import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  TrendingUp,
  ListChecks,
  GitBranch,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  Settings2,
  Target,
} from "lucide-react";

const ROLE_LABELS = {
  employee: "Employee",
  supervisor: "Supervisor",
  manager: "Manager",
  admin: "Admin",
  safety_manager: "Manager",
};

const LEVELS = [
  { label: "Beginner", min: 0, max: 100, color: "bg-slate-200" },
  { label: "Bronze", min: 101, max: 300, color: "bg-amber-400" },
  { label: "Silver", min: 301, max: 600, color: "bg-slate-400" },
  { label: "Gold", min: 601, max: Infinity, color: "bg-yellow-400" },
];

const rewardRules = [
  {
    id: 1,
    role: "employee",
    category: "Training",
    title: "Complete any training module",
    actionKey: "TRAINING_COMPLETED",
    points: 10,
    maxPerDay: null,
    requiresApproval: false,
  },
  {
    id: 2,
    role: "employee",
    category: "Training",
    title: "Complete training before due date",
    actionKey: "TRAINING_BEFORE_DUE",
    points: 5,
    maxPerDay: null,
    requiresApproval: false,
  },
  {
    id: 3,
    role: "employee",
    category: "Training",
    title: "Score above 80% in quiz",
    actionKey: "QUIZ_SCORE_80",
    points: 5,
    maxPerDay: null,
    requiresApproval: false,
  },
  {
    id: 4,
    role: "employee",
    category: "Hazards",
    title: "Report a valid hazard (approved)",
    actionKey: "HAZARD_REPORTED_VALID",
    points: 15,
    maxPerDay: 5,
    requiresApproval: true,
  },
  {
    id: 5,
    role: "employee",
    category: "Hazards",
    title: "Report a critical hazard (High severity)",
    actionKey: "HAZARD_CRITICAL",
    points: 25,
    maxPerDay: 3,
    requiresApproval: true,
  },
  {
    id: 6,
    role: "employee",
    category: "Engagement",
    title: "Safety improvement implemented",
    actionKey: "SAFETY_IMPROVEMENT",
    points: 30,
    maxPerDay: 1,
    requiresApproval: true,
  },
  {
    id: 7,
    role: "supervisor",
    category: "Hazard Review",
    title: "Approve employee hazard report",
    actionKey: "HAZARD_APPROVED",
    points: 5,
    maxPerDay: null,
    requiresApproval: false,
  },
  {
    id: 8,
    role: "supervisor",
    category: "Hazard Review",
    title: "Close hazard with proper action",
    actionKey: "HAZARD_CLOSED",
    points: 10,
    maxPerDay: null,
    requiresApproval: false,
  },
  {
    id: 9,
    role: "supervisor",
    category: "Inspections",
    title: "Submit inspection checklist",
    actionKey: "INSPECTION_SUBMITTED",
    points: 10,
    maxPerDay: 1,
    requiresApproval: false,
  },
  {
    id: 10,
    role: "supervisor",
    category: "Team Safety",
    title: "Zero incidents in team (monthly)",
    actionKey: "ZERO_INCIDENT_MONTH",
    points: 50,
    maxPerDay: 1,
    requiresApproval: true,
  },
  {
    id: 11,
    role: "manager",
    category: "Reporting",
    title: "Review monthly safety reports",
    actionKey: "REPORT_REVIEWED",
    points: 10,
    maxPerDay: 1,
    requiresApproval: false,
  },
  {
    id: 12,
    role: "manager",
    category: "Training",
    title: "Assign & track team training",
    actionKey: "TRAINING_ASSIGNED",
    points: 10,
    maxPerDay: 1,
    requiresApproval: false,
  },
  {
    id: 13,
    role: "manager",
    category: "Hazards",
    title: "Close high severity hazard on time",
    actionKey: "HAZARD_CLOSED_HIGH",
    points: 20,
    maxPerDay: null,
    requiresApproval: true,
  },
  {
    id: 14,
    role: "manager",
    category: "Engagement",
    title: "Conduct safety meeting/toolbox talk",
    actionKey: "SAFETY_MEETING_LOGGED",
    points: 15,
    maxPerDay: 1,
    requiresApproval: false,
  },
  {
    id: 15,
    role: "admin",
    category: "Configuration",
    title: "Create/update training program",
    actionKey: "TRAINING_PROGRAM_UPDATED",
    points: 10,
    maxPerDay: null,
    requiresApproval: false,
  },
  {
    id: 16,
    role: "admin",
    category: "Communication",
    title: "Upload new safety policy/notice",
    actionKey: "POLICY_UPLOADED",
    points: 5,
    maxPerDay: null,
    requiresApproval: false,
  },
  {
    id: 17,
    role: "admin",
    category: "Configuration",
    title: "Set up hazard category",
    actionKey: "HAZARD_CATEGORY_CREATED",
    points: 5,
    maxPerDay: null,
    requiresApproval: false,
  },
  {
    id: 18,
    role: "admin",
    category: "Audit",
    title: "Complete monthly safety audit",
    actionKey: "MONTHLY_AUDIT_COMPLETE",
    points: 20,
    maxPerDay: 1,
    requiresApproval: true,
  },
];

