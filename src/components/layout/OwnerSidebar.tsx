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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link to="/owner" className="flex items-center gap-1">
          <span className="text-muted-foreground text-sm">dot</span>
          <span className="text-xl font-semibold text-foreground">Casting</span>
          <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/owner" && location.pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
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
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.email?.split("@")[0] || "Admin"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          {it.nav.logout}
        </button>
      </div>
    </aside>
  );
};
