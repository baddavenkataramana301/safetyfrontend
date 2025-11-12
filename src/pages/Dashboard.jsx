import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Hazards', value: '12', icon: AlertTriangle, color: 'text-warning' },
    { label: 'Completed Checklists', value: '48', icon: CheckCircle, color: 'text-success' },
    { label: 'Pending Tasks', value: '8', icon: Clock, color: 'text-primary' },
    { label: 'Team Members', value: '24', icon: Users, color: 'text-primary' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Here's what's happening in your safety management system</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Hazards</CardTitle>
              <CardDescription>Latest reported hazards in your facility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <div className="flex-1">
                      <p className="font-medium">Slippery floor in Area {i}</p>
                      <p className="text-sm text-muted-foreground">Reported 2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Inspections</CardTitle>
              <CardDescription>Scheduled safety inspections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Daily Safety Checklist</p>
                      <p className="text-sm text-muted-foreground">Due in {i * 2} hours</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
