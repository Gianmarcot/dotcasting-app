import { useNavigate } from "react-router-dom";
import { it } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Film, FileText, Calendar, Plus, Clock, ArrowRight } from "lucide-react";
import {
  useDashboardStats,
  useRecentApplications,
  useRecentActivity,
} from "@/hooks/useDashboardStats";

const STATUS_STYLES: Record<string, string> = {
  submitted: "bg-amber-100 text-amber-800",
  shortlisted: "bg-green-100 text-green-800",
  hold: "bg-blue-100 text-blue-800",
  callback: "bg-purple-100 text-purple-800",
  booked: "bg-primary/15 text-primary",
  rejected: "bg-red-100 text-red-800",
};

const ACTIVITY_ICONS: Record<string, string> = {
  application: "📩",
  audition: "🎬",
  casting: "📋",
};

export const OwnerDashboard = () => {
  const navigate = useNavigate();
  
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentApplications = [], isLoading: applicationsLoading } = useRecentApplications(5);
  const { data: recentActivity = [], isLoading: activityLoading } = useRecentActivity(8);

  const statCards = [
    {
      title: it.backoffice.totalTalents,
      value: stats?.totalTalents ?? 0,
      icon: Users,
      color: "bg-secondary text-secondary-foreground",
      link: "/owner/talents",
    },
    {
      title: it.backoffice.activeCastings,
      value: stats?.activeCastings ?? 0,
      icon: Film,
      color: "bg-olive text-olive-foreground",
      link: "/owner/castings",
    },
    {
      title: it.backoffice.pendingApplications,
      value: stats?.pendingApplications ?? 0,
      icon: FileText,
      color: "bg-charcoal text-charcoal-foreground",
      link: "/owner/applications",
    },
    {
      title: it.backoffice.upcomingAuditions,
      value: stats?.upcomingAuditions ?? 0,
      icon: Calendar,
      color: "bg-primary text-primary-foreground",
      link: "/owner/auditions",
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Adesso";
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays === 1) return "Ieri";
    if (diffDays < 7) return `${diffDays}g fa`;
    return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-foreground">{it.backoffice.dashboard}</h1>
          <p className="text-muted-foreground mt-1">Panoramica della piattaforma</p>
        </div>
        <Button onClick={() => navigate("/owner/castings")}>
          <Plus className="h-4 w-4 mr-2" />
          {it.backoffice.createCasting}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className={`${stat.color} border-0 cursor-pointer hover:opacity-90 transition-opacity`}
            onClick={() => navigate(stat.link)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">{stat.title}</p>
                  {statsLoading ? (
                    <Skeleton className="h-9 w-16 mt-1 bg-current opacity-20" />
                  ) : (
                    <p className="text-3xl font-semibold mt-1">
                      {stat.value.toLocaleString("it-IT")}
                    </p>
                  )}
                </div>
                <stat.icon className="h-8 w-8 opacity-60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two columns: Recent Applications + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Candidature recenti</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/owner/applications")}
              className="text-muted-foreground"
            >
              {it.common.seeAll}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nessuna candidatura recente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={app.talentPhotoUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {app.talentName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {app.talentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.castingTitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${STATUS_STYLES[app.status] || STATUS_STYLES.submitted}`}
                      >
                        {it.applications.status[app.status as keyof typeof it.applications.status] || app.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(app.submittedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attività recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Nessuna attività recente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-2 border-b border-border last:border-0"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm">
                      {ACTIVITY_ICONS[activity.type] || "📌"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;
