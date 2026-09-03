import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  FileText,
  History,
  Lock,
  LogOut,
  Save,
  Settings,
  User,
} from "lucide-react";
import { PhoneShell } from "@/components/nirogx/phone-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings | NirogX" },
      {
        name: "description",
        content:
          "Manage your NirogX profile and health vitals for accurate health scoring.",
      },
      { property: "og:title", content: "Profile & Settings | NirogX" },
      {
        property: "og:description",
        content: "Your NirogX profile and health vitals.",
      },
    ],
  }),
  component: Profile,
});

const PROFILE_KEY = "nirogx_user_profile";
const VITALS_KEY = "nirogx_user_vitals";

interface UserProfile {
  name: string;
  initials: string;
}

interface UserVitals {
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  heart_rate: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  sleep_hours: number | null;
  daily_steps: number | null;
}

const DEFAULT_VITALS: UserVitals = {
  age: null,
  height_cm: null,
  weight_kg: null,
  heart_rate: null,
  blood_pressure_systolic: null,
  blood_pressure_diastolic: null,
  sleep_hours: null,
  daily_steps: null,
};

function loadProfile(): UserProfile {
  if (typeof window === "undefined") return { name: "User", initials: "U" };
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { name: "User", initials: "U" };
}

function loadVitals(): UserVitals {
  if (typeof window === "undefined") return DEFAULT_VITALS;
  try {
    const saved = localStorage.getItem(VITALS_KEY);
    if (saved) return { ...DEFAULT_VITALS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_VITALS;
}

const menuItems = [
  { icon: User, label: "Personal Information", to: "/profile" },
  { icon: History, label: "Medical History", to: "/profile" },
  { icon: Settings, label: "App Settings", to: "/profile" },
  { icon: Lock, label: "Privacy & Security", to: "/profile" },
];

function Profile() {
  const [profile] = useState<UserProfile>(loadProfile);
  const [vitals, setVitals] = useState<UserVitals>(loadVitals);
  const [saved, setSaved] = useState(false);

  const handleVitalChange = (key: keyof UserVitals, value: string) => {
    const num = value === "" ? null : Number(value);
    setVitals((prev) => ({ ...prev, [key]: num }));
    setSaved(false);
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(VITALS_KEY, JSON.stringify(vitals));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const vitalFields: { key: keyof UserVitals; label: string; unit: string; placeholder: string }[] = [
    { key: "age", label: "Age", unit: "years", placeholder: "e.g. 25" },
    { key: "height_cm", label: "Height", unit: "cm", placeholder: "e.g. 170" },
    { key: "weight_kg", label: "Weight", unit: "kg", placeholder: "e.g. 65" },
    { key: "heart_rate", label: "Resting Heart Rate", unit: "bpm", placeholder: "e.g. 72" },
    { key: "blood_pressure_systolic", label: "BP Systolic", unit: "mmHg", placeholder: "e.g. 120" },
    { key: "blood_pressure_diastolic", label: "BP Diastolic", unit: "mmHg", placeholder: "e.g. 80" },
    { key: "sleep_hours", label: "Sleep", unit: "hours", placeholder: "e.g. 7.5" },
    { key: "daily_steps", label: "Daily Steps", unit: "steps", placeholder: "e.g. 8000" },
  ];

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 pt-8">
        {/* User Identity */}
        <section className="flex flex-col items-center">
          <div className="grid size-24 place-items-center rounded-full border-4 border-primary bg-accent text-2xl font-semibold text-accent-foreground shadow-soft">
            {profile.initials}
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">NirogX Health Profile</p>
        </section>

        {/* Editable Vitals */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold tracking-tight">Health Vitals</h2>
            <p className="text-[11px] text-muted-foreground">Used for health score calculation</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {vitalFields.map(({ key, label, unit, placeholder }) => (
              <div key={key} className="space-y-1">
                <Label className="text-[11px] font-medium text-muted-foreground">
                  {label} <span className="text-[10px]">({unit})</span>
                </Label>
                <Input
                  type="number"
                  value={vitals[key] ?? ""}
                  onChange={(e) => handleVitalChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="h-9 rounded-lg bg-background text-sm"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={handleSave}
            className="mt-4 h-10 w-full rounded-xl text-sm"
          >
            <Save className="size-4" />
            {saved ? "Saved!" : "Save Vitals"}
          </Button>
        </section>

        {/* Menu List */}
        <section className="mt-6 rounded-3xl border border-border bg-card p-2 shadow-soft">
          <ul>
            {menuItems.map(({ icon: Icon, label, to }, index) => (
              <li
                key={label}
                className={index !== menuItems.length - 1 ? "border-b border-border" : ""}
              >
                <Link
                  to={to}
                  className="flex items-center justify-between rounded-2xl px-3 py-3.5 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4.5" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Log Out */}
        <section className="mt-6">
          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-background py-3.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/5"
          >
            <LogOut className="size-4" />
            Log Out
          </Link>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            This will return you to the welcome screen.
          </p>
        </section>
      </div>
    </PhoneShell>
  );
}
