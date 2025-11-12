// Helpers to compute effective permissions for a user based on their groups
export function getUserPermissions(userId) {
  const stored = localStorage.getItem("groups");
  const groups = stored ? JSON.parse(stored) : [];

  // Start with no permissions
  const effective = {
    users: false,
    reports: false,
    hazards: false,
    checklists: false,
    training: false,
    notifications: true, // notifications generally allowed unless explicitly restricted
  };

  // Merge permissions across all groups the user belongs to (OR semantics)
  groups.forEach((group) => {
    if (!group.members || !group.members.includes(userId)) return;

    const perms = group.permissions || {};

    // Legacy boolean shape (manage_users, view_reports, create_hazards, manage_checklists, view_training)
    if (
      Object.prototype.hasOwnProperty.call(perms, "manage_users") ||
      Object.prototype.hasOwnProperty.call(perms, "view_reports")
    ) {
      if (perms.manage_users) effective.users = true;
      if (perms.view_reports) effective.reports = true;
      if (perms.create_hazards) effective.hazards = true;
      if (perms.manage_checklists) effective.checklists = true;
      if (perms.view_training) effective.training = true;
    } else {
      // New CRUD-shaped permissions (users, reports, hazards, checklists, training)
      if (perms.users && (perms.users.read || perms.users.create)) {
        effective.users = true;
      }
      if (perms.reports && (perms.reports.read || perms.reports.create)) {
        effective.reports = true;
      }
      if (perms.hazards && (perms.hazards.read || perms.hazards.create)) {
        effective.hazards = true;
      }
      if (
        perms.checklists &&
        (perms.checklists.read || perms.checklists.create)
      ) {
        effective.checklists = true;
      }
      if (perms.training && (perms.training.read || perms.training.create)) {
        effective.training = true;
      }
    }
  });

  return effective;
}
