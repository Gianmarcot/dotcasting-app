import { Link, useLocation } from "react-router-dom";
import { Home, User, Bookmark, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { it } from "@/lib/i18n";

const navItems = [
  { icon: Home, label: it.nav.home, href: "/talent" },
  { icon: User, label: it.nav.profile, href: "/talent/profile" },
  { icon: Bookmark, label: it.nav.myCastings, href: "/talent/applications" },
  { icon: MessageSquare, label: it.nav.messages, href: "/talent/messages" },
];

export const MobileBottomNavTalent = () => {
  const location = useLocation();

  return (
    <nav className="dc-mobile-bottom-nav md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "dc-mobile-bottom-nav-item",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
