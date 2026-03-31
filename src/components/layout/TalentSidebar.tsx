import { Link, useLocation } from "react-router-dom";
import { Home, Bookmark, User, MessageSquare, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { it } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: Home, label: it.nav.home, href: "/talent" },
  { icon: User, label: it.nav.profile, href: "/talent/profile" },
  { icon: Bookmark, label: it.nav.myCastings, href: "/talent/applications" },
  { icon: MessageSquare, label: it.nav.messages, href: "/talent/messages" },
];

export const TalentSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "Utente";

  const avatarInitial = profile?.first_name?.charAt(0).toUpperCase() 
    || user?.email?.charAt(0).toUpperCase() 
    || "U";

  return (
    <aside className="dc-sidebar">
      {/* Logo */}
      <div className="dc-sidebar-header">
        <Link to="/talent" className="flex items-center">
          <img src={logo} alt="dotCasting" className="h-7" />
        </Link>
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="dc-sidebar-nav">
        <ul className="dc-sidebar-nav-list">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={isActive ? "dc-sidebar-nav-item-active" : "dc-sidebar-nav-item-inactive"}
                >
                  <item.icon className="h-5 w-5" />
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
        <div className="dc-sidebar-user mb-4">
          <Avatar className="dc-avatar-md">
            <AvatarImage src={profile?.profile_photo_url || ""} />
            <AvatarFallback className="dc-avatar-fallback">
              {avatarInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {displayName}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            to="/talent/settings"
            className="dc-sidebar-action"
          >
            <Settings className="h-4 w-4" />
            {it.nav.account}
          </Link>
          <button onClick={handleLogout} className="dc-sidebar-action">
            <LogOut className="h-4 w-4" />
            {it.nav.logout}
          </button>
        </div>
      </div>
    </aside>
  );
};
