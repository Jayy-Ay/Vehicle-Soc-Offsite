import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  AlertTriangle, 
  BarChart3,
  Terminal
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAlerts } from "@/hooks/api/useAlerts";
import { useVehicles } from "@/hooks/api/useVehicles";

const Home = () => {
  const { data: alerts } = useAlerts();
  const { data: vehicles } = useVehicles();
  
  const criticalAlerts = alerts?.filter(a => a.severity === 'high').length || 0;
  const activeVehicles = vehicles?.length || 0;

  return (
    <AppLayout defaultOpen={false}>
      <div className="space-y-12">
        {/* Welcome Section - Simplified */}
        <div className="text-center space-y-4 py-12">
          <h1 className="text-5xl font-bold tracking-tight">
            Vehicle SOC
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Security Operations Center for your vehicle fleet
          </p>
        </div>

        {/* Main Action Cards - Simplified to 4 key items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Link to="/dashboard">
            <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-soc-hover transition-all duration-200 hover:scale-105 cursor-pointer group h-full">
              <CardHeader className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-lg">Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Overview & metrics
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/alerts">
            <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-soc-hover transition-all duration-200 hover:scale-105 cursor-pointer group h-full">
              <CardHeader className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-critical mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-lg">Security Alerts</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  {criticalAlerts > 0 ? `${criticalAlerts} active alerts` : 'All systems secure'}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/fleet">
            <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-soc-hover transition-all duration-200 hover:scale-105 cursor-pointer group h-full">
              <CardHeader className="text-center py-8">
                <Car className="h-12 w-12 text-info mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-lg">Fleet Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  {activeVehicles} vehicles online
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/query">
            <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-soc-hover transition-all duration-200 hover:scale-105 cursor-pointer group h-full">
              <CardHeader className="text-center py-8">
                <Terminal className="h-12 w-12 text-success mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-lg">Data Query</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Advanced analytics
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Simple CTA */}
        <div className="text-center">
          <Link to="/dashboard">
            <Button size="lg" className="px-8 py-3 text-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;