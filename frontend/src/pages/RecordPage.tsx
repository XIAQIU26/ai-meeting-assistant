import { useState } from 'react';
import { Brain, Plus, Save, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { parseMeeting, saveMeeting } from '../services/api';
import type { Meeting, Task } from '../types';

const sampleText =
  '今天组会主题为孤儿福利政策区域差异研究，我汇报了区域差异分析部分，导师认为理论框架不足，需要补充福利多元主义相关文献，并要求修改研究设计，同时让我和A同学合作整理数据，下次组会时间为8月20日。';

interface RecordPageProps {
  projectId: string;
  onSaved: () => void;
}

export function RecordPage({ projectId, onSaved }: RecordPageProps) {
  const [text, setText] = useState(sampleText);
  const [parsed, setParsed] = useState<Omit<Meeting, 'id'> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleParse() {
    setLoading(true);
    try {
      const result = await parseMeeting(text, projectId);
      setParsed(result);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!parsed) return;
    setSaving(true);
    try {
      await saveMeeting(parsed, projectId);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof Omit<Meeting, 'id'>>(field: K, value: Omit<Meeting, 'id'>[K]) {
    setParsed((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
      <Card title="AI 组会记录解析">
        <textarea
          className="min-h-[360px] w-full resize-none rounded-md border border-slate-200 bg-white p-4 text-sm leading-6 outline-none focus:border-research-500 focus:ring-2 focus:ring-research-100"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="mt-4 flex gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-research-500 px-4 py-2 text-sm font-medium text-white hover:bg-research-700 disabled:opacity-60"
            onClick={handleParse}
            disabled={loading || !text.trim()}
          >
            <Brain size={16} /> {loading ? '解析中...' : 'AI解析'}
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            onClick={handleSave}
            disabled={!parsed || saving}
          >
            <Save size={16} /> {saving ? '保存中...' : '保存到当前课题'}
          </button>
        </div>
        {parsed && (
          <p className="mt-3 text-xs text-slate-500">解析结果可直接修改后再保存。</p>
        )}
      </Card>

      <div className="space-y-4">
        {parsed ? (
          <>
            <EditableField label="组会主题" value={parsed.topic} onChange={(value) => updateField('topic', value)} />
            <EditableArea label="我的汇报" value={parsed.presentation} onChange={(value) => updateField('presentation', value)} />
            <EditableArea label="导师反馈" value={parsed.advisorFeedback} onChange={(value) => updateField('advisorFeedback', value)} />
            <EditableList label="修改建议" items={parsed.suggestions} onChange={(items) => updateField('suggestions', items)} />
            <EditableTaskCard title="待办任务" tasks={parsed.tasks.filter((task) => !task.collaborator)} onChange={(tasks) => updateTasks(tasks, false)} />
            <EditableTaskCard title="协作任务" tasks={parsed.tasks.filter((task) => task.collaborator)} onChange={(tasks) => updateTasks(tasks, true)} />
            <div className="notion-card p-4">
              <div className="muted-label mb-2">下一次组会</div>
              <input
                type="date"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-research-500"
                value={parsed.nextMeetingDate || ''}
                onChange={(event) => updateField('nextMeetingDate', event.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="notion-card p-8 text-center text-sm text-slate-500">
            <div className="mb-2 text-base font-medium text-slate-700">还没有解析组会记录</div>
            在左侧输入框中粘贴或输入组会内容，然后点击「AI解析」<br />即可生成可编辑的结构化卡片，修改后再保存。
          </div>
        )}
      </div>
    </div>
  );

  function updateTasks(updated: Task[], isCollaborative: boolean) {
    setParsed((prev) => {
      if (!prev) return prev;
      const others = prev.tasks.filter((task) => Boolean(task.collaborator) !== isCollaborative);
      return { ...prev, tasks: [...others, ...updated] };
    });
  }
}

function EditableField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="notion-card p-4">
      <div className="muted-label mb-2">{label}</div>
      <input
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-research-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function EditableArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="notion-card p-4">
      <div className="muted-label mb-2">{label}</div>
      <textarea
        className="min-h-[80px] w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-800 outline-none focus:border-research-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function EditableList({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  function update(index: number, value: string) {
    onChange(items.map((item, i) => (i === index ? value : item)));
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...items, '']);
  }

  return (
    <div className="notion-card p-4">
      <div className="muted-label mb-2">{label}</div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-research-500 focus:bg-white"
              value={item}
              placeholder="输入建议"
              onChange={(event) => update(index, event.target.value)}
            />
            <button
              className="shrink-0 rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              onClick={() => remove(index)}
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
          onClick={add}
        >
          <Plus size={14} /> 添加建议
        </button>
      </div>
    </div>
  );
}

function EditableTaskCard({ title, tasks, onChange }: { title: string; tasks: Task[]; onChange: (tasks: Task[]) => void }) {
  function update(index: number, patch: Partial<Task>) {
    onChange(tasks.map((task, i) => (i === index ? { ...task, ...patch } : task)));
  }
  function remove(index: number) {
    onChange(tasks.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...tasks, { content: '', owner: '我', deadline: '', collaborator: '', status: 'pending' }]);
  }

  return (
    <div className="notion-card p-4">
      <div className="muted-label mb-2">{title}</div>
      {tasks.length ? (
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="rounded-md border border-slate-200 p-3">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-sm font-medium text-slate-800 outline-none focus:border-research-500"
                  value={task.content || task.task || ''}
                  placeholder="任务内容"
                  onChange={(event) => update(index, { content: event.target.value, task: event.target.value })}
                />
                <button
                  className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  onClick={() => remove(index)}
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <label className="text-xs text-slate-500">
                  负责人
                  <input
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-research-500"
                    value={task.owner}
                    onChange={(event) => update(index, { owner: event.target.value })}
                  />
                </label>
                <label className="text-xs text-slate-500">
                  截止日期
                  <input
                    type="date"
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-research-500"
                    value={task.deadline}
                    onChange={(event) => update(index, { deadline: event.target.value })}
                  />
                </label>
                <label className="text-xs text-slate-500">
                  协作人
                  <input
                    className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-research-500"
                    value={task.collaborator}
                    placeholder="无"
                    onChange={(event) => update(index, { collaborator: event.target.value })}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-500">暂无</div>
      )}
      <button
        className="mt-3 inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
        onClick={add}
      >
        <Plus size={14} /> 添加任务
      </button>
    </div>
  );
}
