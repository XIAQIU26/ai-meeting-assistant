import type { AnalyticsData, Meeting, PreparationData, Project, ResearchInsight, TaskStatus } from '../types';
import { getCurrentUser } from './authContext';
import {
  createMeeting as localCreateMeeting,
  createProject as localCreateProject,
  deleteMeeting as localDeleteMeeting,
  deleteProject as localDeleteProject,
  getMeetingById as localGetMeetingById,
  getMeetings as localGetMeetings,
  getProjectById as localGetProjectById,
  getProjects as localGetProjects,
  updateMeeting as localUpdateMeeting,
  updateProject as localUpdateProject,
  updateTaskStatus as localUpdateTaskStatus
} from './localDb';
import * as supabaseDb from './supabaseDb';
import { answerResearchQuestion, buildAnalytics, buildPreparation, buildResearchInsight } from './localAi';
import { parseMeetingLocally } from './localParser';

function useRemote(): boolean {
  return !!getCurrentUser();
}

// 当远程 Supabase 调用失败时，回退到本地数据库，避免按钮无响应/数据丢失
let remoteFailed = false;

async function callDb<T>(localFn: () => T | Promise<T>, remoteFn: () => T | Promise<T>): Promise<T> {
  if (useRemote() && !remoteFailed) {
    try {
      const result = await remoteFn();
      return result;
    } catch (err) {
      console.warn('Remote API failed, falling back to local:', err instanceof Error ? err.message : 'unknown');
      remoteFailed = true;
      return localFn();
    }
  }
  return localFn();
}

export function fetchProjects(): Promise<Project[]> {
  return callDb(localGetProjects, () => supabaseDb.getProjects());
}

export function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  return callDb(
    () => localCreateProject(project),
    () => supabaseDb.createProject(project)
  );
}

export function fetchMeetings(projectId: string, search = ''): Promise<Meeting[]> {
  return callDb(
    () => localGetMeetings(search, projectId),
    () => supabaseDb.getMeetings(search, projectId)
  );
}

export function fetchMeeting(id: string): Promise<Meeting> {
  return callDb(
    () => {
      const m = localGetMeetingById(id);
      if (!m) throw new Error('Meeting not found');
      return m;
    },
    async () => {
      const m = await supabaseDb.getMeetingById(id);
      if (!m) throw new Error('Meeting not found');
      return m;
    }
  );
}

export function parseMeeting(text: string, projectId: string): Promise<Omit<Meeting, 'id'>> {
  const project = useRemote() ? null : localGetProjectById(projectId);
  return Promise.resolve(parseMeetingLocally(text, project?.researchTopic));
}

export function saveMeeting(meeting: Omit<Meeting, 'id'>, projectId: string): Promise<Meeting> {
  return callDb(
    () => localCreateMeeting({ ...meeting, projectId }),
    () => supabaseDb.createMeeting({ ...meeting, projectId })
  );
}

export function updateMeeting(id: string, data: Partial<Omit<Meeting, 'id'>>): Promise<Meeting> {
  return callDb(
    () => {
      const updated = localUpdateMeeting(id, data);
      if (!updated) throw new Error('Meeting not found');
      return updated;
    },
    async () => {
      const updated = await supabaseDb.updateMeeting(id, data);
      if (!updated) throw new Error('Meeting not found');
      return updated;
    }
  );
}

export function deleteMeeting(id: string): Promise<{ message: string }> {
  return callDb(
    () => {
      const ok = localDeleteMeeting(id);
      if (!ok) throw new Error('Meeting not found');
      return { message: 'deleted' };
    },
    async () => {
      const ok = await supabaseDb.deleteMeeting(id);
      if (!ok) throw new Error('Meeting not found');
      return { message: 'deleted' };
    }
  );
}

export function askAssistant(question: string, projectId: string): Promise<{ answer: string; contextSize: number }> {
  return callDb(
    () => {
      const meetings = localGetMeetings('', projectId);
      const project = localGetProjectById(projectId);
      const answer = answerResearchQuestion(question, meetings, project);
      return { answer, contextSize: meetings.length };
    },
    async () => {
      const meetings = await supabaseDb.getMeetings('', projectId);
      const project = await supabaseDb.getProjectById(projectId);
      const answer = answerResearchQuestion(question, meetings, project);
      return { answer, contextSize: meetings.length };
    }
  );
}

export function fetchAnalytics(projectId: string): Promise<AnalyticsData> {
  return callDb(
    () => {
      const meetings = localGetMeetings('', projectId);
      const project = localGetProjectById(projectId);
      return buildAnalytics(meetings, project);
    },
    async () => {
      const meetings = await supabaseDb.getMeetings('', projectId);
      const project = await supabaseDb.getProjectById(projectId);
      return buildAnalytics(meetings, project);
    }
  );
}

export function fetchPreparation(projectId: string): Promise<PreparationData> {
  return callDb(
    () => {
      const meetings = localGetMeetings('', projectId);
      const project = localGetProjectById(projectId);
      return buildPreparation(meetings, project);
    },
    async () => {
      const meetings = await supabaseDb.getMeetings('', projectId);
      const project = await supabaseDb.getProjectById(projectId);
      return buildPreparation(meetings, project);
    }
  );
}

export function fetchInsight(projectId: string): Promise<ResearchInsight> {
  return callDb(
    () => {
      const meetings = localGetMeetings('', projectId);
      const project = localGetProjectById(projectId);
      return buildResearchInsight(meetings, project);
    },
    async () => {
      const meetings = await supabaseDb.getMeetings('', projectId);
      const project = await supabaseDb.getProjectById(projectId);
      return buildResearchInsight(meetings, project);
    }
  );
}

export function updateTaskStatus(id: string, status: TaskStatus): Promise<unknown> {
  return callDb(
    () => {
      const task = localUpdateTaskStatus(id, status);
      if (!task) throw new Error('Task not found');
      return task;
    },
    async () => {
      const task = await supabaseDb.updateTaskStatus(id, status);
      if (!task) throw new Error('Task not found');
      return task;
    }
  );
}

export function updateProject(id: string, name: string): Promise<Project> {
  return callDb(
    () => {
      const updated = localUpdateProject(id, name);
      if (!updated) throw new Error('Project not found');
      return updated;
    },
    async () => {
      const updated = await supabaseDb.updateProject(id, name);
      if (!updated) throw new Error('Project not found');
      return updated;
    }
  );
}

export function deleteProject(id: string): Promise<{ message: string }> {
  return callDb(
    () => {
      const ok = localDeleteProject(id);
      if (!ok) throw new Error('Project not found');
      return { message: 'deleted' };
    },
    async () => {
      const ok = await supabaseDb.deleteProject(id);
      if (!ok) throw new Error('Project not found');
      return { message: 'deleted' };
    }
  );
}