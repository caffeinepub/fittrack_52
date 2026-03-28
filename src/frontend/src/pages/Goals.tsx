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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Pencil, Plus, Target, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Goal } from "../backend";
import {
  useAddGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoal,
} from "../hooks/useQueries";

function GoalCard({ goal }: { goal: Goal }) {
  const deleteGoal = useDeleteGoal();
  const updateGoal = useUpdateGoal();
  const [newProgress, setNewProgress] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const pct = Math.min(
    100,
    Math.round((goal.progress / goal.targetValue) * 100),
  );
  const targetDate = new Date(
    Number(goal.targetDate) * 1000,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleUpdate = async () => {
    const val = Number(newProgress);
    if (Number.isNaN(val)) {
      toast.error("Enter a valid number");
      return;
    }
    try {
      await updateGoal.mutateAsync({ title: goal.title, progress: val });
      toast.success("Progress updated");
      setEditOpen(false);
      setNewProgress("");
    } catch {
      toast.error("Failed to update progress");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoal.mutateAsync(goal.title);
      toast.success("Goal deleted");
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {goal.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Target: {goal.targetValue} {goal.unit} · Due {targetDate}
          </p>
        </div>
        <div className="flex gap-1">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                data-ocid="goals.update.open_modal_button"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-border"
              data-ocid="goals.update.dialog"
            >
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Update Progress
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {goal.title} — current: {goal.progress} {goal.unit}
                </p>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="update-progress"
                    className="text-muted-foreground text-xs"
                  >
                    New Progress ({goal.unit})
                  </Label>
                  <Input
                    id="update-progress"
                    type="number"
                    placeholder={String(goal.progress)}
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value)}
                    className="bg-input border-border text-foreground"
                    data-ocid="goals.update.input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updateGoal.isPending}
                  className="bg-primary text-primary-foreground"
                  data-ocid="goals.update.save_button"
                >
                  {updateGoal.isPending ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : null}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                data-ocid="goals.goal.delete_button"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              className="bg-card border-border"
              data-ocid="goals.delete.dialog"
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  Delete Goal?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Delete &ldquo;{goal.title}&rdquo;?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="bg-muted border-border text-foreground"
                  data-ocid="goals.delete.cancel_button"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground"
                  data-ocid="goals.delete.confirm_button"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {goal.progress} / {goal.targetValue} {goal.unit}
          </span>
          <span
            className={
              pct >= 100
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            }
          >
            {pct}%
          </span>
        </div>
        <Progress value={pct} className="h-2 bg-muted" />
      </div>
    </div>
  );
}

export default function Goals() {
  const { data: goals = [], isLoading } = useGoals();
  const addGoal = useAddGoal();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const handleAdd = async () => {
    if (!title.trim() || !targetValue || !unit.trim() || !targetDate) {
      toast.error("Fill in all fields");
      return;
    }
    const ts = BigInt(Math.floor(new Date(targetDate).getTime() / 1000));
    try {
      await addGoal.mutateAsync({
        title: title.trim(),
        targetValue: Number(targetValue),
        unit: unit.trim(),
        targetDate: ts,
        progress: 0,
      });
      toast.success("Goal added!");
      setOpen(false);
      setTitle("");
      setTargetValue("");
      setUnit("");
      setTargetDate("");
    } catch {
      toast.error("Failed to add goal");
    }
  };

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your fitness milestones
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              data-ocid="goals.add.open_modal_button"
            >
              <Plus className="w-4 h-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent
            className="bg-card border-border"
            data-ocid="goals.add.dialog"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="goal-title"
                  className="text-muted-foreground text-xs"
                >
                  Goal Title
                </Label>
                <Input
                  id="goal-title"
                  placeholder="e.g. Bench Press 100kg"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-input border-border text-foreground"
                  data-ocid="goals.add.title.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="goal-target"
                    className="text-muted-foreground text-xs"
                  >
                    Target Value
                  </Label>
                  <Input
                    id="goal-target"
                    type="number"
                    placeholder="100"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="bg-input border-border text-foreground"
                    data-ocid="goals.add.target.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="goal-unit"
                    className="text-muted-foreground text-xs"
                  >
                    Unit
                  </Label>
                  <Input
                    id="goal-unit"
                    placeholder="kg, reps, km..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="bg-input border-border text-foreground"
                    data-ocid="goals.add.unit.input"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="goal-date"
                  className="text-muted-foreground text-xs"
                >
                  Target Date
                </Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="bg-input border-border text-foreground"
                  data-ocid="goals.add.date.input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleAdd}
                disabled={addGoal.isPending}
                className="bg-primary text-primary-foreground"
                data-ocid="goals.add.submit_button"
              >
                {addGoal.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : null}
                Add Goal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="goals.loading_state">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full bg-muted rounded-xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div
          className="bg-card rounded-xl p-12 border border-border text-center"
          data-ocid="goals.empty_state"
        >
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No goals yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Set a fitness goal to stay motivated
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {goals.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`goals.goal.item.${i + 1}`}
              >
                <GoalCard goal={g} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
