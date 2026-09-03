import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { NirogXMark } from "@/components/nirogx/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NirogX — AI Health Intelligence" },
      {
        name: "description",
        content:
          "Welcome to NirogX, an AI health intelligence platform for symptom analysis, health scoring and insights.",
      },
      { property: "og:title", content: "NirogX — AI Health Intelligence" },
      {
        property: "og:description",
        content: "Access your NirogX dashboard: AI symptom analysis, health score and wellness intelligence.",
      },
    ],
  }),
  component: WelcomeScreen,
});

const STORAGE_KEY = "nirogx_user_profile";

function WelcomeScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name to continue.");
      return;
    }

    // Store user profile in localStorage for use across the app
    if (typeof window !== "undefined") {
      const profile = { name: trimmed, initials: getInitials(trimmed) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }

    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen w-full bg-secondary/60 py-0 sm:py-8">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-background px-6 pb-10 pt-16 sm:min-h-[860px] sm:rounded-[2.5rem] sm:shadow-lift sm:ring-1 sm:ring-border">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <NirogXMark className="size-16 rounded-[1.25rem] text-3xl" />
          <h1 className="mt-8 text-2xl font-semibold leading-snug tracking-tight">
            Welcome to NirogX
          </h1>
          <p className="mt-2 text-sm font-medium text-primary">AI Health Intelligence Platform</p>
          <p className="mt-3 max-w-[18rem] text-sm text-muted-foreground">
            Symptom analysis, health scoring and wellness insights — powered by machine learning.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
              Your name
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="Enter your name"
              className="h-12 rounded-xl bg-card"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <Button type="submit" size="lg" className="h-13 mt-1 w-full rounded-xl py-3.5 text-base">
            Enter Dashboard
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            Your data stays on your device
          </p>
        </form>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
