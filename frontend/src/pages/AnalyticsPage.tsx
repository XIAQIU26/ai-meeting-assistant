import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { fetchAnalytics } from '../services/api';
import type { AnalyticsData } from '../types';

interface AnalyticsPageProps {
  projectId: string;
}

export function AnalyticsPage({ projectId }: AnalyticsPageProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics(projectId).then(setAnalytics);
  }, [projectId]);

  if (!analytics) return <div className="text-sm text-slate-500">加载中...</div>;

  const max = Math.max(...analytics.keywords.map((item) => item.count), 1);

  return (
    <div className="space-y-5">
      <div>
        <div className="muted-label">Analytics</div>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">导师意见趋势分析</h2>
      </div>

      <Card title="AI 主动诊断摘要">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">阶段判断</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{analytics.insight.statusJudgement}</p>
          </div>
          <div className="rounded-md bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">方向变化</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{analytics.insight.directionChange}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="长期关注问题与优先级">
          <div className="space-y-4">
            {analytics.insight.longTermConcerns.map((item) => (
              <div key={item.name} className="rounded-md border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="rounded-md bg-research-50 px-2 py-1 text-xs text-research-700">优先级：{item.priority}</span>
                </div>
                <p className="text-xs leading-5 text-slate-500">{item.reason}</p>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-research-500" style={{ width: `${(item.count / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="过去 5 次导师关注趋势">
          <div className="space-y-3">
            {analytics.trend.map((item) => (
              <div key={item.date} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-900">{item.date}</div>
                  <div className="text-xs text-slate-500">{item.topic}</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.focus.map((focus) => (
                    <span key={focus} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{focus}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="风险提醒与下一步行动">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">潜在风险</div>
            <div className="space-y-2">
              {analytics.insight.risks.map((risk) => (
                <div key={risk} className="rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">{risk}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">行动建议</div>
            <div className="space-y-2">
              {analytics.insight.nextActions.map((action) => (
                <div key={action} className="rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">{action}</div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
