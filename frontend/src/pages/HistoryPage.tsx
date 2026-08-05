import { useEffect, useState } from 'react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { deleteMeeting, fetchMeetings, updateMeeting, updateTaskStatus } from '../services/api';
import type { Meeting, Task } from '../types';

interface HistoryPageProps {
  projectId: string;
}

export function HistoryPage({ projectId }: HistoryPageProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Meeting | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchMeetings(projectId, search).then((items) => {
        setMeetings(items);
        setSelected((current) => items.find((item) => item.id === current?.id) ?? items[0] ?? null);
      });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [projectId, search]);

  async function refresh() {
    const items = await fetchMeetings(projectId, search);
    setMeetings(items);
    setSelected((current) => items.find((item) => item.id === current?.id) ?? items[0] ?? null);
  }

  async function toggleTask(task: Task) {
    if (!task.id) return;
    await updateTaskStatus(task.id, task.status === 'done' ? 'pending' : 'done');
    await refresh();
  }

  function startEditing() {
    if (!selected) return;
    setDraft(JSON.parse(JSON.stringify(selected)));
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setDraft(null);
  }

  async function saveEdit() {
    if (!draft) return;
    setSaving(true);
    try {
      await updateMeeting(draft.id, {
        date: draft.date,
        topic: draft.topic,
        presentation: draft.presentation,
        advisorFeedback: draft.advisorFeedback,
        suggestions: draft.suggestions,
        nextMeetingDate: draft.nextMeetingDate,
        tasks: draft.tasks
      });
      setEditing(false);
      setDraft(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function removeMeeting() {
    if (!selected) return;
    if (!window.confirm(`确定删除「${selected.date} ${selected.topic}」这条组会记录吗？`)) return;
    await deleteMeeting(selected.id);
    setSelected(null);
    await refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card title="组会历史记录">
        <div className="mb-4 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="搜索当前课题的主题、汇报或导师反馈"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <button
              key={meeting.id}
              className={`w-full rounded-md border p-4 text-left hover:bg-slate-50 ${selected?.id === meeting.id ? 'border-research-500 bg-research-50' : 'border-slate-200 bg-white'}`}
              onClick={() => {
                setSelected(meeting);
                setEditing(false);
              }}
            >
              <div className="text-sm font-semibold text-slate-900">{meeting.date}</div>
              <div className="mt-1 text-sm text-slate-700">{meeting.topic}</div>
              <div className="mt-2 text-xs leading-5 text-slate-500">导师关注：{meeting.advisorFeedback}</div>
              <div className="mt-2 text-xs text-slate-500">任务：{meeting.tasks.map((t) => t.content).join('、') || '无'}</div>
            </button>
          ))}
          {!meetings.length && <div className="rounded-md bg-slate-50 p-6 text-sm text-slate-500">当前课题暂无组会记录。</div>}
        </div>
      </Card>

      <Card title="结构化详情">
        {selected ? (
          editing && draft ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="muted-label">编辑模式</div>
                <div className="flex gap-2">
                  <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={cancelEditing}>取消</button>
                  <button className="rounded-md bg-research-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-research-700 disabled:opacity-60" onClick={saveEdit} disabled={saving}>{saving ? '保存中...' : '保存'}</button>
                </div>
              </div>
              <Field label="日期"><input type="date" className={inputCls} value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></Field>
              <Field label="主题"><input className={inputCls} value={draft.topic} onChange={(e) => setDraft({ ...draft, topic: e.target.value })} /></Field>
              <Field label="我的汇报"><textarea className={areaCls} value={draft.presentation} onChange={(e) => setDraft({ ...draft, presentation: e.target.value })} /></Field>
              <Field label="导师反馈"><textarea className={areaCls} value={draft.advisorFeedback} onChange={(e) => setDraft({ ...draft, advisorFeedback: e.target.value })} /></Field>
              <Field label="下次组会"><input type="date" className={inputCls} value={draft.nextMeetingDate} onChange={(e) => setDraft({ ...draft, nextMeetingDate: e.target.value })} /></Field>
              <div>
                <div className="muted-label mb-2">修改建议</div>
                <div className="space-y-2">
                  {draft.suggestions.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input className={inputCls} value={item} onChange={(e) => setDraft({ ...draft, suggestions: draft.suggestions.map((s, i) => (i === index ? e.target.value : s)) })} />
                      <button className="shrink-0 rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => setDraft({ ...draft, suggestions: draft.suggestions.filter((_, i) => i !== index) })}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button className="rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50" onClick={() => setDraft({ ...draft, suggestions: [...draft.suggestions, ''] })}>添加建议</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="muted-label">查看模式</div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={startEditing}><Pencil size={14} /> 编辑</button>
                  <button className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50" onClick={removeMeeting}><Trash2 size={14} /> 删除</button>
                </div>
              </div>
              <Detail label="日期" value={selected.date} />
              <Detail label="主题" value={selected.topic} />
              <Detail label="我的汇报" value={selected.presentation} />
              <Detail label="导师反馈" value={selected.advisorFeedback} />
              <Detail label="下次组会" value={selected.nextMeetingDate || '待确认'} />
              <div>
                <div className="muted-label mb-2">修改建议</div>
                <div className="flex flex-wrap gap-2">
                  {selected.suggestions.length ? selected.suggestions.map((item) => (
                    <span key={item} className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-700">{item}</span>
                  )) : <span className="text-sm text-slate-500">无</span>}
                </div>
              </div>
              <div>
                <div className="muted-label mb-2">任务状态</div>
                <div className="space-y-2">
                  {selected.tasks.map((task) => (
                    <label key={task.id || task.content} className="flex items-start gap-3 rounded-md border border-slate-200 p-3 text-sm">
                      <input type="checkbox" className="mt-1" checked={task.status === 'done'} onChange={() => toggleTask(task)} />
                      <span>
                        <span className={task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'}>{task.content}</span>
                        <span className="mt-1 block text-xs text-slate-500">负责人：{task.owner} {task.collaborator ? ` · 协作：${task.collaborator}` : ''}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="text-sm text-slate-500">暂无记录。</div>
        )}
      </Card>
    </div>
  );
}

const inputCls = 'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-research-500';
const areaCls = 'min-h-[72px] w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-800 outline-none focus:border-research-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="muted-label mb-1">{label}</div>
      {children}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="muted-label mb-1">{label}</div>
      <div className="text-sm leading-6 text-slate-800">{value}</div>
    </div>
  );
}
