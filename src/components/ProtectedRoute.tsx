import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ROLE_LABELS, type Role } from "@/lib/auth/roles";
import { Button } from "./ui/button";

type ProtectedRouteProps = {
  allowedRoles?: Role[];
  children?: React.ReactNode;
};

export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, status, allowed } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying session…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: "unauthenticated" }}
      />
    );
  }

  if (!allowed(allowedRoles)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <div className="max-w-md space-y-4">
          <div className="flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-critical" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Restricted Area
            </p>
            <h1 className="text-2xl font-bold">Access requires elevated role</h1>
            <p className="text-sm text-muted-foreground">
              This section is limited to{" "}
              {allowedRoles?.map((role) => ROLE_LABELS[role]).join(", ") || "authorized"}{" "}
              personnel. You are signed in as <strong>{user.role}</strong>.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="outline">
              <a href="/">Return to dashboard</a>
            </Button>
            <Button asChild variant="ghost">
              <a href="/login">Switch account</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
