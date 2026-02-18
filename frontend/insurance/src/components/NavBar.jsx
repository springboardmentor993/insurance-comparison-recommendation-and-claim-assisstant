import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, User, Sparkles, FileText, LogOut, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/store/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/claims', label: 'Claims', icon: FileText },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { to: '/admin', label: 'Admin', icon: ShieldAlert },
];

export default function NavBar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-6">
          <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground hidden sm:inline">Insurenz</span>
          </NavLink>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
