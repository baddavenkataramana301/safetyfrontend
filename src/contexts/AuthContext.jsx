import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dummyUsers } from "@/data";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState({
    primary: "#FFB703",
    secondary: "#023047",
    accent: "#FB8500",
    danger: "#D00000",
    background: "#EAEAEA",
    text: "#121212",
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize dummyUsers in localStorage if not present
    const storedUsers = localStorage.getItem("dummyUsers");
    if (!storedUsers) {
      localStorage.setItem("dummyUsers", JSON.stringify(dummyUsers));
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      // Only redirect to dashboard if not already on home page
      if (window.location.pathname !== "/home") {
        redirectToDashboard(userData.role);
      }
    }

    const storedTheme = localStorage.getItem("systemTheme");
    if (storedTheme) {
      setTheme(JSON.parse(storedTheme));
    }

    // Listen for usersUpdated event to refresh user state
    const handleUsersUpdated = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    };

    window.addEventListener("usersUpdated", handleUsersUpdated);

    return () => {
      window.removeEventListener("usersUpdated", handleUsersUpdated);
    };
  }, []);

  const redirectToDashboard = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "safety_manager":
        navigate("/manager-dashboard");
        break;
      case "supervisor":
        navigate("/supervisor-dashboard");
        break;
      case "employee":
        navigate("/employee-dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  const login = async (email, password) => {
    // Get users from localStorage
    const storedUsers = JSON.parse(localStorage.getItem("dummyUsers") || "[]");

    // Find user by email
    const foundUser = storedUsers.find((user) => user.email === email);

    if (!foundUser) {
      throw new Error("User not found");
    }

    // Check password
    if (foundUser.password !== password) {
      throw new Error("Invalid password");
    }

    // Normalize role to match routing
    const normalizedRole = foundUser.role.toLowerCase().replace(" ", "_");

    const userData = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: normalizedRole,
      department: foundUser.department,
      location: "Factory A", // Default location
      approved: foundUser.approved,
    };

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    // After login, redirect to home page
    navigate("/home");
  };

  const register = async (userData) => {
    // Normalize role for consistency
    const normalizedRole = userData.role.toLowerCase().replace(" ", "_");

    // Map normalized role to display role
    const roleMap = {
      admin: "Admin",
      safety_manager: "Safety Manager",
      supervisor: "Supervisor",
      employee: "Employee",
    };
    const displayRole = roleMap[normalizedRole] || normalizedRole;

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: displayRole,
      status: "Active",
      department: userData.department || "",
      approved: displayRole !== "Employee", // Auto-approve non-employees, employees need approval
    };

    // Ensure dummyUsers is initialized in localStorage
    if (localStorage.getItem("dummyUsers") === null) {
      localStorage.setItem("dummyUsers", JSON.stringify(dummyUsers));
    }

    // Add to dummyUsers in localStorage
    const storedUsers = JSON.parse(localStorage.getItem("dummyUsers"));
    const updatedUsers = [...storedUsers, newUser];
    localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));

    // Dispatch event to notify other components
    window.dispatchEvent(new Event("usersUpdated"));

    // Set current user with normalized role
    const currentUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: normalizedRole,
      department: newUser.department,
      location: userData.location || "Factory A",
      approved: newUser.approved,
    };

    setUser(currentUser);
    localStorage.setItem("user", JSON.stringify(currentUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  const updateProfile = async (formData) => {
    const updateData = { ...formData };
    if (!updateData.password || updateData.password === "") {
      delete updateData.password;
    }

    // Update dummyUsers
    const storedUsers = JSON.parse(localStorage.getItem("dummyUsers")) || [];
    const updatedUsers = storedUsers.map((u) =>
      u.id === user.id ? { ...u, ...updateData } : u
    );
    localStorage.setItem("dummyUsers", JSON.stringify(updatedUsers));

    // Update user
    const updatedUser = { ...user, ...updateData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
      l * 100
    )}%`;
  };

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("systemTheme", JSON.stringify(newTheme));
    // Update CSS custom properties with HSL values
    const root = document.documentElement;
    root.style.setProperty("--primary", hexToHsl(newTheme.primary));
    root.style.setProperty("--secondary", hexToHsl(newTheme.secondary));
    root.style.setProperty("--accent", hexToHsl(newTheme.accent));
    root.style.setProperty("--danger", hexToHsl(newTheme.danger));
    root.style.setProperty("--background", hexToHsl(newTheme.background));
    root.style.setProperty("--text", hexToHsl(newTheme.text));

    // Update sidebar colors
    root.style.setProperty("--sidebar-background", hexToHsl(newTheme.primary));
    root.style.setProperty("--sidebar-foreground", hexToHsl(newTheme.text));
    root.style.setProperty("--sidebar-primary", hexToHsl(newTheme.primary));
    root.style.setProperty(
      "--sidebar-primary-foreground",
      hexToHsl(newTheme.text)
    );
    root.style.setProperty("--sidebar-accent", hexToHsl(newTheme.secondary));
    root.style.setProperty(
      "--sidebar-accent-foreground",
      hexToHsl(newTheme.text)
    );
    root.style.setProperty("--sidebar-border", hexToHsl(newTheme.secondary));
    root.style.setProperty("--sidebar-ring", hexToHsl(newTheme.accent));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        theme,
        updateTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
