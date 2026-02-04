import { it } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Film, FileText, Calendar, Plus } from "lucide-react";

const stats = [
  {
    title: it.backoffice.totalTalents,
    value: "1,234",
    icon: Users,
    color: "bg-secondary text-secondary-foreground",
  },
  {
    title: it.backoffice.activeCastings,
    value: "12",
    icon: Film,
    color: "bg-olive text-olive-foreground",
  },
  {
    title: it.backoffice.pendingApplications,
    value: "48",
    icon: FileText,
    color: "bg-charcoal text-charcoal-foreground",
  },
  {
    title: it.backoffice.upcomingAuditions,
    value: "5",
    icon: Calendar,
    color: "bg-primary text-primary-foreground",
  },
];

const recentApplications = [
  { id: "1", talent: "Giulia Rossi", casting: "Modella Beauty", status: "submitted", date: "2025-02-04" },
  { id: "2", talent: "Marco Bianchi", casting: "Attore Spot TV", status: "shortlisted", date: "2025-02-03" },
  { id: "3", talent: "Sara Verdi", casting: "Ballerina Fitness", status: "submitted", date: "2025-02-03" },
];

export const OwnerDashboard = () => {
  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {it.backoffice.dashboard}
          </h1>
          <p className="text-muted-foreground mt-1">
            Panoramica della piattaforma
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {it.backoffice.createCasting}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`${stat.color} border-0`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">{stat.title}</p>
                  <p className="text-3xl font-semibold mt-1">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 opacity-60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent applications */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Candidature recenti</CardTitle>
          <Button variant="ghost" size="sm">
            {it.common.seeAll}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="font-medium text-foreground">{app.talent}</p>
                  <p className="text-sm text-muted-foreground">{app.casting}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    app.status === "shortlisted" 
                      ? "bg-success/20 text-success" 
                      : "bg-info/20 text-info"
                  }`}>
                    {it.applications.status[app.status as keyof typeof it.applications.status]}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(app.date).toLocaleDateString("it-IT")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerDashboard;
