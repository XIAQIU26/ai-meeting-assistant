import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Project } from '../types';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  projects: Project[];
  currentProject?: Project;
  onProjectChange: (projectId: string) => void;
  onProjectCreate: (project: Omit<Project, 'id'>) => void;
  onProjectUpdate: (id: string, name: string) => void;
  onProjectDelete: (id: string) => void;
}

export function Header({ projects, currentProject, onProjectChange, onProjectCreate, onProjectUpdate, onProjectDelete }: HeaderProps) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  function submitProject() {
    const researchTopic = topic.trim() || name.trim();
    if (!researchTopic) return;
    onProjectCreate({
      name: name.trim() || `新课题：${researchTopic}`,
      researchTopic,
      type: '自定义课题',
      stage: '选题论证'
    });
    setName('');
    setTopic('');
    setCreating(false);
  }

  function startEditing() {
    if (!currentProject) return;
    setEditName(currentProject.name);
    setEditing(true);
  }

  function submitEdit() {
    const trimmed = editName.trim();
    if (!trimmed || !currentProject) {
      setEditing(false);
      return;
    }
    onProjectUpdate(currentProject.id, trimmed);
    setEditing(false);
  }

  function handleDelete() {
    if (!currentProject) return;
    if (window.confirm(`确定要删除课题「${currentProject.name}」吗？该课题下的所有组会记录也会被一并删除。`)) {
      onProjectDelete(currentProject.id);
    }
  }

  const hasCurrentProject = Boolean(currentProject);

  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="text-xs text-slate-500">当前研究主题</div>
        <div className="mt-1 flex flex-col gap-2 md:flex-row md:items-center">
          <h1 className="text-lg font-semibold text-slate-900">{currentProject?.researchTopic || '加载课题中'}</h1>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-research-500"
            value={currentProject?.id || ''}
            onChange={(event) => {
              onProjectChange(event.target.value);
              setEditing(false);
            }}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setCreating((value) => !value)}>
            新建课题
          </button>
          <button
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={startEditing}
            disabled={!hasCurrentProject}
            title="更改课题名称"
          >
            <Pencil size={14} /> 重命名
          </button>
          <button
            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleDelete}
            disabled={!hasCurrentProject}
            title="删除当前课题"
          >
            <Trash2 size={14} /> 删除
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {creating && (
          <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 md:flex-row">
            <input className="rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none" placeholder="课题名称" value={name} onChange={(event) => setName(event.target.value)} />
            <input className="rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none" placeholder="研究主题" value={topic} onChange={(event) => setTopic(event.target.value)} />
            <button className="rounded-md bg-research-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-research-700" onClick={submitProject}>创建</button>
          </div>
        )}
        {editing && currentProject && (
          <div className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center">
            <input
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-research-500"
              placeholder="课题名称"
              value={editName}
              autoFocus
              onChange={(event) => setEditName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitEdit();
                if (event.key === 'Escape') setEditing(false);
              }}
            />
            <button className="rounded-md bg-research-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-research-700" onClick={submitEdit}>保存</button>
            <button className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100" onClick={() => setEditing(false)}>取消</button>
          </div>
        )}
        <UserMenu />
      </div>
    </header>
  );
}
