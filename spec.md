# FitTrack

## Current State
New project. Only the empty Motoko actor and scaffolded files exist.

## Requested Changes (Diff)

### Add
- User authentication (authorization component)
- Workout logging: create workouts with exercises, sets, reps, and weight
- Exercise library: predefined exercises (Bench Press, Squat, Deadlift, OHP, Pull-ups, etc.)
- Personal records tracking: auto-detect and store PRs per exercise
- Progress charts: weight lifted over time per exercise
- Dashboard: streak, total workouts, recent activity, KPI stats
- Workout history: list of past workouts with details
- Goals: set and track fitness goals

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Motoko backend:
   - User profile management (name, join date)
   - Workout CRUD (create, read, update, delete)
   - Exercise entries within workouts (exercise name, sets array with reps+weight)
   - Personal records: auto-calculate from all logged sets
   - Stats: total workouts, streak calculation, total volume
   - Goals: create and track goals
2. Frontend:
   - Dark-mode dashboard (matching design preview)
   - Sidebar navigation
   - Dashboard page with KPI cards, progress charts, recent workouts
   - Log Workout page (add exercises, sets, reps, weight)
   - Progress page with charts per exercise
   - Personal Records page
   - Workout History page
