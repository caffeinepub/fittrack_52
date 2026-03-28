import { Button } from "@/components/ui/button";
import { Dumbbell, Loader2, Target, TrendingUp, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    {
      icon: TrendingUp,
      label: "Track Progress",
      desc: "Visualize your fitness journey with charts",
    },
    {
      icon: Trophy,
      label: "Personal Records",
      desc: "Celebrate every new PR you achieve",
    },
    {
      icon: Target,
      label: "Set Goals",
      desc: "Define targets and track your progress",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background: "linear-gradient(135deg, #0E0F10 0%, #121416 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">FitTrack</span>
        </div>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-foreground leading-tight">
              Track your <span className="text-primary">fitness</span> journey
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Log workouts, monitor progress, set goals, and celebrate every
              personal record.
            </p>
          </motion.div>
          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-fit-surface flex items-center justify-center border border-fit-sep">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {f.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">FitTrack</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to continue your fitness journey.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Use your Internet Identity to securely log in.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-11 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Connecting...
                </>
              ) : (
                <>Sign In to FitTrack</>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
