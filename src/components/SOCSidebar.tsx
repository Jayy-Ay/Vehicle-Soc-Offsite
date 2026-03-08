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
import { Brain } from "lucide-react";

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
import { Link, useLocation } from "react-router-dom";
import { useUser } from "@/lib/auth/UserContext";

type AdminItem = {
  title: string;
  url: string;
  icon: typeof Settings;
  badge?: string;
  roles?: readonly ("administrator" | "ml_engineer")[];
};

const adminItems: AdminItem[] = [
  {
    title: "AI Model Updates",
    url: "/ai-model-updates",
    icon: Brain,
    badge: "live",
    roles: ["administrator", "ml_engineer"] as const,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function SOCSidebar() {
  const { state } = useSidebar();
  const { data: vehicles } = useVehicles();
  const { data: alerts } = useAlerts();
  const location = useLocation();
  const { user, hasRole } = useUser();

  // Calculate metrics from real data
  const criticalAlerts = alerts?.filter(a => a.severity === 'high').length || 0;
  const activeVehicles = vehicles?.length || 0;
  const totalSecureTEEs = vehicles?.reduce((sum, v) => sum + v.tee_secure, 0) || 0;

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Security Alerts",
      url: "/alerts",
      icon: AlertTriangle,
      badge: criticalAlerts.toString(),
    },
    {
      title: "Fleet Management",
      url: "/fleet",
      icon: Car,
      badge: activeVehicles.toString(),
    },
    {
      title: "TEE Security",
      url: "/tee",
      icon: Shield,
      badge: totalSecureTEEs.toLocaleString(),
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Activity Monitor",
      url: "/activity",
      icon: Activity,
    },
  ];
  
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
                    isActive={
                      location.pathname === item.url ||
                      (item.url !== "/" && location.pathname.startsWith(item.url))
                    }
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
              {adminItems.map((item) => {
                if (item.roles && !hasRole(item.roles)) return null;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        location.pathname === item.url ||
                        location.pathname.startsWith(item.url)
                      }
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && state === "expanded" && (
                          <Badge variant="outline" className="ml-auto text-[10px] uppercase">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
                    <AvatarFallback className="rounded-lg">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
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
                <DropdownMenuItem>
                  <User2 className="h-4 w-4 mr-2" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
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
