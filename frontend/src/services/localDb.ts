import type { Meeting, Project, Task, TaskStatus } from '../types';

const STORAGE_KEY = 'arm_db_v1';

interface DbState {
  projects: Project[];
  meetings: Meeting[];
}

const seedProjects: Project[] = [
  {
    id: 'p_orphan_policy',
    name: '毕业论文：孤儿福利政策区域差异研究',
    researchTopic: '孤儿福利政策区域差异研究',
    type: '毕业论文',
    stage: '研究设计优化'
  },
  {
    id: 'p_reintegration',
    name: '课题项目：戒毒康复人员社会再融入研究',
    researchTopic: '戒毒康复人员社会再融入研究',
    type: '课题项目',
    stage: '文献综述与访谈设计'
  },
  {
    id: 'p_other_paper',
    name: '其他论文：基层社会治理数字化研究',
    researchTopic: '基层社会治理数字化研究',
    type: '其他论文',
    stage: '选题论证'
  }
];

const seedMeetings: Meeting[] = [
  {
    id: 'm_seed_1',
    projectId: 'p_orphan_policy',
    date: '2026-07-08',
    topic: '孤儿福利政策区域差异研究',
    presentation: '汇报了研究选题、问题意识和政策文本样本来源。',
    advisorFeedback: '导师认为选题有现实意义，但理论框架需要尽快明确。',
    suggestions: ['补充福利多元主义理论', '梳理区域差异的解释变量'],
    nextMeetingDate: '2026-07-22',
    createdAt: '2026-07-08T10:00:00.000Z',
    tasks: [
      { id: 't_seed_1', meetingId: 'm_seed_1', content: '阅读福利多元主义核心文献', owner: '我', deadline: '2026-07-18', collaborator: '', status: 'done' },
      { id: 't_seed_2', meetingId: 'm_seed_1', content: '整理省级政策文本清单', owner: '我', deadline: '2026-07-20', collaborator: 'A同学', status: 'done' }
    ]
  },
  {
    id: 'm_seed_2',
    projectId: 'p_orphan_policy',
    date: '2026-07-22',
    topic: '孤儿福利政策区域差异研究',
    presentation: '汇报了文献综述初稿和区域划分思路。',
    advisorFeedback: '导师指出文献综述不足，区域划分依据需要更清晰。',
    suggestions: ['补充近五年儿童福利政策研究', '说明区域划分标准', '优化论文结构'],
    nextMeetingDate: '2026-08-05',
    createdAt: '2026-07-22T10:00:00.000Z',
    tasks: [
      { id: 't_seed_3', meetingId: 'm_seed_2', content: '补充儿童福利政策近五年文献', owner: '我', deadline: '2026-07-30', collaborator: '', status: 'done' },
      { id: 't_seed_4', meetingId: 'm_seed_2', content: '重写区域划分依据说明', owner: '我', deadline: '2026-08-02', collaborator: '', status: 'pending' }
    ]
  },
  {
    id: 'm_seed_3',
    projectId: 'p_orphan_policy',
    date: '2026-08-05',
    topic: '孤儿福利政策研究',
    presentation: '汇报了区域差异分析部分和初步数据整理结果。',
    advisorFeedback: '导师认为理论框架不足，需要补充福利多元主义相关文献，并修改研究设计。',
    suggestions: ['完善理论框架', '补充福利多元主义文献', '修改研究设计', '明确数据分析方法'],
    nextMeetingDate: '2026-08-20',
    createdAt: '2026-08-05T10:00:00.000Z',
    tasks: [
      { id: 't_seed_5', meetingId: 'm_seed_3', content: '补充福利多元主义相关文献', owner: '我', deadline: '2026-08-12', collaborator: '', status: 'pending' },
      { id: 't_seed_6', meetingId: 'm_seed_3', content: '修改研究设计', owner: '我', deadline: '2026-08-15', collaborator: '', status: 'pending' },
      { id: 't_seed_7', meetingId: 'm_seed_3', content: '合作整理数据', owner: '我', deadline: '2026-08-18', collaborator: 'A同学', status: 'pending' }
    ]
  },
  {
    id: 'm_seed_4',
    projectId: 'p_reintegration',
    date: '2026-07-15',
    topic: '戒毒康复人员社会再融入研究',
    presentation: '汇报了研究问题和访谈对象初步范围。',
    advisorFeedback: '导师建议先补充社会支持理论，并明确访谈伦理与样本进入方式。',
    suggestions: ['补充社会支持理论文献', '完善访谈提纲', '补充伦理说明'],
    nextMeetingDate: '2026-07-29',
    createdAt: '2026-07-15T10:00:00.000Z',
    tasks: [
      { id: 't_seed_8', meetingId: 'm_seed_4', content: '完成社会支持理论文献卡片', owner: '我', deadline: '2026-07-24', collaborator: '', status: 'pending' },
      { id: 't_seed_9', meetingId: 'm_seed_4', content: '修改访谈提纲', owner: '我', deadline: '2026-07-26', collaborator: 'B同学', status: 'pending' }
    ]
  }
];

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function readState(): DbState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DbState;
      if (Array.isArray(parsed.projects) && Array.isArray(parsed.meetings)) {
        return parsed;
      }
    }
  } catch {
    // ignore corrupt data, reseed
  }
  const seed: DbState = { projects: seedProjects, meetings: seedMeetings };
  writeState(seed);
  return seed;
}

