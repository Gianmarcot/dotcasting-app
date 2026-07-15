import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Film,
  FileText,
  MessageSquare,
  Building2,
  Settings,
  Bell,
  LogOut,
  Star,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { it } from "@/lib/i18n";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUnreadNotificationsCount } from "@/hooks/useNotifications";
import { useFavoriteCastings, useReorderFavoriteCastings, type FavoriteCasting } from "@/hooks/useFavoriteCastings";
import { useProfile } from "@/hooks/useProfile";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import logoWhite from "@/assets/logo-white.png";


const allNavItems = [
  { icon: LayoutDashboard, label: it.backoffice.dashboard, href: "/owner" },
  { icon: Users, label: it.backoffice.talentDatabase, href: "/owner/talents" },
  { icon: Film, label: it.backoffice.castings, href: "/owner/castings" },
  { icon: FileText, label: it.backoffice.applications, href: "/owner/applications", flag: "OWNER_APPLICATIONS" as const },
  { icon: MessageSquare, label: it.backoffice.messagingCenter, href: "/owner/messages" },
  { icon: Building2, label: it.backoffice.companiesCRM, href: "/owner/companies" },
];

const navItems = allNavItems.filter((item) => !("flag" in item) || FEATURE_FLAGS[item.flag!]);

export const OwnerSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const unreadCount = useUnreadNotificationsCount();

  const handleLogout = async () => {
    await signOut();
  };

  const firstName = profile?.first_name?.trim() || "";
  const lastName = profile?.last_name?.trim() || "";
  const displayInitials =
    (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "A";

  return (
    <aside className="dc-sidebar-admin">
      {/* Logo */}
      <div className="dc-sidebar-header">
        <Link to="/owner" className="flex items-center gap-3">
          <img src={logoWhite} alt="dotCasting" className="h-7" />
          <span className="text-xs font-display uppercase tracking-widest text-white/60">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="dc-sidebar-nav">
        <ul className="dc-sidebar-nav-list">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/owner" && location.pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={isActive ? "dc-sidebar-admin-nav-item-active" : "dc-sidebar-admin-nav-item-inactive"}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <FavoritesSection />
      </nav>

      {/* User section */}
      <div className="dc-sidebar-footer">
        <div className="dc-sidebar-admin-divider" />
        <div className="dc-sidebar-admin-user">
          <Avatar size="lg">
            {profile?.profile_photo_url ? (
              <AvatarImage src={profile.profile_photo_url} alt="" />
            ) : null}
            <AvatarFallback className="dc-avatar-fallback-primary">
              {displayInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 leading-tight">
            {firstName || lastName ? (
              <>
                <p className="font-display uppercase font-normal text-[15px] text-white truncate">{firstName}</p>
                <p className="font-display uppercase font-normal text-[15px] text-white truncate">{lastName}</p>
              </>
            ) : (
              <p className="font-display uppercase font-normal text-[15px] text-white truncate">
                {user?.email?.split("@")[0] || "Admin"}
              </p>
            )}
          </div>
        </div>

        <Link
          to="/owner/notifications"
          className={
            location.pathname.startsWith("/owner/notifications")
              ? "dc-sidebar-admin-nav-item-active"
              : "dc-sidebar-admin-nav-item-inactive"
          }
        >
          <Bell className="h-4 w-4" />
          <span className="flex-1">Notifiche</span>
          {unreadCount > 0 && (
            <span className="ml-auto inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/owner/settings"
          className={
            location.pathname.startsWith("/owner/settings")
              ? "dc-sidebar-admin-nav-item-active"
              : "dc-sidebar-admin-nav-item-inactive"
          }
        >
          <Settings className="h-4 w-4" />
          {it.backoffice.settings}
        </Link>

        <button onClick={handleLogout} className="dc-sidebar-admin-action">
          <LogOut className="h-4 w-4" />
          {it.nav.logout}
        </button>
      </div>
    </aside>
  );
};

const FavoritesSection = () => {
  const { data: favorites = [], isLoading } = useFavoriteCastings();
  const reorder = useReorderFavoriteCastings();
  const [items, setItems] = useState<FavoriteCasting[]>(favorites);

  useEffect(() => {
    setItems(favorites);
  }, [favorites]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const allHref = "/owner/castings?favorites=1";
  const displayed = items.slice(0, 8);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorder.mutate(next.map((i) => i.id));
  };

  return (
    <div className="mt-6">
      <div className="border-t border-white/10 mx-2 mb-3" />
      <div className="px-4 mb-2">
        <span className="text-sm font-medium text-white/40">Preferiti</span>
      </div>

      <ul className="space-y-0.5 px-2">
        {isLoading ? (
          <li className="px-2 py-2 text-xs text-white/40">Caricamento…</li>
        ) : displayed.length === 0 ? (
          <li className="px-2 py-2 text-xs text-white/40">Nessun preferito</li>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayed.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {displayed.map((c) => (
                <SortableFavoriteItem key={c.id} casting={c} />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {favorites.length > 0 && (
          <li>
            <Link
              to={allHref}
              className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              <span>Visualizza tutti</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

const SortableFavoriteItem = ({ casting }: { casting: FavoriteCasting }) => {
  const { pathname } = useLocation();
  const href = `/owner/castings/${casting.id}`;
  const active = pathname === href || pathname.startsWith(href + "/");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: casting.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className={cn("group/fav relative", isDragging && "z-10 opacity-80")}>
      <Link
        to={href}
        className={cn(
          "flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-md text-sm transition-colors",
          active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white",
        )}
        title={casting.title}
      >
        <button
          type="button"
          aria-label="Riordina"
          {...attributes}
          {...listeners}
          onClick={(e) => e.preventDefault()}
          className="shrink-0 -ml-1 mr-0.5 h-4 w-4 flex items-center justify-center text-white/30 opacity-0 group-hover/fav:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <Star className="h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor" />
        <span className="truncate">{casting.title}</span>
      </Link>
    </li>
  );
};


