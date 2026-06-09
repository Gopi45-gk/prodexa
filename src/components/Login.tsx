import { useState } from "react";
import { CheckCircle2, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export function Login({ onSuccess }: { onSuccess: (name: string) => void }) {
  const [email, setEmail] = useState("alex@taskforge.io");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => onSuccess(email.split("@")[0] || "User"), 1100);
    }, 900);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
        <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-pulse-glow delay-500" />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* LEFT — illustration */}
        <div className="relative hidden lg:flex items-center justify-center p-12 overflow-hidden">
          <div className="absolute inset-8 rounded-3xl gradient-primary opacity-20 blur-2xl animate-gradient" />

          {/* Floating cards composition */}
          <div className="relative w-full max-w-md">
            <div className="glass rounded-3xl p-6 shadow-elegant animate-fade-up">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Productivity Score</div>
                  <div className="font-display text-4xl font-bold gradient-text">92%</div>
                </div>
                <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                  <Sparkles className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[92%] gradient-primary" />
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1.5">
                {[40, 70, 55, 90, 65, 80, 95].map((h, i) => (
                  <div key={i} className="flex flex-col-reverse">
                    <div
                      className="rounded-md gradient-primary"
                      style={{ height: `${h * 0.5}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4 shadow-elegant absolute -right-8 -top-8 w-56 animate-float">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/30 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-medium">Design review</div>
                  <div className="text-xs text-muted-foreground">Completed • 2m ago</div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4 shadow-elegant absolute -left-10 -bottom-10 w-60 animate-float delay-500">
              <div className="text-xs text-muted-foreground">This week</div>
              <div className="font-display text-2xl font-bold mt-1">24 tasks</div>
              <div className="mt-2 flex items-end gap-1 h-10">
                {[3, 5, 2, 7, 4, 6, 8].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm gradient-primary opacity-80"
                    style={{ height: `${h * 10}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 max-w-xs">
            <h2 className="font-display text-3xl font-bold leading-tight">
              Your day, <span className="gradient-text">orchestrated.</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The command center for focused work and meaningful progress.
            </p>
          </div>
        </div>

        {/* RIGHT — login card */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="glass relative w-full max-w-md rounded-3xl p-8 md:p-10 shadow-elegant animate-fade-up">
            {success && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl glass">
                <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-logo-in">
                  <CheckCircle2 className="h-10 w-10 text-primary-foreground" strokeWidth={3} />
                </div>
                <div className="mt-4 font-display text-xl font-semibold">Login Successful</div>
                <div className="text-sm text-muted-foreground mt-1">Welcome back</div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <CheckCircle2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="font-display font-bold text-lg">TaskForge</div>
            </div>

            <h1 className="mt-8 font-display text-3xl md:text-4xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to continue building your momentum.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-border bg-white/5 pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:border-primary focus:bg-white/10 focus:shadow-glow"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-border bg-white/5 pl-11 pr-4 py-3.5 text-sm outline-none transition-all focus:border-primary focus:bg-white/10 focus:shadow-glow"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                  <input type="checkbox" defaultChecked className="rounded border-border accent-primary" />
                  Remember me
                </label>
                <button type="button" className="text-primary hover:underline">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl gradient-primary px-6 py-3.5 font-medium text-primary-foreground shadow-glow transition-all hover:scale-[1.02] disabled:opacity-70"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  {loading ? "Signing in…" : "Sign in"}
                  {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                className="w-full rounded-xl border border-border bg-white/5 px-6 py-3.5 text-sm font-medium transition-all hover:bg-white/10 inline-flex items-center justify-center gap-3"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3-3C17.2 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.5 2.7C6 7.3 8.8 5 12 5z"/>
                  <path fill="#4285F4" d="M23 12c0-.8-.1-1.6-.2-2.3H12v4.6h6.2c-.3 1.4-1.1 2.6-2.3 3.4l3.5 2.7c2.1-1.9 3.6-4.8 3.6-8.4z"/>
                  <path fill="#FBBC05" d="M5.1 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.6 7C.6 8.5 0 10.2 0 12s.6 3.5 1.6 5l3.5-2.7z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 5.9-1.1 7.9-2.9l-3.5-2.7c-1 .7-2.3 1.1-4.4 1.1-3.2 0-6-2.3-6.9-5.2L1.6 16C3.5 19.8 7.4 23 12 23z"/>
                </svg>
                Continue with Google
              </button>

              <p className="text-center text-sm text-muted-foreground pt-2">
                New here? <button type="button" className="text-primary hover:underline">Create an account</button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
