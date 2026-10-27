// --- Core & Auth Types ---
export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  mfa_enabled: boolean;
  organization_id: number;
  organization_name: string;
  role?: string;
  role_rank: number;
  permissions: string[];
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  domain?: string;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: number;
  organization_id: number;
  name: string;
  code?: string;
  description?: string;
  manager_id?: number;
  created_at: string;
}

export interface Team {
  id: number;
  organization_id: number;
  department_id?: number;
  name: string;
  description?: string;
  members_count: number;
  created_at: string;
}

export interface Workspace {
  id: number;
  organization_id: number;
  name: string;
  slug: string;
  description?: string;
  is_private: boolean;
  projects_count: number;
  created_at: string;
}

export interface Project {
  id: number;
  organization_id: number;
  workspace_id: number;
  name: string;
  key: string;
  description?: string;
  status: string;
  priority: string;
  owner_id?: number;
  start_date?: string;
  target_date?: string;
  tasks_count: number;
  completed_tasks_count: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  organization_id: number;
  project_id: number;
  parent_id?: number;
  task_number: number;
  project_key?: string;
  key: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee_id?: number;
  assignee_name?: string;
  reporter_name?: string;
  due_date?: string;
  estimated_hours: number;
  actual_hours: number;
  labels?: string;
  story_points?: number;
  sprint_id?: number;
  epic_id?: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export interface TaskTimeLog {
  id: number;
  task_id: number;
  user_id: number;
  user_name: string;
  hours_spent: number;
  description?: string;
  logged_at: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  open_tasks: number;
  urgent_tasks: number;
  total_team_members: number;
  hours_logged: number;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  rank: number;
  is_system: boolean;
  permissions: {
    id: number;
    name: string;
    resource: string;
    action: string;
  }[];
}

// --- Phase 2: Agile ---
export interface Sprint {
  id: number;
  organization_id: number;
  project_id: number;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
  velocity_points: number;
  tasks_count: number;
  completed_points: number;
  created_at: string;
}

export interface Epic {
  id: number;
  organization_id: number;
  project_id: number;
  name: string;
  key: string;
  description?: string;
  status: string;
  priority: string;
  color: string;
  created_at: string;
}

export interface Milestone {
  id: number;
  organization_id: number;
  project_id: number;
  title: string;
  description?: string;
  due_date: string;
  status: string;
  created_at: string;
}

// --- Phase 3: Engineering ---
export interface Repository {
  id: number;
  organization_id: number;
  project_id?: number;
  name: string;
  full_name: string;
  provider: string;
  url: string;
  default_branch: string;
  is_connected: boolean;
  created_at: string;
}

export interface PullRequest {
  id: number;
  organization_id: number;
  repository_id: number;
  pr_number: number;
  title: string;
  state: string;
  source_branch: string;
  target_branch: string;
  author: string;
  linked_task_id?: number;
  url?: string;
  created_at: string;
}

export interface CommitItem {
  id: number;
  organization_id: number;
  repository_id: number;
  commit_hash: string;
  message: string;
  author: string;
  branch: string;
  linked_task_id?: number;
  committed_at: string;
}

export interface BuildRun {
  id: number;
  organization_id: number;
  repository_id: number;
  build_number: number;
  status: 'success' | 'failed' | 'running' | 'queued';
  branch: string;
  commit_hash: string;
  duration_seconds: number;
  logs_url?: string;
  created_at: string;
}

export interface ReleaseItem {
  id: number;
  organization_id: number;
  project_id?: number;
  name: string;
  tag_name: string;
  environment: string;
  status: string;
  changelog?: string;
  created_at: string;
}

// --- Phase 4: QA ---
export interface TestSuite {
  id: number;
  organization_id: number;
  project_id: number;
  name: string;
  description?: string;
  category: string;
  cases_count: number;
  created_at: string;
}

export interface TestCase {
  id: number;
  organization_id: number;
  suite_id: number;
  test_number: number;
  title: string;
  description?: string;
  preconditions?: string;
  steps: string;
  expected_result: string;
  priority: string;
  execution_type: string;
  last_status?: string;
  created_at: string;
}

export interface TestExecutionItem {
  id: number;
  organization_id: number;
  test_case_id: number;
  executed_by_id?: number;
  executed_by_name?: string;
  status: 'pass' | 'fail' | 'blocked' | 'skipped';
  notes?: string;
  evidence_url?: string;
  executed_at: string;
}

export interface DefectItem {
  id: number;
  organization_id: number;
  project_id: number;
  test_case_id?: number;
  defect_number: number;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_investigation' | 'resolved' | 'closed';
  assignee_id?: number;
  assignee_name?: string;
  reporter_name?: string;
  created_at: string;
}

// --- Phase 5: DevOps & ITSM ---
export interface ServiceItem {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  tier: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime_percentage: number;
  owner_team_id?: number;
  owner_team_name?: string;
  created_at: string;
}

export interface IncidentItem {
  id: number;
  organization_id: number;
  service_id?: number;
  service_name?: string;
  incident_number: number;
  title: string;
  description: string;
  severity: string;
  priority: string;
  status: 'open' | 'investigating' | 'mitigated' | 'resolved' | 'closed';
  assignee_id?: number;
  assignee_name?: string;
  reporter_name?: string;
  sla_breached: boolean;
  response_due_at?: string;
  resolution_due_at?: string;
  resolved_at?: string;
  created_at: string;
}

export interface ChangeRequestItem {
  id: number;
  organization_id: number;
  service_id?: number;
  service_name?: string;
  change_number: number;
  title: string;
  reason: string;
  risk_level: string;
  status: string;
  scheduled_start?: string;
  scheduled_end?: string;
  requested_by_name?: string;
  created_at: string;
}

export interface KnowledgeArticle {
  id: number;
  organization_id: number;
  category: string;
  title: string;
  content: string;
  author_name?: string;
  is_published: boolean;
  views_count: number;
  created_at: string;
}

// --- Phase 6: Workflow Automation ---
export interface WorkflowStep {
  id: number;
  workflow_id: number;
  step_order: number;
  title: string;
  step_type: string;
  config_json?: string;
}

export interface WorkflowDefinition {
  id: number;
  organization_id: number;
  name: string;
  description?: string;
  department: string;
  trigger_type: string;
  is_active: boolean;
  steps: WorkflowStep[];
  created_at: string;
}

export interface WorkflowApproval {
  id: number;
  execution_id: number;
  approver_id: number;
  approver_name?: string;
  step_order: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  decided_at?: string;
}

export interface WorkflowExecution {
  id: number;
  organization_id: number;
  workflow_id: number;
  workflow_name?: string;
  initiated_by_name?: string;
  status: 'running' | 'approved' | 'rejected' | 'completed' | 'failed';
  current_step_order: number;
  payload_json?: string;
  approvals: WorkflowApproval[];
  created_at: string;
}

// --- Operations (HR, Finance, Marketing, Sales) ---
export interface Employee {
  id: number;
  organization_id: number;
  user_id: number;
  full_name?: string;
  email?: string;
  department_name?: string;
  employee_code: string;
  job_title: string;
  hire_date: string;
  status: string;
  created_at: string;
}

export interface LeaveRequest {
  id: number;
  organization_id: number;
  employee_id: number;
  employee_name?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  created_at: string;
}

export interface ExpenseRequest {
  id: number;
  organization_id: number;
  user_id: number;
  user_name?: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  notes?: string;
  created_at: string;
}

export interface PurchaseRequest {
  id: number;
  organization_id: number;
  user_id: number;
  user_name?: string;
  title: string;
  vendor: string;
  estimated_cost: number;
  justification: string;
  status: string;
  created_at: string;
}

export interface MarketingCampaign {
  id: number;
  organization_id: number;
  name: string;
  channel: string;
  budget: number;
  spent: number;
  leads_generated: number;
  status: string;
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface SalesLead {
  id: number;
  organization_id: number;
  company_name: string;
  contact_name: string;
  contact_email: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  deal_value: number;
  owner_id?: number;
  owner_name?: string;
  created_at: string;
}

// --- Phase 7: AI Operating Layer ---
export interface AITaskSuggestion {
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimated_hours: number;
  labels: string;
}

export interface AIRiskItem {
  category: string;
  risk: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface AICommandResponse {
  action: string;
  summary: string;
  suggested_tasks?: AITaskSuggestion[];
  identified_risks?: AIRiskItem[];
  suggested_tests?: string[];
  tokens_consumed: number;
}

export interface AIUsageLog {
  id: number;
  capability: string;
  prompt: string;
  response_summary: string;
  tokens_used: number;
  created_at: string;
}

// --- Phase 8: Executive Portfolio Intelligence ---
export interface ExecutiveKPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  status: 'positive' | 'warning' | 'critical' | 'info';
}

export interface VelocityPoint {
  sprint: string;
  committed: number;
  completed: number;
}

export interface DefectTrendPoint {
  month: string;
  discovered: number;
  resolved: number;
}

export interface RevenueBudgetPoint {
  month: string;
  budget: number;
  actual_spent: number;
}

export interface ExecutivePortfolioSummary {
  active_projects_count: number;
  total_headcount: number;
  open_incidents_count: number;
  sla_compliance_rate: number;
  qa_pass_rate: number;
  pending_approvals_count: number;
  kpis: ExecutiveKPI[];
  velocity_chart: VelocityPoint[];
  defect_trend: DefectTrendPoint[];
  financial_overview: RevenueBudgetPoint[];
}
