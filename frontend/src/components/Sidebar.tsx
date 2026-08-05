import { BarChart3, Bot, CalendarCheck, History, LayoutDashboard, PenLine } from 'lucide-react';

export type PageKey = 'dashboard' | 'record' | 'history' | 'chat' | 'analytics' | 'prep';

interface SidebarProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
}

const items = [
  { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { key: 'record' as const, label: '组会记录', icon: PenLine },
  { key: 'history' as const, label: '历史记录', icon: History },
  { key: 'chat' as const, label: 'AI助手', icon: Bot },
  { key: 'analytics' as const, label: '趋势分析', icon: BarChart3 },
  { key: 'prep' as const, label: '组会准备', icon: CalendarCheck }
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-5 md:block">
      <div className="mb-8">
        <div className="text-sm font-semibold text-slate-900">AI Research Meeting</div>
        <div className="mt-1 text-xs text-slate-500">科研组会管理助手</div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.key;
          return (
            <button
              key={item.key}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                active ? 'bg-research-50 text-research-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => onNavigate(item.key)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
