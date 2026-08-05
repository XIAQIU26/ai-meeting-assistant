import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowRight, CheckCircle2, Lightbulb, MessageSquareText, ShieldAlert, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import type { PageKey } from '../components/Sidebar';
import { fetchAnalytics, fetchMeetings } from '../services/api';
import type { AnalyticsData, Meeting, Project } from '../types';

interface DashboardPageProps {
  projectId: string;
  project?: Project;
  onNavigate: (page: PageKey) => void;
}

export function DashboardPage({ projectId, project, onNavigate }: DashboardPageProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchMeetings(projectId).then(setMeetings);
    fetchAnalytics(projectId).then(setAnalytics);
  }, [projectId]);

  const latest = meetings[0];
  const insight = analytics?.insight;
  const pendingCount = meetings.flatMap((m) => m.tasks).filter((t) => t.status !== 'done').length;
  const topFocus = analytics?.keywords.filter((item) => item.count > 0).slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="muted-label">Research Dashboard</div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">科研进展总览</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            当前课题：{project?.name || '加载中'}。AI 会基于该课题的历史组会主动判断阶段、风险和下一步优先级。
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-research-500 px-4 py-2 text-sm font-medium text-white hover:bg-research-700"
          onClick={() => onNavigate('record')}
        >
          记录新组会 <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="当前阶段" value={insight?.currentStage || project?.stage || '分析中'} detail="AI 根据历史组会自动判断" />
        <Metric title="未完成任务" value={`${pendingCount} 项`} detail="只统计当前课题" />
        <Metric title="最近组会" value={latest?.date || '-'} detail={latest?.topic || '暂无记录'} />
        <Metric title="下次组会" value={latest?.nextMeetingDate || '待确认'} detail={latest?.nextMeetingDate ? '基于最近一次组会约定' : '暂未约定'} />
      </div>

      <Card title="AI 主动研究洞察">
        <div className="grid gap-4 lg:grid-cols-3">
          <InsightBlock icon={<Lightbulb size={18} />} title="当前研究状态判断" text={insight?.statusJudgement || '暂无足够历史记录生成判断。'} />
          <InsightBlock icon={<ShieldAlert size={18} />} title="潜在风险提醒" text={insight?.risks.join('\n') || '暂无风险。'} />
          <InsightBlock icon={<TrendingUp size={18} />} title="下一步行动建议" text={insight?.nextActions.join('\n') || '暂无建议。'} />
        </div>
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">研究方向变化检测</div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{insight?.directionChange || '暂无足够数据。'}</p>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card title="最近一次组会">
          {latest ? (
            <div className="space-y-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">{latest.topic}</div>
                <div className="mt-1 text-sm text-slate-500">{latest.date}</div>
              </div>
              <p className="text-sm leading-6 text-slate-700">{latest.advisorFeedback}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {latest.tasks.slice(0, 4).map((task) => (
                  <div key={task.id || task.content} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                    <div className="font-medium text-slate-800">{task.content}</div>
                    <div className="mt-1 text-xs text-slate-500">{task.status === 'done' ? '已完成' : '待完成'}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-md bg-slate-50 p-6 text-sm text-slate-500">当前课题暂无组会记录。</div>
          )}
        </Card>

        <Card title="导师长期关注问题">
          <div className="space-y-3">
            {topFocus.length ? topFocus.map((item) => (
              <div key={item.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-800">{item.name}</span>
                  <span className="text-slate-500">{item.count} 次</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-research-500" style={{ width: `${Math.min(item.count * 25, 100)}%` }} />
                </div>
              </div>
            )) : <div className="text-sm text-slate-500">暂无可分析关注点。</div>}
          </div>
        </Card>
      </div>

      <Card title="研究推进趋势">
        <div className="grid gap-3 md:grid-cols-5">
          {(analytics?.progress || ['选题确定', '理论与文献', '研究设计', '数据收集与分析', '论文修改']).map((stage, index) => (
            <div key={stage} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
              {stage.includes('已推进') ? <CheckCircle2 className="text-research-500" size={20} /> : <TrendingUp className="text-slate-400" size={20} />}
              <span className="text-sm font-medium text-slate-800">{stage}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="notion-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">{title}</div>
        <MessageSquareText size={16} className="text-slate-400" />
      </div>
      <div className="mt-3 text-xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-xs leading-5 text-slate-500">{detail}</div>
    </div>
  );
}

function InsightBlock({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <span className="text-research-500">{icon}</span>
        {title}
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
