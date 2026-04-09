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
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-[#EEEEF0] p-4 flex flex-col shrink-0 hidden md:flex">
        <a href="/" className="flex items-center gap-2 mb-8">
          <img src="/x.png?v=2" alt="smbx.ai" className="w-8 h-8" />
          <span className="font-headline font-bold text-sm">smbx.ai</span>
        </a>

        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5d5e61] mb-3">Admin Console</p>

        <nav className="space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-none cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#D44A78]/10 text-[#D44A78]'
                  : 'bg-transparent text-[#5d5e61] hover:bg-[#f3f3f6]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-[#EEEEF0]">
          <a
            href="/chat"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#5d5e61] hover:bg-[#f3f3f6] transition-all no-underline"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to App
          </a>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#EEEEF0] px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <a href="/" className="shrink-0 mr-2">
          <img src="/x.png?v=2" alt="smbx.ai" className="w-6 h-6" />
        </a>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#D44A78] text-white'
                : 'bg-[#f3f3f6] text-[#5d5e61]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 md:pt-8 pt-14">
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
