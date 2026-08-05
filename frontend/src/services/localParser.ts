import type { Meeting, Task } from '../types';

function inferSuggestions(text: string): string[] {
  const suggestions: string[] = [];
  if (/理论框架|福利多元主义|社会支持理论/.test(text)) suggestions.push('完善理论框架，并说明理论与研究问题的对应关系');
  if (/文献|综述/.test(text)) suggestions.push('补充核心文献和近五年研究');
  if (/研究设计|变量|样本|访谈提纲/.test(text)) suggestions.push('修改研究设计，明确样本、变量和方法');
  if (/数据|区域/.test(text)) suggestions.push('整理数据，并说明区域划分或资料来源依据');
  return suggestions.length ? suggestions : ['梳理导师反馈并形成下一轮修改清单'];
}

function inferTasks(text: string): Task[] {
  const tasks: Task[] = [];
  if (/补充.*文献|文献/.test(text)) tasks.push({ content: '补充相关理论与实证文献', owner: '我', deadline: '', collaborator: '', status: 'pending' });
  if (/修改研究设计|研究设计/.test(text)) tasks.push({ content: '修改研究设计', owner: '我', deadline: '', collaborator: '', status: 'pending' });
  if (/合作整理数据|整理数据|数据/.test(text)) tasks.push({ content: '合作整理数据', owner: '我', deadline: '', collaborator: extractCollaborator(text), status: 'pending' });
  if (/访谈提纲/.test(text)) tasks.push({ content: '完善访谈提纲', owner: '我', deadline: '', collaborator: extractCollaborator(text), status: 'pending' });
  return tasks.length ? tasks : [{ content: '整理本次组会反馈', owner: '我', deadline: '', collaborator: '', status: 'pending' }];
}

function extractCollaborator(text: string): string {
  const match = text.match(/和([^，。]+?)合作/);
  return match?.[1] || '';
}

export function parseMeetingLocally(text: string, projectName?: string): Omit<Meeting, 'id'> {
  const today = new Date().toISOString().slice(0, 10);
  const nextDateMatch = text.match(/下次组会(?:时间|日期)?(?:为|是|定在)?[^0-9]{0,4}([0-9]{1,2})[月.\/\-]([0-9]{1,2})[日号]?/);
  const topicMatch = text.match(/组会主题为([^，。]+)/);
  const presentationMatch = text.match(/我汇报了([^，。]+)/);
  const feedbackMatch = text.match(/导师(?:认为|指出|建议)([^，。]+)/);
  const suggestions = inferSuggestions(text);
  const tasks = inferTasks(text);

  const year = new Date().getFullYear();
  const month = nextDateMatch?.[1]?.padStart(2, '0') || '';
  const day = nextDateMatch?.[2]?.padStart(2, '0') || '';

  return {
    projectId: '',
    date: today,
    topic: topicMatch?.[1] || projectName || '未命名组会',
    presentation: presentationMatch?.[1] || '本次组会汇报了研究进展',
    advisorFeedback: feedbackMatch
      ? `导师${text.includes('指出') ? '指出' : text.includes('建议') ? '建议' : '认为'}${feedbackMatch[1]}`
      : '导师建议继续聚焦理论框架、文献补充和研究设计。',
    suggestions,
    tasks,
    nextMeetingDate: month && day ? `${year}-${month}-${day}` : ''
  };
}
