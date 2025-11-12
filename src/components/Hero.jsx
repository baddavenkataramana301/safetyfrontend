import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import heroImage from "/hero-safety.jpg";

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  const handleWatchDemo = () => {
    // For now, scroll to features section or show a toast
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Industrial Safety"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/80" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            SafetyApp
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-4">
            Industrial Safety Management System
          </p>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Your Partner in Workplace Safety and Compliance
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="#">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                View Demo
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-white/10 text-white border-white hover:bg-white hover:text-primary"
              >
                Get Start
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
