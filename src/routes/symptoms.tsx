import { createFileRoute } from '@tanstack/react-router'
import { Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, Sparkle, X, Plus, AlertCircle, Loader2 } from "lucide-react";
import { PhoneShell } from "@/components/nirogx/phone-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { fetchSymptoms } from "@/services/api";

export const Route = createFileRoute("/symptoms")({
  component: SymptomChecker,
});

function SymptomChecker() {
  const [query, setQuery] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // FIX: Safely check for 'window' so SSR doesn't crash on page load
  const [selected, setSelected] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("nirogx_logged_symptoms");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    fetchSymptoms()
      .then((data) => {
        setSymptoms(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load symptoms", err);
        setError("Cannot connect to the backend server. Make sure it is running.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // FIX: Safely check for 'window' before saving to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nirogx_logged_symptoms", JSON.stringify(selected));
    }
  }, [selected]);

  const formatLabel = (s: string) => 
    s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const filtered = useMemo(
    () => symptoms.filter((s) => formatLabel(s).toLowerCase().includes(query.trim().toLowerCase())),
    [query, symptoms],
  );

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <PhoneShell>
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="px-5 pb-4 pt-8">
          <h1 className="text-xl font-semibold tracking-tight">Symptom Checker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Log your active symptoms for ML analysis.
          </p>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-40">
          
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 shadow-sm">
              <AlertCircle className="size-5 shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          <button 
            onClick={() => setIsSearchModalOpen(true)}
            disabled={isLoading || !!error}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:border-primary/50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              <span className="text-sm">{isLoading ? "Loading database..." : "Search symptoms..."}</span>
            </div>
            <Plus className="size-4 text-primary" />
          </button>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">
              Selected ({selected.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selected.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No symptoms selected yet.</p>
              ) : (
                selected.map((s) => (
                  <div
                    key={s}
                    className="flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary shadow-soft"
                  >
                    {formatLabel(s)}
                    <button onClick={() => toggle(s)} className="text-primary hover:text-primary/70">
                      <X className="size-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {isSearchModalOpen && (
          <div className="absolute inset-0 z-20 bg-background flex flex-col animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search..."
                className="h-10 border-none shadow-none focus-visible:ring-0 bg-transparent flex-1"
              />
              <button 
                onClick={() => { setIsSearchModalOpen(false); setQuery(""); }}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-muted/20">
              {filtered.map((s) => {
                const active = selected.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm transition-colors",
                      active ? "bg-primary/10 font-semibold text-primary" : "bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    {formatLabel(s)}
                    {active && <span className="text-xs">Selected</span>}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-border bg-card">
              <Button onClick={() => setIsSearchModalOpen(false)} className="w-full h-12 rounded-xl">
                Done ({selected.length} selected)
              </Button>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-[76px] z-10 px-4 pb-3">
          <div className="pointer-events-auto rounded-3xl border border-border bg-card p-4 shadow-lift">
            <Button asChild size="lg" disabled={selected.length === 0} className="h-12 w-full rounded-xl text-sm">
              <Link to="/Results">
                <Sparkle className="size-4" />
                Analyze Symptoms (Scikit-Learn AI)
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}