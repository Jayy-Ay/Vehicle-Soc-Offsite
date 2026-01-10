import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Bell, Shield, Database, User, Lock, Save, RefreshCw } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  
  // Profile state
  const [profile, setProfile] = useState({
    name: "Security Admin",
    email: "admin@soc.com",
    role: "Security Administrator"
  });
  
  // Security settings state
  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: true,
    password: ""
  });
  
  // Notification settings state
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    emailNotifications: true,
    desktopNotifications: false,
    weeklyReports: true
  });
  
  // Dashboard settings state
  const [dashboard, setDashboard] = useState({
    autoRefresh: true,
    darkMode: true,
    compactView: false,
    refreshInterval: "30"
  });
  
  // Database settings state
  const [database, setDatabase] = useState({
    retentionPeriod: "90",
    autoBackup: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSecurity = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Security Settings Updated",
        description: "Your security preferences have been saved.",
      });
      setSecurity(prev => ({ ...prev, password: "" }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Notification Preferences Saved",
        description: "Your notification settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveDashboard = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Dashboard Settings Applied",
        description: "Your dashboard preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply dashboard settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveDatabase = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Database Settings Updated",
        description: "Your database configuration has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update database settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
									<Input 
										id="name" 
										value={profile.name}
										onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<Input 
										id="email" 
										type="email" 
										value={profile.email}
										onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="role">Role</Label>
								<Input id="role" value={profile.role} disabled />
							</div>
							<Button 
								onClick={handleSaveProfile} 
								disabled={isLoading}
								className="flex items-center gap-2"
							>
								{isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
								Save Changes
							</Button>
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
								<Switch 
									checked={security.twoFactor}
									onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactor: checked }))}
								/>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Session Timeout</Label>
									<p className="text-xs text-muted-foreground">
										Automatically log out after inactivity
									</p>
								</div>
								<Switch 
									checked={security.sessionTimeout}
									onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, sessionTimeout: checked }))}
								/>
							</div>
							<Separator />
							<div className="space-y-2">
								<Label htmlFor="password">Change Password</Label>
								<Input 
									id="password" 
									type="password" 
									placeholder="Enter new password" 
									value={security.password}
									onChange={(e) => setSecurity(prev => ({ ...prev, password: e.target.value }))}
								/>
							</div>
							<Button 
								onClick={handleSaveSecurity} 
								disabled={isLoading}
								className="flex items-center gap-2"
							>
								{isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
								Update Security Settings
							</Button>
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
								<Switch 
									checked={notifications.criticalAlerts}
									onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, criticalAlerts: checked }))}
								/>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Email Notifications</Label>
									<p className="text-xs text-muted-foreground">
										Get security updates via email
									</p>
								</div>
								<Switch 
									checked={notifications.emailNotifications}
									onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
								/>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Desktop Notifications</Label>
									<p className="text-xs text-muted-foreground">
										Show browser notifications for events
									</p>
								</div>
								<Switch 
									checked={notifications.desktopNotifications}
									onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, desktopNotifications: checked }))}
								/>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Weekly Reports</Label>
									<p className="text-xs text-muted-foreground">
										Receive weekly security summary reports
									</p>
								</div>
								<Switch 
									checked={notifications.weeklyReports}
									onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
								/>
							</div>
							<Button 
								onClick={handleSaveNotifications} 
								disabled={isLoading}
								className="flex items-center gap-2"
							>
								{isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
								Save Notification Preferences
							</Button>
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
										Automatically update dashboard every {dashboard.refreshInterval} seconds
									</p>
								</div>
								<Switch 
									checked={dashboard.autoRefresh}
									onCheckedChange={(checked) => setDashboard(prev => ({ ...prev, autoRefresh: checked }))}
								/>
							</div>
							{dashboard.autoRefresh && (
								<div className="space-y-2">
									<Label htmlFor="refresh-interval">Refresh Interval</Label>
									<Select 
										value={dashboard.refreshInterval}
										onValueChange={(value) => setDashboard(prev => ({ ...prev, refreshInterval: value }))}
									>
										<SelectTrigger className="w-[180px]">
											<SelectValue placeholder="Select interval" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="10">10 seconds</SelectItem>
											<SelectItem value="30">30 seconds</SelectItem>
											<SelectItem value="60">1 minute</SelectItem>
											<SelectItem value="300">5 minutes</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
							<Separator />
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Dark Mode</Label>
									<p className="text-xs text-muted-foreground">
										Use dark theme for the dashboard
									</p>
								</div>
								<Switch 
									checked={dashboard.darkMode}
									onCheckedChange={(checked) => setDashboard(prev => ({ ...prev, darkMode: checked }))}
								/>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label>Compact View</Label>
									<p className="text-xs text-muted-foreground">
										Show more information in less space
									</p>
								</div>
								<Switch 
									checked={dashboard.compactView}
									onCheckedChange={(checked) => setDashboard(prev => ({ ...prev, compactView: checked }))}
								/>
							</div>
							<Button 
								onClick={handleSaveDashboard} 
								disabled={isLoading}
								className="flex items-center gap-2"
							>
								{isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <SettingsIcon className="h-4 w-4" />}
								Apply Dashboard Settings
							</Button>
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
								<Select 
									value={database.retentionPeriod}
									onValueChange={(value) => setDatabase(prev => ({ ...prev, retentionPeriod: value }))}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select retention period" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="30">30 days</SelectItem>
										<SelectItem value="60">60 days</SelectItem>
										<SelectItem value="90">90 days</SelectItem>
										<SelectItem value="180">6 months</SelectItem>
										<SelectItem value="365">1 year</SelectItem>
										<SelectItem value="730">2 years</SelectItem>
									</SelectContent>
								</Select>
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
								<Switch 
									checked={database.autoBackup}
									onCheckedChange={(checked) => setDatabase(prev => ({ ...prev, autoBackup: checked }))}
								/>
							</div>
							<Button 
								onClick={handleSaveDatabase} 
								disabled={isLoading}
								className="flex items-center gap-2"
							>
								{isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
								Update Database Settings
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
    </AppLayout>
  );
}
