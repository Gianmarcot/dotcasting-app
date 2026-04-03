import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Film, MessageSquare, MoreHorizontal, FileText, Building2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { it } from "@/lib/i18n";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const mainNavItems = [
  { icon: LayoutDashboard, label: it.backoffice.dashboard, href: "/owner" },
  { icon: Users, label: it.backoffice.talentDatabase, href: "/owner/talents" },
  { icon: Film, label: it.backoffice.castings, href: "/owner/castings" },
  { icon: MessageSquare, label: it.backoffice.messagingCenter, href: "/owner/messages" },
];

const moreNavItems = [
  { icon: FileText, label: it.backoffice.applications, href: "/owner/applications" },
  { icon: Building2, label: it.backoffice.companiesCRM, href: "/owner/companies" },
  { icon: Settings, label: it.backoffice.settings, href: "/owner/settings" },
];

export const MobileBottomNavOwner = () => {
  const location = useLocation();

  const isMoreActive = moreNavItems.some(
    (item) => location.pathname === item.href || location.pathname.startsWith(item.href)
  );

  return (
    <nav className="dc-mobile-bottom-nav md:hidden">
      {mainNavItems.map((item) => {
        const isActive = item.href === "/owner"
          ? location.pathname === item.href
          : location.pathname.startsWith(item.href);
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
            <span className="text-[10px] mt-0.5 truncate max-w-[60px]">{item.label}</span>
          </Link>
        );
      })}

      {/* More menu */}
      <Drawer>
        <DrawerTrigger asChild>
          <button
            className={cn(
              "dc-mobile-bottom-nav-item",
              isMoreActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">Altro</span>
          </button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Altre sezioni</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 grid grid-cols-2 gap-2 pb-8">
            {moreNavItems.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href);
              return (
                <DrawerClose key={item.href} asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "bg-muted/50 text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs font-medium text-center">{item.label}</span>
                  </Link>
                </DrawerClose>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
};
