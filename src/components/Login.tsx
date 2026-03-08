import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, UsersRound, CheckCircle2 } from "lucide-react";
import { LoginForm } from "@/components/ui/login-form";
import { Badge } from "./ui/badge";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [navigate, user]);

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground">
      <div className="mx-auto grid min-h-svh max-w-6xl grid-cols-1 gap-8 p-6 md:grid-cols-2 md:p-12">
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/[0.04] bg-[size:36px_36px]" aria-hidden />
          <div className="relative flex h-full flex-col justify-between space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                Vehicle SOC Control
              </Badge>
              <h1 className="text-3xl font-bold leading-tight md:text-4xl">
                Secure access for your SOC operations team
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground md:text-base">
                Demo-ready authentication with per-role permissions. Use Google SSO when configured
                or jump in with curated demo accounts for today&apos;s review.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role-based guardrails</p>
                  <p className="font-semibold">Admin, Manager, Analyst</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Demo identities ready</p>
                  <p className="font-semibold">1-click sign-in</p>
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Enterprise posture</p>
                  <p className="font-semibold">SSO + session handling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
