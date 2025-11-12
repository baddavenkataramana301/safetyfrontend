import {
  AlertTriangle,
  CheckSquare,
  FileText,
  Bell,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Services = () => {
  const services = [
    {
      icon: AlertTriangle,
      title: "Hazard Management",
      description:
        "Comprehensive hazard identification, reporting, and tracking system with real-time notifications.",
      features: [
        "Real-time reporting",
        "Photo documentation",
        "Priority classification",
        "Resolution tracking",
      ],
    },
    {
      icon: CheckSquare,
      title: "Digital Checklists",
      description:
        "Create, manage, and complete safety inspections with customizable digital checklists.",
      features: [
        "Custom templates",
        "Schedule automation",
        "Offline capability",
        "Compliance tracking",
      ],
    },
    {
      icon: FileText,
      title: "Incident Reporting",
      description:
        "Streamlined incident and near-miss reporting with root cause analysis.",
      features: [
        "Detailed documentation",
        "Investigation tools",
        "Corrective actions",
        "Trend analysis",
      ],
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Targeted notification system to keep teams informed about safety updates.",
      features: [
        "Group messaging",
        "Priority alerts",
        "Read receipts",
        "Scheduled reminders",
      ],
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description:
        "Powerful analytics dashboard with KPIs, trends, and customizable reports.",
      features: [
        "Real-time metrics",
        "Custom reports",
        "Trend analysis",
        "Export capabilities",
      ],
    },
    {
      icon: GraduationCap,
      title: "Training Management",
      description:
        "Track employee training, certifications, and competencies with automated reminders.",
      features: [
        "Training records",
        "Certification tracking",
        "Compliance alerts",
        "Progress monitoring",
      ],
    },
  ];

  return (
    <section id="services" className="bg-accent/30 py-20 scroll-mt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6 mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">Our Services</h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive safety management solutions designed to protect your
            workforce and ensure compliance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
                  <service.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
