import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export default function Messages() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = {
    kk: {
      title: 'Хабарламалар',
      placeholder: 'Хабарлама жазыңыз...',
      send: 'Жіберу',
      empty: 'Хабарлама жоқ. Мұғалімге жазыңыз!',
      admin: 'Мұғалім',
    },
    ru: {
      title: 'Сообщения',
      placeholder: 'Напишите сообщение...',
      send: 'Отправить',
      empty: 'Нет сообщений. Напишите учителю!',
      admin: 'Учитель',
    },
  }[language];

  // Get admin user IDs
  const { data: adminIds = [] } = useQuery({
    queryKey: ['admin-ids'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      return data?.map((r) => r.user_id) || [];
    },
  });

  // Get admin profiles for names
  const { data: adminProfiles = [] } = useQuery({
    queryKey: ['admin-profiles', adminIds],
    queryFn: async () => {
      if (adminIds.length === 0) return [];
      const { data } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', adminIds);
      return data || [];
    },
    enabled: adminIds.length > 0,
  });

  const firstAdminId = adminIds[0];

  // Fetch messages between user and admins
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map((msg) => {
        const profile = adminProfiles.find((p) => p.user_id === msg.sender_id);
        return { ...msg, sender_name: profile?.full_name || undefined };
      });
    },
    enabled: !!user && adminProfiles.length >= 0,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('user-messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_messages',
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', user.id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark unread messages as read
  useEffect(() => {
    if (!user || messages.length === 0) return;
    const unread = messages.filter((m) => m.recipient_id === user.id && !m.is_read);
    if (unread.length > 0) {
      supabase
        .from('user_messages')
        .update({ is_read: true })
        .in('id', unread.map((m) => m.id))
        .then();
    }
  }, [messages, user]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      if (!user || !firstAdminId || !newMessage.trim()) return;
      const { error } = await supabase.from('user_messages').insert({
        sender_id: user.id,
        recipient_id: firstAdminId,
        body: newMessage.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>

      <Card className="flex flex-col h-[60vh]">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p>{t.empty}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}>
                    {!isMine && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {msg.sender_name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[70%] px-3 py-2 rounded-2xl text-sm',
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-secondary-foreground rounded-bl-md'
                      )}
                    >
                      {!isMine && (
                        <p className="text-xs font-medium mb-0.5 opacity-70">{msg.sender_name || t.admin}</p>
                      )}
                      <p>{msg.body}</p>
                      <p className={cn('text-[10px] mt-1', isMine ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-3 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t.placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage.mutate();
              }
            }}
          />
          <Button
            size="icon"
            onClick={() => sendMessage.mutate()}
            disabled={!newMessage.trim() || sendMessage.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
