import { Link } from "@tanstack/react-router";
import { Activity, Home, Stethoscope, User } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/Results", label: "Health Analytics", icon: Activity },
  { to: "/symptoms", label: "AI Diagnostics", icon: Stethoscope },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 px-2 pb-2 pt-2 backdrop-blur sm:rounded-b-[2.5rem]">
      <ul className="flex items-stretch justify-between">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              className="group flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="size-5" strokeWidth={2} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
