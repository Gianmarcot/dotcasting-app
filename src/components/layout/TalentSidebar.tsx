import { Link, useLocation } from "react-router-dom";
import { useRef } from "react";
import { Bookmark, User, MessageSquare, LogOut, Settings, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { it } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUnreadNotificationsCount } from "@/hooks/useNotifications";
import { useOwnerSidebarWidth } from "@/hooks/useOwnerSidebarWidth";
import logo from "@/assets/logo.png";

const navItems = [
  { icon: User, label: it.nav.profile, href: "/talent/profile" },
  { icon: Bookmark, label: it.nav.myCastings, href: "/talent/applications" },
  { icon: MessageSquare, label: it.nav.messages, href: "/talent/messages" },
];

export const TalentSidebar = () => {
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
    "U";

  const { width, setWidth, resetWidth, min, max } = useOwnerSidebarWidth();
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startWidth: width };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = dragState.current;
    if (!s) return;
    setWidth(s.startWidth + (e.clientX - s.startX));
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    dragState.current = null;
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  return (
    <aside className="dc-sidebar" style={{ width: `${width}px` }}>
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
          className="block h-16 w-1 rounded-full bg-foreground/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-active:opacity-100"
        />
      </div>

      {/* Logo */}
      <div className="dc-sidebar-header">
        <Link to="/talent/profile" className="flex items-center">
          <img src={logo} alt="dotCasting" className="h-7" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="dc-sidebar-nav">
        <ul className="dc-sidebar-nav-list">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={isActive ? "dc-sidebar-nav-item-active" : "dc-sidebar-nav-item-inactive"}
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
      <div className="dc-sidebar-footer">
        <div className="dc-sidebar-divider" />
        <div className="dc-sidebar-user">
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
                <p className="font-display uppercase font-normal text-[15px] text-foreground truncate">
                  {firstName}
                </p>
                <p className="font-display uppercase font-normal text-[15px] text-foreground truncate">
                  {lastName}
                </p>
              </>
            ) : (
              <p className="font-display uppercase font-normal text-[15px] text-foreground truncate">
                {user?.email?.split("@")[0] || "Utente"}
              </p>
            )}
          </div>
        </div>

        <Link
          to="/talent/notifications"
          className={
            location.pathname.startsWith("/talent/notifications")
              ? "dc-sidebar-nav-item-active"
              : "dc-sidebar-nav-item-inactive"
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
          to="/talent/settings"
          className={
            location.pathname.startsWith("/talent/settings")
              ? "dc-sidebar-nav-item-active"
              : "dc-sidebar-nav-item-inactive"
          }
        >
          <Settings className="h-4 w-4" />
          {it.nav.account}
        </Link>

        <button onClick={handleLogout} className="dc-sidebar-action">
          <LogOut className="h-4 w-4" />
          {it.nav.logout}
        </button>
      </div>
    </aside>
  );
};
