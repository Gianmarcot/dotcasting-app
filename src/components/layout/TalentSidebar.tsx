import { Link, useLocation } from "react-router-dom";
import { Home, Bookmark, User, MessageSquare, Calendar, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { it } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { icon: Home, label: it.nav.home, href: "/talent" },
  { icon: Bookmark, label: it.nav.myCastings, href: "/talent/applications" },
  { icon: MessageSquare, label: it.nav.messages, href: "/talent/messages" },
  { icon: Calendar, label: it.nav.auditions, href: "/talent/auditions" },
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link to="/talent" className="flex items-center gap-1">
          <span className="text-muted-foreground text-sm">dot</span>
          <span className="text-xl font-semibold text-foreground">Casting</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
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
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.profile_photo_url || ""} />
            <AvatarFallback className="bg-muted text-foreground text-sm">
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
            to="/talent/profile"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <User className="h-4 w-4" />
            {it.nav.account}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            {it.nav.logout}
          </button>
        </div>
      </div>
    </aside>
  );
};
