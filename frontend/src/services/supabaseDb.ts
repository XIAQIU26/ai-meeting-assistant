import type { Meeting, Project, Task, TaskStatus } from '../types';
import { supabase } from './supabase';

function genId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function mapProjectRow(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    researchTopic: (row.research_topic as string) || row.name as string,
    type: (row.type as string) || '其他',
    stage: (row.stage as string) || '选题论证'
  };
}

function mapMeetingRow(row: Record<string, unknown>): Meeting {
  const tasksRaw = row.tasks;
  let tasks: Task[] = [];
  if (Array.isArray(tasksRaw)) {
    tasks = tasksRaw.map((t: Record<string, unknown>) => ({
      id: t.id as string,
      meetingId: row.id as string,
      content: (t.content as string) || (t.task as string) || '',
      owner: (t.owner as string) || '我',
      deadline: (t.deadline as string) || '',
      collaborator: (t.collaborator as string) || '',
      status: (t.status as TaskStatus) || 'pending'
    }));
  }
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    date: row.date as string,
    topic: (row.topic as string) || '',
    presentation: (row.presentation as string) || '',
    advisorFeedback: (row.advisor_feedback as string) || '',
    suggestions: Array.isArray(row.suggestions) ? (row.suggestions as string[]) : [],
    tasks,
    nextMeetingDate: (row.next_meeting_date as string) || '',
    createdAt: (row.created_at as string) || ''
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) throw error;
  return (data || []).map(mapProjectRow);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapProjectRow(data) : null;
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const id = genId();
  const { data, error } = await supabase.from('projects').insert({
    id,
    name: project.name || project.researchTopic || '未命名课题',
    research_topic: project.researchTopic || project.name || '未命名课题',
    type: project.type || '其他',
    stage: project.stage || '选题论证'
  }).select().single();
  if (error) throw error;
  return mapProjectRow(data!);
}

export async function updateProject(id: string, name: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').update({
    name,
    research_topic: name
  }).eq('id', id).select().single();
  if (error) throw error;
  return data ? mapProjectRow(data) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function getMeetings(search = '', projectId = ''): Promise<Meeting[]> {
  let query = supabase.from('meetings').select('*');
  if (projectId) query = query.eq('project_id', projectId);
  if (search) {
    const q = search.toLowerCase();
    query = query.or(
      `topic.ilike.%${q}%,presentation.ilike.%${q}%,advisor_feedback.ilike.%${q}%`
    );
  }
  const { data, error } = await query.order('date', { ascending: false });
  if (error) throw error;
  const meetings = (data || []).map(mapMeetingRow);
  // Sort by date desc, then createdAt desc
  return meetings.sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });
}

export async function getMeetingById(id: string): Promise<Meeting | null> {
  const { data, error } = await supabase.from('meetings').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapMeetingRow(data) : null;
}

export async function createMeeting(meeting: Partial<Meeting> & { projectId?: string }): Promise<Meeting> {
  const id = meeting.id || genId();
  const tasksData = (meeting.tasks || []).map((task) => ({
    id: task.id || genId(),
    content: task.content || task.task || '',
    owner: task.owner || '我',
    deadline: task.deadline || '',
    collaborator: task.collaborator || '',
    status: task.status || 'pending'
  }));

  const { data, error } = await supabase.from('meetings').insert({
    id,
    project_id: meeting.projectId,
    date: meeting.date || meeting.meetingDate || new Date().toISOString().slice(0, 10),
    topic: meeting.topic || '',
    presentation: meeting.presentation || '',
    advisor_feedback: meeting.advisorFeedback || '',
    suggestions: meeting.suggestions || [],
    tasks: tasksData,
    next_meeting_date: meeting.nextMeetingDate || '',
    created_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return mapMeetingRow(data!);
}

export async function updateMeeting(id: string, db: Partial<Meeting>): Promise<Meeting | null> {
  const updates: Record<string, unknown> = {};
  if (db.date !== undefined) updates.date = db.date;
  if (db.topic !== undefined) updates.topic = db.topic;
  if (db.presentation !== undefined) updates.presentation = db.presentation;
  if (db.advisorFeedback !== undefined) updates.advisor_feedback = db.advisorFeedback;
  if (db.suggestions !== undefined) updates.suggestions = db.suggestions;
  if (db.nextMeetingDate !== undefined) updates.next_meeting_date = db.nextMeetingDate;
  if (db.tasks !== undefined) {
    updates.tasks = db.tasks.map((task) => ({
      id: task.id || genId(),
      content: task.content || task.task || '',
      owner: task.owner || '我',
      deadline: task.deadline || '',
      collaborator: task.collaborator || '',
      status: task.status || 'pending'
    }));
  }

  const { data, error } = await supabase.from('meetings').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data ? mapMeetingRow(data) : null;
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const { error } = await supabase.from('meetings').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task | null> {
  const { data, error } = await supabase.from('meetings').select('*');
  if (error) throw error;
  const meetings = data || [];
  for (const meeting of meetings) {
    const tasks = (meeting.tasks as Array<Record<string, unknown>>) || [];
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex].status = status;
      const { error: updateError } = await supabase
        .from('meetings')
        .update({ tasks })
        .eq('id', meeting.id);
      if (updateError) throw updateError;
      return { ...tasks[taskIndex], id: tasks[taskIndex].id } as unknown as Task;
    }
  }
  return null;
}
