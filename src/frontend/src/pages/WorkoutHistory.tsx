import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, History, Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Workout } from "../backend";
import { useDeleteWorkout, useWorkouts } from "../hooks/useQueries";

function formatDate(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function WorkoutCard({ workout }: { workout: Workout }) {
  const [expanded, setExpanded] = useState(false);
  const deleteWorkout = useDeleteWorkout();

  const handleDelete = async () => {
    try {
      await deleteWorkout.mutateAsync(workout.id);
      toast.success("Workout deleted");
    } catch {
      toast.error("Failed to delete workout");
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {workout.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(workout.date)} · {Number(workout.durationMinutes)} min ·{" "}
            {workout.exercises.length} exercises
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                data-ocid="history.workout.delete_button"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              className="bg-card border-border"
              data-ocid="history.delete.dialog"
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  Delete Workout?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will permanently delete &ldquo;{workout.name}&rdquo;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="bg-muted border-border text-foreground"
                  data-ocid="history.delete.cancel_button"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-ocid="history.delete.confirm_button"
                >
                  {deleteWorkout.isPending ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            data-ocid="history.workout.toggle"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-border pt-4 space-y-3">
              {workout.exercises.map((ex, ei) => (
                <div key={`${ex.name}-${ei}`}>
                  <p className="text-xs font-semibold text-primary mb-1.5">
                    {ex.name}
                  </p>
                  <div className="grid grid-cols-3 text-xs text-muted-foreground mb-1">
                    <span>Set</span>
                    <span>Weight</span>
                    <span>Reps</span>
                  </div>
                  {ex.sets.map((s, si) => (
                    <div
                      key={`set-${ex.name}-${s.weightKg}-${Number(s.reps)}`}
                      className="grid grid-cols-3 text-xs text-foreground py-0.5"
                    >
                      <span>{si + 1}</span>
                      <span>{s.weightKg} kg</span>
                      <span>{Number(s.reps)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WorkoutHistory() {
  const { data: workouts = [], isLoading } = useWorkouts();
  const sorted = [...workouts].sort((a, b) => Number(b.date) - Number(a.date));

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workout History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {sorted.length} workouts logged
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="history.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full bg-muted rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="bg-card rounded-xl p-12 border border-border text-center"
          data-ocid="history.empty_state"
        >
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No workouts yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Your logged workouts will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              data-ocid={`history.workout.item.${i + 1}`}
            >
              <WorkoutCard workout={w} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
