import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Loader2 } from 'lucide-react';

export default function Certificates() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const t = {
    kk: {
      title: 'Менің сертификаттарым',
      empty: 'Сізде әлі сертификат жоқ. Курсты аяқтаңыз!',
      download: 'Жүктеу',
      issued: 'Берілген күні',
      certNo: 'Сертификат №',
    },
    ru: {
      title: 'Мои сертификаты',
      empty: 'У вас пока нет сертификатов. Завершите курс!',
      download: 'Скачать',
      issued: 'Дата выдачи',
      certNo: 'Сертификат №',
    },
  }[language];

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('certificates')
        .select('*, courses(title)')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>

      {certificates.length === 0 ? (
        <div className="text-center py-16">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t.empty}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Award className="w-16 h-16 text-primary" />
              </div>
              <CardContent className="pt-4 space-y-2">
                <h3 className="font-semibold text-foreground">
                  {(cert.courses as { title: string } | null)?.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t.certNo}: {cert.certificate_number}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.issued}: {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : '-'}
                </p>
                {cert.pdf_url && (
                  <Button variant="outline" size="sm" asChild className="w-full mt-2">
                    <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-1" />
                      {t.download}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
