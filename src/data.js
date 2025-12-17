// Dummy data for the Safety App

export const dummyUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@company.com",
    password: "1122",
    role: "Admin",
    status: "Active",
    department: "Administration",
    approved: true,
  },
  {
    id: 2,
    name: "Manager User",
    email: "manager@company.com",
    password: "1122",
    role: "Safety Manager",
    status: "Active",
    department: "Operations",
    approved: true,
  },
  {
    id: 3,
    name: "Supervisor User",
    email: "supervisor@company.com",
    password: "1122",
    role: "Supervisor",
    status: "Active",
    department: "Production",
    approved: true,
  },
  {
    id: 4,
    name: "Employee User",
    email: "employee@company.com",
    password: "1122",
    role: "Employee",
    status: "Active",
    department: "Maintenance",
    approved: true,
  },
  {
    id: 5,
    name: "Emilsa User",
    email: "emilsa@company.com",
    password: "1122",
    role: "Supervisor",
    status: "Active",
    department: "Production",
    approved: true,
  },
];

export const dummyCourses = [
  {
    id: 1,
    title: "Safety Procedures Mastery",
    category: "Safety",
    description: "Complete guide to workplace safety procedures and emergency response.",
    level: "Beginner",
    duration: "4 hours",
    points: 100,
    thumbnail: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHNhZmV0eXxlbnwwfHwwfHx8MA%3D%3D",
    status: "Available",
    enrolledUserIds: [2, 3], 
    modules: [
      {
        id: 101,
        title: "Introduction to Safety",
        lessons: [
          {
            id: 1001,
            title: "Why Safety Matters",
            type: "video",
            content: "https://www.w3schools.com/html/mov_bbb.mp4",
            duration: "10 min",
            completedByUserIds: [2]
          },
          {
            id: 1002,
            title: "Safety Policy Overview",
            type: "pdf",
            content: "/assets/safety-policy.pdf",
            duration: "15 min",
            completedByUserIds: [2]
          }
        ]
      },
      {
        id: 102,
        title: "Emergency Response",
        lessons: [
           {
            id: 1003,
            title: "Fire Evacuation Procedures",
            type: "video",
            content: "https://www.w3schools.com/html/mov_bbb.mp4",
            duration: "20 min",
            completedByUserIds: []
          },
          {
            id: 1004,
            title: "First Aid Basics",
            type: "article",
            content: "Call 911 immediately in case of emergency...",
            duration: "5 min",
            completedByUserIds: []
          }
        ]
      }
    ],
    quizId: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Advanced Hazard Identification",
    category: "Technical",
    description: "Learn to identify subtle workplace hazards before they cause accidents.",
    level: "Advanced",
    duration: "2.5 hours",
    points: 150,
    thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kdXN0cmlhbCUyMHNhZmV0eXxlbnwwfHwwfHx8MA%3D%3D",
    status: "Available",
    enrolledUserIds: [2],
     modules: [
      {
        id: 201,
        title: "Types of Hazards",
        lessons: [
          {
            id: 2001,
            title: "Physical Hazards",
            type: "video",
            content: "https://www.w3schools.com/html/mov_bbb.mp4",
            duration: "15 min",
            completedByUserIds: []
          }
        ]
      }
    ],
    quizId: 2,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Office Ergonomics",
    category: "Health",
    description: "Setup your workstation correctly to prevent long-term injury.",
    level: "Intermediate",
    duration: "1 hour",
    points: 50,
    thumbnail: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2ZmaWNlfGVufDB8fDB8fHww",
    status: "Published",
    enrolledUserIds: [],
    modules: [],
    quizId: null,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];

export const dummyQuizzes = [
  {
    id: 1,
    courseId: 1,
    title: "Safety Mastery Final Assessment",
    passingScore: 80,
    questions: [
      {
        id: 1,
        text: "What is the first step in case of fire?",
        options: ["Run", "Scream", "Activate Alarm", "Hide"],
        correctOption: 2,
        points: 10
      },
      {
        id: 2,
        text: "PPE stands for:",
        options: ["Personal Protective Equipment", "Public People Eater", "Private Property Entry", "None"],
        correctOption: 0,
        points: 10
      }
    ]
  },
  {
    id: 2,
    courseId: 2,
    title: "Hazard Identification Quiz",
    passingScore: 70,
    questions: [
      {
        id: 1,
        text: "Which is a physical hazard?",
        options: ["Bacteria", "Noise", "Stress", "Virus"],
        correctOption: 1,
        points: 10
      }
    ]
  }
];

// Keep dummyTrainings for backward compatibility if needed, or alias it
export const dummyTrainings = dummyCourses;

export const dummyHazards = [
  {
    id: 1,
    type: "Slip/Trip",
    location: "Warehouse A",
    severity: "High",
    date: new Date().toISOString().split("T")[0],
    status: "Open",
    description: "Water spill near loading dock",
    reportedBy: "John Doe",
    role: "employee",
    priority: null,
    timeline: null,
    assignedTeam: null,
    approvalRemarks: null,
    adminApproval: null,
    managerApproval: null,
    supervisorApproval: null,
    assignedEmployees: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    type: "Electrical",
    location: "Production Floor",
    severity: "Critical",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    status: "Pending",
    description: "Exposed wiring in machine panel",
    reportedBy: "Jane Smith",
    role: "employee",
    priority: "High",
    timeline: "2024-01-20",
    assignedTeam: "Electrical Team",
    approvalRemarks: "Immediate attention required",
    adminApproval: "approved",
    managerApproval: "approved",
    supervisorApproval: "approved",
    assignedEmployees: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    type: "Chemical",
    location: "Storage Room",
    severity: "Medium",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    status: "Resolved",
    description: "Improper chemical storage",
    reportedBy: "Bob Johnson",
    role: "employee",
    priority: "Medium",
    timeline: "2024-01-18",
    assignedTeam: "Safety Team",
    approvalRemarks: "Resolved with proper storage procedures",
    adminApproval: "approved",
    managerApproval: "approved",
    supervisorApproval: "approved",
    assignedEmployees: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const dummyChecklists = [
  {
    id: 1,
    title: "Daily Safety Inspection",
    department: "Production",
    dueDate: "2024-01-16",
    status: "In Progress",
    items: [
      {
        id: 1,
        text: "Check fire extinguisher pressure",
        completed: true,
      },
      { id: 2, text: "Verify emergency exit signs", completed: true },
      { id: 3, text: "Inspect PPE equipment", completed: false },
      { id: 4, text: "Test emergency alarm system", completed: false },
    ],
  },
  {
    id: 2,
    title: "Weekly Equipment Maintenance",
    department: "Maintenance",
    dueDate: "2024-01-17",
    status: "Pending",
    items: [
      { id: 1, text: "Lubricate machinery parts", completed: false },
      { id: 2, text: "Check hydraulic fluid levels", completed: false },
      { id: 3, text: "Inspect safety guards", completed: false },
    ],
  },
];

export const dummyChecklistData = [
  {
    key: 1,
    id: Date.now() - 1000000,
    location: "Main Building - Ground Floor",
    type: "ABC Dry Chemical",
    capacity: "5 KG",
    mfgDate: "2022-03-15",
    condition: "Completed",
    fireNo: "FE-001",
    locationCode: "MB-GF-001",
    remarks: "John Smith - Safety Officer - Mike Johnson - john.smith@company.com",
  },
  {
    key: 2,
    id: Date.now() - 900000,
    location: "Warehouse A - Section 1",
    type: "CO2",
    capacity: "10 KG",
    mfgDate: "2021-08-20",
    condition: "In Progress",
    fireNo: "FE-002",
    locationCode: "WA-S1-002",
    remarks: "Sarah Davis - Supervisor - Tom Wilson - sarah.davis@company.com",
  },
  {
    key: 3,
    id: Date.now() - 800000,
    location: "Production Floor - Line 1",
    type: "Water",
    capacity: "9 L",
    mfgDate: "2023-01-10",
    condition: "Pending",
    fireNo: "FE-003",
    locationCode: "PF-L1-003",
    remarks: "Robert Brown - Technician - Lisa Garcia - robert.brown@company.com",
  },
  {
    key: 4,
    id: Date.now() - 700000,
    location: "Office Area - Floor 2",
    type: "ABC Dry Chemical",
    capacity: "2 KG",
    mfgDate: "2022-11-05",
    condition: "Completed",
    fireNo: "FE-004",
    locationCode: "OA-F2-004",
    remarks: "Emily Johnson - Admin - David Lee - emily.johnson@company.com",
  },
  {
    key: 5,
    id: Date.now() - 600000,
    location: "Cafeteria",
    type: "Wet Chemical",
    capacity: "6 L",
    mfgDate: "2022-06-30",
    condition: "Completed",
    fireNo: "FE-005",
    locationCode: "CAF-001",
    remarks: "Michael Chen - Manager - Anna White - michael.chen@company.com",
  },
  {
    key: 6,
    id: Date.now() - 500000,
    location: "Parking Garage - Level 1",
    type: "CO2",
    capacity: "5 KG",
    mfgDate: "2023-04-12",
    condition: "Pending",
    fireNo: "FE-006",
    locationCode: "PG-L1-006",
    remarks: "James Wilson - Security - Karen Martinez - james.wilson@company.com",
  },
  {
    key: 7,
    id: Date.now() - 400000,
    location: "Server Room",
    type: "Clean Agent",
    capacity: "4 KG",
    mfgDate: "2022-09-18",
    condition: "In Progress",
    fireNo: "FE-007",
    locationCode: "SR-001",
    remarks: "Jennifer Taylor - IT Admin - Chris Anderson - jennifer.taylor@company.com",
  },
  {
    key: 8,
    id: Date.now() - 300000,
    location: "Loading Dock",
    type: "ABC Dry Chemical",
    capacity: "10 KG",
    mfgDate: "2021-12-08",
    condition: "Completed",
    fireNo: "FE-008",
    locationCode: "LD-001",
    remarks: "Mark Thompson - Logistics - Susan Clark - mark.thompson@company.com",
  },
];

export const dummyAlerts = [
  {
    id: 1,
    title: "Fire Drill Scheduled",
    message: "Mandatory fire drill at 2 PM today in the main building.",
    type: "info",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: 2,
    title: "Safety Meeting Reminder",
    message: "Weekly safety meeting starts in 30 minutes.",
    type: "warning",
    date: new Date(Date.now() - 3600000).toISOString(),
    read: true,
  },
];

export const dummyNotifications = [
  {
    id: 1,
    title: "New Hazard Reported",
    message: "A new hazard has been reported in Warehouse A.",
    type: "alert",
    date: new Date().toISOString(),
    read: false,
  },
  {
    id: 2,
    title: "Training Completed",
    message: "John Doe has completed the Safety Procedures Training.",
    type: "success",
    date: new Date(Date.now() - 7200000).toISOString(),
    read: false,
  },
];

export const dummyUser = {
  id: 1,
  name: "John Doe",
  email: "john@company.com",
  role: "Admin",
};

export const dummyTheme = "light";

export const dummyRewards = [
  // Admin-specific rewards
  {
    id: 1,
    employeeName: "Admin User",
    rewardTitle: "System Administration Excellence",
    rewardType: "Badge",
    reason: "Outstanding performance in managing the safety management system",
    issuedBy: "System",
    issueDate: "2024-01-15",
    pointsEarned: 100,
    status: "Active",
    targetRoles: ["admin"],
  },
  {
    id: 2,
    employeeName: "Admin User",
    rewardTitle: "User Management Champion",
    rewardType: "Certificate",
    reason: "Successfully managing and onboarding 50+ users",
    issuedBy: "System",
    issueDate: "2024-01-20",
    pointsEarned: 150,
    status: "Active",
    targetRoles: ["admin"],
  },

  // Manager-specific rewards
  {
    id: 3,
    employeeName: "Manager User",
    rewardTitle: "Safety Leadership Award",
    rewardType: "Certificate",
    reason:
      "Exemplary leadership in implementing safety protocols across teams",
    issuedBy: "Admin User",
    issueDate: "2024-01-25",
    pointsEarned: 200,
    status: "Active",
    targetRoles: ["safety_manager"],
  },
  {
    id: 4,
    employeeName: "Manager User",
    rewardTitle: "Team Safety Excellence",
    rewardType: "Badge",
    reason: "Achieving 95% safety compliance across managed teams",
    issuedBy: "Admin User",
    issueDate: "2024-02-01",
    pointsEarned: 125,
    status: "Active",
    targetRoles: ["safety_manager"],
  },

  // Employee-specific rewards
  {
    id: 5,
    employeeName: "Employee User",
    rewardTitle: "Safety Champion Badge",
    rewardType: "Badge",
    reason: "Consistently demonstrating excellent safety practices",
    issuedBy: "Manager User",
    issueDate: "2024-02-05",
    pointsEarned: 50,
    status: "Active",
    targetRoles: ["employee"],
  },
  {
    id: 6,
    employeeName: "Employee User",
    rewardTitle: "Hazard Reporting Excellence",
    rewardType: "Points",
    reason: "Reporting 5 critical hazards that prevented potential accidents",
    issuedBy: "Manager User",
    issueDate: "2024-02-10",
    pointsEarned: 100,
    status: "Active",
    targetRoles: ["employee"],
  },
  {
    id: 7,
    employeeName: "Employee User",
    rewardTitle: "Zero Accident Certificate",
    rewardType: "Certificate",
    reason: "Completing 6 months without any safety incidents",
    issuedBy: "Manager User",
    issueDate: "2024-02-15",
    pointsEarned: 200,
    status: "Active",
    targetRoles: ["employee"],
  },
  {
    id: 8,
    employeeName: "Employee User",
    rewardTitle: "Task Completion Bonus",
    rewardType: "Bonus",
    reason:
      "Successfully completing all assigned safety checklists for the quarter",
    issuedBy: "Manager User",
    issueDate: "2024-02-20",
    pointsEarned: 150,
    status: "Active",
    targetRoles: ["employee"],
  },
  {
    id: 9,
    employeeName: "Employee User",
    rewardTitle: "Safety Training Excellence",
    rewardType: "Badge",
    reason: "Scoring 100% on all safety training modules",
    issuedBy: "Manager User",
    issueDate: "2024-02-25",
    pointsEarned: 75,
    status: "Active",
    targetRoles: ["employee"],
  },
  {
    id: 10,
    employeeName: "Employee User",
    rewardTitle: "First Hazard Report",
    rewardType: "Points",
    reason: "Reporting first hazard in the system",
    issuedBy: "Manager User",
    issueDate: "2024-03-01",
    pointsEarned: 25,
    status: "Active",
    targetRoles: ["employee"],
  },
  {
    id: 11,
    employeeName: "Employee User",
    rewardTitle: "Checklist Master",
    rewardType: "Badge",
    reason: "Completing 10 consecutive safety checklists without issues",
    issuedBy: "Manager User",
    issueDate: "2024-03-05",
    pointsEarned: 60,
    status: "Active",
    targetRoles: ["employee"],
  },

  // Cross-role rewards (visible to multiple roles)
  {
    id: 12,
    employeeName: "Manager User",
    rewardTitle: "Company Safety Milestone",
    rewardType: "Certificate",
    reason: "Contributing to achieving company-wide safety goals",
    issuedBy: "Admin User",
    issueDate: "2024-03-10",
    pointsEarned: 300,
    status: "Active",
    targetRoles: ["admin", "safety_manager", "employee"],
  },
];
