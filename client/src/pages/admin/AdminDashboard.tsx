import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'wouter';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminTraffic from './AdminTraffic';
import AdminIssues from './AdminIssues';

type Tab = 'overview' | 'users' | 'traffic' | 'issues';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'users', label: 'Users', icon: 'group' },
  { id: 'traffic', label: 'Traffic', icon: 'bar_chart' },
  { id: 'issues', label: 'Issues', icon: 'bug_report' },
];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (loading) {
    return <div className="flex justify-center items-center min-h-dvh bg-[#F8F6F2]"><p className="text-[#9CA3AF]">Loading...</p></div>;
  }

  if (!user || (user.role !== 'admin' && user.email !== 'pbaker@smbx.ai')) {
    navigate('/chat');
    return null;
  }

  return (
    <div className="min-h-dvh bg-[#F8F6F2] flex">
      {/* Desktop sidebar — matches app's 80px icon rail style */}
      <aside className="w-20 bg-white border-r border-[#eeeef0] shadow-sm flex-col items-center py-6 shrink-0 hidden md:flex fixed top-0 left-0 h-screen z-50">
        {/* Logo → back to chat */}
        <button
          onClick={() => navigate('/chat')}
          className="border-0 bg-transparent cursor-pointer p-1 rounded-xl mb-4"
          title="Back to Chat"
          type="button"
        >
          <img src="/x.png?v=2" alt="smbx.ai" width={42} height={42} className="sidebar-x-img" style={{ display: 'block' }} />
        </button>

        <span className="text-[9px] font-bold uppercase tracking-widest text-[#5a4044] mb-3">Admin</span>

        <div className="flex flex-col items-center gap-1 w-full px-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-none cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#D44A78] bg-[#D44A78]/5'
                  : 'text-[#636467] hover:text-[#D44A78] hover:bg-[#D44A78]/5'
              }`}
              title={tab.label}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              <span className="text-[9px] font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Back to app */}
        <div className="mt-auto">
          <button
            onClick={() => navigate('/chat')}
            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border-none cursor-pointer text-[#636467] hover:text-[#D44A78] hover:bg-[#D44A78]/5"
            title="Back to Chat"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="text-[9px] font-semibold">Chat</span>
          </button>
        </div>
      </aside>

      {/* Mobile header — pill tabs matching app style */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#eeeef0] px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => navigate('/chat')}
          className="shrink-0 mr-1 border-0 bg-transparent cursor-pointer p-0"
          type="button"
        >
          <img src="/x.png?v=2" alt="smbx.ai" className="w-7 h-7" style={{ display: 'block' }} />
        </button>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#D44A78] text-white border-[#D44A78]'
                : 'bg-white text-[#6E6A63] border-[rgba(0,0,0,0.08)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content — offset by sidebar on desktop */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 md:ml-20 pt-14 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'traffic' && <AdminTraffic />}
          {activeTab === 'issues' && <AdminIssues />}
        </div>
      </main>
    </div>
  );
}