const rewardTransactions = [
  {
    id: 101,
    userId: "emp-5",
    userName: "Priya Menon",
    role: "employee",
    actionKey: "HAZARD_REPORTED_VALID",
    description: "Valid hazard reported – conveyor pinch point",
    points: 15,
    referenceId: "hazard_id=23",
    createdAt: "2025-11-26T10:15:00Z",
  },
  {
    id: 102,
    userId: "sup-3",
    userName: "Rahul Singh",
    role: "supervisor",
    actionKey: "HAZARD_APPROVED",
    description: "Approved hazard #23 from maintenance team",
    points: 5,
    referenceId: "hazard_id=23",
    createdAt: "2025-11-26T10:20:00Z",
  },
  {
    id: 103,
    userId: "mgr-2",
    userName: "Sofia Martinez",
    role: "manager",
    actionKey: "HAZARD_CLOSED_HIGH",
    description: "Closed high severity hazard #23 before deadline",
    points: 20,
    referenceId: "hazard_id=23",
    createdAt: "2025-11-26T10:45:00Z",
  },
  {
    id: 104,
    userId: "emp-7",
    userName: "Daniel Chen",
    role: "employee",
    actionKey: "TRAINING_COMPLETED",
    description: "Forklift refresher training completed",
    points: 10,
    referenceId: "training_id=58",
    createdAt: "2025-11-25T09:00:00Z",
  },
  {
    id: 105,
    userId: "admin-1",
    userName: "Ariana Patel",
    role: "admin",
    actionKey: "MONTHLY_AUDIT_COMPLETE",
    description: "November audit logged in system",
    points: 20,
    referenceId: "audit_id=11",
    createdAt: "2025-11-24T18:30:00Z",
  },
];

const userPoints = [
  { userId: "emp-5", name: "Priya Menon", role: "employee", points: 230, team: "Assembly" },
  { userId: "emp-7", name: "Daniel Chen", role: "employee", points: 210, team: "Maintenance" },
  { userId: "emp-8", name: "Lucas Branco", role: "employee", points: 180, team: "Warehouse" },
  { userId: "sup-3", name: "Rahul Singh", role: "supervisor", points: 190, team: "Assembly" },
  { userId: "sup-6", name: "Elena Petrova", role: "supervisor", points: 175, team: "Logistics" },
  { userId: "mgr-2", name: "Sofia Martinez", role: "manager", points: 205, team: "South Plant" },
  { userId: "mgr-4", name: "James O'Connor", role: "manager", points: 188, team: "North Plant" },
  { userId: "admin-1", name: "Ariana Patel", role: "admin", points: 160, team: "HQ" },
  { userId: "admin-2", name: "Gabriel Lee", role: "admin", points: 150, team: "HQ" },
];

const rewardFlows = [
  {
    id: "training",
    title: "Training completion flow",
    roles: ["employee", "manager"],
    steps: [
      "Employee completes training (POST /training/complete)",
      "Backend marks training complete",
      "addReward(user_id, TRAINING_COMPLETED)",
      "Insert transaction + update reward_points",
    ],
  },
  {
    id: "hazard",
    title: "Hazard reporting flow",
    roles: ["employee", "supervisor", "manager"],
    steps: [
      "Employee submits hazard report (no points yet)",
      "Supervisor reviews → addReward(employee, HAZARD_REPORTED_VALID)",
      "Supervisor approval → addReward(supervisor, HAZARD_APPROVED)",
      "Manager closes high severity hazard → addReward(manager, HAZARD_CLOSED_HIGH)",
    ],
  },
  {
    id: "config",
    title: "System configuration flow",
    roles: ["admin"],
    steps: [
      "Admin updates rule/policy",
      "Rule stored in reward_rules table",
      "Transactions only log when action executed",
      "Audit logs keep history for reports",
    ],
  },
];

