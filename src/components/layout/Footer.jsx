import { Link } from 'react-router-dom';
import { ShieldAlert, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">SafetyMS</span>
            </button>
            <p className="text-sm text-muted-foreground">
              Comprehensive Safety Management System for modern workplaces. Streamline your EHS processes and create a safer environment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </button>
              </li>
              <li>
                <a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Hazard Reporting</li>
              <li>Safety Checklists</li>
              <li>Team Management</li>
              <li>Analytics & Reports</li>
              <li>Training & Compliance</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                support@safetyms.com
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                123 Safety Street, NY 10001
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 SafetyMS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
