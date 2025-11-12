import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export const PublicNavbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getRoleDashboardLink = () => {
    if (!user) return { path: '/dashboard', label: 'Dashboard' };
    
    switch (user.role) {
      case 'admin':
        return { path: '/dashboard', label: 'Admin Panel' };
      case 'safety_manager':
        return { path: '/dashboard', label: 'Manager Dashboard' };
      case 'supervisor':
        return { path: '/dashboard', label: 'Team Dashboard' };
      case 'employee':
        return { path: '/dashboard', label: 'My Work' };
      default:
        return { path: '/dashboard', label: 'Dashboard' };
    }
  };

  const dashboardLink = getRoleDashboardLink();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            {/* Logo */}
            <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">SafetyMS</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#home" className="text-foreground hover:text-primary transition-colors">
                Home
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">
                About
              </a>
              <a href="#services" className="text-foreground hover:text-primary transition-colors">
                Services
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </a>
              
              {isAuthenticated && (
                user?.role === 'employee' && !user?.approved ? (
                  <span className="text-foreground/60 font-medium">
                    My Work (Pending Approval)
                  </span>
                ) : (
                  <Link to={dashboardLink.path} className="text-foreground hover:text-primary transition-colors font-medium">
                    {dashboardLink.label}
                  </Link>
                )
              )}

              {isAuthenticated ? (
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              ) : (
                <Button onClick={() => setIsModalOpen(true)}>
                  Login / Register
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </nav>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in">
                <a 
                  href="#home" 
                  className="block py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </a>
                <a 
                  href="#about" 
                  className="block py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
                <a 
                  href="#services" 
                  className="block py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </a>
                <a 
                  href="#contact" 
                  className="block py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
              
              {isAuthenticated && (
                user?.role === 'employee' && !user?.approved ? (
                  <span className="block py-2 text-foreground/60 font-medium">
                    My Work (Pending Approval)
                  </span>
                ) : (
                  <Link
                    to={dashboardLink.path}
                    className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {dashboardLink.label}
                  </Link>
                )
              )}

              {isAuthenticated ? (
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  Logout
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full"
                >
                  Login / Register
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
