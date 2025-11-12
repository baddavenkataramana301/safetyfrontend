import { AlertTriangle, CheckSquare, Users, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: AlertTriangle,
      title: "Hazard Reporting",
      description: "Quickly report and track workplace hazards in real-time",
    },
    {
      icon: CheckSquare,
      title: "Safety Checklists",
      description: "Digital checklists for inspections and compliance tracking",
    },
    {
      icon: Users,
      title: "Team Management",
      description:
        "Manage users, roles, and permissions across your organization",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive insights into safety metrics and trends",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16 bg-accent/30">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          Everything You Need for Safety Management
        </h2>
        <p className="text-muted-foreground">
          Powerful features designed for safety professionals
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card
            key={feature.title}
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Features;
