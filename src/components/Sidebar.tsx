import React, { useState } from 'react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingSettlementsCount: number;
  pendingOnboardingCount: number;
  activeCompanyCount: number;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  pendingSettlementsCount,
  pendingOnboardingCount,
  activeCompanyCount
}: SidebarProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    dashboard: false,
    reports: false,
    transactions: false,
    admin: false,
    onboarding: false,
    risk: false,
    production: false
  });

  const toggleGroup = (group: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const navItem = (id: string, label: string, icon: string, badge?: number) => {
    const isActive = currentTab === id;
    return (
      <button
        id={`nav-item-${id}`}
        onClick={() => setCurrentTab(id)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors duration-150 text-left ${
          isActive
            ? 'bg-amber-50 text-amber-950 font-medium border-l-2 border-amber-600 pl-2.5'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center space-x-2.5">
          <i className={`${icon} text-amber-700 w-4 text-center ${isActive ? 'text-amber-800' : 'opacity-80'}`} />
          <span>{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-50 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm">
          <i className="fa-solid fa-vault text-lg" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-gray-900 tracking-tight leading-tight">WageFlow v4</h1>
          <p className="text-xs text-amber-700 font-medium">EWA 3.0 Standalone</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        
        {/* Dashboard Group */}
        <div>
          <div className="px-3 py-1 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>DASHBOARD</span>
          </div>
          <div className="mt-1 space-y-0.5">
            {navItem('overview', 'Platform Overview', 'fa-solid fa-house')}
          </div>
        </div>

        {/* Reports Group */}
        <div>
          <button
            onClick={() => toggleGroup('reports')}
            className="w-full px-3 py-1 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider text-left"
          >
            <span>📈 Ledger Reports</span>
            <i className={`fa-solid ${collapsedGroups.reports ? 'fa-chevron-right' : 'fa-chevron-down'} text-[10px]`} />
          </button>
          {!collapsedGroups.reports && (
            <div className="mt-1.5 pl-1.5 space-y-0.5 border-l border-gray-100 ml-3">
              {navItem('chart-accounts', 'Chart of Accounts', 'fa-solid fa-folder-tree')}
              {navItem('journal-entries', 'Journal Entries', 'fa-solid fa-book')}
              {navItem('general-ledger', 'General Ledger', 'fa-solid fa-list-check')}
              {navItem('trial-balance', 'Trial Balance', 'fa-solid fa-scale-balanced')}
              {navItem('balance-sheet', 'Balance Sheet', 'fa-solid fa-file-invoice-dollar')}
              {navItem('profit-loss', 'Profit & Loss', 'fa-solid fa-money-bill-trend-up')}
              {navItem('cash-flow', 'Cash Flow Statement', 'fa-solid fa-money-bill-transfer')}
              {navItem('overdue-aging', 'Overdue Aging', 'fa-solid fa-hourglass-half')}
              {navItem('transaction-summary', 'Aggregate Metrics', 'fa-solid fa-chart-pie')}
              {navItem('account-statement', 'Account Statement', 'fa-solid fa-receipt')}
            </div>
          )}
        </div>

        {/* Transactions Group */}
        <div>
          <button
            onClick={() => toggleGroup('transactions')}
            className="w-full px-3 py-1 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider text-left"
          >
            <span>⚙️ Transactions</span>
            <i className={`fa-solid ${collapsedGroups.transactions ? 'fa-chevron-right' : 'fa-chevron-down'} text-[10px]`} />
          </button>
          {!collapsedGroups.transactions && (
            <div className="mt-1.5 pl-1.5 space-y-0.5 border-l border-gray-100 ml-3">
              {navItem('settlement-queue', 'Settlement Queue', 'fa-solid fa-clipboard-list', pendingSettlementsCount)}
              {navItem('disbursement-monitor', 'Disbursement Monitor', 'fa-solid fa-money-check-dollar')}
              {navItem('qr-processing', 'QR Code Processing', 'fa-solid fa-qrcode')}
            </div>
          )}
        </div>

        {/* Admin Group */}
        <div>
          <button
            onClick={() => toggleGroup('admin')}
            className="w-full px-3 py-1 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider text-left"
          >
            <span>🏢 Admin & Config</span>
            <i className={`fa-solid ${collapsedGroups.admin ? 'fa-chevron-right' : 'fa-chevron-down'} text-[10px]`} />
          </button>
          {!collapsedGroups.admin && (
            <div className="mt-1.5 pl-1.5 space-y-0.5 border-l border-gray-100 ml-3">
              {navItem('companies', 'Companies Manager', 'fa-solid fa-building', activeCompanyCount)}
              {navItem('employees', 'Employee Directory', 'fa-solid fa-users')}
              {navItem('users', 'System Users', 'fa-solid fa-user-gear')}
              {navItem('fee-config', 'Fee Configuration', 'fa-solid fa-sliders')}
              {navItem('form-creator', 'Dynamic Form Creator', 'fa-solid fa-laptop-code')}
            </div>
          )}
        </div>

        {/* Onboarding Group */}
        <div>
          <button
            onClick={() => toggleGroup('onboarding')}
            className="w-full px-3 py-1 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider text-left"
          >
            <span>🚀 Tenant Pipelines</span>
            <i className={`fa-solid ${collapsedGroups.onboarding ? 'fa-chevron-right' : 'fa-chevron-down'} text-[10px]`} />
          </button>
          {!collapsedGroups.onboarding && (
            <div className="mt-1.5 pl-1.5 space-y-0.5 border-l border-gray-100 ml-3">
              {navItem('company-onboarding', 'Company Onboarding', 'fa-solid fa-rocket', pendingOnboardingCount)}
            </div>
          )}
        </div>

        {/* Risk Group */}
        <div>
          <button
            onClick={() => toggleGroup('risk')}
            className="w-full px-3 py-1 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider text-left"
          >
            <span>⚠️ Risk Controls</span>
            <i className={`fa-solid ${collapsedGroups.risk ? 'fa-chevron-right' : 'fa-chevron-down'} text-[10px]`} />
          </button>
          {!collapsedGroups.risk && (
            <div className="mt-1.5 pl-1.5 space-y-0.5 border-l border-gray-100 ml-3">
              {navItem('credit-assessment', 'Credit Scoring', 'fa-solid fa-gauge-high')}
              {navItem('ghost-employees', 'Ghost Employees', 'fa-solid fa-ghost')}
              {navItem('overdue-monitoring', 'Overdue Watch', 'fa-solid fa-triangle-exclamation')}
            </div>
          )}
        </div>

        {/* Production Group */}
        <div>
          <button
            onClick={() => toggleGroup('production')}
            className="w-full px-3 py-1 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider text-left"
          >
            <span>🚀 Production Export</span>
            <i className={`fa-solid ${collapsedGroups.production ? 'fa-chevron-right' : 'fa-chevron-down'} text-[10px]`} />
          </button>
          {!collapsedGroups.production && (
            <div className="mt-1.5 pl-1.5 space-y-0.5 border-l border-gray-100 ml-3">
              {navItem('publish-github', 'Publish to GitHub', 'fa-brands fa-github')}
            </div>
          )}
        </div>

      </div>

      {/* Logged in User Section */}
      <div className="p-3 border-t border-gray-50 bg-gray-50/50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-semibold">
            KS
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-semibold text-gray-900 truncate">Kaung Htet Min</h4>
            <p className="text-[10px] text-gray-500 truncate">kaunghtetmin.kght@gmail.com</p>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-center text-gray-400 font-mono">
          Operator Tenant: MYANMAR
        </div>
      </div>
    </aside>
  );
}
