import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LedgerReports from './components/LedgerReports';
import AdminCRUD from './components/AdminCRUD';
import FormCreator from './components/FormCreator';
import OnboardingWizard from './components/OnboardingWizard';
import RiskAndOps from './components/RiskAndOps';
import BudgetAnalysis from './components/BudgetAnalysis';
import NotificationCenter from './components/NotificationCenter';
import ValidationEngine from './components/ValidationEngine';

import { Company, Employee, User, FeeConfig, JournalEntry, FormSchema, CompanyOnboarding, SettlementRequest, QRProcessingRequest, DisbursementFeedItem, ValidationRule } from './types';
import { 
  SEED_COMPANIES, 
  SEED_EMPLOYEES, 
  SEED_USERS, 
  DEFAULT_FEE_CONFIG, 
  SEED_JOURNAL_ENTRIES, 
  SEED_FORMS, 
  SEED_ONBOARDINGS, 
  SEED_SETTLEMENTS, 
  SEED_QR_REQUESTS,
  loadState,
  saveState 
} from './data';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Core State
  const [companies, setCompanies] = useState<Company[]>(() => loadState('ewa_companies', SEED_COMPANIES));
  const [employees, setEmployees] = useState<Employee[]>(() => loadState('ewa_employees', SEED_EMPLOYEES));
  const [users, setUsers] = useState<User[]>(() => loadState('ewa_users', SEED_USERS));
  const [feeConfig, setFeeConfig] = useState<FeeConfig>(() => {
    const loaded = loadState('ewa_fee_config', DEFAULT_FEE_CONFIG);
    if (loaded && Array.isArray(loaded.tiers)) {
      loaded.tiers.forEach((t: any) => {
        if (t.max === null) t.max = Infinity;
      });
    }
    return loaded;
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => loadState('ewa_journal_entries', SEED_JOURNAL_ENTRIES));
  const [forms, setForms] = useState<FormSchema[]>(() => loadState('ewa_forms', SEED_FORMS));
  const [onboardings, setOnboardings] = useState<CompanyOnboarding[]>(() => loadState('ewa_onboardings', SEED_ONBOARDINGS));
  const [settlements, setSettlements] = useState<SettlementRequest[]>(() => loadState('ewa_settlements', SEED_SETTLEMENTS));
  const [qrRequests, setQrRequests] = useState<QRProcessingRequest[]>(() => loadState('ewa_qr_requests', SEED_QR_REQUESTS));
  
  // DMN Rules State
  const [rules, setRules] = useState<ValidationRule[]>(() => loadState('ewa_validation_rules', [
    { id: 'rule-1', name: 'Freeze Day Cap Check', inputField: 'payroll_frozen', operator: '==', value: 'true', action: 'BLOCK', errorMessage: 'Validation Blocked [DMN-001]: Period has closed for this cycle (Payroll Frozen).', enabled: true, priority: 100 },
    { id: 'rule-2', name: 'Active Whitelisted Status', inputField: 'nrc_verified', operator: '==', value: 'false', action: 'BLOCK', errorMessage: 'Validation Blocked [DMN-002]: Access restricted. Contact employer HR department.', enabled: true, priority: 90 },
    { id: 'rule-3', name: 'Daily Maximum EWA limit (MMK)', inputField: 'amount', operator: '>', value: '500000', action: 'BLOCK', errorMessage: 'Validation Blocked [DMN-003]: Advance request exceeding daily MMK transaction limit of {{limit}} MMK.', enabled: true, priority: 80 },
    { id: 'rule-4', name: 'Draw Cap Base Salary Limit (%)', inputField: 'salary_percentage', operator: '>', value: '50', action: 'BLOCK', errorMessage: 'Validation Blocked [DMN-004]: Request is capped at maximum {{limit}}% of employee monthly salary.', enabled: true, priority: 70 },
    { id: 'rule-5', name: 'Maker Checker Double Verification', inputField: 'amount', operator: '>', value: '300000', action: 'CHECKER_REQUIRED', errorMessage: 'Escalated [DMN-005]: High-amount transaction (> {{limit}} MMK) requires Maker-Checker secondary audit approval.', enabled: true, priority: 60 }
  ]));

  // Disbursement feed loaded from journal entries or initial mock
  const [disbursements, setDisbursements] = useState<DisbursementFeedItem[]>(() => loadState('ewa_disbursements', [
    { id: 'TX-44829', employeeName: 'Mg Kyaw', companyName: 'United Petro Co., Ltd', amount: 100000, fee: 2000, netAmount: 98000, channel: 'KBZ Pay', status: 'Success', timestamp: '2026-06-10 10:00', reference: 'EWA-TX-001' },
    { id: 'TX-55102', employeeName: 'Ma Thu Thu', companyName: 'United Petro Co., Ltd', amount: 150000, fee: 3000, netAmount: 147000, channel: 'Wave Money', status: 'Success', timestamp: '2026-06-12 12:30', reference: 'EWA-TX-002' },
    { id: 'TX-99381', employeeName: 'Ko Naing', companyName: 'Yoma Fleet Logistics', amount: 50000, fee: 1000, netAmount: 49000, channel: 'CB Pay', status: 'Success', timestamp: '2026-06-15 15:45', reference: 'EWA-TX-003' }
  ]));

  // Auto-sync states to localStorage
  useEffect(() => { saveState('ewa_companies', companies); }, [companies]);
  useEffect(() => { saveState('ewa_employees', employees); }, [employees]);
  useEffect(() => { saveState('ewa_users', users); }, [users]);
  useEffect(() => { saveState('ewa_fee_config', feeConfig); }, [feeConfig]);
  useEffect(() => { saveState('ewa_journal_entries', journalEntries); }, [journalEntries]);
  useEffect(() => { saveState('ewa_forms', forms); }, [forms]);
  useEffect(() => { saveState('ewa_onboardings', onboardings); }, [onboardings]);
  useEffect(() => { saveState('ewa_settlements', settlements); }, [settlements]);
  useEffect(() => { saveState('ewa_qr_requests', qrRequests); }, [qrRequests]);
  useEffect(() => { saveState('ewa_disbursements', disbursements); }, [disbursements]);
  useEffect(() => { saveState('ewa_validation_rules', rules); }, [rules]);

  // Counting badges
  const pendingSettlementsCount = settlements.filter(s => s.status === 'Pending' || s.status === 'Maker Approved').length;
  const pendingOnboardingCount = onboardings.filter(o => o.currentStep < o.steps.length).length;
  const activeCompanyCount = companies.filter(c => c.status === 'Active').length;

  // --- Core Simulation logic: 7-Point Validation, GoRule Fees, Circle Ledger Posting ---
  const addSimulatedTransaction = (
    amount: number,
    type: 'disburse' | 'repay',
    employeeId: number,
    channel: string = 'MoMoney',
    repaymentMethod: string = 'Bank'
  ): { success: boolean; message: string } => {
    
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return { success: false, message: 'Employee profile not found.' };

    const company = companies.find(c => c.id === emp.companyId);
    if (!company) return { success: false, message: 'Employer company not registered.' };

    if (type === 'disburse') {
      // Execute 7-Point Pre-Disbursement Validation (BRD UC-22)
      
      // Check 1: Employee Active
      if (emp.status !== 'Active') {
        return { success: false, message: 'Validation Blocked [EWA-001]: Your account is not active. Contact HR.' };
      }

      // Check 2: Whitelisted Trusted Employee
      if (!emp.trusted) {
        return { success: false, message: 'Validation Blocked [EWA-002]: EWA access not enabled. Contact HR.' };
      }

      const effectiveFreezeDay = company.config?.payrollCutoffDay || feeConfig.freezeDay;
      const effectiveMaxPercent = company.config?.maxPercentSalary || feeConfig.maxPercentSalary;
      const effectiveFeeModel = (company.config?.feeModel && company.config.feeModel !== 'system_default') ? company.config.feeModel : feeConfig.model;
      
      const effectiveMaxRequests = company.config?.maxMonthlyRequests || feeConfig.maxMonthlyRequests;

      // Check 3: Drawing Window (System simulated date is 2026-06-29, freeze on 24th)
      const currentDay = 29; // simulated system day
      if (currentDay >= effectiveFreezeDay) {
        return { success: false, message: 'Validation Blocked [EWA-003]: Request period has ended for this cycle (Payroll Frozen).' };
      }

      // Add Check for Gap Days
      const gapEndDay = effectiveFreezeDay + (company.config?.gapDaysAfterPayroll ?? feeConfig.gapDaysAfterPayroll);
      if (currentDay > effectiveFreezeDay && currentDay <= gapEndDay) {
        return { success: false, message: `Validation Blocked [EWA-003]: We are currently in the ${company.config?.gapDaysAfterPayroll ?? feeConfig.gapDaysAfterPayroll}-day settlement gap period. EWA will resume shortly.` };
      }

      // Check 4: Duplicate Pending Checks
      const hasPending = disbursements.some(d => d.employeeName === emp.name && d.status === 'Pending');
      if (hasPending) {
        return { success: false, message: 'Validation Blocked [EWA-004]: You have a pending advance request.' };
      }

      // Check 5: Limit Checks
      const maxAllowed = (emp.salary * effectiveMaxPercent) / 100;
      if (amount > maxAllowed) {
        return { success: false, message: `Validation Blocked [EWA-005]: Amount exceeds available limit of ${maxAllowed.toLocaleString()} MMK (max ${effectiveMaxPercent}% of base salary).` };
      }
      if (amount < feeConfig.minAmount || amount > feeConfig.maxAmount) {
        return { success: false, message: `Validation Blocked [EWA-005]: Amount must be between ${feeConfig.minAmount.toLocaleString()} and ${feeConfig.maxAmount.toLocaleString()} MMK.` };
      }

      // Check 6: Velocity checks (Simulated monthly request constraints)
      const empRequestsThisMonth = disbursements.filter(d => d.employeeName === emp.name).length;
      if (empRequestsThisMonth >= effectiveMaxRequests) {
        return { success: false, message: `Validation Blocked [EWA-006]: Maximum monthly requests (${effectiveMaxRequests}) reached.` };
      }

      // Check 7: Budget Availability Checks
      const potentialUtilized = company.utilized + amount;
      if (potentialUtilized > company.budget) {
        return { success: false, message: 'Validation Blocked [EWA-018]: Company budget exhausted. Contact administrator.' };
      }

      // All 7 Checks Passed! Run GoRule Fee calculation (Flat, Percent, or Tiered)
      let fee = feeConfig.flatFee;
      if (effectiveFeeModel === 'percentage') {
        fee = Math.round((amount * feeConfig.percentage) / 100);
      } else if (effectiveFeeModel === 'tiered') {
        const matchingTier = feeConfig.tiers.find(t => amount > t.min && amount <= t.max);
        fee = matchingTier ? matchingTier.rate : 1500;
      }

      const netAmount = amount - fee;

      // Update Company utilized balance
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, utilized: c.utilized + amount } : c));

      // Append successful disbursement to logs
      const txId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;
      const refCode = `EWA-TX-${Math.floor(100 + Math.random() * 900)}`;
      const newDisb: DisbursementFeedItem = {
        id: txId,
        employeeName: emp.name,
        companyName: company.name,
        amount,
        fee,
        netAmount,
        channel,
        status: 'Success',
        timestamp: '2026-06-29 15:45',
        reference: refCode
      };
      setDisbursements(prev => [newDisb, ...prev]);

      // Write Circle-Ledger balanced journal entries (Debits = Credits)
      // Entry 1: EWA Advance Receivable DEBIT, Cash Pool CREDIT
      const journalId1 = `JE-${Math.floor(10000 + Math.random() * 90000)}`;
      const j1: JournalEntry = {
        id: journalId1,
        date: '2026-06-29',
        description: `EWA Advance Salary Disbursement - ${emp.code}`,
        debitAccount: '1200', // Asset Increase
        debitAmount: amount,
        creditAccount: '1100', // Asset Decrease
        creditAmount: netAmount,
        reference: refCode,
        companyId: company.id,
        employeeId: emp.id
      };

      // Entry 2: EWA Service Fee Revenue CREDIT, EWA Service Fee Receivable DEBIT (then cleared against cash)
      const journalId2 = `JE-${Math.floor(10000 + Math.random() * 90000)}`;
      const j2: JournalEntry = {
        id: journalId2,
        date: '2026-06-29',
        description: `EWA Service Fee Charged - ${emp.code}`,
        debitAccount: '1100', // Cash Pool Debit (increases Cash with fee amount since deducted from payout)
        debitAmount: fee,
        creditAccount: '4100', // Income Credit (increases revenue)
        creditAmount: fee,
        reference: refCode,
        companyId: company.id,
        employeeId: emp.id
      };

      setJournalEntries(prev => [...prev, j1, j2]);

      return {
        success: true,
        message: `SUCCESS! 7-Point pre-disbursement validation passed. Disbursed ${netAmount.toLocaleString()} MMK (Fee: ${fee.toLocaleString()} MMK) via KBZ Pay. EWA Ledger entries posted and balanced.`
      };

    } else {
      // Repay All Corporate Settlement
      const outstandingAmt = company.utilized;
      if (outstandingAmt <= 0) {
        return { success: false, message: `${company.name} has zero utilized outstanding balance. No settlement required.` };
      }

      // Reset utilized budget to 0
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, utilized: 0 } : c));

      // Append settlement logs
      const refCode = `SET-${Math.floor(10000 + Math.random() * 90000)}`;
      const newSettlement: SettlementRequest = {
        id: Date.now(),
        companyId: company.id,
        companyName: company.name,
        amount: outstandingAmt,
        reference: refCode,
        repaymentMethod: repaymentMethod as any,
        source: 'Manual',
        status: 'Approved',
        submittedAt: '2026-06-29 15:46',
        verifiedAt: '2026-06-29 15:46',
        approvedAt: '2026-06-29 15:46'
      };
      setSettlements(prev => [newSettlement, ...prev]);

      // Balanced Circle-Ledger Entries
      const journalId = `JE-${Math.floor(10000 + Math.random() * 90000)}`;
      const je: JournalEntry = {
        id: journalId,
        date: '2026-06-29',
        description: `Corporate Repayment Clearing Outstanding - ${company.name}`,
        debitAccount: '1100', // Cash Increases
        debitAmount: outstandingAmt,
        creditAccount: '1200', // Receivables Decreases
        creditAmount: outstandingAmt,
        reference: refCode,
        companyId: company.id
      };

      setJournalEntries(prev => [...prev, je]);

      return {
        success: true,
        message: `SUCCESS! Cleared ${outstandingAmt.toLocaleString()} MMK outstanding utilized balance for ${company.name}. Circle Ledger posted DEBIT 1100 (Cash), CREDIT 1200 (Receivables).`
      };
    }
  };

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans text-gray-800 antialiased overflow-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingSettlementsCount={pendingSettlementsCount}
        pendingOnboardingCount={pendingOnboardingCount}
        activeCompanyCount={activeCompanyCount}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      {/* Main Panel Content Scroll Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-gray-150 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="text-gray-400">Section</span>
            <i className="fa-solid fa-chevron-right text-[10px] text-gray-300" />
            <span className="text-emerald-950 font-bold">{currentTab.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* System Version */}
            <span className="text-[10px] font-bold font-mono bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-100">
              BUILD v4.0.0
            </span>
            <span className="text-xs text-gray-400 font-medium">Kaung Htet Min (kaunghtetmin.kght@gmail.com)</span>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Main Tabs Route Mapping */}
            {currentTab === 'overview' && (
              <Dashboard
                companies={companies}
                employees={employees}
                journalEntries={journalEntries}
                addSimulatedTransaction={addSimulatedTransaction}
                setCurrentTab={setCurrentTab}
              />
            )}

            {/* Accounting Reports Sub-routes */}
            {['chart-accounts', 'journal-entries', 'general-ledger', 'trial-balance', 'balance-sheet', 'profit-loss', 'cash-flow', 'overdue-aging', 'transaction-summary', 'account-statement'].includes(currentTab) && (
              <LedgerReports
                companies={companies}
                employees={employees}
                journalEntries={journalEntries}
                disbursements={disbursements}
                settlements={settlements}
                currentReportTab={currentTab}
              />
            )}

            {/* Transactions Operations Routes */}
            {['settlement-queue', 'disbursement-monitor', 'qr-processing', 'credit-assessment', 'ghost-employees', 'overdue-monitoring'].includes(currentTab) && (
              <RiskAndOps
                companies={companies}
                setCompanies={setCompanies}
                employees={employees}
                setEmployees={setEmployees}
                journalEntries={journalEntries}
                setJournalEntries={setJournalEntries}
                settlements={settlements}
                setQrRequests={setQrRequests}
                setSettlements={setSettlements}
                qrRequests={qrRequests}
                disbursements={disbursements}
                setDisbursements={setDisbursements}
                activeTab={currentTab}
              />
            )}

            {/* Corporate Budget & Exposure Analysis */}
            {currentTab === 'budget-analysis' && (
              <BudgetAnalysis
                companies={companies}
                employees={employees}
                feeConfig={feeConfig}
                setCompanies={setCompanies}
              />
            )}

            {/* Admin and CRUD configuration Routes */}
            {['companies', 'employees', 'users', 'fee-config'].includes(currentTab) && (
              <AdminCRUD
                companies={companies}
                setCompanies={setCompanies}
                employees={employees}
                setEmployees={setEmployees}
                users={users}
                setUsers={setUsers}
                feeConfig={feeConfig}
                setFeeConfig={setFeeConfig}
                activeSubTab={currentTab}
                disbursements={disbursements}
              />
            )}

            {/* Dynamic Form Creator */}
            {currentTab === 'form-creator' && (
              <FormCreator
                forms={forms}
                setForms={setForms}
              />
            )}

            {/* Onboarding Wizard Steps */}
            {currentTab === 'company-onboarding' && (
              <OnboardingWizard
                onboardings={onboardings}
                setOnboardings={setOnboardings}
                companies={companies}
                setCompanies={setCompanies}
              />
            )}

            {/* Bulk Notification Command Center */}
            {currentTab === 'notifications' && (
              <NotificationCenter
                companies={companies}
                employees={employees}
              />
            )}

            {/* DMN Decision Validation Engine Rules */}
            {currentTab === 'validation-engine' && (
              <ValidationEngine
                companies={companies}
                employees={employees}
                rules={rules}
                setRules={setRules}
              />
            )}

            {/* Publish to GitHub Developer Hub */}

          </div>
        </main>

      </div>

    </div>
  );
}
