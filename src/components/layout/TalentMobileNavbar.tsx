import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings, LogOut, User, Bookmark, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCommunicationsCount } from "@/hooks/useCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { it } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import logo from "@/assets/logo.png";

const HIDE_AFTER = 80; // px scrolled before the bar may hide
const DELTA = 8; // minimum movement to register a direction change

/* Icona menu: geometria del file nav-hamburgher.svg (due tratti, il secondo più
   corto e allineato a destra), colore ereditato dal testo come da regole di stile. */
const MenuIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <line x1="3" y1="12" x2="29" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="11" y1="20" x2="29" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const TalentMobileNavbar = ({ scrollRef }: { scrollRef: React.RefObject<HTMLElement> }) => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const unread = useUnreadCommunicationsCount();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = el.scrollTop;
      if (y <= HIDE_AFTER) {
        setHidden(false);
        lastY.current = y;
        return;
      }
      const diff = y - lastY.current;
      if (Math.abs(diff) < DELTA) return;
      setHidden(diff > 0);
      lastY.current = y;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "Utente";
  const initial =
    profile?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";

  const navItems = [
    { icon: User, label: it.nav.profile, href: "/talent/profile" },
    { icon: Bookmark, label: it.nav.myCastings, href: "/talent/applications" },
    { icon: Megaphone, label: it.nav.communications, href: "/talent/communications", badge: unread },
    { icon: Settings, label: it.nav.settings, href: "/talent/settings" },
  ];

  return (
    <header
      onFocusCapture={() => setHidden(false)}
      className={cn(
        "fixed left-4 right-4 top-2 z-50 flex h-16 items-center justify-between rounded-[100px] bg-card py-2 pl-5 pr-2 transition-transform duration-300 ease-out md:hidden",
        "shadow-[0px_12px_72px_rgba(0,0,0,0.05),0px_5px_25px_rgba(0,0,0,0.03),0px_2px_12px_rgba(0,0,0,0.03),0px_1px_4px_rgba(0,0,0,0.02)]",
        hidden && "-translate-y-[calc(100%+1rem)]"
      )}
    >
      <Link to="/talent/profile" className="flex items-center">
        <img src={logo} alt="dotCasting" className="h-[26px] w-[110px] object-contain" />
      </Link>

      <div className="flex items-center gap-2">
        <Link to="/talent/communications" aria-label={unread > 0 ? `Profilo, ${unread} comunicazioni non lette` : "Profilo"} className="relative h-12 w-12">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.profile_photo_url || ""} className="object-cover" />
            <AvatarFallback className="dc-avatar-fallback">{initial}</AvatarFallback>
          </Avatar>
          {unread > 0 && (
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
          )}
        </Link>

        <Drawer>
          <DrawerTrigger asChild>
            <button aria-label="Apri menu" className="flex h-12 w-12 items-center justify-center text-foreground">
              <MenuIcon />
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="sr-only">Menu</DrawerTitle>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.profile_photo_url || ""} className="object-cover" />
                  <AvatarFallback className="dc-avatar-fallback">{initial}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </DrawerHeader>
            <div className="space-y-1 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              {navItems.map((item) => (
                <DrawerClose asChild key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[15px] hover:bg-muted",
                      location.pathname === item.href ? "text-primary" : "text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" strokeWidth={1.5} />
                    <span className="flex-1">{item.label}</span>
                    {!!item.badge && item.badge > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </Link>
                </DrawerClose>
              ))}
              <DrawerClose asChild>
                <button
                  onClick={() => void signOut()}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-[15px] text-destructive hover:bg-muted"
                >
                  <LogOut className="h-5 w-5" strokeWidth={1.5} />
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
