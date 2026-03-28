import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { motion } from "motion/react";
import { usePersonalRecords } from "../hooks/useQueries";

export default function PersonalRecords() {
  const { data: records = [], isLoading } = usePersonalRecords();

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Personal Records</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your best lifts across all exercises
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="records.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full bg-muted rounded-xl" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div
          className="bg-card rounded-xl p-12 border border-border text-center"
          data-ocid="records.empty_state"
        >
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No personal records yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Log workouts to set your first PR
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card rounded-xl border border-border overflow-hidden"
          data-ocid="records.table"
        >
          <div className="grid grid-cols-3 px-5 py-3 border-b border-border bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Exercise
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
              Max Weight
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
              Max Reps
            </span>
          </div>
          {records.map((r, i) => (
            <div
              key={r.exerciseName}
              className="grid grid-cols-3 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              data-ocid={`records.item.${i + 1}`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {r.exerciseName}
                </span>
              </div>
              <span className="text-sm font-bold text-primary text-center">
                {r.maxWeight} kg
              </span>
              <span className="text-sm text-muted-foreground text-right">
                {Number(r.maxReps)} reps
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
