import type { AnalyticsData, Meeting, PreparationData, Project, ResearchInsight, Task } from '../types';

interface ConcernRule {
  key: string;
  terms: string[];
  stageWeight: number;
}

const concernRules: ConcernRule[] = [
  { key: '理论框架', terms: ['理论框架', '理论', '福利多元主义', '社会支持理论'], stageWeight: 4 },
  { key: '文献综述', terms: ['文献', '综述', '研究不足'], stageWeight: 3 },
  { key: '研究设计', terms: ['研究设计', '设计', '变量', '样本', '访谈提纲'], stageWeight: 4 },
  { key: '数据处理', terms: ['数据', '数据分析', '数据处理', '整理数据', '文本清单'], stageWeight: 5 },
  { key: '论文结构', terms: ['论文结构', '结构', '章节'], stageWeight: 2 },
  { key: '研究伦理', terms: ['伦理', '访谈伦理', '知情同意'], stageWeight: 3 },
  { key: '区域比较', terms: ['区域', '区域差异', '区域比较', '区域划分'], stageWeight: 5 }
];

function meetingText(meeting: Meeting): string {
  return `${meeting.topic} ${meeting.presentation} ${meeting.advisorFeedback} ${(meeting.suggestions || []).join(' ')} ${(meeting.tasks || []).map((t) => t.content).join(' ')}`;
}

function rankConcerns(meetings: Meeting[]) {
  const stats = concernRules.map((rule) => ({ name: rule.key, count: 0, score: 0, evidence: [] as string[] }));
  meetings.forEach((meeting, index) => {
    const text = meetingText(meeting);
    stats.forEach((item) => {
      const rule = concernRules.find((candidate) => candidate.key === item.name)!;
      const matched = rule.terms.some((term) => text.includes(term));
      if (!matched) return;
      item.count += 1;
      item.score += rule.stageWeight + Math.max(0, 5 - index);
      item.evidence.push(`${meeting.date}：${meeting.advisorFeedback}`);
    });
  });

  return stats
    .filter((item) => item.count > 0)
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      name: item.name,
      count: item.count,
      priority: index === 0 ? '高' : index === 1 ? '中' : '低',
      reason: `${item.count} 次出现在近期组会中，最近证据：${item.evidence[0] || '暂无'}`,
      evidence: item.evidence.slice(0, 3)
    }));
}

