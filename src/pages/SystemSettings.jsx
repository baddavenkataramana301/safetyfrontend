import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

const SystemSettings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Manage system-wide configurations and preferences
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Theme
              </CardTitle>
              <CardDescription>
                Customize the appearance and branding of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/settings/theme">
                <Button className="w-full">Manage Theme</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Add more settings cards here as needed */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;
