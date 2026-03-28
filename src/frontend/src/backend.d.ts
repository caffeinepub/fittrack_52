import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Goal {
    title: string;
    unit: string;
    progress: number;
    targetDate: bigint;
    targetValue: number;
}
export type PublicGoals = Array<Goal>;
export interface PersonalRecord {
    maxWeight: number;
    exerciseName: string;
    maxReps: bigint;
}
export interface Exercise {
    name: string;
    sets: Array<Set_>;
}
export interface WorkoutStats {
    totalWorkouts: bigint;
    totalVolumeKg: number;
}
export interface Workout {
    id: number;
    date: bigint;
    name: string;
    exercises: Array<Exercise>;
    durationMinutes: bigint;
}
export interface ProfilePublic {
    displayName: string;
}
export interface Set_ {
    reps: bigint;
    weightKg: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGoal(goal: Goal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteGoal(title: string): Promise<void>;
    deleteWorkout(workoutId: number): Promise<void>;
    getCallerUserProfile(): Promise<ProfilePublic>;
    getCallerUserRole(): Promise<UserRole>;
    getGoals(): Promise<PublicGoals>;
    getPersonalRecords(): Promise<Array<PersonalRecord>>;
    getStats(): Promise<WorkoutStats>;
    getUserProfile(user: Principal): Promise<ProfilePublic | null>;
    getWorkout(workoutId: number): Promise<Workout>;
    getWorkouts(): Promise<Array<Workout>>;
    isCallerAdmin(): Promise<boolean>;
    logWorkout(workout: Workout): Promise<number>;
    saveCallerUserProfile(profile: ProfilePublic): Promise<void>;
    updateGoal(title: string, progress: number): Promise<void>;
}
