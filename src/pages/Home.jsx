import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import CTA from "@/components/CTA";
import { Footer } from "@/components/layout/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Hero />
      <Features />
      <About />
      <Services />
      <Contact />
      <CTA />
      <Footer />
    </div>
  );
};

export default Home;
