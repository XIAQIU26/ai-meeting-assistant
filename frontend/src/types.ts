export type TaskStatus = 'pending' | 'done';

export interface Task {
  id?: string;
  meetingId?: string;
  content?: string;
  task?: string;
  owner: string;
  deadline: string;
  collaborator: string;
  status: TaskStatus;
}

export interface Project {
  id: string;
  name: string;
  researchTopic: string;
  type: string;
  stage: string;
}

export interface Meeting {
  id: string;
  projectId: string;
  date: string;
  meetingDate?: string;
  topic: string;
  presentation: string;
  advisorFeedback: string;
  suggestions: string[];
  tasks: Task[];
  nextMeetingDate: string;
  createdAt?: string;
}

export interface ResearchInsight {
  currentStage: string;
  statusJudgement: string;
  longTermConcerns: Array<{ name: string; count: number; priority: string; reason: string; evidence: string[] }>;
  repeatedIssues: Array<{ name: string; count: number; priority: string; reason: string; evidence: string[] }>;
  risks: string[];
  nextActions: string[];
  directionChange: string;
  confidence: string;
}

export interface AnalyticsData {
  keywords: Array<{ name: string; count: number }>;
  trend: Array<{ date: string; topic: string; focus: string[] }>;
  progress: string[];
  pendingTasks: Task[];
  insight: ResearchInsight;
}

export interface PreparationData {
  nextMeetingDate: string;
  unresolved: string[];
  reportSuggestions: string[];
  possibleQuestions: string[];
}
