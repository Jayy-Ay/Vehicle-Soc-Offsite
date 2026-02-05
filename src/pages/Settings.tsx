import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  User,
  Lock,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";

export default function Settings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your SOC dashboard and security preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 gap-6">
          {/* Profile Settings */}
          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Security Admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@soc.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  defaultValue="Security Administrator"
                  disabled
                />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>
                Configure authentication and security options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="password">Change Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                />
              </div>
              <Button>Update Security Settings</Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>
                Configure how you receive alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Critical Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications for high severity alerts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Get security updates via email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Desktop Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Show browser notifications for events
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Weekly Reports</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive weekly security summary reports
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button>Save Notification Preferences</Button>
            </CardContent>
          </Card>

          {/* Dashboard Settings */}
          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader>
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                <CardTitle>Dashboard Settings</CardTitle>
              </div>
              <CardDescription>
                Customize your dashboard appearance and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Refresh Data</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically update dashboard every 30 seconds
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Use dark theme for the dashboard
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact View</Label>
                  <p className="text-xs text-muted-foreground">
                    Show more information in less space
                  </p>
                </div>
                <Switch />
              </div>
              <Button>Apply Dashboard Settings</Button>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>Database Settings</CardTitle>
              </div>
              <CardDescription>
                Configure database connection and data retention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retention">Data Retention Period</Label>
                <Input id="retention" defaultValue="90 days" />
                <p className="text-xs text-muted-foreground">
                  How long to keep historical security data
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Backup</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically backup database daily
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button>Update Database Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
