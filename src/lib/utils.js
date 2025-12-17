import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const normalizeRole = (role) => {
  if (!role) return null;
  const normalized = role.toLowerCase().replace(/\s+/g, "_");
  // Map common role variations
  if (normalized === "safety_manager" || normalized === "manager") {
    return "safety_manager";
  }
  return normalized;
};