const systemConfigHighlights = [
  {
    title: "Reward Rules Registry",
    description: "CRUD UI for reward_rules table so admins can change points without code pushes.",
    chips: ["role", "action_key", "points", "max_per_day", "requires_approval"],
  },
  {
    title: "Transactions Ledger",
    description: "Every addReward call inserts into reward_transactions for analytics/exports.",
    chips: ["user_id", "action_key", "points", "reference_id", "created_at"],
  },
  {
    title: "User Totals Cache",
    description: "users.reward_points column stays in sync to avoid recalculating SUM every load.",
    chips: ["triggered on insert", "fallback SUM()", "leaderboards"],
  },
];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getLevelMeta = (points) => {
  return (
    LEVELS.find((level) => points >= level.min && points <= level.max) ||
    LEVELS[LEVELS.length - 1]
  );
};

const Rewards = () => {
  const { user } = useAuth();
  const canonicalRole =
    user?.role === "safety_manager" ? "manager" : user?.role || "employee";
  const activeRole = canonicalRole;

  const rulesForRole = useMemo(
    () => rewardRules.filter((rule) => rule.role === activeRole),
    [activeRole]
  );

  const ruleCategories = useMemo(() => {
    return rulesForRole.reduce((acc, rule) => {
      acc[rule.category] = acc[rule.category] || [];
      acc[rule.category].push(rule);
      return acc;
    }, {});
  }, [rulesForRole]);

  const transactionsForRole = useMemo(
    () => rewardTransactions.filter((tx) => tx.role === activeRole),
    [activeRole]
  );

  const leaderboard = useMemo(() => {
    return userPoints
      .filter((entry) => entry.role === activeRole)
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [activeRole]);

  const personalScore =
    leaderboard.find((entry) => entry.userId === user?.id)?.points ||
    leaderboard[0]?.points ||
    0;

  const levelMeta = getLevelMeta(personalScore);
  const nextLevel =
    LEVELS[LEVELS.findIndex((lvl) => lvl.label === levelMeta.label) + 1];
  const toNextLevel = nextLevel ? Math.max(0, nextLevel.min - personalScore) : 0;
  const progressToNext = nextLevel
    ? Math.round(
        ((personalScore - levelMeta.min) /
          (nextLevel.min - levelMeta.min || 1)) *
          100
      )
    : 100;

  const teamAverage = useMemo(() => {
    if (leaderboard.length === 0) return 0;
    const total = leaderboard.reduce((sum, entry) => sum + entry.points, 0);
    return Math.round(total / leaderboard.length);
  }, [leaderboard]);

  const totalTransactions = transactionsForRole.length;

    return (
      <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl md:text-3xl font-bold">
            {ROLE_LABELS[activeRole]} rewards & safety score
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Points, rules, and ledger entries tailored to your role. All data is
            driven by reward_rules, reward_transactions, and cached totals so
            the UI stays in sync with backend logic.
          </p>
        </div>

        <div className="space-y-6">
          {/* Score snapshot */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Your Safety Score
                  </CardTitle>
                  <div className="text-3xl font-bold">{personalScore}</div>
                </div>
                <ShieldCheck className="h-10 w-10 text-blue-500" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{levelMeta.label} level</span>
                  {nextLevel ? (
                    <span className="text-muted-foreground">
                      {toNextLevel} pts to {nextLevel.label}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Max level reached
                    </span>
                  )}
                </div>
                <Progress value={Math.min(progressToNext, 100)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Team Average
                  </CardTitle>
                  <div className="text-3xl font-bold">{teamAverage}</div>
                </div>
                <TrendingUp className="h-10 w-10 text-emerald-500" />
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  Leaderboard built from reward_transactions SUM(points)
                </p>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-1 text-xs">
                  <ArrowUpRight className="h-3 w-3" />
                  +8% vs last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Logged Transactions
                  </CardTitle>
                  <div className="text-3xl font-bold">{totalTransactions}</div>
                </div>
                <GitBranch className="h-10 w-10 text-purple-500" />
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  {activeRole === "admin"
                    ? "Config changes logged when actions are executed."
                    : "Only approved items move points."}
                </p>
                <Badge variant="outline" className="text-xs">
                  Sample data
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* What gives points */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <ListChecks className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">
                  What gives {ROLE_LABELS[activeRole]} points?
                </h2>
                <p className="text-muted-foreground text-sm">
                  Pulled straight from reward_rules so UI always mirrors the
                  backend rules table.
                </p>
              </div>
                    </div>
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(ruleCategories).map(([category, list]) => (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      {category}
                    </CardTitle>
                    <CardDescription>
                      {list.length} rule{list.length > 1 && "s"} ·{" "}
                      {list.reduce((sum, rule) => sum + rule.points, 0)} total
                      available points
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {list.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-start justify-between gap-3 border border-dashed rounded-lg p-3"
                      >
                        <div>
                          <p className="font-medium text-sm">{rule.title}</p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">
                            {rule.actionKey}
                          </p>
                          {rule.requiresApproval && (
                        <Badge
                          variant="outline"
                              className="mt-2 text-[10px]"
                        >
                              Requires approval
                        </Badge>
                          )}
                          {rule.maxPerDay && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Max {rule.maxPerDay} per day
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-semibold text-primary">
                            +{rule.points}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            points
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Reward rules table */}
          <Card>
            <CardHeader>
              <CardTitle>Reward rules table snapshot</CardTitle>
              <CardDescription>
                Mirrors reward_rules schema (role, action_key, points,
                max_per_day, requires_approval). Update this table → UI updates
                automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Action Key</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Max / Day</TableHead>
                    <TableHead>Approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rulesForRole.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">
                        {rule.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.actionKey}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        +{rule.points}
                      </TableCell>
                      <TableCell>
                        {rule.maxPerDay ? rule.maxPerDay : "Unlimited"}
                      </TableCell>
                      <TableCell>
                        {rule.requiresApproval ? (
                          <Badge className="bg-emerald-600">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent transactions + leaderboard */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent reward transactions</CardTitle>
                <CardDescription>
                  Data comes straight from reward_transactions (points only post
                  after approval).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactionsForRole.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No transactions yet for this role.
                  </div>
                ) : (
                  transactionsForRole.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-start justify-between border rounded-lg p-3"
                    >
                      <div>
                        <p className="font-semibold">{tx.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tx.referenceId} · {formatDate(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-primary">
                          +{tx.points}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {tx.actionKey}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leaderboard (Top 5)</CardTitle>
                <CardDescription>
                  Built using users.reward_points (kept in sync on every
                  transaction insert).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No users tracked yet for this role.
                  </div>
                ) : (
                  leaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-muted-foreground">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-semibold">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.team}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{entry.points} pts</p>
                        <Badge variant="outline" className="text-[10px]">
                          {getLevelMeta(entry.points).label}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Flow */}
          <div className="grid gap-4 md:grid-cols-3">
            {rewardFlows
              .filter((flow) => flow.roles.includes(activeRole))
              .map((flow) => (
                <Card key={flow.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <CardTitle className="text-base font-semibold">
                        {flow.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {flow.steps.map((step, idx) => (
                        <li key={step} className="flex gap-2">
                          <span className="text-muted-foreground">
                            {idx + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* System level configuration */}
                <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-primary" />
                  <div>
              <h2 className="text-xl font-semibold">
                How we calculate & store rewards
              </h2>
              <p className="text-muted-foreground text-sm">
                Reference architecture for reward_rules + reward_transactions +
                cached totals.
                    </p>
                  </div>
                  </div>
          <div className="grid gap-4 md:grid-cols-3">
            {systemConfigHighlights.map((highlight) => (
              <Card key={highlight.title} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Settings2 className="h-4 w-4 text-primary" />
                    {highlight.title}
                  </CardTitle>
                  <CardDescription>{highlight.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {highlight.chips.map((chip) => (
                    <Badge key={chip} variant="outline" className="text-xs">
                      {chip}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dashboard guidance */}
        <Card>
          <CardHeader className="space-y-1">
                      <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Dashboard UX playbook</CardTitle>
            </div>
            <CardDescription>
              How to surface these points per persona (matches requirement doc).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="border rounded-lg p-4 space-y-2">
              <p className="font-semibold">Employee dashboard</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Total points + badge (Beginner/Bronze/Silver/Gold)</li>
                <li>Recent transactions timeline</li>
                <li>Progress bar “{toNextLevel} to {nextLevel?.label ?? "Gold"}”</li>
              </ul>
                      </div>
            <div className="border rounded-lg p-4 space-y-2">
              <p className="font-semibold">Supervisor / Manager</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Own score + zero-incident bonus tracker</li>
                <li>Top performers per team (leaderboard data)</li>
                <li>Hazard approvals widget (pending vs rewarded)</li>
              </ul>
                        </div>
            <div className="border rounded-lg p-4 space-y-2">
              <p className="font-semibold">Admin</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Rules management UI</li>
                <li>Company-wide leaderboard & export</li>
                <li>Monthly points per department chart</li>
              </ul>
              </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Rewards;
