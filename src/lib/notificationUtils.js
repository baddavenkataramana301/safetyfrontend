/**
 * Utility functions for managing notifications across the application
 */

// Create a notification for all users when admin/supervisor/manager makes changes
export const createSystemNotification = (type, title, message) => {
  const existingNotifications = JSON.parse(
    localStorage.getItem("notifications") || "[]"
  );

  const newNotification = {
    id: Date.now(),
    type: type, // 'info', 'success', 'warning', 'alert'
    title: title,
    message: message,
    time: new Date().toISOString(),
    read: false,
  };

  const updatedNotifications = [newNotification, ...existingNotifications];
  localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event("notificationsUpdated"));

  return newNotification;
};

// Training-related notifications
export const createTrainingNotification = (action, trainingData) => {
  let title, message, type;

  switch (action) {
    case "create":
      title = "New Training Added";
      message = `A new training "${trainingData.title}" has been added to the system.`;
      type = "info";
      break;
    case "update":
      title = "Training Updated";
      message = `The training "${trainingData.title}" has been updated.`;
      type = "warning";
      break;
    case "delete":
      title = "Training Removed";
      message = `The training "${trainingData.title}" has been removed from the system.`;
      type = "alert";
      break;
    case "complete":
      title = "Training Completed";
      message = `A training "${trainingData.title}" has been marked as completed.`;
      type = "success";
      break;
    default:
      return;
  }

  return createSystemNotification(type, title, message);
};

// Hazard-related notifications
export const createHazardNotification = (action, hazardData) => {
  let title, message, type;

  switch (action) {
    case "create":
      title = "New Hazard Reported";
      message = `A new ${hazardData.severity} severity hazard has been reported in ${hazardData.location}.`;
      type = "alert";
      break;
    case "update":
      title = "Hazard Updated";
      message = `Hazard in ${hazardData.location} has been updated to ${hazardData.status} status.`;
      type = "warning";
      break;
    case "resolve":
      title = "Hazard Resolved";
      message = `Hazard in ${hazardData.location} has been resolved.`;
      type = "success";
      break;
    case "approve":
      title = "Hazard Approved";
      message = `Hazard in ${
        hazardData.location
      } has been approved and assigned to ${
        hazardData.assignedTeam || "team"
      }.`;
      type = "info";
      break;
    default:
      return;
  }

  return createSystemNotification(type, title, message);
};

// Checklist-related notifications
export const createChecklistNotification = (action, checklistData) => {
  let title, message, type;

  switch (action) {
    case "create":
      title = "New Checklist Created";
      message = `A new checklist "${checklistData.title}" has been created for ${checklistData.department} department.`;
      type = "info";
      break;
    case "update":
      title = "Checklist Updated";
      message = `Checklist "${checklistData.title}" has been updated.`;
      type = "warning";
      break;
    case "complete":
      title = "Checklist Completed";
      message = `Checklist "${checklistData.title}" has been completed.`;
      type = "success";
      break;
    case "delete":
      title = "Checklist Removed";
      message = `Checklist "${checklistData.title}" has been removed.`;
      type = "alert";
      break;
    default:
      return;
  }

  return createSystemNotification(type, title, message);
};

// User management notifications
export const createUserNotification = (action, userData) => {
  let title, message, type;

  switch (action) {
    case "create":
      title = "New User Added";
      message = `A new user "${userData.name}" has been added to the system.`;
      type = "info";
      break;
    case "update":
      title = "User Updated";
      message = `User "${userData.name}" information has been updated.`;
      type = "warning";
      break;
    case "approve":
      title = "User Approved";
      message = `User "${userData.name}" has been approved and can now access the system.`;
      type = "success";
      break;
    case "delete":
      title = "User Removed";
      message = `User "${userData.name}" has been removed from the system.`;
      type = "alert";
      break;
    default:
      return;
  }

  return createSystemNotification(type, title, message);
};

// Alert-related notifications
export const createAlertNotification = (action, alertData) => {
  let title, message, type;

  switch (action) {
    case "create":
      title = "New Alert Issued";
      message = `A new ${alertData.type} alert has been issued: ${alertData.title}`;
      type =
        alertData.type === "info"
          ? "info"
          : alertData.type === "warning"
          ? "warning"
          : "alert";
      break;
    case "update":
      title = "Alert Updated";
      message = `Alert "${alertData.title}" has been updated.`;
      type = "warning";
      break;
    case "resolve":
      title = "Alert Resolved";
      message = `Alert "${alertData.title}" has been resolved.`;
      type = "success";
      break;
    default:
      return;
  }

  return createSystemNotification(type, title, message);
};

// Group-related notifications (for group members only)
export const createGroupNotification = (action, groupData, memberIds) => {
  let title, message, type;

  switch (action) {
    case "create":
      title = "New Group Created";
      message = `You have been added to the group "${groupData.name}".`;
      type = "info";
      break;
    case "update":
      title = "Group Updated";
      message = `The group "${groupData.name}" has been updated.`;
      type = "warning";
      break;
    case "add_member":
      title = "Added to Group";
      message = `You have been added to the group "${groupData.name}".`;
      type = "info";
      break;
    case "remove_member":
      title = "Removed from Group";
      message = `You have been removed from the group "${groupData.name}".`;
      type = "alert";
      break;
    case "change_permissions":
      title = "Group Permissions Changed";
      message = `Permissions for group "${groupData.name}" have been updated.`;
      type = "warning";
      break;
    default:
      return;
  }

  // Create group-specific notification for each member
  const existingNotifications = JSON.parse(
    localStorage.getItem("notifications") || "[]"
  );

  memberIds.forEach((memberId) => {
    const groupNotification = {
      id: Date.now() + memberId, // Unique ID per member
      type: type,
      title: title,
      message: message,
      time: new Date().toISOString(),
      read: false,
      groupId: groupData.id,
      memberId: memberId,
    };
    existingNotifications.unshift(groupNotification);
  });

  localStorage.setItem("notifications", JSON.stringify(existingNotifications));

  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event("notificationsUpdated"));

  return existingNotifications[0]; // Return the first notification as reference
};
