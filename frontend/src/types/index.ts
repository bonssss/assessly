export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  enrolledDepartmentIds: string[];
  trialQuotaLimit: number;
  trialUsedCount: number;
  createdAt: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  questionCount: number;
  resourceCount: number;
  color: string;
  icon: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  departmentId: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  body: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  status: 'Draft' | 'Published' | 'Archived';
  version: number;
  createdAt: string;
}

export interface LearningResource {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  accessLevel: 'free' | 'paid';
  downloadCount: number;
  uploadedAt: string;
}

export interface Exam {
  id: string;
  departmentId: string;
  title: string;
  durationMinutes: number;
  instructions: string;
  feedbackPolicy: 'immediate' | 'after_submission';
  questionIds: string[];
  status: 'active' | 'draft' | 'archived';
  totalMarks: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  departmentId: string;
  departmentName: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds: number;
  score: number;
  totalMarks: number;
  percentage: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  userAnswers: Record<string, string>; // questionId -> selectedOptionId
}

export interface PackagePlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  scope: 'single_department' | 'all_departments';
  durationDays: number;
  questionLimit: 'unlimited' | number;
  description: string;
  popular?: boolean;
}

export type PaymentChannel = 'Telebirr' | 'Commercial Bank of Ethiopia (CBE)' | 'Awash Bank';
export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PaymentSubmission {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  packageId: string;
  packageName: string;
  departmentId?: string;
  amount: number;
  currency: string;
  channel: PaymentChannel;
  transactionRef: string;
  receiptUrl: string;
  receiptFileName: string;
  submittedAt: string;
  status: PaymentStatus;
  decisionNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  isSuspectedDuplicate?: boolean;
}

export interface Entitlement {
  id: string;
  userId: string;
  departmentId: string | 'all';
  packageId: string;
  packageName: string;
  startsAt: string;
  expiresAt: string;
  remainingCredits: 'unlimited' | number;
  status: 'active' | 'expired' | 'revoked';
  sourcePaymentId: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'Payment' | 'Question' | 'Department' | 'User' | 'Entitlement' | 'Exam';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface PaymentSetting {
  id: string;
  method: PaymentChannel;
  accountHolder: string;
  accountNumber: string;
  instructions: string;
  active: boolean;
}
