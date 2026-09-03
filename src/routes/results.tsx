import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Cpu,
  Layers,
  Loader2,
  MessageSquareText,
  ServerCrash,
} from "lucide-react";
import { PhoneShell } from "@/components/nirogx/phone-shell";
import { Button } from "@/components/ui/button";
import { getPrediction, PredictionResponse } from "@/services/api";

export const Route = createFileRoute("/Results")({
  head: () => ({
    meta: [
      { title: "AI Diagnostic Prediction | NirogX" },
      {
        name: "description",
        content:
          "NirogX AI diagnostic prediction results with ML model output and clinical safety disclaimer.",
      },
      { property: "og:title", content: "AI Diagnostic Prediction | NirogX" },
      {
        property: "og:description",
        content: "Review your NirogX AI prediction and model transparency details.",
      },
    ],
  }),
  component: Results,
});

function Results() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  useEffect(() => {
    const runPrediction = async () => {
      // Read symptoms from localStorage (saved by the symptoms page)
      let storedSymptoms: string[] = [];
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("nirogx_logged_symptoms");
          storedSymptoms = saved ? JSON.parse(saved) : [];
        } catch {
          storedSymptoms = [];
        }
      }

      setSymptoms(storedSymptoms);

      if (storedSymptoms.length === 0) {
        setError("no_symptoms");
        setIsLoading(false);
        return;
      }

      try {
        const result = await getPrediction(storedSymptoms);
        setPrediction(result);
      } catch (err: any) {
        setError(err.message || "Failed to get prediction from server.");
      } finally {
        setIsLoading(false);
      }
    };

    runPrediction();
  }, []);

  const formatLabel = (s: string) =>
    s
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <PhoneShell>
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 pt-8">
        <div className="flex items-center gap-3">
          <Link
            to="/symptoms"
            className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground"
            aria-label="Back to symptom checker"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Analysis Results</h1>
        </div>

        {/* Loading State */}
        {isLoading && (
          <section className="mt-10 flex flex-col items-center gap-4 text-center">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Running ML analysis on {symptoms.length} symptom{symptoms.length !== 1 ? "s" : ""}...
            </p>
          </section>
        )}

        {/* No Symptoms State */}
        {!isLoading && error === "no_symptoms" && (
          <section className="mt-10 flex flex-col items-center gap-4 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-secondary">
              <Layers className="size-7 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">No Symptoms Selected</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Please select at least one symptom before running analysis.
              </p>
            </div>
            <Button asChild className="mt-2 h-11 rounded-xl">
              <Link to="/symptoms">Go to Symptom Checker</Link>
            </Button>
          </section>
        )}

        {/* Error State */}
        {!isLoading && error && error !== "no_symptoms" && (
          <section className="mt-10 flex flex-col items-center gap-4 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-destructive/10">
              <ServerCrash className="size-7 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Analysis Failed</h2>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              variant="outline"
              className="mt-2 h-11 rounded-xl"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </section>
        )}

        {/* Prediction Results */}
        {!isLoading && prediction && (
          <>
            <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                AI Diagnostic Prediction
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary">
                {prediction.prediction}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on {prediction.symptoms_analyzed.length} symptom
                {prediction.symptoms_analyzed.length !== 1 ? "s" : ""} analyzed
              </p>
            </section>

            {/* Clinical Disclaimer */}
            <section className="mt-4 rounded-2xl border border-warning/40 bg-warning-surface p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-warning" />
                <p className="text-xs leading-relaxed text-warning-foreground">
                  This system is supported by machine learning models and does not substitute
                  professional medical consultation. Always confirm findings with a licensed
                  clinician.
                </p>
              </div>
            </section>

            {/* Symptoms Analyzed */}
            <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
              <h3 className="text-sm font-semibold tracking-tight">Symptoms Analyzed</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {prediction.symptoms_analyzed.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {formatLabel(s)}
                  </span>
                ))}
              </div>
            </section>

            {/* System Status */}
            <section className="mt-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
              <h3 className="text-sm font-semibold tracking-tight">System Status</h3>
              <dl className="mt-4 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <Cpu className="size-4" />
                  </span>
                  <div>
                    <dt className="text-muted-foreground">Model</dt>
                    <dd className="font-medium text-foreground">Random Forest Classifier</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <Layers className="size-4" />
                  </span>
                  <div>
                    <dt className="text-muted-foreground">Input space</dt>
                    <dd className="font-medium text-foreground">132 Vector Parameters</dd>
                  </div>
                </div>
              </dl>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald" />
                Inference completed successfully
              </div>
            </section>

            <Button asChild size="lg" className="mt-5 h-12 w-full rounded-xl text-sm">
              <Link to="/chat">
                <MessageSquareText className="size-4" />
                Discuss with NirogX AI
              </Link>
            </Button>
          </>
        )}
      </div>
    </PhoneShell>
  );
}
