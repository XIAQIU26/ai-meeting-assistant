import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, type PageKey } from './components/Sidebar';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuthPage } from './pages/AuthPage';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { PreparationPage } from './pages/PreparationPage';
import { RecordPage } from './pages/RecordPage';
import { AuthProvider, useAuth } from './services/authContext';
import { createProject, deleteProject, fetchProjects, updateProject } from './services/api';
import type { Project } from './types';

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState<PageKey>(() => (localStorage.getItem('arm_active_page') as PageKey) || 'dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState(() => localStorage.getItem('arm_current_project') || '');

  useEffect(() => {
    localStorage.setItem('arm_active_page', activePage);
  }, [activePage]);

  useEffect(() => {
    if (currentProjectId) localStorage.setItem('arm_current_project', currentProjectId);
  }, [currentProjectId]);

  useEffect(() => {
    if (!user) return;
    fetchProjects().then((items) => {
      setProjects(items);
      setCurrentProjectId((current) => {
        if (current && items.some((p) => p.id === current)) return current;
        return items[0]?.id || '';
      });
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const currentProject = projects.find((project) => project.id === currentProjectId);

  async function handleProjectCreate(project: Omit<Project, 'id'>) {
    const created = await createProject(project);
    setProjects((items) => [...items, created]);
    setCurrentProjectId(created.id);
  }

  async function handleProjectUpdate(id: string, name: string) {
    const updated = await updateProject(id, name);
    setProjects((items) => items.map((project) => (project.id === id ? updated : project)));
  }

  async function handleProjectDelete(id: string) {
    await deleteProject(id);
    setProjects((items) => {
      const remaining = items.filter((project) => project.id !== id);
      setCurrentProjectId((current) => (current === id ? remaining[0]?.id || '' : current));
      return remaining;
    });
  }

  const renderPage = () => {
    if (!currentProjectId) return <div className="text-sm text-slate-500">正在加载课题...</div>;
    switch (activePage) {
      case 'record':
        return <RecordPage projectId={currentProjectId} onSaved={() => setActivePage('history')} />;
      case 'history':
        return <HistoryPage projectId={currentProjectId} />;
      case 'chat':
        return <ChatPage projectId={currentProjectId} />;
      case 'analytics':
        return <AnalyticsPage projectId={currentProjectId} />;
      case 'prep':
        return <PreparationPage projectId={currentProjectId} />;
      default:
        return <DashboardPage projectId={currentProjectId} project={currentProject} onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="min-w-0 flex-1">
        <Header
          projects={projects}
          currentProject={currentProject}
          onProjectChange={setCurrentProjectId}
          onProjectCreate={handleProjectCreate}
          onProjectUpdate={handleProjectUpdate}
          onProjectDelete={handleProjectDelete}
        />
        <main className="mx-auto max-w-6xl px-5 py-6">{renderPage()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
