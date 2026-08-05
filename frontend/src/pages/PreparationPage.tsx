import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { HelpCircle, ListChecks, Presentation } from 'lucide-react';
import { Card } from '../components/Card';
import { fetchPreparation } from '../services/api';
import type { PreparationData } from '../types';

interface PreparationPageProps {
  projectId: string;
}

export function PreparationPage({ projectId }: PreparationPageProps) {
  const [data, setData] = useState<PreparationData | null>(null);

  useEffect(() => {
    fetchPreparation(projectId).then(setData);
  }, [projectId]);

  if (!data) return <div className="text-sm text-slate-500">加载中...</div>;

  return (
    <div className="space-y-5">
      <div>
        <div className="muted-label">Next Meeting</div>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">下一次组会准备助手</h2>
        <p className="mt-2 text-sm text-slate-500">预计下次组会：{data.nextMeetingDate || '待确认'}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <PrepCard icon={<ListChecks size={20} />} title="上次遗留问题" items={data.unresolved} />
        <PrepCard icon={<Presentation size={20} />} title="AI 建议汇报" items={data.reportSuggestions} />
        <PrepCard icon={<HelpCircle size={20} />} title="可能导师提问" items={data.possibleQuestions} prefix="Q: " />
      </div>

      <Card title="组会准备清单">
        <div className="grid gap-3 md:grid-cols-2">
          {['整理结构化汇报提纲', '准备理论框架图或研究设计图', '更新文献综述表', '确认数据或材料整理进度'].map((item) => (
            <label key={item} className="flex items-center gap-3 rounded-md border border-slate-200 p-3 text-sm text-slate-700">
              <input type="checkbox" />
              {item}
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PrepCard({ icon, title, items, prefix = '' }: { icon: ReactNode; title: string; items: string[]; prefix?: string }) {
  return (
    <div className="notion-card p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <span className="text-research-500">{icon}</span>
        {title}
      </div>
      <div className="space-y-3">
        {(items.length ? items : ['暂无']).map((item) => (
          <div key={item} className="rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">{prefix}{item}</div>
        ))}
      </div>
    </div>
  );
}
