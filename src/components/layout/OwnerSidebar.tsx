import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Film, 
  Target, 
  FileText, 
  Calendar, 
  MessageSquare, 
  Building2, 
  Settings,
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { it } from "@/lib/i18n";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: LayoutDashboard, label: it.backoffice.dashboard, href: "/owner" },
  { icon: Users, label: it.backoffice.talentDatabase, href: "/owner/talents" },
  { icon: Film, label: it.backoffice.castings, href: "/owner/castings" },
  { icon: Target, label: it.backoffice.targets, href: "/owner/targets" },
  { icon: FileText, label: it.backoffice.applications, href: "/owner/applications" },
  { icon: Calendar, label: it.backoffice.auditionScheduling, href: "/owner/auditions" },
  { icon: MessageSquare, label: it.backoffice.messagingCenter, href: "/owner/messages" },
  { icon: Building2, label: it.backoffice.companiesCRM, href: "/owner/companies" },
  { icon: Settings, label: it.backoffice.settings, href: "/owner/settings" },
];

export const OwnerSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside className="dc-sidebar">
      {/* Logo */}
      <div className="dc-sidebar-header">
        <Link to="/owner" className="flex items-center gap-3">
          <img src={logo} alt="dotCasting" className="h-7" />
          <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">Admin</span>
        </Link>
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="dc-sidebar-nav">
        <ul className="dc-sidebar-nav-list">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/owner" && location.pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={isActive ? "dc-sidebar-nav-item-active" : "dc-sidebar-nav-item-inactive"}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="dc-sidebar-footer">
        <div className="dc-sidebar-divider" />
        <div className="dc-sidebar-user">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="dc-avatar-fallback-primary">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.email?.split("@")[0] || "Admin"}
            </p>
          </div>
        </div>

        <button onClick={handleLogout} className="dc-sidebar-action">
          <LogOut className="h-4 w-4" />
          {it.nav.logout}
        </button>
      </div>
    </aside>
  );
};
