import React from 'react';
import { RefreshCw, CloudOff, Cloud, AlertCircle, Clock3 } from 'lucide-react';
import { SyncState } from '../services/sync/types';

interface SyncStatusBadgeProps {
  state: SyncState;
  onSyncNow: () => void;
}

const formatSyncTime = (value: string | null): string => {
  if (!value) return '未同步';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '未同步';
  return date.toLocaleTimeString();
};

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ state, onSyncNow }) => {
  const statusView = (() => {
    switch (state.status) {
      case 'syncing':
        return {
          label: '同步中',
          className: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        };
      case 'synced':
        return {
          label: '已同步',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Cloud className="w-4 h-4" />,
        };
      case 'pending':
        return {
          label: `待同步 ${state.pendingCount}`,
          className: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Clock3 className="w-4 h-4" />,
        };
      case 'offline':
        return {
          label: `离线待同步 ${state.pendingCount}`,
          className: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <CloudOff className="w-4 h-4" />,
        };
      case 'disabled':
        return {
          label: '云同步未启用',
          className: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <CloudOff className="w-4 h-4" />,
        };
      case 'error':
        return {
          label: '同步异常',
          className: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <AlertCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: '等待同步',
          className: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <Clock3 className="w-4 h-4" />,
        };
    }
  })();

  return (
    <div className="fixed right-4 bottom-4 z-40 max-w-xs rounded-xl border bg-white/90 shadow-lg backdrop-blur p-3 space-y-2">
      <div className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs font-medium ${statusView.className}`}>
        {statusView.icon}
        <span>{statusView.label}</span>
      </div>
      <div className="text-[11px] text-slate-500">
        <div>账号：{state.authenticatedEmail || '公开浏览模式'}</div>
        <div>上次成功：{formatSyncTime(state.lastSuccessAt)}</div>
        {state.lastError && <div className="text-rose-600 mt-1">{state.lastError}</div>}
      </div>
      <button
        type="button"
        onClick={onSyncNow}
        className="w-full rounded-md bg-slate-900 text-white text-xs py-1.5 hover:bg-slate-700 transition"
      >
        立即同步
      </button>
    </div>
  );
};
