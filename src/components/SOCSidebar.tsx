import React from "react";
import {
  AlertTriangle,
  Shield,
  Car,
  BarChart3,
  Settings,
  Activity,
  Home,
  ChevronUp,
  User2,
  LogOut
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useVehicles } from "@/hooks/api/useVehicles";
import { useAlerts } from "@/hooks/api/useAlerts";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Link, useLocation } from "react-router-dom";

type NavigationItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  badge?: string;
};

export function SOCSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { data: vehicles } = useVehicles();
  const { data: alerts } = useAlerts();
  const { user, signOut } = useAuth();

  // Calculate metrics from real data
  const criticalAlerts = alerts?.filter(a => a.severity === 'high').length || 0;
  const activeVehicles = vehicles?.length || 0;
  const totalSecureTEEs = vehicles?.reduce((sum, v) => sum + v.tee_secure, 0) || 0;

  const navigationItems: NavigationItem[] = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      isActive: location.pathname === "/",
    },
    {
      title: "Security Alerts",
      url: "/alerts",
      icon: AlertTriangle,
      badge: criticalAlerts.toString(),
      isActive: location.pathname === "/alerts",
    },
    {
      title: "Fleet Management",
      url: "/fleet",
      icon: Car,
      badge: activeVehicles.toString(),
      isActive: location.pathname === "/fleet",
    },
    {
      title: "TEE Security",
      url: "/tee",
      icon: Shield,
      badge: totalSecureTEEs.toLocaleString(),
      isActive: location.pathname === "/tee",
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
      isActive: location.pathname === "/analytics",
    },
    {
      title: "Activity Monitor",
      url: "/activity",
      icon: Activity,
      isActive: location.pathname === "/activity",
    },
  ];

  const adminItems = user?.role === "admin" ? [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ] : [];

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "US";
  
  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar-background">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="w-full justify-start"
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && state === "expanded" && (
                        <Badge 
                          variant={item.title === "Security Alerts" ? "destructive" : "secondary"} 
                          className="ml-auto text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="flex-col items-start">
                  <User2 className="h-4 w-4 mr-2" />
                  <div>
                    <p className="text-sm font-semibold">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_LABELS[user?.role ?? "viewer"]}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
