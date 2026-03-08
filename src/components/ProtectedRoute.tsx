import { AppLayout } from "@/components/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, UserRole } from "@/lib/auth/UserContext";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { hasRole } = useUser();
  const authorized = hasRole(allowedRoles);

  if (!authorized) {
    return (
      <AppLayout>
        <Card className="max-w-3xl mx-auto mt-10 bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex items-start gap-3">
            <div className="rounded-full bg-destructive/10 p-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Restricted Access</CardTitle>
              <CardDescription>
                You need elevated privileges to view the AI model monitoring
                console. Switch to an administrator or ML engineer account to
                continue.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="outline" className="border-dashed">
              Admin
            </Badge>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">ML Engineering</Badge>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return <>{children}</>;
}
