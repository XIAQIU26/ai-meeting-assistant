import type { Meeting, Task } from '../types';

function inferSuggestions(text: string): string[] {
  const suggestions: string[] = [];
  if (/理论框架|福利多元主义|社会支持理论/.test(text)) suggestions.push('完善理论框架，并说明理论与研究问题的对应关系');
  if (/文献|综述/.test(text)) suggestions.push('补充核心文献和近五年研究');
  if (/研究设计|变量|样本|访谈提纲/.test(text)) suggestions.push('修改研究设计，明确样本、变量和方法');
  if (/数据|区域/.test(text)) suggestions.push('整理数据，并说明区域划分或资料来源依据');
  if (/修改建议|建议|应该|需要|得/.test(text)) suggestions.push('根据反馈梳理修改方向并形成清单');
  return suggestions.length ? suggestions : ['根据组会反馈整理待修改事项'];
}

function inferTasks(text: string): Task[] {
  const tasks: Task[] = [];
  if (/补充.*文献|文献/.test(text)) tasks.push({ content: '补充相关理论与实证文献', owner: '我', deadline: '', collaborator: '', status: 'pending' });
  if (/修改研究设计|研究设计/.test(text)) tasks.push({ content: '修改研究设计', owner: '我', deadline: '', collaborator: '', status: 'pending' });
  if (/合作整理数据|整理数据|数据/.test(text)) tasks.push({ content: '合作整理数据', owner: '我', deadline: '', collaborator: extractCollaborator(text), status: 'pending' });
  if (/访谈提纲/.test(text)) tasks.push({ content: '完善访谈提纲', owner: '我', deadline: '', collaborator: extractCollaborator(text), status: 'pending' });
  if (/修改建议|修改|得|需要|应该/.test(text)) tasks.push({ content: '落实组会提出的修改事项', owner: '我', deadline: '', collaborator: '', status: 'pending' });
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
  const presentationMatch = text.match(/我(?:汇报了|汇报|做了汇报|报告了|分享了)([^，。；;]+)/);
  const feedbackMatch = text.match(/导师(?:认为|指出|建议|反馈|提出|要求|说|提到)([^，。；;]+)/);
  const suggestionMatch = text.match(/(?:修改建议|建议|修改方案|后续工作)(?:是|为|:|：)?([^，。；;]+)/);
  const suggestions = inferSuggestions(text);
  const tasks = inferTasks(text);

  const year = new Date().getFullYear();
  const month = nextDateMatch?.[1]?.padStart(2, '0') || '';
  const day = nextDateMatch?.[2]?.padStart(2, '0') || '';

  // 提取导师反馈：优先用正则匹配，否则尝试提取"导师"后的内容
  let advisorFeedback = '';
  if (feedbackMatch) {
    const verb = text.includes('指出') ? '指出' : text.includes('建议') ? '建议' : text.includes('反馈') ? '反馈' : text.includes('提出') ? '提出' : text.includes('要求') ? '要求' : text.includes('提到') ? '提到' : '认为';
    advisorFeedback = `导师${verb}${feedbackMatch[1]}`;
  } else {
    const mentorIdx = text.indexOf('导师');
    if (mentorIdx !== -1) {
      advisorFeedback = text.slice(mentorIdx, Math.min(mentorIdx + 80, text.length));
      if (advisorFeedback.length > 60) advisorFeedback = advisorFeedback.slice(0, 60) + '...';
    } else {
      advisorFeedback = '无明确导师反馈记录';
    }
  }

  // 提取汇报内容
  let presentation = '';
  if (presentationMatch) {
    presentation = presentationMatch[1];
  } else {
    const reportIdx = text.indexOf('汇报');
    if (reportIdx !== -1) {
      presentation = text.slice(reportIdx, Math.min(reportIdx + 60, text.length));
      if (presentation.length > 50) presentation = presentation.slice(0, 50) + '...';
    } else {
      presentation = text.slice(0, Math.min(50, text.length));
    }
  }

  return {
    projectId: '',
    date: today,
    topic: topicMatch?.[1] || projectName || '未命名组会',
    presentation,
    advisorFeedback,
    suggestions,
    tasks,
    nextMeetingDate: month && day ? `${year}-${month}-${day}` : ''
  };
}