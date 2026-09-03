import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Droplets,
  Footprints,
  HeartPulse,
  MessageSquareText,
  Moon,
  ScanLine,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";
import { PhoneShell } from "@/components/nirogx/phone-shell";
import { calculateHealthScore, HealthScoreResponse } from "@/services/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Home Dashboard | NirogX" }],
  }),
  component: Dashboard,
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

function loadProfile(): UserProfile {
  if (typeof window === "undefined") return { name: "User", initials: "U" };
  try {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { name: "User", initials: "U" };
}

function loadVitals(): UserVitals {
  if (typeof window === "undefined")
    return {
      age: null,
      height_cm: null,
      weight_kg: null,
      heart_rate: null,
      blood_pressure_systolic: null,
      blood_pressure_diastolic: null,
      sleep_hours: null,
      daily_steps: null,
    };
  try {
    const saved = localStorage.getItem(VITALS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    age: null,
    height_cm: null,
    weight_kg: null,
    heart_rate: null,
    blood_pressure_systolic: null,
    blood_pressure_diastolic: null,
    sleep_hours: null,
    daily_steps: null,
  };
}

// Dynamic Score Ring Component
function ScoreRing({
  score,
  isLoading,
  noData,
}: {
  score: number;
  isLoading: boolean;
  noData: boolean;
}) {
  const r = 72;
  const c = 2 * Math.PI * r;
  const safeScore = isNaN(score) ? 0 : score;
  const dashOffset = noData ? c : c * (1 - safeScore / 100);

  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 168 168" className="size-48 -rotate-90">
        <circle
          cx="84"
          cy="84"
          r={r}
          className="fill-none stroke-primary/15"
          strokeWidth="16"
        />
        <circle
          cx="84"
          cy="84"
          r={r}
          className={cn(
            "fill-none stroke-primary transition-all duration-1000 ease-out",
            noData && "stroke-muted-foreground/30",
          )}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        {isLoading ? (
          <span className="text-2xl font-bold tracking-tight text-muted-foreground animate-pulse">
            ...
          </span>
        ) : noData ? (
          <span className="text-xl font-bold tracking-tight text-muted-foreground">N/A</span>
        ) : (
          <span className="text-5xl font-bold tracking-tight text-foreground">{safeScore}</span>
        )}
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Score
        </span>
      </div>
    </div>
  );
}

// Steps Ring
function StepsRing({ steps, target }: { steps: number; target: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const progress = Math.min(steps / target, 1);
  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 60 60" className="size-16 -rotate-90">
        <circle cx="30" cy="30" r={r} className="fill-none stroke-secondary" strokeWidth="6" />
        <circle
          cx="30"
          cy="30"
          r={r}
          className="fill-none stroke-primary"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
        />
      </svg>
      <Footprints className="absolute size-5 text-primary" />
    </div>
  );
}

const quickActions = [
  { icon: ScanLine, label: "Scan Reports", to: "/Results" as const },
  { icon: Stethoscope, label: "Log Symptoms", to: "/symptoms" as const },
  { icon: MessageSquareText, label: "AI Chat", to: "/chat" as const },
];

function formatSleep(hours: number | null): string {
  if (!hours) return "--";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function Dashboard() {
  const [profile, setProfile] = useState<UserProfile>({ name: "User", initials: "U" });
  const [vitals, setVitals] = useState<UserVitals>(loadVitals);
  const [scoreData, setScoreData] = useState<HealthScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNoData, setHasNoData] = useState(false);

  // Load profile on client
  useEffect(() => {
    setProfile(loadProfile());
    setVitals(loadVitals());
  }, []);

  useEffect(() => {
    const fetchScore = async () => {
      // Read symptoms from localStorage
      let storedSymptoms: string[] = [];
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("nirogx_logged_symptoms");
          storedSymptoms = saved ? JSON.parse(saved) : [];
        } catch {
          storedSymptoms = [];
        }
      }

      // Build dynamic payload from stored vitals
      const currentVitals = loadVitals();
      const payload = {
        heart_rate: currentVitals.heart_rate,
        blood_pressure_systolic: currentVitals.blood_pressure_systolic,
        blood_pressure_diastolic: currentVitals.blood_pressure_diastolic,
        daily_steps: currentVitals.daily_steps,
        age: currentVitals.age,
        height_cm: currentVitals.height_cm,
        weight_kg: currentVitals.weight_kg,
        sleep_hours: currentVitals.sleep_hours,
        symptoms: storedSymptoms,
      };

      try {
        const res = await calculateHealthScore(payload);
        setScoreData(res);
        setHasNoData(false);
      } catch (error) {
        console.error("Failed to fetch health score:", error);
        setHasNoData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScore();
  }, []);

  const stepsValue = vitals.daily_steps ?? 0;
  const stepsTarget = 10000;

  const displayVitals = [
    {
      label: "Footsteps",
      value: stepsValue > 0 ? stepsValue.toLocaleString() : "--",
      sub: stepsValue > 0 ? `/ ${stepsTarget.toLocaleString()}` : "",
      icon: () => <StepsRing steps={stepsValue} target={stepsTarget} />,
      isCustom: true,
    },
    {
      label: "Heart Rate",
      value: vitals.heart_rate ? String(vitals.heart_rate) : "--",
      sub: vitals.heart_rate ? "bpm" : "",
      icon: HeartPulse,
      iconColor: "text-metric-heart",
      bgColor: "bg-metric-heart-bg",
    },
    {
      label: "Sleep Activity",
      value: formatSleep(vitals.sleep_hours),
      sub: "",
      icon: Moon,
      iconColor: "text-metric-sleep",
      bgColor: "bg-metric-sleep-bg",
    },
    {
      label: "Hydration",
      value: "1.5",
      sub: "L",
      icon: Droplets,
      iconColor: "text-metric-hydration",
      bgColor: "bg-metric-hydration-bg",
    },
  ];

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 pt-8">
        {/* Profile Teaser */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-13 place-items-center rounded-full border-2 border-primary bg-accent text-sm font-semibold text-accent-foreground shadow-soft">
              {profile.initials}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Hello, {profile.name.split(" ")[0]}
              </h1>
              <Link
                to="/profile"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                View Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald/20">
            <span className="size-2 animate-pulse rounded-full bg-emerald shadow-[0_0_6px] shadow-emerald" />
            System Online
          </div>
        </header>

        {/* Dynamic Health Score */}
        <section className="mt-6 rounded-[1.75rem] border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-col items-center">
            <ScoreRing
              score={scoreData?.overallScore || 0}
              isLoading={isLoading}
              noData={hasNoData}
            />

            <p className="mt-4 text-center text-sm font-medium text-muted-foreground">
              {isLoading ? (
                <span className="animate-pulse">Analyzing health profile...</span>
              ) : hasNoData ? (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="size-4" />
                  Could not connect to server
                </span>
              ) : scoreData?.overallScore === null ? (
                <span className="text-amber-600">
                  Add your vitals in Profile to get a health score
                </span>
              ) : scoreData?.components?.symptomsMl?.status === "attention" ? (
                <span className="text-amber-600">Symptoms detected. ML analysis applied.</span>
              ) : (
                "Your wellness is on track."
              )}
            </p>

            {scoreData && scoreData.indicatorsUsed > 0 && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Based on {scoreData.indicatorsUsed} of {scoreData.indicatorsTotal} indicators
              </p>
            )}
          </div>
        </section>

        {/* Health Metrics Grid */}
        <section className="mt-6 grid grid-cols-2 gap-3">
          {displayVitals.map((vital) => (
            <article
              key={vital.label}
              className="flex aspect-square flex-col items-center justify-center rounded-[1.75rem] border border-border bg-card p-4 shadow-soft"
            >
              {vital.isCustom ? (
                <vital.icon />
              ) : (
                <div
                  className={`grid size-16 place-items-center rounded-full ${vital.bgColor} ${vital.iconColor}`}
                >
                  <vital.icon className="size-6" />
                </div>
              )}
              <p className="mt-2 text-xs font-semibold text-muted-foreground">{vital.label}</p>
              <p className="text-sm font-bold text-foreground">
                {vital.value}
                {vital.sub && (
                  <span className="text-xs font-medium text-muted-foreground">{vital.sub}</span>
                )}
              </p>
            </article>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="mt-6">
          <h2 className="text-sm font-bold tracking-tight text-foreground">Quick Actions</h2>
          <div className="-mx-5 mt-3 flex gap-3 overflow-x-auto no-scrollbar px-5 pb-1">
            {quickActions.map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-soft transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Icon className="size-4 text-primary" />
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PhoneShell>
  );
}