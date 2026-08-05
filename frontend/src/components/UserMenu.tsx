import { useState } from 'react';
import { useAuth } from '../services/authContext';
import { LogOut, User, ChevronDown, Cloud, HardDrive } from 'lucide-react';

interface UserMenuProps {
  isRemote: boolean;
  onLogout: () => void;
}

export function UserMenu({ isRemote, onLogout }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isRemote) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
        <HardDrive size={14} />
        <span>本地模式</span>
      </div>
    );
  }

  if (!user) return null;

  const displayName = (user.user_metadata?.name as string) || user.email?.split('@')[0] || '用户';

  async function handleLogout() {
    await signOut();
    onLogout();
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-600">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="max-w-[100px] truncate">{displayName}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <div className="border-b border-slate-100 px-3 py-2">
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Cloud size={12} /> 云端已同步
              </div>
              <p className="text-sm font-medium text-slate-700">{displayName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={14} /> 退出登录
            </button>
          </div>
        </>
      )}
    </div>
  );
}
