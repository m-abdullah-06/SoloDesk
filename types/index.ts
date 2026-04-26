export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  tagline: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  whatsapp: string | null;
  platform: "upwork" | "fiverr" | "local" | "direct" | "other";
  country: string | null;
  timezone: string | null;
  tags: ClientTag[];
  notes: string | null;
  total_earned: number;
  created_at: string;
};

export type ClientTag = "active" | "repeat" | "vip" | "difficult" | "prospect";

export type ProjectStatus =
  | "inquiry"
  | "proposal_sent"
  | "negotiating"
  | "active"
  | "in_review"
  | "completed"
  | "archived";

export type PaymentStatus = "unpaid" | "partial" | "paid";

export type Project = {
  id: string;
  user_id: string;
  client_id: string;
  client?: Client;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  currency: "PKR" | "USD" | "GBP";
  payment_status: PaymentStatus;
  start_date: string | null;
  deadline: string | null;
  portal_token: string;
  portal_enabled: boolean;
  scope_log: string | null;
  internal_notes: string | null;
  milestones?: Milestone[];
  created_at: string;
};

export type MilestoneStatus = "pending" | "in_progress" | "done" | "approved";

export type Milestone = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: MilestoneStatus;
  sort_order: number;
  created_at: string;
};

export type ProjectUpdate = {
  id: string;
  project_id: string;
  message: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
};

export type ClientMessage = {
  id: string;
  project_id: string;
  client_name: string;
  client_email: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type InvoiceStatus = "draft" | "sent" | "partial" | "paid" | "overdue";

export type Invoice = {
  id: string;
  user_id: string;
  client_id: string;
  client?: Client;
  project_id: string | null;
  project?: Project;
  invoice_number: string;
  status: InvoiceStatus;
  currency: "PKR" | "USD" | "GBP";
  total: number;
  amount_paid: number;
  issue_date: string;
  due_date: string;
  notes: string | null;
  payment_instructions: string | null;
  items?: InvoiceItem[];
  created_at: string;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  total: number;
};

export type ProposalStatus = "draft" | "sent" | "accepted" | "declined" | "changes_requested";

export type Proposal = {
  id: string;
  user_id: string;
  client_id: string;
  client?: Client;
  title: string;
  overview: string | null;
  status: ProposalStatus;
  scope_items: ProposalScopeItem[];
  timeline_items: ProposalTimelineItem[];
  pricing_items: ProposalPricingItem[];
  total_amount: number;
  currency: "PKR" | "USD" | "GBP";
  terms: string | null;
  valid_until: string | null;
  portal_token: string;
  created_at: string;
};

export type ProposalScopeItem = {
  id: string;
  title: string;
  description: string;
};

export type ProposalTimelineItem = {
  id: string;
  milestone: string;
  duration: string;
};

export type ProposalPricingItem = {
  id: string;
  description: string;
  amount: number;
};

export type AIScenario =
  | "late_payment"
  | "scope_creep"
  | "project_delivery"
  | "revision_limit"
  | "rate_increase"
  | "project_delay"
  | "client_ghosting"
  | "contract_reminder"
  | "milestone_approval"
  | "project_completion";

export type AITone = "professional" | "firm" | "friendly" | "urgent";
export type AILanguage = "english" | "urdu" | "both";

export type AIMessage = {
  id: string;
  user_id: string;
  scenario: AIScenario;
  tone: AITone;
  language: AILanguage;
  input: string;
  output: string;
  subject: string | null;
  client_id: string | null;
  project_id: string | null;
  created_at: string;
};

export type DashboardStats = {
  active_projects: number;
  total_clients: number;
  monthly_earnings: number;
  overdue_milestones: number;
  unread_messages: number;
  currency: "PKR" | "USD" | "GBP";
};
