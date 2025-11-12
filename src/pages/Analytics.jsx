import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

const Analytics = () => {
  const hazardData = [
    { month: 'Jan', hazards: 12 },
    { month: 'Feb', hazards: 19 },
    { month: 'Mar', hazards: 15 },
    { month: 'Apr', hazards: 8 },
    { month: 'May', hazards: 22 },
    { month: 'Jun', hazards: 14 },
  ];

  const incidentData = [
    { name: 'Slip/Fall', value: 35 },
    { name: 'Electrical', value: 20 },
    { name: 'Chemical', value: 15 },
    { name: 'Machinery', value: 30 },
  ];

  const checklistData = [
    { week: 'Week 1', completed: 85 },
    { week: 'Week 2', completed: 92 },
    { week: 'Week 3', completed: 78 },
    { week: 'Week 4', completed: 95 },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const kpis = [
    { label: 'Total Hazards (YTD)', value: '90', change: '-12%' },
    { label: 'Checklist Completion', value: '87.5%', change: '+5%' },
    { label: 'Training Compliance', value: '94%', change: '+2%' },
    { label: 'Open Incidents', value: '4', change: '-50%' },
  ];

  const handleDownload = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Safety Analytics Report', 20, 30);

    // KPIs
    doc.setFontSize(16);
    doc.text('Key Performance Indicators:', 20, 50);
    let yPos = 60;
    kpis.forEach(kpi => {
      doc.setFontSize(12);
      doc.text(`${kpi.label}: ${kpi.value} (${kpi.change})`, 20, yPos);
      yPos += 10;
    });

    // Hazards Data
    yPos += 10;
    doc.setFontSize(16);
    doc.text('Hazards Reported by Month:', 20, yPos);
    yPos += 10;
    hazardData.forEach(item => {
      doc.setFontSize(12);
      doc.text(`${item.month}: ${item.hazards} hazards`, 20, yPos);
      yPos += 10;
    });

    // Incident Data
    yPos += 10;
    doc.setFontSize(16);
    doc.text('Incident Distribution:', 20, yPos);
    yPos += 10;
    incidentData.forEach(item => {
      doc.setFontSize(12);
      doc.text(`${item.name}: ${item.value}%`, 20, yPos);
      yPos += 10;
    });

    // Checklist Data
    yPos += 10;
    doc.setFontSize(16);
    doc.text('Checklist Completion Rate:', 20, yPos);
    yPos += 10;
    checklistData.forEach(item => {
      doc.setFontSize(12);
      doc.text(`${item.week}: ${item.completed}%`, 20, yPos);
      yPos += 10;
    });

    // Save the PDF
    doc.save('safety-analytics-report.pdf');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Safety metrics and performance insights</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <p className={`text-xs mt-1 ${kpi.change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
                  {kpi.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hazards Reported by Month</CardTitle>
              <CardDescription>Monthly hazard reporting trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hazardData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="hazards" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Incident Distribution</CardTitle>
              <CardDescription>Breakdown by incident type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incidentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incidentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Checklist Completion Rate</CardTitle>
              <CardDescription>Weekly completion percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={checklistData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Download Button */}
        <Button onClick={handleDownload} className="fixed bottom-4 right-4">
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
