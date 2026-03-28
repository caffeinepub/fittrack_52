import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Dumbbell,
  History,
  LayoutDashboard,
  LogOut,
  Plus,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfile } from "../hooks/useQueries";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "log-workout", label: "Log Workout", icon: Plus },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "records", label: "Personal Records", icon: Trophy },
  { id: "history", label: "History", icon: History },
  { id: "goals", label: "Goals", icon: Target },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { clear } = useInternetIdentity();
  const { data: profile } = useProfile();
  const displayName = profile?.displayName || "User";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border min-h-screen">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-sidebar-foreground">
            FitTrack
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              data-ocid={`nav.${item.id}.link`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon
                style={{ width: 18, height: 18 }}
                className={active ? "text-primary" : ""}
              />
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-all"
              data-ocid="user.dropdown_menu"
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {displayName}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-52 bg-popover border-border"
          >
            <DropdownMenuItem
              onClick={clear}
              className="text-destructive focus:text-destructive cursor-pointer"
              data-ocid="user.logout.button"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
