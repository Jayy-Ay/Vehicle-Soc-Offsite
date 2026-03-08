import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, ShieldAlert, Sparkles, LogIn, Mail, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { toast } from "sonner";

type LoginState = {
  email: string;
  password: string;
};

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithEmail, signInWithGoogle, signInAsDemo, demoDirectory, supabaseReady } =
    useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<LoginState>({
    email: "",
    password: "",
  });

  const redirectPath = (location.state as { from?: string } | null)?.from ?? "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmail(state);
      toast.success("Signed in successfully");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start Google login";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = useMemo(
    () =>
      demoDirectory.map((user) => ({
        ...user,
        label: `${user.name} · ${ROLE_LABELS[user.role]}`,
      })),
    [demoDirectory]
  );

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {!supabaseReady && (
        <Alert variant="default" className="border-primary/30 bg-primary/5">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Demo mode enabled</AlertTitle>
          <AlertDescription className="text-sm">
            Supabase credentials were not found. Use the demo accounts below or email/password
            login to explore without full SSO setup.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border/60 shadow-2xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-xs font-semibold uppercase tracking-widest">Admin Console</p>
          </div>
          <CardTitle className="text-2xl">Sign in to Vehicle SOC</CardTitle>
          <CardDescription>
            Secure access with SSO or curated demo identities for this review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Work email</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@soc.demo"
                    required
                    className="pl-9"
                    value={state.email}
                    onChange={(event) =>
                      setState((prev) => ({ ...prev, email: event.target.value }))
                    }
                  />
                </div>
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <span className="text-xs text-muted-foreground">Demo defaults are listed</span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-9"
                    value={state.password}
                    onChange={(event) =>
                      setState((prev) => ({ ...prev, password: event.target.value }))
                    }
                  />
                </div>
              </Field>
            </FieldGroup>
            <div className="space-y-3">
              <Button type="submit" className="w-full" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" />
                Continue
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt=""
                  className="mr-2 h-4 w-4"
                />
                Continue with Google
              </Button>
              <FieldDescription className="text-center text-xs text-muted-foreground">
                We create short-lived demo sessions. For production, connect Supabase Auth +
                Google SSO.
              </FieldDescription>
            </div>
          </form>

          <div className="space-y-3 rounded-2xl border border-dashed border-border/70 bg-muted/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Demo access
            </div>
            <div className="grid grid-cols-1 gap-2">
              {demoCredentials.map((user) => (
                <Button
                  key={user.id}
                  type="button"
                  variant="ghost"
                  className="group flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/60 text-left hover:border-primary/40"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await signInAsDemo(user.id);
                      toast.success(`Signed in as ${user.name} (${ROLE_LABELS[user.role]})`);
                      navigate("/", { replace: true });
                    } catch (error) {
                      const message = error instanceof Error ? error.message : "Unable to sign in";
                      toast.error(message);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <div>
                    <p className="font-semibold">{user.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email} · password: <span className="font-mono">{user.password}</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="group-hover:bg-primary group-hover:text-primary-foreground">
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
            <p className="text-xs text-muted-foreground">
              Need production hardening? Wire this into your Supabase project so users, roles, and
              Google SSO come from your identity provider. The demo users above remain available if
              SSO is offline.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
