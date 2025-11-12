import { Target, Users, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To empower organizations with intuitive safety management tools that prevent incidents and save lives.",
    },
    {
      icon: Users,
      title: "Our Team",
      description:
        "Safety experts and technology professionals dedicated to creating solutions that make workplaces safer.",
    },
    {
      icon: Zap,
      title: "Our Vision",
      description:
        "A world where every workplace operates at the highest safety standards through smart technology.",
    },
  ];

  return (
    <section id="about" className="container mx-auto px-4 py-20 scroll-mt-16">
      <div className="max-w-3xl mx-auto text-center space-y-6 mb-16 animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold">About SafetyMS</h2>
        <p className="text-xl text-muted-foreground">
          We're on a mission to revolutionize workplace safety management
          through innovative technology and user-centered design.
        </p>
      </div>

      {/* Values */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {values.map((value, index) => (
          <Card
            key={value.title}
            className="text-center hover:shadow-lg transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle>{value.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{value.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Story */}
      <div className="max-w-4xl mx-auto space-y-6 bg-card p-8 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold">Our Story</h3>
        <p className="text-muted-foreground leading-relaxed">
          SafetyMS was founded by safety professionals who experienced firsthand
          the challenges of managing workplace safety with outdated tools and
          disconnected systems. We saw organizations struggling with paper-based
          processes, missed inspections, and delayed incident reporting.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Today, SafetyMS serves organizations across industries including
          manufacturing, construction, logistics, and corporate environments.
          Our platform has helped reduce workplace incidents by an average of
          40% and improved compliance rates by over 60%.
        </p>
      </div>
    </section>
  );
};

export default About;
