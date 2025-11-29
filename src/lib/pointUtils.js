// Point management utilities for dynamic point tracking

// Get or initialize user points from localStorage
export const getUserPoints = (userId) => {
  const stored = localStorage.getItem(`userPoints_${userId}`);
  if (stored) {
    return JSON.parse(stored);
  }

  // Initialize with empty structure
  const initialPoints = {
    total: 0,
    history: [],
    lastLoginDate: null,
  };

  localStorage.setItem(`userPoints_${userId}`, JSON.stringify(initialPoints));
  return initialPoints;
};

// Save user points to localStorage
export const saveUserPoints = (userId, pointsData) => {
  localStorage.setItem(`userPoints_${userId}`, JSON.stringify(pointsData));
};

// Add points for a specific activity
export const addPoints = (userId, activity, points, role) => {
  const userPoints = getUserPoints(userId);
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Create point entry
  const pointEntry = {
    id: `${userId}-${Date.now()}-${Math.random()}`,
    date: today,
    activity,
    points,
    type: points > 0 ? "earning" : "deduction",
    role,
    timestamp: now.toISOString(),
  };

  // Add to history
  userPoints.history.push(pointEntry);

  // Update total
  userPoints.total += points;

  // Save
  saveUserPoints(userId, userPoints);

  return userPoints;
};

// Add login points (only once per day)
export const addLoginPoints = (userId, role) => {
  // Normalize role
  let normalizedRole = role;
  if (typeof role === "string") {
    normalizedRole = role.toLowerCase().replace(/\s+/g, "_");
    if (normalizedRole === "safety_manager" || normalizedRole === "manager") {
      normalizedRole = "safety_manager";
    }
  }

  const userPoints = getUserPoints(userId);
  const today = new Date().toISOString().split("T")[0];

  // Check if already logged in today
  if (userPoints.lastLoginDate === today) {
    return userPoints; // Already got points today
  }

  // Only employees get login points (supervisors and managers don't have this activity)
  if (normalizedRole === "employee") {
    const loginPoints = 5; // Fixed value for employees
    addPoints(userId, "Daily login / attendance", loginPoints, normalizedRole);
    userPoints.lastLoginDate = today;
    saveUserPoints(userId, userPoints);
  }

  return getUserPoints(userId);
};

// Get monthly point history
export const getMonthlyHistory = (userId, month, year) => {
  const userPoints = getUserPoints(userId);
  const monthHistory = userPoints.history.filter((entry) => {
    const entryDate = new Date(entry.date);
    return (
      entryDate.getMonth() + 1 === month && entryDate.getFullYear() === year
    );
  });

  return monthHistory;
};

// Get daily point aggregation for a month
export const getDailyPoints = (userId, month, year) => {
  const monthHistory = getMonthlyHistory(userId, month, year);
  const dailyMap = {};

  monthHistory.forEach((entry) => {
    const day = entry.date;
    if (!dailyMap[day]) {
      dailyMap[day] = { date: day, points: 0, activities: [] };
    }
    dailyMap[day].points += entry.points;
    dailyMap[day].activities.push(entry);
  });

  // Convert to array and sort by date
  return Object.values(dailyMap).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
};

// Point system reference (should match Rewards.jsx)
const POINT_SYSTEM = {
  employee: {
    earnings: [
      { activity: "Daily login / attendance", points: 5 },
      { activity: "Completing assigned safety tasks", points: 20 },
      { activity: "Reporting a safety incident / hazard", points: 30 },
      { activity: "Completing safety training module", points: 50 },
      { activity: "Participating in safety quiz", points: 15 },
      { activity: "Zero violations for the week", points: 40 },
    ],
    deductions: [
      { rule: "Safety violation", points: -30 },
      { rule: "Incomplete task", points: -10 },
    ],
  },
  supervisor: {
    earnings: [
      { activity: "Approving employee safety task", points: 10 },
      { activity: "Reviewing safety incident report", points: 15 },
      { activity: "Assigning tasks on time", points: 5 },
      { activity: "Weekly safety meeting completed", points: 20 },
      { activity: "No incidents in team", points: 50 },
    ],
    deductions: [
      { rule: "Pending approvals not done in time", points: -10 },
      { rule: "Ignoring safety violation", points: -20 },
    ],
  },
  safety_manager: {
    earnings: [
      { activity: "Approving supervisor reports", points: 20 },
      { activity: "Closing safety cases", points: 30 },
      { activity: "Uploading safety documents/policies", points: 25 },
      { activity: "Conducting safety audits", points: 40 },
      { activity: "Achieving monthly safety KPI", points: 50 },
    ],
    deductions: [
      { rule: "Incomplete audit", points: -20 },
      { rule: "Late approval", points: -10 },
    ],
  },
};

// Initialize dummy point data for a user
export const initializeDummyPoints = (userId, role, userName) => {
  const stored = localStorage.getItem(`userPoints_${userId}`);
  // Only initialize if no data exists
  if (stored) {
    return JSON.parse(stored);
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const history = [];

  // Get activities for the role
  const activities = POINT_SYSTEM[role]?.earnings || [];
  const deductions = POINT_SYSTEM[role]?.deductions || [];
  const allActivities = [...activities, ...deductions];

  if (allActivities.length === 0) {
    // Admin or role without point system
    return {
      total: 0,
      history: [],
      lastLoginDate: null,
    };
  }

  let totalPoints = 0;

  // Generate data for last 3 months
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const month = currentMonth - monthOffset;
    const year = month < 0 ? currentYear - 1 : currentYear;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generate activities for this month
    const numActivities = Math.floor(Math.random() * 20) + 15; // 15-35 activities per month

    for (let i = 0; i < numActivities; i++) {
      const activity =
        allActivities[Math.floor(Math.random() * allActivities.length)];
      if (!activity) continue;

      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const date = new Date(year, month, day);
      const activityName = activity.activity || activity.rule;
      const points = activity.points;

      const entry = {
        id: `${userId}-${year}-${month}-${i}-${Math.random()}`,
        date: date.toISOString().split("T")[0],
        activity: activityName,
        points: points,
        type: points > 0 ? "earning" : "deduction",
        role: role,
        timestamp: date.toISOString(),
      };

      history.push(entry);
      totalPoints += points;
    }
  }

  // Sort history by date
  history.sort((a, b) => new Date(a.date) - new Date(b.date));

  const pointsData = {
    total: totalPoints,
    history: history,
    lastLoginDate: new Date().toISOString().split("T")[0],
  };

  localStorage.setItem(`userPoints_${userId}`, JSON.stringify(pointsData));
  return pointsData;
};

// Initialize dummy points for all users
export const initializeAllDummyPoints = () => {
  const users = JSON.parse(localStorage.getItem("dummyUsers") || "[]");

  users.forEach((user) => {
    const normalizedRole = user.role.toLowerCase().replace(/\s+/g, "_");
    // Map role names
    let role = normalizedRole;
    if (normalizedRole === "safety_manager" || normalizedRole === "manager") {
      role = "safety_manager";
    } else if (normalizedRole === "admin") {
      role = "admin";
    }

    // Only initialize if no data exists
    const existing = localStorage.getItem(`userPoints_${user.id}`);
    if (!existing) {
      initializeDummyPoints(user.id, role, user.name);
    }
  });
};

export { POINT_SYSTEM };
