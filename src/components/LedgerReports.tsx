import React, { useState } from 'react';
import { Company, Employee, JournalEntry, GLAccount } from '../types';
import { CHART_OF_ACCOUNTS, getAccountBalances } from '../data';

interface LedgerReportsProps {
  companies: Company[];
  employees: Employee[];
  journalEntries: JournalEntry[];
  currentReportTab: string; // which report sub-tab
}

export default function LedgerReports({
  companies,
  employees,
  journalEntries,
  currentReportTab
}: LedgerReportsProps) {
  const [selectedAccountCode, setSelectedAccountCode] = useState<string>('1100');
  const [journalFilter, setJournalFilter] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const balances = getAccountBalances(journalEntries);

  // Helper to generate CSV and trigger a simulated download
  const handleExportCSV = (reportName: string, headers: string[], rows: string[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported ${reportName} to CSV successfully.`);
  };

  // --- REPORT 1: Chart of Accounts ---
  const renderChartOfAccounts = () => {
    const headers = ['Account Code', 'Account Name', 'Account Type', 'Opening Balance (MMK)', 'Current Balance (MMK)'];
    const rows = CHART_OF_ACCOUNTS.map(acc => [
      acc.code,
      acc.name,
      acc.type,
      acc.openingBalance.toLocaleString(),
      (balances[acc.code] || 0).toLocaleString()
    ]);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Chart of Accounts (COA)</h3>
            <p className="text-xs text-gray-500">Platform primary ledger accounts and active balances.</p>
          </div>
          <button
            onClick={() => handleExportCSV('Chart_of_Accounts', headers, rows)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg font-medium flex items-center space-x-1 cursor-pointer"
          >
            <i className="fa-solid fa-download" /> <span>Export CSV</span>
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                <th className="p-3">Code</th>
                <th className="p-3">Account Name</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Opening Balance (MMK)</th>
                <th className="p-3 text-right font-semibold text-gray-700">Current Balance (MMK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-mono text-gray-600">
              {CHART_OF_ACCOUNTS.map(acc => {
                const bal = balances[acc.code] || 0;
                return (
                  <tr key={acc.code} className="hover:bg-amber-50/10">
                    <td className="p-3 font-semibold text-amber-950">{acc.code}</td>
                    <td className="p-3 font-sans text-gray-900 font-medium">{acc.name}</td>
                    <td className="p-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                        acc.type === 'Asset' ? 'bg-emerald-50 text-emerald-800' :
                        acc.type === 'Liability' ? 'bg-rose-50 text-rose-800' :
                        acc.type === 'Income' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="p-3 text-right">{acc.openingBalance.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-gray-900">{bal.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- REPORT 2: Journal Entries ---
  const renderJournalEntries = () => {
    const filteredEntries = journalEntries.filter(entry => {
      const matchText = journalFilter.toLowerCase();
      return (
        entry.id.toLowerCase().includes(matchText) ||
        entry.description.toLowerCase().includes(matchText) ||
        entry.debitAccount.includes(matchText) ||
        entry.creditAccount.includes(matchText) ||
        (entry.reference && entry.reference.toLowerCase().includes(matchText))
      );
    });

    const headers = ['ID', 'Date', 'Description', 'Debit Account', 'Debit Amount', 'Credit Account', 'Credit Amount', 'Reference'];
    const rows = filteredEntries.map(e => [
      e.id, e.date, e.description, e.debitAccount, e.debitAmount.toString(), e.creditAccount, e.creditAmount.toString(), e.reference
    ]);

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Journal Entries Ledger</h3>
            <p className="text-xs text-gray-500 font-sans">Chronological list of double-entry records.</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search journals..."
              value={journalFilter}
              onChange={(e) => setJournalFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
            />
            <button
              onClick={() => handleExportCSV('Journal_Entries', headers, rows)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg font-medium flex items-center space-x-1 cursor-pointer"
            >
              <i className="fa-solid fa-download" /> <span>Export CSV</span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                <th className="p-3">JE-ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Description / Narrative</th>
                <th className="p-3">Debit Account</th>
                <th className="p-3 text-right">Debit (MMK)</th>
                <th className="p-3">Credit Account</th>
                <th className="p-3 text-right">Credit (MMK)</th>
                <th className="p-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-mono text-gray-600">
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-amber-50/10">
                  <td className="p-3 text-amber-900 font-semibold">{entry.id}</td>
                  <td className="p-3 font-sans text-gray-500 whitespace-nowrap">{entry.date}</td>
                  <td className="p-3 font-sans text-gray-900 font-medium max-w-xs truncate" title={entry.description}>
                    {entry.description}
                  </td>
                  <td className="p-3 text-emerald-800 font-semibold">{entry.debitAccount}</td>
                  <td className="p-3 text-right text-emerald-700 font-semibold">{entry.debitAmount.toLocaleString()}</td>
                  <td className="p-3 text-rose-800 font-semibold">{entry.creditAccount}</td>
                  <td className="p-3 text-right text-rose-700 font-semibold">{entry.creditAmount.toLocaleString()}</td>
                  <td className="p-3 font-sans text-gray-500">{entry.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- REPORT 3: General Ledger ---
  const renderGeneralLedger = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900">General Ledger (GL) Details</h3>
          <p className="text-xs text-gray-500">Account-wise breakdown with running balance calculations.</p>
        </div>

        {CHART_OF_ACCOUNTS.map(acc => {
          let runningBalance = acc.openingBalance;
          const accountEntries = journalEntries.filter(e => e.debitAccount === acc.code || e.creditAccount === acc.code);

          if (accountEntries.length === 0) return null;

          return (
            <div key={acc.code} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">
                  {acc.code} — {acc.name} <span className="font-sans text-gray-400 font-normal uppercase">({acc.type})</span>
                </span>
                <span className="text-xs font-mono font-semibold text-amber-900">
                  Opening Balance: {acc.openingBalance.toLocaleString()} MMK
                </span>
              </div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100/50 border-b border-gray-100 text-gray-500 font-semibold uppercase font-sans">
                    <th className="p-3">Date</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Narrative</th>
                    <th className="p-3 text-right">Debit (MMK)</th>
                    <th className="p-3 text-right">Credit (MMK)</th>
                    <th className="p-3 text-right font-bold text-amber-950">Running Balance (MMK)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-mono text-gray-600">
                  {accountEntries.map(entry => {
                    const isDebit = entry.debitAccount === acc.code;
                    const change = isDebit ? entry.debitAmount : entry.creditAmount;
                    
                    if (acc.type === 'Asset' || acc.type === 'Expense') {
                      runningBalance = isDebit ? runningBalance + change : runningBalance - change;
                    } else {
                      runningBalance = isDebit ? runningBalance - change : runningBalance + change;
                    }

                    return (
                      <tr key={entry.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-sans text-gray-500">{entry.date}</td>
                        <td className="p-3">{entry.reference}</td>
                        <td className="p-3 font-sans text-gray-800">{entry.description}</td>
                        <td className="p-3 text-right text-emerald-700">{isDebit ? change.toLocaleString() : '-'}</td>
                        <td className="p-3 text-right text-rose-700">{!isDebit ? change.toLocaleString() : '-'}</td>
                        <td className="p-3 text-right font-bold text-gray-900">{runningBalance.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  // --- REPORT 4: Trial Balance ---
  const renderTrialBalance = () => {
    let totalDebitSum = 0;
    let totalCreditSum = 0;

    const rows = CHART_OF_ACCOUNTS.map(acc => {
      // Calculate Debits and Credits during the period
      const debits = journalEntries.filter(e => e.debitAccount === acc.code).reduce((sum, e) => sum + e.debitAmount, 0);
      const credits = journalEntries.filter(e => e.creditAccount === acc.code).reduce((sum, e) => sum + e.creditAmount, 0);
      const currentBal = balances[acc.code] || 0;

      totalDebitSum += debits;
      totalCreditSum += credits;

      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        opening: acc.openingBalance,
        debits,
        credits,
        closing: currentBal
      };
    });

    const headers = ['Account Code', 'Account Name', 'Type', 'Opening (MMK)', 'Debits (MMK)', 'Credits (MMK)', 'Closing Balance (MMK)'];
    const csvRows = rows.map(r => [
      r.code, r.name, r.type, r.opening.toString(), r.debits.toString(), r.credits.toString(), r.closing.toString()
    ]);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Trial Balance Sheet</h3>
            <p className="text-xs text-gray-500 font-sans">Summary showing opening, aggregate debits/credits, and closing balance per account.</p>
          </div>
          <button
            onClick={() => handleExportCSV('Trial_Balance', headers, csvRows)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg font-medium flex items-center space-x-1 cursor-pointer"
          >
            <i className="fa-solid fa-download" /> <span>Export CSV</span>
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                <th className="p-3">Code</th>
                <th className="p-3">Account Name</th>
                <th className="p-3 text-right">Opening (MMK)</th>
                <th className="p-3 text-right">Debits (MMK)</th>
                <th className="p-3 text-right">Credits (MMK)</th>
                <th className="p-3 text-right font-bold text-gray-900">Closing Balance (MMK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-mono text-gray-600">
              {rows.map(row => (
                <tr key={row.code} className="hover:bg-amber-50/10">
                  <td className="p-3 font-semibold text-amber-950">{row.code}</td>
                  <td className="p-3 font-sans text-gray-800 font-medium">{row.name}</td>
                  <td className="p-3 text-right">{row.opening.toLocaleString()}</td>
                  <td className="p-3 text-right text-emerald-700 font-semibold">+{row.debits.toLocaleString()}</td>
                  <td className="p-3 text-right text-rose-700 font-semibold">-{row.credits.toLocaleString()}</td>
                  <td className="p-3 text-right font-bold text-gray-900">{row.closing.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-gray-50/50 border-t-2 border-gray-200 font-bold text-gray-900">
                <td colSpan={3} className="p-3 text-right font-sans">Total Aggregate Adjustments:</td>
                <td className="p-3 text-right text-emerald-800">{totalDebitSum.toLocaleString()}</td>
                <td className="p-3 text-right text-rose-800">{totalCreditSum.toLocaleString()}</td>
                <td className="p-3 text-right text-amber-900 font-sans font-bold">In Balance</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- REPORT 5: Balance Sheet ---
  const renderBalanceSheet = () => {
    const assets = CHART_OF_ACCOUNTS.filter(a => a.type === 'Asset');
    const liabilities = CHART_OF_ACCOUNTS.filter(a => a.type === 'Liability');
    const equity = CHART_OF_ACCOUNTS.filter(a => a.type === 'Equity');

    const totalAssetsVal = assets.reduce((sum, a) => sum + (balances[a.code] || 0), 0);
    const totalLiabilitiesVal = liabilities.reduce((sum, a) => sum + (balances[a.code] || 0), 0);
    const totalEquityVal = equity.reduce((sum, a) => sum + (balances[a.code] || 0), 0);

    // Dynamic Retained earnings (Net Income from current ledger operations)
    const rev = (balances['4100'] || 0) + (balances['4200'] || 0);
    const exp = (balances['5100'] || 0) + (balances['5200'] || 0);
    const currentRetained = rev - exp;

    const totalEquityPlusLiabilities = totalLiabilitiesVal + totalEquityVal + currentRetained;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Balance Sheet Report</h3>
          <p className="text-xs text-gray-500">Summary of platform assets, liabilities, and equity capital position as of today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Hand: Assets */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm p-4 space-y-3">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b border-gray-50 pb-2">ASSETS</h4>
            <div className="divide-y divide-gray-50">
              {assets.map(acc => (
                <div key={acc.code} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{acc.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">Code {acc.code}</span>
                  </div>
                  <span className="font-bold font-mono text-gray-800">{(balances[acc.code] || 0).toLocaleString()} MMK</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t-2 border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-950 bg-emerald-50/50 p-2.5 rounded-lg">
              <span>Total Assets:</span>
              <span className="font-mono">{totalAssetsVal.toLocaleString()} MMK</span>
            </div>
          </div>

          {/* Right Hand: Liabilities & Equity */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm p-4 space-y-3">
            <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider border-b border-gray-50 pb-2">LIABILITIES</h4>
            <div className="divide-y divide-gray-50">
              {liabilities.map(acc => (
                <div key={acc.code} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{acc.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">Code {acc.code}</span>
                  </div>
                  <span className="font-bold font-mono text-gray-800">{(balances[acc.code] || 0).toLocaleString()} MMK</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-rose-950">
              <span>Total Liabilities:</span>
              <span className="font-mono">{totalLiabilitiesVal.toLocaleString()} MMK</span>
            </div>

            <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider border-b border-gray-50 pb-2 pt-4">EQUITY</h4>
            <div className="divide-y divide-gray-50">
              {equity.map(acc => (
                <div key={acc.code} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{acc.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">Code {acc.code}</span>
                  </div>
                  <span className="font-bold font-mono text-gray-800">{(balances[acc.code] || 0).toLocaleString()} MMK</span>
                </div>
              ))}
              {/* Retained Earnings */}
              <div className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900">Current Retained Earnings</span>
                  <span className="text-[10px] text-gray-400 font-sans">Net Income current period</span>
                </div>
                <span className="font-bold font-mono text-gray-800">{currentRetained.toLocaleString()} MMK</span>
              </div>
            </div>
            <div className="pt-3 border-t-2 border-blue-100 flex items-center justify-between text-xs font-bold text-blue-950 bg-blue-50/50 p-2.5 rounded-lg">
              <span>Total Liabilities & Equity:</span>
              <span className="font-mono">{totalEquityPlusLiabilities.toLocaleString()} MMK</span>
            </div>
          </div>

        </div>

        {/* Assets must equal Liabilities + Equity */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center space-x-3 text-xs text-amber-900">
          <i className="fa-solid fa-scale-balanced text-lg text-amber-700" />
          <div>
            <strong>Circle Ledger Verification:</strong> Assets (<span className="font-mono font-bold">{totalAssetsVal.toLocaleString()}</span>) 
            = Liabilities + Equity (<span className="font-mono font-bold">{totalEquityPlusLiabilities.toLocaleString()}</span>). 
            Accounting balance is in perfect equilibrium.
          </div>
        </div>

      </div>
    );
  };

  // --- REPORT 6: Profit & Loss ---
  const renderProfitAndLoss = () => {
    const feeRevenue = balances['4100'] || 0;
    const lateRevenue = balances['4200'] || 0;
    const badDebt = balances['5100'] || 0;
    const gatewayFees = balances['5200'] || 0;

    const totalIncome = feeRevenue + lateRevenue;
    const totalExpenses = badDebt + gatewayFees;
    const netIncome = totalIncome - totalExpenses;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Profit & Loss (P&L) Statement</h3>
          <p className="text-xs text-gray-500">Summary of operator fee revenues and operational expenditures for the period.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm max-w-2xl">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">P&L Statement Summary</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase">Currency: MMK</span>
          </div>
          <div className="p-4 space-y-4 text-xs">
            
            {/* Income */}
            <div className="space-y-2">
              <h4 className="font-bold text-emerald-800 border-b border-gray-100 pb-1 uppercase tracking-wider text-[10px]">OPERATING REVENUES</h4>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">EWA Transaction Service Fee Income (4100)</span>
                <span className="font-mono font-bold text-gray-800">{feeRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Late Payment Penalty Revenue (4200)</span>
                <span className="font-mono font-bold text-gray-800">{lateRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-dashed border-gray-100 font-semibold text-gray-900 bg-emerald-50/30 p-1.5 rounded">
                <span>Total Operating Revenue:</span>
                <span className="font-mono">{totalIncome.toLocaleString()}</span>
              </div>
            </div>

            {/* Expenses */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-rose-800 border-b border-gray-100 pb-1 uppercase tracking-wider text-[10px]">OPERATING EXPENDITURES</h4>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Bad Debt Write-Off Loss Expense (5100)</span>
                <span className="font-mono font-bold text-gray-800">({badDebt.toLocaleString()})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Disbursement Bank Gateway Service Fees (5200)</span>
                <span className="font-mono font-bold text-gray-800">({gatewayFees.toLocaleString()})</span>
              </div>
              <div className="flex justify-between py-1 border-t border-dashed border-gray-100 font-semibold text-gray-900 bg-rose-50/30 p-1.5 rounded">
                <span>Total Operating Expenditures:</span>
                <span className="font-mono">({totalExpenses.toLocaleString()})</span>
              </div>
            </div>

            {/* Net Income */}
            <div className="pt-4 border-t-2 border-amber-200 flex items-center justify-between font-bold text-sm text-amber-950 bg-amber-50/50 p-3 rounded-lg">
              <span>NET INCOME (PROFIT):</span>
              <span className="font-mono">{netIncome.toLocaleString()} MMK</span>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // --- REPORT 7: Cash Flow Statement ---
  const renderCashFlow = () => {
    // Basic Cash Flow statement based on Cash Account 1100 transactions
    const debitCashEntries = journalEntries.filter(e => e.debitAccount === '1100');
    const creditCashEntries = journalEntries.filter(e => e.creditAccount === '1100');

    // Categorize cash transactions
    // Financing: 3000 (Capital)
    // Operating: fees, disbursements, collections
    let financingIn = debitCashEntries.filter(e => e.creditAccount === '3000').reduce((sum, e) => sum + e.debitAmount, 0);
    
    let operatingIn = debitCashEntries.filter(e => e.creditAccount !== '3000').reduce((sum, e) => sum + e.debitAmount, 0);
    let operatingOut = creditCashEntries.reduce((sum, e) => sum + e.creditAmount, 0);

    const netOperating = operatingIn - operatingOut;
    const netFinancing = financingIn;
    const netChange = netOperating + netFinancing;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Statement of Cash Flows</h3>
          <p className="text-xs text-gray-500">Platform liquidity movements categorized by operating and financing workflows.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm max-w-2xl">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">Cash Flow Metrics</span>
            <span className="text-[10px] font-semibold text-gray-400">Account 1100</span>
          </div>
          <div className="p-4 space-y-4 text-xs">
            
            {/* Operating Activities */}
            <div className="space-y-2">
              <h4 className="font-bold text-amber-800 border-b border-gray-100 pb-1 uppercase tracking-wider text-[10px]">Operating Cash Flows</h4>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Cash Received from EWA Fee Service Recoveries</span>
                <span className="font-mono text-emerald-700 font-semibold">+{operatingIn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Cash Disbursed for Employee Salary Advances</span>
                <span className="font-mono text-rose-700 font-semibold">({operatingOut.toLocaleString()})</span>
              </div>
              <div className="flex justify-between py-1 border-t border-dashed border-gray-100 font-bold text-gray-900">
                <span>Net Cash from Operating Activities:</span>
                <span className={`font-mono ${netOperating >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {netOperating >= 0 ? '+' : ''}{netOperating.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Financing Activities */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-blue-800 border-b border-gray-100 pb-1 uppercase tracking-wider text-[10px]">Financing Cash Flows</h4>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Capital Reserve Equity Seed Funding (Credit Account 3000)</span>
                <span className="font-mono text-emerald-700 font-semibold">+{netFinancing.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-dashed border-gray-100 font-bold text-gray-900">
                <span>Net Cash from Financing Activities:</span>
                <span className="font-mono text-emerald-700">+{netFinancing.toLocaleString()}</span>
              </div>
            </div>

            {/* Reconciliation */}
            <div className="pt-4 border-t-2 border-amber-200 space-y-2 font-bold text-amber-950 bg-amber-50/50 p-3 rounded-lg">
              <div className="flex justify-between">
                <span>NET CUMULATIVE CHANGE IN LIQUIDITY:</span>
                <span className="font-mono">{netChange.toLocaleString()} MMK</span>
              </div>
              <div className="flex justify-between border-t border-amber-100 pt-1 text-[11px] font-normal text-gray-500 font-sans">
                <span>Starting Capital Reserve:</span>
                <span className="font-mono">500,000,000</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-900">
                <span>End-Of-Period Cash Pool Balance:</span>
                <span className="font-mono">{(balances['1100'] || 0).toLocaleString()} MMK</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // --- REPORT 8: Overdue Aging ---
  const renderOverdueAging = () => {
    // Generate simple buckets for demo purposes
    const buckets = [
      { range: '0 - 10 Days Late', count: 1, amount: 120000, lateFee: 5400, company: 'Apex Retail' },
      { range: '11 - 30 Days Late', count: 0, amount: 0, lateFee: 0, company: '-' },
      { range: '31+ Days Late', count: 0, amount: 0, lateFee: 0, company: '-' }
    ];

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Repayments Overdue Aging</h3>
          <p className="text-xs text-gray-500">Aging brackets detailing late repayments and penalty accruals (0.15% per day).</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                <th className="p-3">Aging Range</th>
                <th className="p-3">Company Target</th>
                <th className="p-3 text-center">Unresolved Accounts</th>
                <th className="p-3 text-right font-semibold">Overdue Principal (MMK)</th>
                <th className="p-3 text-right text-rose-700 font-bold">Late Penalty Charged (MMK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-mono text-gray-600">
              {buckets.map((b, idx) => (
                <tr key={idx} className="hover:bg-amber-50/10">
                  <td className="p-3 font-semibold text-gray-900 font-sans">{b.range}</td>
                  <td className="p-3 font-sans text-gray-600">{b.company}</td>
                  <td className="p-3 text-center font-sans">{b.count}</td>
                  <td className="p-3 text-right">{b.amount.toLocaleString()}</td>
                  <td className="p-3 text-right text-rose-700 font-bold">{b.lateFee.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- REPORT 9: Transaction Summary ---
  const renderTransactionSummary = () => {
    const totalTransactions = journalEntries.filter(e => e.debitAccount === '1200').length;
    const totalDisbursedAmt = journalEntries.filter(e => e.debitAccount === '1200').reduce((sum, e) => sum + e.debitAmount, 0);
    const totalRepaidAmt = journalEntries.filter(e => e.creditAccount === '1200').reduce((sum, e) => sum + e.creditAmount, 0);

    const activeOutstanding = totalDisbursedAmt - totalRepaidAmt;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Aggregate Platform Metrics</h3>
          <p className="text-xs text-gray-500 font-sans">Visual metrics summarizing overall system traffic, utilization, and collection status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Disbursement Velocity</span>
            <div className="mt-4">
              <h4 className="text-xl font-bold font-mono text-gray-900">{totalDisbursedAmt.toLocaleString()} MMK</h4>
              <p className="text-[10px] text-gray-400 mt-1">{totalTransactions} total requests executed</p>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Collection Rate</span>
            <div className="mt-4">
              <h4 className="text-xl font-bold font-mono text-gray-900">{totalRepaidAmt.toLocaleString()} MMK</h4>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">
                {totalDisbursedAmt > 0 ? ((totalRepaidAmt / totalDisbursedAmt) * 100).toFixed(1) : '0'}% recovery rate
              </p>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${totalDisbursedAmt > 0 ? (totalRepaidAmt / totalDisbursedAmt) * 100 : 0}%` }}></div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Outstanding Exposure</span>
            <div className="mt-4">
              <h4 className="text-xl font-bold font-mono text-rose-900">{activeOutstanding.toLocaleString()} MMK</h4>
              <p className="text-[10px] text-gray-400 mt-1">Pending payroll deduction period</p>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-rose-600 h-full rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- REPORT 10: Account Statement ---
  const renderAccountStatement = () => {
    const selectedAcc = CHART_OF_ACCOUNTS.find(a => a.code === selectedAccountCode) || CHART_OF_ACCOUNTS[0];
    let runningBalance = selectedAcc.openingBalance;
    const entries = journalEntries.filter(e => e.debitAccount === selectedAcc.code || e.creditAccount === selectedAcc.code);

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Bank-Style Account Statement</h3>
            <p className="text-xs text-gray-500 font-sans">Audit view for selected account ledger records.</p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-gray-600 font-sans">Select Account:</label>
            <select
              value={selectedAccountCode}
              onChange={(e) => setSelectedAccountCode(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {CHART_OF_ACCOUNTS.map(a => (
                <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 text-xs">
            <div>
              <p className="text-[10px] text-gray-400 font-sans">Account Code / Title</p>
              <h4 className="font-bold text-gray-900 text-sm mt-0.5">{selectedAcc.code} - {selectedAcc.name}</h4>
              <p className="text-[10px] text-amber-800 font-medium font-sans uppercase bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">
                Type: {selectedAcc.type}
              </p>
            </div>
            <div className="text-right sm:text-right mt-3 sm:mt-0 font-sans">
              <p className="text-[10px] text-gray-400">Statement Date</p>
              <p className="font-semibold text-gray-900 mt-0.5">June 29, 2026</p>
              <p className="text-[10px] text-gray-500 mt-1">
                Opening Balance: <span className="font-mono font-bold text-gray-700">{selectedAcc.openingBalance.toLocaleString()} MMK</span>
              </p>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 font-semibold uppercase font-sans">
                <th className="p-2">Date</th>
                <th className="p-2">JE Reference</th>
                <th className="p-2">Description</th>
                <th className="p-2 text-right">Debit (MMK)</th>
                <th className="p-2 text-right">Credit (MMK)</th>
                <th className="p-2 text-right font-bold text-amber-950">Running Balance (MMK)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-mono text-gray-600">
              <tr className="bg-gray-50/40 text-gray-500">
                <td colSpan={5} className="p-2 font-sans italic text-right font-medium">Opening Balance Forward:</td>
                <td className="p-2 text-right font-bold text-gray-700">{selectedAcc.openingBalance.toLocaleString()}</td>
              </tr>
              {entries.map(entry => {
                const isDebit = entry.debitAccount === selectedAcc.code;
                const amt = isDebit ? entry.debitAmount : entry.creditAmount;
                
                if (selectedAcc.type === 'Asset' || selectedAcc.type === 'Expense') {
                  runningBalance = isDebit ? runningBalance + amt : runningBalance - amt;
                } else {
                  runningBalance = isDebit ? runningBalance - amt : runningBalance + amt;
                }

                return (
                  <tr key={entry.id} className="hover:bg-amber-50/10">
                    <td className="p-2 font-sans text-gray-500">{entry.date}</td>
                    <td className="p-2">{entry.id}</td>
                    <td className="p-2 font-sans text-gray-800">{entry.description}</td>
                    <td className="p-2 text-right text-emerald-700">{isDebit ? amt.toLocaleString() : '-'}</td>
                    <td className="p-2 text-right text-rose-700">{!isDebit ? amt.toLocaleString() : '-'}</td>
                    <td className="p-2 text-right font-bold text-gray-900">{runningBalance.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Router for current sub-tab
  const renderActiveReport = () => {
    switch (currentReportTab) {
      case 'chart-accounts':
        return renderChartOfAccounts();
      case 'journal-entries':
        return renderJournalEntries();
      case 'general-ledger':
        return renderGeneralLedger();
      case 'trial-balance':
        return renderTrialBalance();
      case 'balance-sheet':
        return renderBalanceSheet();
      case 'profit-loss':
        return renderProfitAndLoss();
      case 'cash-flow':
        return renderCashFlow();
      case 'overdue-aging':
        return renderOverdueAging();
      case 'transaction-summary':
        return renderTransactionSummary();
      case 'account-statement':
        return renderAccountStatement();
      default:
        return renderChartOfAccounts();
    }
  };

  return (
    <div className="space-y-4">
      {successToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition-opacity duration-300">
          <i className="fa-solid fa-circle-check" />
          <span>{successToast}</span>
        </div>
      )}
      {renderActiveReport()}
    </div>
  );
}
