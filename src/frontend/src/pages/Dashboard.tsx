import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Dumbbell,
  Flame,
  Plus,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { Page } from "../App";
import type { Workout } from "../backend";
import {
  useGoals,
  usePersonalRecords,
  useProfile,
  useStats,
  useWorkouts,
} from "../hooks/useQueries";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

function formatDate(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function calcStreak(workouts: Workout[]): number {
  if (!workouts.length) return 0;
  const days = [
    ...new Set(
      workouts.map((w) => {
        const d = new Date(Number(w.date) * 1000);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }),
    ),
  ]
    .sort()
    .reverse();
  let streak = 0;
  const current = new Date();
  for (const day of days) {
    const [y, m, d] = day.split("-").map(Number);
    const target = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
    const check = `${y}-${m}-${d}`;
    if (check === target) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else break;
  }
  return streak;
}

function getProgressData(workouts: Workout[], exercise: string) {
  return workouts
    .filter((w) => w.exercises.some((e) => e.name === exercise))
    .map((w) => {
      const ex = w.exercises.find((e) => e.name === exercise)!;
      const maxWeight = Math.max(...ex.sets.map((s) => s.weightKg));
      return { date: formatDate(w.date), weight: maxWeight };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: profile } = useProfile();
  const { data: workouts = [], isLoading: wLoading } = useWorkouts();
  const { data: stats } = useStats();
  const { data: records = [] } = usePersonalRecords();
  const { data: goals = [] } = useGoals();

  const streak = useMemo(() => calcStreak(workouts), [workouts]);
  const recentWorkouts = useMemo(
    () =>
      [...workouts].sort((a, b) => Number(b.date) - Number(a.date)).slice(0, 5),
    [workouts],
  );

  const featuredExercise = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const w of workouts) {
      for (const e of w.exercises) {
        counts[e.name] = (counts[e.name] || 0) + 1;
      }
    }
    return (
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "Bench Press"
    );
  }, [workouts]);

  const chartData = useMemo(
    () => getProgressData(workouts, featuredExercise),
    [workouts, featuredExercise],
  );

  const kpis = [
    {
      label: "Current Streak",
      value: `${streak}d`,
      icon: Flame,
      color: "text-fit-orange",
      bg: "bg-fit-orange/10",
    },
    {
      label: "Total Workouts",
      value: stats ? Number(stats.totalWorkouts).toString() : "0",
      icon: Dumbbell,
      color: "text-fit-green",
      bg: "bg-fit-green/10",
    },
    {
      label: "Total Volume",
      value: stats ? `${Math.round(stats.totalVolumeKg)}kg` : "0kg",
      icon: TrendingUp,
      color: "text-fit-blue",
      bg: "bg-fit-blue/10",
    },
    {
      label: "Active Goals",
      value: goals.length.toString(),
      icon: Target,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  const hasData = workouts.length > 0;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.displayName || "Athlete"}! 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Let&apos;s hit your goals.
          </p>
        </div>
        <Button
          onClick={() => onNavigate("log-workout")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          data-ocid="dashboard.log_workout.primary_button"
        >
          <Plus className="w-4 h-4" />
          Log Workout
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl p-4 border border-border"
            data-ocid={`dashboard.kpi.item.${i + 1}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {kpi.label}
              </p>
              <div
                className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}
              >
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            {wLoading ? (
              <Skeleton className="h-8 w-16 bg-muted" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      {!hasData ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl p-12 border border-border text-center"
          data-ocid="dashboard.empty_state"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Ready to start?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Log your first workout to start tracking your progress and building
            your fitness story.
          </p>
          <Button
            onClick={() => onNavigate("log-workout")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            data-ocid="dashboard.start_workout.primary_button"
          >
            <Plus className="w-4 h-4" /> Log First Workout
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Progress chart */}
            <div className="xl:col-span-2 bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Weekly Progress
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {featuredExercise} — Max Weight
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate("progress")}
                  className="text-xs text-fit-blue hover:text-fit-blue/80 flex items-center gap-1"
                  data-ocid="dashboard.progress.link"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2B2D30" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#A6AAB0", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#A6AAB0", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReTooltip
                      contentStyle={{
                        background: "#222427",
                        border: "1px solid #2B2D30",
                        borderRadius: 8,
                        color: "#F2F3F4",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#3B82F6"
                      fill="url(#blueGrad)"
                      strokeWidth={2}
                      dot={{ fill: "#3B82F6", r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  Log more workouts to see your progress chart
                </div>
              )}
            </div>

            {/* Personal Records */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  Personal Records
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate("records")}
                  className="text-xs text-fit-blue hover:text-fit-blue/80 flex items-center gap-1"
                  data-ocid="dashboard.records.link"
                >
                  All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3">
                {records.slice(0, 4).map((r, i) => (
                  <div
                    key={r.exerciseName}
                    className="flex items-center justify-between"
                    data-ocid={`dashboard.record.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">
                        {r.exerciseName}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {r.maxWeight}kg
                    </span>
                  </div>
                ))}
                {records.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No records yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Recent Workouts */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  Recent Workouts
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate("history")}
                  className="text-xs text-fit-blue hover:text-fit-blue/80 flex items-center gap-1"
                  data-ocid="dashboard.history.link"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {recentWorkouts.map((w, i) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    data-ocid={`dashboard.workout.item.${i + 1}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {w.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(w.date)} · {Number(w.durationMinutes)}min
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/30 bg-primary/10 text-xs"
                    >
                      Logged
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Goals */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">
                  Upcoming Goals
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate("goals")}
                  className="text-xs text-fit-blue hover:text-fit-blue/80 flex items-center gap-1"
                  data-ocid="dashboard.goals.link"
                >
                  Manage <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {goals.length === 0 ? (
                <div
                  className="text-center py-6"
                  data-ocid="dashboard.goals.empty_state"
                >
                  <p className="text-sm text-muted-foreground">No goals yet</p>
                  <button
                    type="button"
                    onClick={() => onNavigate("goals")}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Add a goal
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.slice(0, 4).map((g, i) => (
                    <div
                      key={g.title}
                      data-ocid={`dashboard.goal.item.${i + 1}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {g.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {g.progress}/{g.targetValue} {g.unit}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (g.progress / g.targetValue) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground pt-4">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
