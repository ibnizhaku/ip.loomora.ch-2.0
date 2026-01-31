import {
  TrendingUp,
  Users,
  FolderKanban,
  Euro,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ProjectsOverview } from "@/components/dashboard/ProjectsOverview";

const stats = [
  {
    title: "Gesamtumsatz",
    value: "€124.580",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Euro,
  },
  {
    title: "Aktive Projekte",
    value: "23",
    change: "+3",
    changeType: "positive" as const,
    icon: FolderKanban,
  },
  {
    title: "Kunden",
    value: "156",
    change: "+8",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Auslastung",
    value: "87%",
    change: "-2.3%",
    changeType: "negative" as const,
    icon: TrendingUp,
  },
];

const Index = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Willkommen zurück, Max
        </h1>
        <p className="text-muted-foreground">
          Hier ist ein Überblick über Ihre aktuellen Aktivitäten und Projekte.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatsCard {...stat} />
          </div>
        ))}
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
        </div>
      </div>

      {/* Activity Section */}
      <RecentActivity />
    </div>
  );
};

export default Index;
