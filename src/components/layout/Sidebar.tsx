import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  GraduationCap, 
  Settings,
  Users,
  FolderOpen,
  LayoutDashboard,
  FileText,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const location = useLocation();

  const userNavItems = [
    { icon: Home, label: t.nav.home, path: '/app' },
    { icon: BookOpen, label: t.nav.myCourses, path: '/app/courses' },
    { icon: BarChart3, label: t.nav.progress, path: '/app/progress' },
    { icon: GraduationCap, label: t.nav.lessons, path: '/app/lessons' },
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, label: t.admin.dashboard, path: '/admin' },
    { icon: Users, label: t.admin.users, path: '/admin/users' },
    { icon: FolderOpen, label: t.admin.content, path: '/admin/content' },
    { icon: FileText, label: 'Тапсырмалар', path: '/admin/homework' },
    { icon: BarChart3, label: t.admin.statistics, path: '/admin/stats' },
  ];

  const navItems = isAdmin ? [...userNavItems, ...adminNavItems] : userNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-sidebar-border">
          <Link to="/app" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-lg">D</span>
            </div>
            <span className="text-sidebar-foreground font-semibold text-lg">Dos.Coding</span>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "sidebar-nav-item",
                  isActive && "active"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <Link 
            to="/app/settings" 
            onClick={onClose}
            className="sidebar-nav-item"
          >
            <Settings className="w-5 h-5" />
            <span>{t.nav.settings}</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
