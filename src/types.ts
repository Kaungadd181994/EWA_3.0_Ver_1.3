export type CompanyType = 'Corporate' | 'SME';

export interface Company {
  id: number;
  name: string;
  type: CompanyType;
  dica: string;
  industry: string;
  contact: string;
  tier: 'A' | 'B' | 'C' | 'D' | 'E';
  budget: number;
  utilized: number;
  status: 'Active' | 'Inactive' | 'Frozen' | 'Onboarding';
  branchesCount: number;
}

export interface Employee {
  id: number;
  code: string;
  name: string;
  phone: string;
  nrc: string;
  dept: string;
  position: string;
  branch: string;
  salary: number;
  joinDate: string;
  trusted: boolean;
  status: 'Active' | 'Unverified' | 'Frozen' | 'Suspended' | 'Terminated';
  companyId: number;
}

export interface User {
  id: number;
  code?: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin HR' | 'Branch HR' | 'Finance' | 'Viewer';
  branches: string[]; // ['All'] or specific branch names
  status: 'Active' | 'Inactive' | 'Invited';
  lastLogin: string;
  permissions?: string[];
}

export interface FeeTier {
  min: number;
  max: number;
  rate: number; // For tiered fee computation
}

export interface FeeConfig {
  model: 'flat' | 'percentage' | 'tiered';
  flatFee: number;
  percentage: number;
  tiers: FeeTier[];
  minAmount: number;
  maxAmount: number;
  maxPercentSalary: number;
  applyStartDay: number;
  applyEndDay: number;
  freezeDay: number;
  maxMonthlyRequests: number;
  payer: 'employee' | 'corporate';
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'dropdown' | 'radio' | 'checkbox' | 'file' | 'nrc' | 'selfie';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for dropdown or radio
  validationRegex?: string;
}

export interface FormSchema {
  id: number;
  name: string;
  target: 'all' | 'corporate' | 'sme' | string; // target scope
  fields: FormField[];
  published: boolean;
  version: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  debitAmount: number;
  creditAccount: string;
  creditAmount: number;
  reference: string;
  companyId?: number;
  employeeId?: number;
}

export interface GLAccount {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Equity';
  openingBalance: number;
}

export interface OnboardingStep {
  name: string;
  status: 'completed' | 'current' | 'pending' | 'failed';
  description: string;
  date?: string;
}

export interface CompanyOnboarding {
  id: number;
  companyName: string;
  type: CompanyType;
  dica: string;
  contact: string;
  currentStep: number; // 0 to 5 for Corporate, 0 to 2 for SME
  steps: OnboardingStep[];
  submittedData: Record<string, any>;
  riskScore?: number;
  assignedTier?: 'A' | 'B' | 'C' | 'D' | 'E';
  approvedBudget?: number;
  signatoryName?: string;
  signatoryEmail?: string;
}

export interface SettlementRequest {
  id: number;
  companyId: number;
  companyName: string;
  amount: number;
  reference: string;
  proofUrl?: string; // Simulated base64 or URL
  status: 'Pending' | 'Maker Approved' | 'Approved' | 'Rejected';
  submittedAt: string;
  verifiedAt?: string;
  approvedAt?: string;
}

export interface DisbursementFeedItem {
  id: string;
  employeeName: string;
  companyName: string;
  amount: number;
  fee: number;
  netAmount: number;
  channel: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Processing';
  timestamp: string;
  reference: string;
}

export interface QRProcessingRequest {
  id: number;
  employeeName: string;
  employeeCode: string;
  companyName: string;
  amount: number;
  qrCodeUrl: string;
  status: 'Pending' | 'Completed' | 'Rejected';
  uploadedAt: string;
  processedAt?: string;
}

// --- Notification Center Types ---
export type NotificationChannel = 'sms' | 'email' | 'push';

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject?: string;
  content: string; // supports {{name}}, {{amount}}, {{fee}}, {{company}}, {{reference}}
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  recipientName: string;
  recipientContact: string; // phone, email, or user token
  channel: NotificationChannel;
  subject?: string;
  content: string;
  status: 'Sent' | 'Failed' | 'Scheduled';
  scheduledTime?: string;
  createdAt: string;
}

// --- DMN Validation Rules Types ---
export type DMNInputField = 'amount' | 'salary_percentage' | 'monthly_count' | 'utilization_percent' | 'nrc_verified' | 'payroll_frozen';
export type DMNOperator = '>' | '<' | '==' | '!=' | 'matches' | 'contains';
export type DMNAction = 'ALLOW' | 'BLOCK' | 'CHECKER_REQUIRED';

export interface ValidationRule {
  id: string;
  name: string;
  inputField: DMNInputField;
  operator: DMNOperator;
  value: string;
  action: DMNAction;
  errorMessage: string;
  enabled: boolean;
  priority: number;
}
