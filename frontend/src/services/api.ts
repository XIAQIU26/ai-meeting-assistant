import type { AnalyticsData, Meeting, PreparationData, Project, ResearchInsight, TaskStatus } from '../types';
import {
  createMeeting as localCreateMeeting,
  createProject as localCreateProject,
  deleteMeeting as localDeleteMeeting,
  deleteProject as localDeleteProject,
  getMeetingById,
  getMeetings,
  getProjectById,
  getProjects,
  updateMeeting as localUpdateMeeting,
  updateProject as localUpdateProject,
  updateTaskStatus as localUpdateTaskStatus
} from './localDb';
import { answerResearchQuestion, buildAnalytics, buildPreparation, buildResearchInsight } from './localAi';
import { parseMeetingLocally } from './localParser';

// 纯前端实现：所有数据存浏览器 localStorage，无需后端。
// 函数签名保持返回 Promise，兼容现有页面组件的 .then() 调用。

export function fetchProjects(): Promise<Project[]> {
  return Promise.resolve(getProjects());
}

export function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  return Promise.resolve(localCreateProject(project));
}

export function fetchMeetings(projectId: string, search = ''): Promise<Meeting[]> {
  return Promise.resolve(getMeetings(search, projectId));
}

export function fetchMeeting(id: string): Promise<Meeting> {
  const meeting = getMeetingById(id);
  if (!meeting) return Promise.reject(new Error('Meeting not found'));
  return Promise.resolve(meeting);
}

export function parseMeeting(text: string, projectId: string): Promise<Omit<Meeting, 'id'>> {
  const project = getProjectById(projectId);
  return Promise.resolve(parseMeetingLocally(text, project?.researchTopic));
}

export function saveMeeting(meeting: Omit<Meeting, 'id'>, projectId: string): Promise<Meeting> {
  return Promise.resolve(localCreateMeeting({ ...meeting, projectId }));
}

export function updateMeeting(id: string, data: Partial<Omit<Meeting, 'id'>>): Promise<Meeting> {
  const updated = localUpdateMeeting(id, data);
  if (!updated) return Promise.reject(new Error('Meeting not found'));
  return Promise.resolve(updated);
}

export function deleteMeeting(id: string): Promise<{ message: string }> {
  const ok = localDeleteMeeting(id);
  if (!ok) return Promise.reject(new Error('Meeting not found'));
  return Promise.resolve({ message: 'deleted' });
}

export function askAssistant(question: string, projectId: string): Promise<{ answer: string; contextSize: number }> {
  const meetings = getMeetings('', projectId);
  const project = getProjectById(projectId);
  const answer = answerResearchQuestion(question, meetings, project);
  return Promise.resolve({ answer, contextSize: meetings.length });
}

export function fetchAnalytics(projectId: string): Promise<AnalyticsData> {
  const meetings = getMeetings('', projectId);
  const project = getProjectById(projectId);
  return Promise.resolve(buildAnalytics(meetings, project));
}

export function fetchPreparation(projectId: string): Promise<PreparationData> {
  const meetings = getMeetings('', projectId);
  const project = getProjectById(projectId);
  return Promise.resolve(buildPreparation(meetings, project));
}

export function fetchInsight(projectId: string): Promise<ResearchInsight> {
  const meetings = getMeetings('', projectId);
  const project = getProjectById(projectId);
  return Promise.resolve(buildResearchInsight(meetings, project));
}

export function updateTaskStatus(id: string, status: TaskStatus): Promise<unknown> {
  const task = localUpdateTaskStatus(id, status);
  if (!task) return Promise.reject(new Error('Task not found'));
  return Promise.resolve(task);
}

export function updateProject(id: string, name: string): Promise<Project> {
  const updated = localUpdateProject(id, name);
  if (!updated) return Promise.reject(new Error('Project not found'));
  return Promise.resolve(updated);
}

export function deleteProject(id: string): Promise<{ message: string }> {
  const ok = localDeleteProject(id);
  if (!ok) return Promise.reject(new Error('Project not found'));
  return Promise.resolve({ message: 'deleted' });
}