function writeState(state: DbState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getProjects(): Project[] {
  return readState().projects;
}

export function getProjectById(id: string): Project | null {
  return readState().projects.find((p) => p.id === id) || null;
}

export function createProject(project: Omit<Project, 'id'>): Project {
  const state = readState();
  const newProject: Project = {
    id: genId(),
    name: project.name || project.researchTopic || '未命名课题',
    researchTopic: project.researchTopic || project.name || '未命名课题',
    type: project.type || '其他',
    stage: project.stage || '选题论证'
  };
  state.projects.push(newProject);
  writeState(state);
  return newProject;
}

export function updateProject(id: string, name: string): Project | null {
  const state = readState();
  const project = state.projects.find((p) => p.id === id);
  if (!project) return null;
  project.name = name;
  project.researchTopic = name;
  writeState(state);
  return project;
}

export function deleteProject(id: string): boolean {
  const state = readState();
  const exists = state.projects.some((p) => p.id === id);
  if (!exists) return false;
  state.projects = state.projects.filter((p) => p.id !== id);
  state.meetings = state.meetings.filter((m) => m.projectId !== id);
  writeState(state);
  return true;
}

export function getMeetings(search = '', projectId = ''): Meeting[] {
  const q = search.trim().toLowerCase();
  return readState()
    .meetings.filter((meeting) => {
      if (projectId && meeting.projectId !== projectId) return false;
      if (!q) return true;
      return [meeting.topic, meeting.presentation, meeting.advisorFeedback, ...meeting.suggestions, ...meeting.tasks.map((task) => task.content)]
        .join(' ')
        .toLowerCase()
        .includes(q);
    })
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (byDate !== 0) return byDate;
      const aCreated = a.createdAt || '';
      const bCreated = b.createdAt || '';
      return bCreated.localeCompare(aCreated);
    });
}

export function getMeetingById(id: string): Meeting | null {
  return readState().meetings.find((m) => m.id === id) || null;
}

export function createMeeting(meeting: Partial<Meeting> & { projectId?: string }): Meeting {
  const state = readState();
  const projectId = meeting.projectId || state.projects[0]?.id || '';
  const id = meeting.id || genId();
  const normalized: Meeting = {
    id,
    projectId,
    date: meeting.date || meeting.meetingDate || new Date().toISOString().slice(0, 10),
    topic: meeting.topic || getProjectById(projectId)?.researchTopic || '未命名组会',
    presentation: meeting.presentation || '',
    advisorFeedback: meeting.advisorFeedback || '',
    suggestions: meeting.suggestions || [],
    nextMeetingDate: meeting.nextMeetingDate || '',
    createdAt: new Date().toISOString(),
    tasks: (meeting.tasks || []).map((task) => ({
      id: task.id || genId(),
      meetingId: id,
      content: task.content || task.task || '',
      owner: task.owner || '我',
      deadline: task.deadline || '',
      collaborator: task.collaborator || '',
      status: task.status || 'pending'
    }))
  };
  state.meetings.push(normalized);
  writeState(state);
  return normalized;
}

export function updateMeeting(id: string, data: Partial<Meeting>): Meeting | null {
  const state = readState();
  const index = state.meetings.findIndex((m) => m.id === id);
  if (index === -1) return null;
  state.meetings[index] = { ...state.meetings[index], ...data };
  writeState(state);
  return state.meetings[index];
}

export function deleteMeeting(id: string): boolean {
  const state = readState();
  const exists = state.meetings.some((m) => m.id === id);
  if (!exists) return false;
  state.meetings = state.meetings.filter((m) => m.id !== id);
  writeState(state);
  return true;
}

export function updateTaskStatus(id: string, status: TaskStatus): Task | null {
  const state = readState();
  let updated: Task | null = null;
  state.meetings = state.meetings.map((meeting) => ({
    ...meeting,
    tasks: meeting.tasks.map((task) => {
      if (task.id !== id) return task;
      updated = { ...task, status };
      return updated;
    })
  }));
  writeState(state);
  return updated;
}

export function resetDatabase(): DbState {
  const seed: DbState = { projects: seedProjects, meetings: seedMeetings };
  writeState(seed);
  return seed;
}
