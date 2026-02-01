import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  PlayCircle, 
  FileText, 
  BarChart3,
  ArrowRight,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function Landing() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: PlayCircle,
      title: t.landing.feature1Title,
      description: t.landing.feature1Desc,
    },
    {
      icon: FileText,
      title: t.landing.feature2Title,
      description: t.landing.feature2Desc,
    },
    {
      icon: BarChart3,
      title: t.landing.feature3Title,
      description: t.landing.feature3Desc,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Dos.Coding</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <span className="font-medium uppercase text-xs">{language}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setLanguage('kk')}
                  className={cn(language === 'kk' && 'bg-secondary')}
                >
                  🇰🇿 Қазақша
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('ru')}
                  className={cn(language === 'ru' && 'bg-secondary')}
                >
                  🇷🇺 Русский
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            <Link to="/login">
              <Button variant="default" size="sm" className="ml-2">
                {t.nav.login}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-sidebar-foreground mb-6 animate-fade-in">
              {t.landing.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-sidebar-foreground/70 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {t.landing.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/login">
                <Button size="lg" className="btn-accent-gradient px-8 h-12 text-base gap-2">
                  {t.landing.getStarted}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 text-base border-sidebar-foreground/20 text-sidebar-foreground hover:bg-sidebar-foreground/10">
                {t.landing.learnMore}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.landing.whyUs}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card-elevated p-8 text-center group hover:-translate-y-2 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Dos.Coding IT Academy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
