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
  ChevronDown,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  Code,
  Laptop,
  MessageCircle,
  Star,
  Zap
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

  const stats = [
    { icon: Users, value: '500+', label: t.landing.statStudents },
    { icon: BookOpen, value: '50+', label: t.landing.statLessons },
    { icon: Award, value: '95%', label: t.landing.statSatisfaction },
    { icon: Code, value: '10+', label: t.landing.statCourses },
  ];

  const steps = [
    { number: '01', title: t.landing.step1Title, desc: t.landing.step1Desc, icon: Laptop },
    { number: '02', title: t.landing.step2Title, desc: t.landing.step2Desc, icon: PlayCircle },
    { number: '03', title: t.landing.step3Title, desc: t.landing.step3Desc, icon: FileText },
    { number: '04', title: t.landing.step4Title, desc: t.landing.step4Desc, icon: Award },
  ];

  const testimonials = [
    { name: t.landing.testimonial1Name, text: t.landing.testimonial1Text, role: t.landing.testimonial1Role },
    { name: t.landing.testimonial2Name, text: t.landing.testimonial2Text, role: t.landing.testimonial2Role },
    { name: t.landing.testimonial3Name, text: t.landing.testimonial3Text, role: t.landing.testimonial3Role },
  ];

  const courses = [
    { title: 'Python', desc: t.landing.coursePythonDesc, icon: Code, level: t.landing.levelBeginner },
    { title: 'Web Development', desc: t.landing.courseWebDesc, icon: Laptop, level: t.landing.levelIntermediate },
    { title: 'Data Science', desc: t.landing.courseDataDesc, icon: BarChart3, level: t.landing.levelAdvanced },
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8 animate-fade-in">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm text-primary-foreground/90">{t.landing.heroBadge}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
              {t.landing.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {t.landing.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/login">
                <Button size="lg" className="px-8 h-12 text-base gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                  {t.landing.getStarted}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 text-base border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                {t.landing.learnMore}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="card-elevated p-6 text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.landing.whyUs}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.landing.whyUsSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card-elevated p-8 text-center group hover:-translate-y-2 transition-all duration-300"
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

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.landing.howItWorks}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.landing.howItWorksSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">{step.number}</span>
                <h3 className="text-lg font-semibold text-foreground mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.landing.popularCourses}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.landing.popularCoursesSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {courses.map((course, i) => (
              <div key={i} className="card-elevated overflow-hidden group hover:-translate-y-2 transition-all duration-300">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <course.icon className="w-16 h-16 text-primary/60 group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{course.level}</span>
                  <h3 className="text-xl font-semibold text-foreground mt-3 mb-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.landing.testimonials}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((item, i) => (
              <div key={i} className="card-elevated p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{item.text}"</p>
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center card-elevated p-12 lg:p-16 bg-gradient-to-br from-primary/5 to-accent/5">
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.landing.ctaTitle}</h2>
            <p className="text-lg text-muted-foreground mb-8">{t.landing.ctaSubtitle}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="px-8 h-12 text-base gap-2">
                  {t.landing.getStarted}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success" /> {t.landing.ctaBenefit1}</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success" /> {t.landing.ctaBenefit2}</span>
            </div>
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
