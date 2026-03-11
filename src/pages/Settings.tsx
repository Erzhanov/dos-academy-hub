import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2, Save, Lock } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    kk: {
      profile: 'Профиль',
      security: 'Қауіпсіздік',
      fullName: 'Аты-жөні',
      phone: 'Телефон',
      birthDate: 'Туған күні',
      guardianName: 'Ата-ана аты-жөні',
      guardianPhone: 'Ата-ана телефоны',
      save: 'Сақтау',
      saved: 'Сақталды!',
      changePassword: 'Құпиясөзді өзгерту',
      newPassword: 'Жаңа құпиясөз',
      confirmPassword: 'Құпиясөзді растау',
      passwordChanged: 'Құпиясөз өзгертілді!',
      passwordMismatch: 'Құпиясөздер сәйкес келмейді',
      uploadAvatar: 'Сурет жүктеу',
    },
    ru: {
      profile: 'Профиль',
      security: 'Безопасность',
      fullName: 'ФИО',
      phone: 'Телефон',
      birthDate: 'Дата рождения',
      guardianName: 'ФИО родителя',
      guardianPhone: 'Телефон родителя',
      save: 'Сохранить',
      saved: 'Сохранено!',
      changePassword: 'Изменить пароль',
      newPassword: 'Новый пароль',
      confirmPassword: 'Подтвердите пароль',
      passwordChanged: 'Пароль изменён!',
      passwordMismatch: 'Пароли не совпадают',
      uploadAvatar: 'Загрузить фото',
    },
  }[language];

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Populate form when profile loads
  useState(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setBirthDate(profile.birth_date || '');
      setGuardianName(profile.guardian_full_name || '');
      setGuardianPhone(profile.guardian_phone || '');
    }
  });

  // Use effect to populate when profile changes
  const profileLoaded = useRef(false);
  if (profile && !profileLoaded.current) {
    profileLoaded.current = true;
    setFullName(profile.full_name || '');
    setPhone(profile.phone || '');
    setBirthDate(profile.birth_date || '');
    setGuardianName(profile.guardian_full_name || '');
    setGuardianPhone(profile.guardian_phone || '');
  }

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          birth_date: birthDate || null,
          guardian_full_name: guardianName || null,
          guardian_phone: guardianPhone || null,
        })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: t.saved });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!user) return;
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: t.saved });
    },
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error('mismatch');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewPassword('');
      setConfirmPassword('');
      toast({ title: t.passwordChanged });
    },
    onError: (err: Error) => {
      if (err.message === 'mismatch') {
        toast({ title: t.passwordMismatch, variant: 'destructive' });
      }
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">{t.profile}</h1>

      {/* Avatar */}
      <Card>
        <CardContent className="flex items-center gap-6 pt-6">
          <div className="relative group">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-foreground/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-6 h-6 text-background" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatar.mutate(file);
              }}
            />
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile?.full_name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 mr-1" />
              {t.uploadAvatar}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t.profile}</TabsTrigger>
          <TabsTrigger value="security">{t.security}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>{t.fullName}</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t.phone}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" />
              </div>
              <div className="space-y-2">
                <Label>{t.birthDate}</Label>
                <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t.guardianName}</Label>
                <Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t.guardianPhone}</Label>
                <Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
              </div>
              <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {t.changePassword}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t.newPassword}</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t.confirmPassword}</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Button onClick={() => changePassword.mutate()} disabled={changePassword.isPending || !newPassword}>
                {changePassword.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {t.changePassword}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