function rankTextConcerns(text: string) {
  return concernRules
    .map((rule) => ({ name: rule.key, count: rule.terms.filter((term) => text.includes(term)).length }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

function extractMeetingConcerns(meeting: Meeting) {
  return rankConcerns([meeting]);
}

function inferResearchStage(meetings: Meeting[], project?: Project | null): string {
  const text = meetings.map(meetingText).join(' ');
  if (/研究设计|变量|样本|访谈提纲|区域划分/.test(text)) return '研究设计优化阶段';
  if (/数据分析方法|分析结果|数据处理|数据收集/.test(text)) return '数据整理与分析阶段';
  if (/论文结构|论文修改|章节/.test(text)) return '论文修改阶段';
  if (/理论框架|文献|综述/.test(text)) return '理论与文献夯实阶段';
  return project?.stage || '选题论证阶段';
}

function buildStatusJudgement(stage: string, project?: Project | null): string {
  const topic = project?.researchTopic || '当前课题';
  if (stage === '研究设计优化阶段') return `你的“${topic}”已经从选题阶段进入研究设计优化阶段，当前关键是把理论框架、研究问题和方法设计对齐。`;
  if (stage === '数据整理与分析阶段') return `你的“${topic}”已经进入数据整理与分析阶段，下一步需要把数据口径、分析方法和导师反馈形成闭环。`;
  if (stage === '理论与文献夯实阶段') return `你的“${topic}”仍处于理论与文献夯实阶段，当前应优先补齐概念、理论和既有研究不足。`;
  return `你的“${topic}”处于${stage}，建议持续把导师反馈转化为可检查的任务。`;
}

function buildRisks(repeated: ReturnType<typeof rankConcerns>, pendingTasks: Task[]): string[] {
  const risks = repeated.map((item) => `连续多次组会出现“${item.name}”，说明它仍是当前主要风险，需要在下次汇报中主动回应。`);
  if (pendingTasks.length >= 3) risks.push(`当前仍有 ${pendingTasks.length} 项未完成任务，存在下次组会前准备分散的风险。`);
  return risks.length ? risks : ['暂未发现连续性高风险，但仍建议在下次组会前明确本轮修改结果。'];
}

function buildNextActions(mainConcern: ReturnType<typeof rankConcerns>[number] | undefined, pendingTasks: Task[], stage: string): string[] {
  const actions: string[] = [];
  if (mainConcern?.name === '理论框架') actions.push('下一次组会重点展示理论框架修改结果，说明核心概念、变量和研究问题如何对应。');
  if (mainConcern?.name === '文献综述') actions.push('优先补充高相关文献，并用表格区分已有研究、研究不足和你的切入点。');
  if (mainConcern?.name === '研究设计') actions.push('把研究设计整理成一页说明：研究问题、样本、资料来源、分析方法和预期发现。');
  if (mainConcern?.name === '数据处理') actions.push('展示数据整理进度、数据口径和下一步分析计划，避免只汇报“正在整理”。');
  if (stage.includes('数据')) actions.push('准备一个小样本分析结果，让导师能直接判断方法是否可行。');
  pendingTasks.slice(0, 2).forEach((task) => actions.push(`优先完成遗留任务：${task.content}`));
  return actions.length ? actions : ['整理本轮导师反馈，形成下次组会的三点式汇报提纲。'];
}

function detectDirectionChange(meetings: Meeting[]): string {
  if (meetings.length < 3) return '历史记录较少，暂未检测到明确的研究方向变化。';
  const ordered = [...meetings].sort((a, b) => a.date.localeCompare(b.date));
  const early = ordered.slice(0, Math.ceil(ordered.length / 2)).map(meetingText).join(' ');
  const recent = ordered.slice(Math.floor(ordered.length / 2)).map(meetingText).join(' ');
  const earlyConcerns = rankTextConcerns(early);
  const recentConcerns = rankTextConcerns(recent);
  const earlyTop = earlyConcerns[0]?.name;
  const recentTop = recentConcerns[0]?.name;
  if (earlyTop && recentTop && earlyTop !== recentTop) {
    return `近几次组会中，研究重点由“${earlyTop}”逐渐转向“${recentTop}”，建议确认这是否意味着研究问题或论文主线需要同步调整。`;
  }
  return '近几次组会未发现明显方向漂移，研究主线基本稳定。';
}

function buildProgressStages(currentStage: string): string[] {
  const stages = ['选题确定', '理论与文献', '研究设计', '数据收集与分析', '论文修改'];
  const activeIndex = currentStage.includes('论文') ? 4 : currentStage.includes('数据') ? 3 : currentStage.includes('设计') ? 2 : currentStage.includes('理论') ? 1 : 0;
  return stages.map((name, index) => `${name}${index <= activeIndex ? '：已推进' : '：待深化'}`);
}

function buildPossibleQuestions(insight: ResearchInsight): string[] {
  const questions = ['为什么选择当前理论框架，它如何解释研究问题？'];
  if (insight.longTermConcerns.some((item) => item.name === '区域比较')) questions.push('区域划分依据是什么，是否足以解释差异？');
  if (insight.longTermConcerns.some((item) => item.name === '数据处理')) questions.push('数据来源的完整性和可比性如何保证？');
  if (insight.longTermConcerns.some((item) => item.name === '研究设计')) questions.push('研究设计修改后，样本、变量和方法之间是否一致？');
  return questions.slice(0, 3);
}

export function buildResearchInsight(meetings: Meeting[], project?: Project | null): ResearchInsight {
  const recent = meetings.slice(0, 5);
  const concernStats = rankConcerns(recent);
  const repeated = concernStats.filter((item) => item.count >= 2);
  const pendingTasks = meetings.flatMap((m) => m.tasks.filter((t) => t.status !== 'done'));
  const currentStage = inferResearchStage(recent, project);
  const mainConcern = concernStats[0];
  const statusJudgement = buildStatusJudgement(currentStage, project);
  const risks = buildRisks(repeated, pendingTasks);
  const nextActions = buildNextActions(mainConcern, pendingTasks, currentStage);
  const directionChange = detectDirectionChange(meetings);

  return {
    currentStage,
    statusJudgement,
    longTermConcerns: concernStats,
    repeatedIssues: repeated,
    risks,
    nextActions,
    directionChange,
    confidence: meetings.length >= 3 ? '较高' : meetings.length > 0 ? '中等' : '较低'
  };
}

export function buildAnalytics(meetings: Meeting[], project?: Project | null): AnalyticsData {
  const insight = buildResearchInsight(meetings, project);
  return {
    keywords: insight.longTermConcerns.map((item) => ({ name: item.name, count: item.count })),
    trend: meetings.slice(0, 5).reverse().map((meeting) => ({
      date: meeting.date,
      topic: meeting.topic,
      focus: extractMeetingConcerns(meeting).map((item) => item.name)
    })),
    progress: buildProgressStages(insight.currentStage),
    pendingTasks: meetings.flatMap((m) => m.tasks.filter((t) => t.status !== 'done')),
    insight
  };
}

export function buildPreparation(meetings: Meeting[], project?: Project | null): PreparationData {
  const insight = buildResearchInsight(meetings, project);
  const latest = meetings[0];
  const pending = meetings.flatMap((m) => m.tasks.filter((t) => t.status !== 'done'));
  return {
    nextMeetingDate: latest?.nextMeetingDate || '',
    unresolved: pending.slice(0, 5).map((t) => t.content ?? ''),
    reportSuggestions: insight.nextActions.slice(0, 3),
    possibleQuestions: buildPossibleQuestions(insight)
  };
}

export function answerResearchQuestion(question: string, meetings: Meeting[], project?: Project | null): string {
  const projectName = project?.name || '当前课题';
  const insight = buildResearchInsight(meetings, project);
  const pending = meetings.flatMap((m) => m.tasks.filter((t) => t.status !== 'done').map((t) => ({ ...t, topic: m.topic })));
  const themes = [...new Set(meetings.slice(0, 5).map((m) => m.topic))].join('、');

  if (!meetings.length) {
    return `「${projectName}」目前还没有任何组会记录。建议先到“组会记录”页录入第一次组会内容，AI 才能基于上下文回答你的问题。`;
  }

  if (/未完成|任务/.test(question)) {
    return `根据“${projectName}”的历史组会记录，你目前有 ${pending.length} 项未完成任务：\n${pending.map((t) => `- ${t.content}${t.deadline ? `（截止 ${t.deadline}）` : ''}`).join('\n')}`;
  }

  if (/关注|导师|问题/.test(question)) {
    return `根据最近 ${Math.min(meetings.length, 5)} 次组会记录，导师长期关注点按优先级排序为：\n${insight.longTermConcerns.map((item) => `- ${item.name}：${item.reason}`).join('\n')}`;
  }

  if (/主题|围绕/.test(question)) {
    return `过去一段时间该课题主要围绕：${themes || '暂无记录'}。${insight.statusJudgement}`;
  }

  if (/变化|方向/.test(question)) {
    return insight.directionChange;
  }

  return retrieveAnswer(question, meetings, projectName, insight);
}

function retrieveAnswer(question: string, meetings: Meeting[], projectName: string, insight: ResearchInsight): string {
  const stopWords = new Set(['的', '了', '是', '在', '我', '有', '和', '与', '及', '或', '上', '下', '不', '都', '也', '又', '你', '他', '她', '它', '这', '那', '一', '个', '什么', '怎么', '为什么', '如何', '是否', '吗', '呢', '啊', '吧', '请', '问', '想', '知道', '了解', '看看', '一下']);
  const tokens = (question.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [])
    .map((token) => token.toLowerCase())
    .filter((token) => !stopWords.has(token));

  if (!tokens.length) {
    return `${insight.statusJudgement}\n\n你可以基于「${projectName}」问得更具体一些，比如：\n- 导师最近关注哪些问题？\n- 我有哪些未完成任务？\n- 我的研究方向有没有变化？\n- 关于“理论框架/文献/数据”导师都说过什么？`;
  }

  const scored = meetings.map((meeting) => {
    const text = `${meeting.topic} ${meeting.presentation} ${meeting.advisorFeedback} ${(meeting.suggestions || []).join(' ')} ${(meeting.tasks || []).map((t) => t.content).join(' ')}`.toLowerCase();
    let score = 0;
    const matched: string[] = [];
    tokens.forEach((token) => {
      if (text.includes(token)) {
        score += 1;
        matched.push(token);
      }
    });
    return { meeting, score, matched };
  }).filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return `在「${projectName}」的 ${meetings.length} 条组会记录中，没有直接提到与你的问题相关的内容。\n\n课题当前状态：${insight.statusJudgement}\n\n你可以换个关键词，或直接问“导师关注什么 / 未完成任务 / 研究方向变化”。`;
  }

  const top = scored.slice(0, 3);
  const header = `针对「${projectName}」，根据 ${meetings.length} 条组会记录中与你问题最相关的 ${top.length} 条，整理如下：`;
  const details = top.map((item, index) => {
    const m = item.meeting;
    const evidence = [`日期：${m.date}`, `主题：${m.topic}`, `我的汇报：${m.presentation || '无'}`, `导师反馈：${m.advisorFeedback || '无'}`];
    if (m.suggestions && m.suggestions.length) evidence.push(`建议：${m.suggestions.join('；')}`);
    if (m.tasks && m.tasks.length) {
      const pending = m.tasks.filter((t) => t.status !== 'done').map((t) => t.content);
      if (pending.length) evidence.push(`未完成任务：${pending.join('、')}`);
    }
    return `【相关记录 ${index + 1}】（命中关键词：${item.matched.join('、')}）\n${evidence.join('\n')}`;
  }).join('\n\n');

  const tail = `\n\n综合判断：${insight.statusJudgement}`;
  return `${header}\n\n${details}${tail}`;
}
