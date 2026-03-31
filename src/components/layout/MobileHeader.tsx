import { Link } from "react-router-dom";
import { Menu, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { it } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import logo from "@/assets/logo.png";

interface MobileHeaderProps {
  variant?: "talent" | "owner";
}

export const MobileHeader = ({ variant = "talent" }: MobileHeaderProps) => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "Utente";

  const avatarInitial =
    profile?.first_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  const settingsPath = variant === "owner" ? "/owner/settings" : "/talent/settings";

  return (
    <header className="dc-mobile-header md:hidden">
      <Link to={variant === "owner" ? "/owner" : "/talent"} className="flex items-center">
        <img src={logo} alt="dotCasting" className="h-6" />
      </Link>

      <div className="flex items-center gap-2">
        <NotificationBell />

        <Drawer>
          <DrawerTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors">
              <Menu className="h-5 w-5 text-foreground" />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="sr-only">Menu</DrawerTitle>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.profile_photo_url || ""} />
                  <AvatarFallback className="dc-avatar-fallback">
                    {avatarInitial}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </DrawerHeader>

            <div className="p-4 space-y-1">
              <DrawerClose asChild>
                <Link
                  to={settingsPath}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-foreground hover:bg-muted transition-colors w-full"
                >
                  <Settings className="h-4 w-4" />
                  {it.nav.settings}
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-destructive hover:bg-muted transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  {it.nav.logout}
                </button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
};
