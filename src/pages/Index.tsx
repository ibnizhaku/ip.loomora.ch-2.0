import {
  TrendingUp,
  Users,
  FolderKanban,
  Banknote,
  Loader2,
  Factory,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProjectsOverview } from "@/components/dashboard/ProjectsOverview";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { useDashboardStats } from "@/hooks/use-dashboard";

const Index = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('CHF', "CHF ");
  };

  const statsCards = [
    {
      title: "Umsatz (Monat)",
      value: stats ? formatCurrency(stats.totalRevenue) : "CHF 0",
      change: stats?.revenueChange || "+0%",
      changeType: stats?.revenueChange?.startsWith('+') ? "positive" as const : "negative" as const,
      icon: Banknote,
    },
    {
      title: "Aktive Aufträge",
      value: stats?.activeProjects?.toString() || "0",
      change: stats?.activeProjects ? `${stats.activeProjects} in Arbeit` : "0 in Arbeit",
      changeType: "positive" as const,
      icon: FolderKanban,
    },
    {
      title: "Kunden",
      value: stats?.customerCount?.toString() || "0",
      change: stats?.customerCount ? `${stats.customerCount} gesamt` : "0 gesamt",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Werkstatt-Auslastung",
      value: stats ? `${stats.utilizationRate}%` : "0%",
      change: stats?.utilizationRate && stats.utilizationRate >= 80 ? "Gut ausgelastet" : "Kapazität frei",
      changeType: stats?.utilizationRate && stats.utilizationRate >= 80 ? "positive" as const : "neutral" as const,
      icon: Factory,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Betriebsübersicht
        </h1>
        <p className="text-muted-foreground">
          Aufträge, Werkstatt und Finanzen auf einen Blick
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-4 flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          statsCards.map((stat, index) => (
            <div
              key={stat.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StatsCard {...stat} />
            </div>
          ))
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ProjectsOverview />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <QuickActions />
          <CalendarWidget />
        </div>
      </div>

      {/* Activity Section */}
      <RecentActivity />
    </div>
  );
};

export default Index;
