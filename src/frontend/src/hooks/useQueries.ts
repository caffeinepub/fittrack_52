import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Goal, Workout } from "../backend";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (displayName: string) => {
      if (!actor) throw new Error("No actor");
      await actor.saveCallerUserProfile({ displayName });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useWorkouts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getWorkouts();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getStats();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePersonalRecords() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["personalRecords"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPersonalRecords();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGoals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getGoals();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogWorkout() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (workout: Workout) => {
      if (!actor) throw new Error("No actor");
      return await actor.logWorkout(workout);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["personalRecords"] });
    },
  });
}

export function useDeleteWorkout() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (workoutId: number) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteWorkout(workoutId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useAddGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (goal: Goal) => {
      if (!actor) throw new Error("No actor");
      await actor.addGoal(goal);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useDeleteGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteGoal(title);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      progress,
    }: { title: string; progress: number }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateGoal(title, progress);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}
