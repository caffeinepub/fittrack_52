import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dumbbell, Loader2, Plus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import { useLogWorkout } from "../hooks/useQueries";

interface LogWorkoutProps {
  onNavigate: (page: Page) => void;
}

const PRESET_EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Overhead Press",
  "Pull-ups",
  "Barbell Row",
  "Leg Press",
  "Romanian Deadlift",
  "Incline Bench",
  "Dumbbell Curl",
  "Tricep Pushdown",
  "Lateral Raise",
];

interface SetEntry {
  reps: string;
  weightKg: string;
}
interface ExerciseEntry {
  name: string;
  sets: SetEntry[];
  id: string;
}

let exId = 0;
function newExercise(): ExerciseEntry {
  return { name: "", sets: [{ reps: "", weightKg: "" }], id: String(exId++) };
}

export default function LogWorkout({ onNavigate }: LogWorkoutProps) {
  const logWorkout = useLogWorkout();
  const [workoutName, setWorkoutName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState<ExerciseEntry[]>([newExercise()]);

  const addExercise = () => setExercises((prev) => [...prev, newExercise()]);

  const removeExercise = (id: string) =>
    setExercises((prev) => prev.filter((ex) => ex.id !== id));

  const setExerciseName = (id: string, name: string) =>
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, name } : ex)),
    );

  const addSet = (exId: string) =>
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exId
          ? { ...ex, sets: [...ex.sets, { reps: "", weightKg: "" }] }
          : ex,
      ),
    );

  const removeSet = (exId: string, sIdx: number) =>
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exId
          ? { ...ex, sets: ex.sets.filter((_, si) => si !== sIdx) }
          : ex,
      ),
    );

  const updateSet = (
    exId: string,
    sIdx: number,
    field: keyof SetEntry,
    val: string,
  ) =>
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exId
          ? {
              ...ex,
              sets: ex.sets.map((s, si) =>
                si === sIdx ? { ...s, [field]: val } : s,
              ),
            }
          : ex,
      ),
    );

  const handleSubmit = async () => {
    if (!workoutName.trim()) {
      toast.error("Enter a workout name");
      return;
    }
    if (!duration || Number.isNaN(Number(duration))) {
      toast.error("Enter a valid duration");
      return;
    }
    const validExercises = exercises.filter(
      (e) => e.name.trim() && e.sets.some((s) => s.reps && s.weightKg),
    );
    if (!validExercises.length) {
      toast.error("Add at least one exercise with a set");
      return;
    }

    const dateTs = BigInt(Math.floor(new Date(date).getTime() / 1000));
    const workout = {
      id: 0,
      name: workoutName.trim(),
      date: dateTs,
      durationMinutes: BigInt(Number(duration)),
      exercises: validExercises.map((e) => ({
        name: e.name,
        sets: e.sets
          .filter((s) => s.reps && s.weightKg)
          .map((s) => ({
            reps: BigInt(Number(s.reps)),
            weightKg: Number(s.weightKg),
          })),
      })),
    };

    try {
      await logWorkout.mutateAsync(workout);
      toast.success("Workout logged! 💪");
      onNavigate("dashboard");
    } catch {
      toast.error("Failed to log workout");
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Log Workout</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Record your training session
        </p>
      </div>

      <div className="space-y-5">
        {/* Workout info */}
        <div className="bg-card rounded-xl p-5 border border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Workout Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="workout-name"
                className="text-muted-foreground text-xs"
              >
                Workout Name
              </Label>
              <Input
                id="workout-name"
                placeholder="e.g. Upper Body Push"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground/50"
                data-ocid="log_workout.name.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="workout-date"
                className="text-muted-foreground text-xs"
              >
                Date
              </Label>
              <Input
                id="workout-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-input border-border text-foreground"
                data-ocid="log_workout.date.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="workout-duration"
                className="text-muted-foreground text-xs"
              >
                Duration (minutes)
              </Label>
              <Input
                id="workout-duration"
                type="number"
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground/50"
                data-ocid="log_workout.duration.input"
              />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <AnimatePresence>
          {exercises.map((ex, exIdx) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card rounded-xl p-5 border border-border"
              data-ocid={`log_workout.exercise.item.${exIdx + 1}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Exercise {exIdx + 1}
                  </h3>
                </div>
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(ex.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    data-ocid={`log_workout.exercise.delete_button.${exIdx + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mb-4">
                <Select
                  value={ex.name}
                  onValueChange={(v) => setExerciseName(ex.id, v)}
                >
                  <SelectTrigger
                    className="bg-input border-border text-foreground"
                    data-ocid={`log_workout.exercise.select.${exIdx + 1}`}
                  >
                    <SelectValue placeholder="Select exercise..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {PRESET_EXERCISES.map((e) => (
                      <SelectItem
                        key={e}
                        value={e}
                        className="text-foreground hover:bg-accent"
                      >
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Or type custom exercise name"
                  value={ex.name}
                  onChange={(e) => setExerciseName(ex.id, e.target.value)}
                  className="mt-2 bg-input border-border text-foreground placeholder:text-muted-foreground/50 text-sm"
                />
              </div>

              {/* Sets */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground uppercase tracking-wider px-1">
                  <span className="col-span-1">#</span>
                  <span className="col-span-5">Weight (kg)</span>
                  <span className="col-span-5">Reps</span>
                </div>
                {ex.sets.map((s, sIdx) => (
                  <div
                    key={`set-${ex.id}-${sIdx}`}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <span className="col-span-1 text-xs text-muted-foreground font-mono">
                      {sIdx + 1}
                    </span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={s.weightKg}
                      onChange={(e) =>
                        updateSet(ex.id, sIdx, "weightKg", e.target.value)
                      }
                      className="col-span-5 bg-input border-border text-foreground h-8 text-sm"
                    />
                    <Input
                      type="number"
                      placeholder="0"
                      value={s.reps}
                      onChange={(e) =>
                        updateSet(ex.id, sIdx, "reps", e.target.value)
                      }
                      className="col-span-5 bg-input border-border text-foreground h-8 text-sm"
                    />
                    {ex.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSet(ex.id, sIdx)}
                        className="col-span-1 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => addSet(ex.id)}
                  className="text-xs text-muted-foreground hover:text-foreground gap-1 h-7"
                  data-ocid={`log_workout.add_set.button.${exIdx + 1}`}
                >
                  <Plus className="w-3 h-3" /> Add Set
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          variant="outline"
          type="button"
          onClick={addExercise}
          className="w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-card gap-2"
          data-ocid="log_workout.add_exercise.button"
        >
          <Plus className="w-4 h-4" /> Add Exercise
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={logWorkout.isPending}
          className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          data-ocid="log_workout.submit_button"
        >
          {logWorkout.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {logWorkout.isPending ? "Logging..." : "Save Workout"}
        </Button>
      </div>
    </div>
  );
}
