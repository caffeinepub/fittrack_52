import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat8 "mo:core/Nat8";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization State & Authentication
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      Text.compare(profile1.displayName, profile2.displayName);
    };
  };

  module Workout {
    public func compare(workout1 : Workout, workout2 : Workout) : Order.Order {
      Nat8.compare(workout1.id, workout2.id);
    };
  };

  type Profile = {
    displayName : Text;
  };

  type ProfilePublic = {
    displayName : Text;
  };

  type Set = {
    reps : Nat;
    weightKg : Float;
  };

  type Exercise = {
    name : Text;
    sets : [Set];
  };

  type Workout = {
    id : Nat8;
    name : Text;
    date : Int; // Unix timestamp
    durationMinutes : Nat;
    exercises : [Exercise];
  };

  type Goal = {
    title : Text;
    targetValue : Float;
    unit : Text;
    targetDate : Int;
    progress : Float;
  };

  type WorkoutStats = {
    totalWorkouts : Nat;
    totalVolumeKg : Float;
  };

  type PersonalRecord = {
    exerciseName : Text;
    maxWeight : Float;
    maxReps : Nat;
  };

  type PublicGoals = [Goal];

  var nextWorkoutId : Nat8 = 0;

  // Persistent State
  let profiles = Map.empty<Principal, Profile>();
  let workouts = Map.empty<Principal, List.List<Workout>>();
  let goals = Map.empty<Principal, List.List<Goal>>();
  let personalRecords = Map.empty<Principal, Map.Map<Text, PersonalRecord>>();

  public query ({ caller }) func getCallerUserProfile() : async ProfilePublic {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        {
          displayName = profile.displayName;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?ProfilePublic {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (null) { null };
      case (?profile) {
        ?{
          displayName = profile.displayName;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : ProfilePublic) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let newProfile : Profile = {
      displayName = profile.displayName;
    };
    profiles.add(caller, newProfile);
  };

  // Workout Management
  public shared ({ caller }) func logWorkout(workout : Workout) : async Nat8 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log workouts");
    };
    let workoutId = nextWorkoutId;
    nextWorkoutId += 1;

    let newWorkout = {
      workout with
      id = workoutId;
    };

    let userWorkouts = switch (workouts.get(caller)) {
      case (null) { List.empty<Workout>() };
      case (?existing) { existing };
    };
    userWorkouts.add(newWorkout);
    workouts.add(caller, userWorkouts);

    updatePersonalRecords(caller, newWorkout);
    workoutId;
  };

  func updatePersonalRecords(user : Principal, workout : Workout) {
    let userRecords = switch (personalRecords.get(user)) {
      case (null) { Map.empty<Text, PersonalRecord>() };
      case (?records) { records };
    };

    for (exercise in workout.exercises.values()) {
      var maxWeight : Float = 0;
      var maxReps : Nat = 0;

      for (set in exercise.sets.values()) {
        if (set.weightKg > maxWeight) { maxWeight := set.weightKg };
        if (set.reps > maxReps) { maxReps := set.reps };
      };

      switch (userRecords.get(exercise.name)) {
        case (null) {
          userRecords.add(
            exercise.name,
            {
              exerciseName = exercise.name;
              maxWeight;
              maxReps;
            },
          );
        };
        case (?record) {
          if (maxWeight > record.maxWeight) {
            userRecords.add(
              exercise.name,
              {
                exerciseName = exercise.name;
                maxWeight;
                maxReps = record.maxReps;
              },
            );
          } else if (maxReps > record.maxReps) {
            userRecords.add(
              exercise.name,
              {
                exerciseName = exercise.name;
                maxWeight = record.maxWeight;
                maxReps;
              },
            );
          };
        };
      };
    };

    personalRecords.add(user, userRecords);
  };

  public query ({ caller }) func getWorkouts() : async [Workout] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workouts");
    };
    switch (workouts.get(caller)) {
      case (null) { [] };
      case (?userWorkouts) { userWorkouts.toArray().sort() };
    };
  };

  public query ({ caller }) func getWorkout(workoutId : Nat8) : async Workout {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workouts");
    };
    let userWorkouts = switch (workouts.get(caller)) {
      case (null) { Runtime.trap("Workout not found") };
      case (?existing) { existing };
    };

    for (w in userWorkouts.values()) {
      if (w.id == workoutId) { return w };
    };
    Runtime.trap("Workout not found");
  };

  public shared ({ caller }) func deleteWorkout(workoutId : Nat8) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete workouts");
    };
    switch (workouts.get(caller)) {
      case (null) { Runtime.trap("Workout not found") };
      case (?userWorkouts) {
        let filteredWorkouts = userWorkouts.filter(func(w) { w.id != workoutId });
        if (filteredWorkouts.size() == userWorkouts.size()) { Runtime.trap("Workout not found") };
        workouts.add(caller, filteredWorkouts);
      };
    };
  };

  // Goal Management
  public shared ({ caller }) func addGoal(goal : Goal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add goals");
    };
    let newGoal = {
      goal with
      progress = 0.0;
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { List.empty<Goal>() };
      case (?existing) { existing };
    };
    userGoals.add(newGoal);
    goals.add(caller, userGoals);
  };

  public query ({ caller }) func getGoals() : async PublicGoals {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view goals");
    };
    switch (goals.get(caller)) {
      case (null) { [] };
      case (?userGoals) { userGoals.toArray() };
    };
  };

  public shared ({ caller }) func updateGoal(title : Text, progress : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update goals");
    };
    let userGoals = switch (goals.get(caller)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?existing) { existing };
    };

    var found = false;
    let updatedGoals = userGoals.map<Goal, Goal>(
      func(g) {
        if (g.title == title) {
          found := true;
          {
            g with
            progress;
          };
        } else { g };
      }
    );

    if (not found) { Runtime.trap("Goal not found") };

    goals.add(caller, updatedGoals);
  };

  public shared ({ caller }) func deleteGoal(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete goals");
    };
    switch (goals.get(caller)) {
      case (null) { Runtime.trap("Goal not found") };
      case (?userGoals) {
        let filteredGoals = userGoals.filter(func(g) { g.title != title });
        if (filteredGoals.size() == userGoals.size()) { Runtime.trap("Goal not found") };
        goals.add(caller, filteredGoals);
      };
    };
  };

  // Stats & Personal Records
  public query ({ caller }) func getStats() : async WorkoutStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stats");
    };
    let userWorkouts = switch (workouts.get(caller)) {
      case (null) { return { totalWorkouts = 0; totalVolumeKg = 0.0 } };
      case (?existing) { existing };
    };

    let totalVolume = userWorkouts.foldLeft(
      0.0,
      func(acc, w) {
        var workoutVolume : Float = 0.0;
        for (exercise in w.exercises.values()) {
          for (set in exercise.sets.values()) {
            workoutVolume += set.reps.toFloat() * set.weightKg;
          };
        };
        acc + workoutVolume;
      },
    );

    {
      totalWorkouts = userWorkouts.size();
      totalVolumeKg = totalVolume;
    };
  };

  public query ({ caller }) func getPersonalRecords() : async [PersonalRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view personal records");
    };
    switch (personalRecords.get(caller)) {
      case (null) { [] };
      case (?records) { records.values().toArray() };
    };
  };
};
