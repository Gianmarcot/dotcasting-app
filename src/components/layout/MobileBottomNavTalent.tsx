import { Link, useLocation } from "react-router-dom";
import { User, Bookmark, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { it } from "@/lib/i18n";
import { useUnreadCommunicationsCount } from "@/hooks/useCommunications";

const navItems = [
  { icon: User, label: it.nav.profile, href: "/talent/profile" },
  { icon: Bookmark, label: it.nav.myCastings, href: "/talent/applications" },
  { icon: Megaphone, label: it.nav.communications, href: "/talent/communications" },
];

export const MobileBottomNavTalent = () => {
  const location = useLocation();
  const unreadCount = useUnreadCommunicationsCount();

  return (
    <nav className="dc-mobile-bottom-nav md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const showBadge = item.href === "/talent/communications" && unreadCount > 0;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "dc-mobile-bottom-nav-item",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <span className="relative">
              <item.icon className="h-5 w-5" />
              {showBadge && (
                <span className="absolute -right-1.5 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
