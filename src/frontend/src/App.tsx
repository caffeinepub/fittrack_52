import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { Dumbbell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useProfile, useSaveProfile } from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import LogWorkout from "./pages/LogWorkout";
import PersonalRecords from "./pages/PersonalRecords";
import Progress from "./pages/Progress";
import WorkoutHistory from "./pages/WorkoutHistory";

export type Page =
  | "dashboard"
  | "log-workout"
  | "progress"
  | "records"
  | "history"
  | "goals";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [nameInput, setNameInput] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);

  const isLoggedIn = !!identity;
  const { data: profile, isLoading: profileLoading } = useProfile();
  const saveProfile = useSaveProfile();

  useEffect(() => {
    if (isLoggedIn && profile !== undefined && profile !== null) {
      if (!profile.displayName || profile.displayName.trim() === "") {
        setShowNameModal(true);
      }
    }
  }, [isLoggedIn, profile]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await saveProfile.mutateAsync(nameInput.trim());
    setShowNameModal(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Dumbbell className="text-primary w-10 h-10 animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading FitTrack...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "log-workout":
        return <LogWorkout onNavigate={setCurrentPage} />;
      case "progress":
        return <Progress />;
      case "records":
        return <PersonalRecords />;
      case "history":
        return <WorkoutHistory />;
      case "goals":
        return <Goals />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 min-w-0 overflow-auto">{renderPage()}</main>

      <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
        <DialogContent
          className="bg-card border-border"
          data-ocid="name_setup.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Welcome to FitTrack! 💪
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Set your display name to personalize your experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Label htmlFor="display-name" className="text-foreground">
              Display Name
            </Label>
            <Input
              id="display-name"
              placeholder="e.g. Alex Johnson"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              className="bg-input border-border text-foreground"
              data-ocid="name_setup.input"
            />
            <Button
              onClick={handleSaveName}
              disabled={!nameInput.trim() || saveProfile.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="name_setup.submit_button"
            >
              {saveProfile.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {saveProfile.isPending ? "Saving..." : "Get Started"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
