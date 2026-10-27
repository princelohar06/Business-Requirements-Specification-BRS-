import axios from 'axios';
import {
  AICommandResponse,
  AIUsageLog,
  AuditLog,
  AuthResponse,
  BuildRun,
  ChangeRequestItem,
  CommitItem,
  DashboardStats,
  DefectItem,
  Department,
  Employee,
  Epic,
  ExpenseRequest,
  IncidentItem,
  KnowledgeArticle,
  LeaveRequest,
  MarketingCampaign,
  Milestone,
  NotificationItem,
  Organization,
  Project,
  PullRequest,
  PurchaseRequest,
  ReleaseItem,
  Repository,
  Role,
  SalesLead,
  ServiceItem,
  Sprint,
  Task,
  TaskComment,
  TestCase,
  TestExecutionItem,
  TestSuite,
  TaskTimeLog,
  Team,
  UserProfile,
  WorkflowDefinition,
  WorkflowExecution,
  Workspace,
  ExecutivePortfolioSummary,
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<AuthResponse>('/api/v1/auth/refresh', {
          refresh_token: refreshToken,
        });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        api.defaults.headers.common.Authorization = `Bearer ${data.access_token}`;
        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// --- Phase 1: Core APIs ---
export const authApi = {
  login: (data: any) => api.post<AuthResponse>('/auth/login', data),
  register: (data: any) => api.post<AuthResponse>('/auth/register', data),
  logout: (refresh_token: string) => api.post('/auth/logout', { refresh_token }),
  getMe: () => api.get<UserProfile>('/auth/me'),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

export const orgApi = {
  getOrg: () => api.get<Organization>('/organizations/me'),
  updateOrg: (data: any) => api.put<Organization>('/organizations/me', data),
  getDepartments: () => api.get<Department[]>('/organizations/departments'),
  createDepartment: (data: any) => api.post<Department>('/organizations/departments', data),
  getTeams: () => api.get<Team[]>('/organizations/teams'),
  createTeam: (data: any) => api.post<Team>('/organizations/teams', data),
  getWorkspaces: () => api.get<Workspace[]>('/organizations/workspaces'),
  createWorkspace: (data: any) => api.post<Workspace>('/organizations/workspaces', data),
};

export const userApi = {
  getUsers: () => api.get<UserProfile[]>('/users/'),
  createUser: (data: any) => api.post<UserProfile>('/users/', data),
  updateUser: (id: number, data: any) => api.put<UserProfile>(`/users/${id}`, data),
  getRoles: () => api.get<Role[]>('/users/roles'),
  getAuditLogs: (limit = 50) => api.get<AuditLog[]>(`/users/audit-logs?limit=${limit}`),
};

export const projectApi = {
  getStats: () => api.get<DashboardStats>('/projects/stats/summary'),
  getProjects: (workspaceId?: number) =>
    api.get<Project[]>(`/projects/${workspaceId ? `?workspace_id=${workspaceId}` : ''}`),
  getProject: (id: number) => api.get<Project>(`/projects/${id}`),
  createProject: (data: any) => api.post<Project>('/projects/', data),
  updateProject: (id: number, data: any) => api.put<Project>(`/projects/${id}`, data),
  deleteProject: (id: number) => api.delete(`/projects/${id}`),
};

export const taskApi = {
  getTasks: (params?: { projectId?: number; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.projectId) q.append('project_id', String(params.projectId));
    if (params?.status) q.append('status', params.status);
    if (params?.search) q.append('search', params.search);
    return api.get<Task[]>(`/tasks/?${q.toString()}`);
  },
  getTask: (id: number) => api.get<Task>(`/tasks/${id}`),
  createTask: (data: any) => api.post<Task>('/tasks/', data),
  updateTask: (id: number, data: any) => api.put<Task>(`/tasks/${id}`, data),
  deleteTask: (id: number) => api.delete(`/tasks/${id}`),
  getComments: (taskId: number) => api.get<TaskComment[]>(`/tasks/${taskId}/comments`),
  addComment: (taskId: number, content: string) => api.post<TaskComment>(`/tasks/${taskId}/comments`, { content }),
  getTimeLogs: (taskId: number) => api.get<TaskTimeLog[]>(`/tasks/${taskId}/time-logs`),
  logTime: (taskId: number, data: any) => api.post<TaskTimeLog>(`/tasks/${taskId}/time-logs`, data),
};

export const notificationApi = {
  getNotifications: (unreadOnly = false) =>
    api.get<NotificationItem[]>(`/notifications/?unread_only=${unreadOnly}`),
  getUnreadCount: () => api.get<{ unread_count: number }>('/notifications/unread-count'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// --- Phase 2: Agile APIs ---
export const agileApi = {
  getSprints: (projectId?: number) =>
    api.get<Sprint[]>(`/agile/sprints${projectId ? `?project_id=${projectId}` : ''}`),
  createSprint: (data: any) => api.post<Sprint>('/agile/sprints', data),
  updateSprint: (id: number, data: any) => api.put<Sprint>(`/agile/sprints/${id}`, data),
  getEpics: (projectId?: number) =>
    api.get<Epic[]>(`/agile/epics${projectId ? `?project_id=${projectId}` : ''}`),
  createEpic: (data: any) => api.post<Epic>('/agile/epics', data),
  getMilestones: (projectId?: number) =>
    api.get<Milestone[]>(`/agile/milestones${projectId ? `?project_id=${projectId}` : ''}`),
  createMilestone: (data: any) => api.post<Milestone>('/agile/milestones', data),
};

// --- Phase 3: Engineering APIs ---
export const engineeringApi = {
  getRepositories: () => api.get<Repository[]>('/engineering/repositories'),
  createRepository: (data: any) => api.post<Repository>('/engineering/repositories', data),
  getPullRequests: (repoId?: number) =>
    api.get<PullRequest[]>(`/engineering/pull-requests${repoId ? `?repository_id=${repoId}` : ''}`),
  createPullRequest: (data: any) => api.post<PullRequest>('/engineering/pull-requests', data),
  getCommits: (repoId?: number) =>
    api.get<CommitItem[]>(`/engineering/commits${repoId ? `?repository_id=${repoId}` : ''}`),
  getBuilds: (repoId?: number) =>
    api.get<BuildRun[]>(`/engineering/builds${repoId ? `?repository_id=${repoId}` : ''}`),
  triggerBuild: (repoId: number) => api.post<BuildRun>(`/engineering/builds/trigger/${repoId}`),
  getReleases: (projectId?: number) =>
    api.get<ReleaseItem[]>(`/engineering/releases${projectId ? `?project_id=${projectId}` : ''}`),
  createRelease: (data: any) => api.post<ReleaseItem>('/engineering/releases', data),
};

// --- Phase 4: QA APIs ---
export const qaApi = {
  getSuites: (projectId?: number) =>
    api.get<TestSuite[]>(`/qa/suites${projectId ? `?project_id=${projectId}` : ''}`),
  createSuite: (data: any) => api.post<TestSuite>('/qa/suites', data),
  getCases: (suiteId?: number) =>
    api.get<TestCase[]>(`/qa/cases${suiteId ? `?suite_id=${suiteId}` : ''}`),
  createCase: (data: any) => api.post<TestCase>('/qa/cases', data),
  recordExecution: (data: any) => api.post<TestExecutionItem>('/qa/executions', data),
  getDefects: (params?: { projectId?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.projectId) q.append('project_id', String(params.projectId));
    if (params?.status) q.append('status', params.status);
    return api.get<DefectItem[]>(`/qa/defects?${q.toString()}`);
  },
  createDefect: (data: any) => api.post<DefectItem>('/qa/defects', data),
  updateDefect: (id: number, data: any) => api.put<DefectItem>(`/qa/defects/${id}`, data),
};

// --- Phase 5: DevOps & ITSM APIs ---
export const itsmApi = {
  getServices: () => api.get<ServiceItem[]>('/itsm/services'),
  createService: (data: any) => api.post<ServiceItem>('/itsm/services', data),
  getIncidents: (params?: { serviceId?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.serviceId) q.append('service_id', String(params.serviceId));
    if (params?.status) q.append('status', params.status);
    return api.get<IncidentItem[]>(`/itsm/incidents?${q.toString()}`);
  },
  createIncident: (data: any) => api.post<IncidentItem>('/itsm/incidents', data),
  updateIncident: (id: number, data: any) => api.put<IncidentItem>(`/itsm/incidents/${id}`, data),
  getChanges: () => api.get<ChangeRequestItem[]>('/itsm/changes'),
  createChange: (data: any) => api.post<ChangeRequestItem>('/itsm/changes', data),
  getKnowledge: (category?: string) =>
    api.get<KnowledgeArticle[]>(`/itsm/knowledge${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  createKnowledge: (data: any) => api.post<KnowledgeArticle>('/itsm/knowledge', data),
};

// --- Phase 6: Workflow Automation APIs ---
export const workflowApi = {
  getDefinitions: () => api.get<WorkflowDefinition[]>('/workflows/definitions'),
  createDefinition: (data: any) => api.post<WorkflowDefinition>('/workflows/definitions', data),
  getExecutions: (workflowId?: number) =>
    api.get<WorkflowExecution[]>(`/workflows/executions${workflowId ? `?workflow_id=${workflowId}` : ''}`),
  startExecution: (workflowId: number, payload?: any) =>
    api.post<WorkflowExecution>('/workflows/executions/start', { workflow_id: workflowId, payload }),
  decideApproval: (approvalId: number, status: 'approved' | 'rejected', comments?: string) =>
    api.post('/workflows/approvals/decide', { approval_id: approvalId, status, comments }),
};

// --- Operations APIs (HR, Finance, Marketing, Sales) ---
export const operationsApi = {
  // HR
  getEmployees: () => api.get<Employee[]>('/operations/hr/employees'),
  createEmployee: (data: any) => api.post<Employee>('/operations/hr/employees', data),
  getLeaves: () => api.get<LeaveRequest[]>('/operations/hr/leaves'),
  submitLeave: (data: any) => api.post<LeaveRequest>('/operations/hr/leaves', data),
  updateLeaveStatus: (id: number, status: string) => api.put(`/operations/hr/leaves/${id}/status?status=${status}`),
  // Finance
  getExpenses: () => api.get<ExpenseRequest[]>('/operations/finance/expenses'),
  submitExpense: (data: any) => api.post<ExpenseRequest>('/operations/finance/expenses', data),
  getPurchases: () => api.get<PurchaseRequest[]>('/operations/finance/purchases'),
  createPurchase: (data: any) => api.post<PurchaseRequest>('/operations/finance/purchases', data),
  // Marketing
  getCampaigns: () => api.get<MarketingCampaign[]>('/operations/marketing/campaigns'),
  createCampaign: (data: any) => api.post<MarketingCampaign>('/operations/marketing/campaigns', data),
  // Sales
  getLeads: () => api.get<SalesLead[]>('/operations/sales/leads'),
  createLead: (data: any) => api.post<SalesLead>('/operations/sales/leads', data),
};

// --- Phase 7: AI APIs ---
export const aiApi = {
  executeCommand: (action: string, prompt: string, context: any = {}) =>
    api.post<AICommandResponse>('/ai/command', { action, prompt, context }),
  getLogs: () => api.get<AIUsageLog[]>('/ai/logs'),
};

// --- Phase 8: Executive Portfolio Intelligence APIs ---
export const intelligenceApi = {
  getPortfolioSummary: () => api.get<ExecutivePortfolioSummary>('/intelligence/portfolio-summary'),
};

export default api;
