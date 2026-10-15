import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { it } from "@/lib/i18n";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUnreadNotificationsCount } from "@/hooks/useNotifications";
import { useFavoriteCastings, useReorderFavoriteCastings, type FavoriteCasting } from "@/hooks/useFavoriteCastings";
import { useProfile } from "@/hooks/useProfile";
import { useOwnerSidebarWidth } from "@/hooks/useOwnerSidebarWidth";


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
  { icon: MessageSquare, label: it.backoffice.messagingCenter, href: "/owner/messages" },
  { icon: Building2, label: it.backoffice.companiesCRM, href: "/owner/companies" },
];

const navItems = allNavItems;

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

  const {
    width,
    collapsed,
    setWidth,
    setCollapsed,
    toggleCollapsed,
    resetWidth,
    min,
    max,
    snap,
  } = useOwnerSidebarWidth();
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startWidth: width };
    setDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s) return;
    const candidate = s.startWidth + (e.clientX - s.startX);
    if (collapsed) {
      if (candidate >= snap) {
        setCollapsed(false);
        setWidth(candidate);
      }
    } else if (candidate < snap) {
      setCollapsed(true);
    } else {
      setWidth(candidate);
    }
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    dragState.current = null;
    setDragging(false);
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  return (
    <aside
      className={cn(
        "dc-sidebar-admin",
        !dragging &&
          "transition-[width] duration-300 ease-out motion-reduce:transition-none",
      )}
      style={{ width: `${width}px` }}
    >
      {/* Resize handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Ridimensiona sidebar"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={width}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={resetWidth}
        className="group absolute top-0 right-0 z-50 hidden md:flex h-full w-2 cursor-col-resize touch-none select-none items-center justify-center"
      >
        <span
          aria-hidden
          className="block h-16 w-1 rounded-full bg-white/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100"
        />

      </div>



      {/* Logo */}
      <div className="dc-sidebar-header">
        {!collapsed ? (
          <Link to="/owner" className="flex items-center gap-3">
            <img src={logoWhite} alt="dotCasting" className="h-7" />
            <span className="text-xs font-display uppercase tracking-widest text-white/60">
              Admin
            </span>
          </Link>
        ) : (
          <span aria-hidden className="h-7 w-7" />
        )}
      </div>

      {/* Espandi/comprimi: freccia a cavallo del bordo, come nel drawer dettagli casting */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Espandi barra laterale" : "Comprimi barra laterale"}
            aria-expanded={!collapsed}
            className="absolute top-[22px] -right-5 z-[60] flex h-10 w-10 items-center justify-center rounded-full bg-white text-foreground shadow-sm"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {collapsed ? "Espandi barra laterale" : "Comprimi barra laterale"}
        </TooltipContent>
      </Tooltip>

      {/* Navigation */}
      <nav className="dc-sidebar-nav">
        <ul className="dc-sidebar-nav-list">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/owner" && location.pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <NavItemLink item={item} isActive={isActive} collapsed={collapsed} />
              </li>
            );
          })}
        </ul>

        {!collapsed && <FavoritesSection />}
      </nav>

      {/* User section */}
      <div className="dc-sidebar-footer">
        <div className="dc-sidebar-admin-divider" />
        <div className={cn("flex items-center mb-3", collapsed ? "justify-center" : "gap-3 px-2")}>
          <Avatar size={collapsed ? "sm" : "lg"}>
            {profile?.profile_photo_url ? (
              <AvatarImage src={profile.profile_photo_url} alt="" />
            ) : null}
            <AvatarFallback className="dc-avatar-fallback-primary">
              {displayInitials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
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
          )}
        </div>

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/owner/notifications"
                aria-label="Notifiche"
                className={cn(
                  "relative mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname.startsWith("/owner/notifications")
                    ? "bg-primary text-primary-foreground"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium text-primary-foreground ring-2 ring-ink">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Notifiche</TooltipContent>
          </Tooltip>
        ) : (
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
        )}

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/owner/settings"
                aria-label={it.backoffice.settings}
                className={cn(
                  "mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                  location.pathname.startsWith("/owner/settings")
                    ? "bg-primary text-primary-foreground"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Settings className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{it.backoffice.settings}</TooltipContent>
          </Tooltip>
        ) : (
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
        )}

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                aria-label={it.nav.logout}
                className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{it.nav.logout}</TooltipContent>
          </Tooltip>
        ) : (
          <button onClick={handleLogout} className="dc-sidebar-admin-action">
            <LogOut className="h-4 w-4" />
            {it.nav.logout}
          </button>
        )}
      </div>
    </aside>
  );
};

const NavItemLink = ({
  item,
  isActive,
  collapsed,
}: {
  item: (typeof navItems)[number];
  isActive: boolean;
  collapsed: boolean;
}) => {
  const link = (
    <Link
      to={item.href}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center rounded-lg text-sm font-medium transition-all duration-200",
        collapsed ? "mx-auto h-10 w-10 justify-center" : "gap-3 px-4 py-2.5",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-white/70 hover:bg-white/10 hover:text-white",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && item.label}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
};

/** Array stabile: un [] letterale cambierebbe identità a ogni render, riavviando l'effetto. */
const EMPTY_FAVORITES: FavoriteCasting[] = [];

const FavoritesSection = () => {
  const { data: favorites = EMPTY_FAVORITES, isLoading } = useFavoriteCastings();
  const reorder = useReorderFavoriteCastings();
  const [items, setItems] = useState<FavoriteCasting[]>(favorites);
  const justDraggedRef = useRef(false);

  useEffect(() => {
    setItems(favorites);
  }, [favorites]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const allHref = "/owner/castings?favorites=1";
  const displayed = items.slice(0, 8);

  const handleDragStart = () => {
    justDraggedRef.current = true;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    // Keep the flag true briefly so the synthetic click after pointerup is suppressed
    window.setTimeout(() => {
      justDraggedRef.current = false;
    }, 250);
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    reorder.mutate(next.map((i) => i.id));
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (justDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="mt-6">
      <div className="border-t border-white/10 mx-2 mb-3" />
      <div className="px-4 mb-2">
        <span className="text-sm font-medium text-white/40">Preferiti</span>
      </div>

      <ul className="space-y-0.5 px-2" onClickCapture={handleClickCapture}>
        {isLoading ? (
          <li className="px-2 py-2 text-xs text-white/40">Caricamento…</li>
        ) : displayed.length === 0 ? (
          <li className="px-2 py-2 text-xs text-white/40">Nessun preferito</li>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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


