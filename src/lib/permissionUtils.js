// Helpers to compute effective permissions for a user based on their groups
export function getUserPermissions(userId) {
  const stored = localStorage.getItem("groups");
  const groups = stored ? JSON.parse(stored) : [];

  // Get user role from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user ? user.role : null;

  // Start with default permissions based on role
  const effective = {
    users: { create: false, read: false, update: false, delete: false },
    reports: { create: false, read: false, update: false, delete: false },
    hazards: { create: false, read: false, update: false, delete: false },
    checklists: { create: false, read: false, update: false, delete: false },
    training: { create: false, read: false, update: false, delete: false },
    notifications: true, // notifications generally allowed unless explicitly restricted
  };

  // Default permissions based on role
  if (role === "admin") {
    effective.users = { create: true, read: true, update: true, delete: true };
    effective.reports = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
    effective.hazards = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
    effective.checklists = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
    effective.training = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
  } else if (role === "safety_manager") {
    effective.reports = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
    effective.hazards = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
    effective.checklists = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
    effective.training = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
  } else if (role === "supervisor") {
    effective.hazards = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
    effective.checklists = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
    effective.training = { read: true };
  } else if (role === "employee") {
    effective.hazards = { create: true, read: true };
    effective.checklists = {
      create: false,
      read: true,
      update: false,
      delete: false,
    };
    effective.training = { read: true };
  }

  // Merge permissions across all groups the user belongs to (OR semantics)
  groups.forEach((group) => {
    if (!group.members || !group.members.includes(userId)) return;

    const perms = group.permissions || {};

    // Legacy boolean shape (manage_users, view_reports, create_hazards, manage_checklists, view_training)
    if (
      Object.prototype.hasOwnProperty.call(perms, "manage_users") ||
      Object.prototype.hasOwnProperty.call(perms, "view_reports")
    ) {
      if (perms.manage_users) {
        effective.users.create = true;
        effective.users.read = true;
        effective.users.update = true;
        effective.users.delete = true;
      }
      if (perms.view_reports) {
        effective.reports.read = true;
      }
      if (perms.create_hazards) {
        effective.hazards.create = true;
        effective.hazards.read = true;
        effective.hazards.update = true;
      }
      if (perms.manage_checklists) {
        effective.checklists.create = true;
        effective.checklists.read = true;
        effective.checklists.update = true;
        effective.checklists.delete = true;
      }
      if (perms.view_training) {
        effective.training.read = true;
      }
    } else {
      // New CRUD-shaped permissions (users, reports, hazards, checklists, training)
      Object.keys(perms).forEach((section) => {
        if (perms[section] && typeof perms[section] === "object") {
          ["create", "read", "update", "delete"].forEach((op) => {
            if (perms[section][op]) {
              effective[section][op] = true;
            }
          });
        }
      });
    }
  });

  return effective;
}
