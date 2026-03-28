import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useWorkouts } from "../hooks/useQueries";

function formatDate(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function Progress() {
  const { data: workouts = [] } = useWorkouts();
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  const allExercises = useMemo(() => {
    const s = new Set<string>();
    for (const w of workouts) for (const e of w.exercises) s.add(e.name);
    return [...s].sort();
  }, [workouts]);

  const exercise = selectedExercise || allExercises[0] || "";

  const chartData = useMemo(() => {
    if (!exercise) return [];
    return workouts
      .filter((w) => w.exercises.some((e) => e.name === exercise))
      .map((w) => {
        const ex = w.exercises.find((e) => e.name === exercise)!;
        const maxWeight = Math.max(...ex.sets.map((s) => s.weightKg));
        const volume = ex.sets.reduce(
          (sum, s) => sum + Number(s.reps) * s.weightKg,
          0,
        );
        return {
          date: formatDate(w.date),
          maxWeight,
          volume: Math.round(volume),
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [workouts, exercise]);

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your strength gains over time
        </p>
      </div>

      {allExercises.length === 0 ? (
        <div
          className="bg-card rounded-xl p-12 border border-border text-center"
          data-ocid="progress.empty_state"
        >
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No workout data yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Log workouts to see your progress charts
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Label
              htmlFor="exercise-select"
              className="text-sm text-muted-foreground"
            >
              Exercise:
            </Label>
            <Select value={exercise} onValueChange={setSelectedExercise}>
              <SelectTrigger
                id="exercise-select"
                className="w-56 bg-input border-border text-foreground"
                data-ocid="progress.exercise.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {allExercises.map((e) => (
                  <SelectItem key={e} value={e} className="text-foreground">
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4"
          >
            {/* Max Weight chart */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Max Weight per Session (kg)
              </h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="greenGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2ED47A"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2ED47A"
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
                      unit="kg"
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
                      dataKey="maxWeight"
                      stroke="#2ED47A"
                      fill="url(#greenGrad)"
                      strokeWidth={2}
                      dot={{ fill: "#2ED47A", r: 3 }}
                      name="Max Weight"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-10">
                  No data for this exercise
                </p>
              )}
            </div>

            {/* Volume chart */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                Volume per Session (reps × weight kg)
              </h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
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
                    <Bar
                      dataKey="volume"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      name="Volume"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-10">
                  No data for this exercise
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
