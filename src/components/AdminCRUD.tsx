import React, { useState } from 'react';
import { Company, Employee, User, FeeConfig, DisbursementFeedItem } from '../types';

interface AdminCRUDProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  feeConfig: FeeConfig;
  setFeeConfig: (config: FeeConfig) => void;
  activeSubTab: string;
  disbursements?: DisbursementFeedItem[];
}

export default function AdminCRUD({
  companies,
  setCompanies,
  employees,
  setEmployees,
  users,
  setUsers,
  feeConfig,
  setFeeConfig,
  activeSubTab,
  disbursements = []
}: AdminCRUDProps) {
  
  // Modals state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Edit target state
  const [editCompanyId, setEditCompanyId] = useState<number | null>(null);
  const [editEmployeeId, setEditEmployeeId] = useState<number | null>(null);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  // Search/Filters
  const [companySearch, setCompanySearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Toasts
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Company Form States ---
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState<'Corporate' | 'SME'>('Corporate');
  const [compDica, setCompDica] = useState('');
  const [compIndustry, setCompIndustry] = useState('Oil & Gas');
  const [compContact, setCompContact] = useState('');
  const [compTier, setCompTier] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('C');
  const [compBudget, setCompBudget] = useState(50000000);
  const [compStatus, setCompStatus] = useState<'Active' | 'Inactive' | 'Frozen'>('Active');

  // Company Config States
  const [compConfigEnabled, setCompConfigEnabled] = useState(false);
  const [compFeeModel, setCompFeeModel] = useState<'system_default' | 'flat' | 'percentage' | 'tiered'>('system_default');
  const [compFeePayer, setCompFeePayer] = useState<'system_default' | 'employee' | 'corporate'>('system_default');
  const [compSettlementCycle, setCompSettlementCycle] = useState<'monthly' | 'bi_weekly' | 'weekly'>('monthly');
  const [compMaxPercent, setCompMaxPercent] = useState<number>(50);
  const [compCutoffDay, setCompCutoffDay] = useState<number>(25);
  const [compGapDays, setCompGapDays] = useState<number>(5);
  const [compLateReminder, setCompLateReminder] = useState<number>(3);
  const [compMaxRequests, setCompMaxRequests] = useState<number>(3);

  const openAddCompany = () => {
    setEditCompanyId(null);
    setCompName('');
    setCompType('Corporate');
    setCompDica('');
    setCompIndustry('Oil & Gas');
    setCompContact('');
    setCompTier('C');
    setCompBudget(50000000);
    setCompStatus('Active');
    
    setCompConfigEnabled(false);
    setCompFeeModel('system_default');
    setCompFeePayer('system_default');
    setCompSettlementCycle('monthly');
    setCompMaxPercent(50);
    setCompCutoffDay(25);
    setCompGapDays(5);
    setCompLateReminder(3);
    setCompMaxRequests(3);
    setShowCompanyModal(true);
  };

  const openEditCompany = (c: Company) => {
    setEditCompanyId(c.id);
    setCompName(c.name);
    setCompType(c.type);
    setCompDica(c.dica);
    setCompIndustry(c.industry);
    setCompContact(c.contact);
    setCompTier(c.tier);
    setCompBudget(c.budget);
    setCompStatus(c.status === 'Onboarding' ? 'Active' : c.status as any);
    
    if (c.config) {
      setCompConfigEnabled(true);
      setCompFeeModel(c.config.feeModel);
      setCompFeePayer(c.config.feePayer);
      setCompSettlementCycle(c.config.settlementCycle);
      setCompMaxPercent(c.config.maxPercentSalary);
      setCompCutoffDay(c.config.payrollCutoffDay);
      setCompGapDays(c.config.gapDaysAfterPayroll || 5);
      setCompLateReminder(c.config.lateReminderDays || 3);
      setCompMaxRequests(c.config.maxMonthlyRequests || 3);
    } else {
      setCompConfigEnabled(false);
      setCompFeeModel('system_default');
      setCompFeePayer('system_default');
      setCompSettlementCycle('monthly');
      setCompMaxPercent(50);
      setCompCutoffDay(25);
      setCompGapDays(5);
      setCompLateReminder(3);
      setCompMaxRequests(3);
    }
    setShowCompanyModal(true);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !compDica || !compContact) {
      alert('Please fill out all required fields.');
      return;
    }

    const newConfig = compConfigEnabled ? {
      feeModel: compFeeModel,
      feePayer: compFeePayer,
      settlementCycle: compSettlementCycle,
      maxPercentSalary: compMaxPercent,
      payrollCutoffDay: compCutoffDay,
      gapDaysAfterPayroll: compGapDays,
      lateReminderDays: compLateReminder,
      maxMonthlyRequests: compMaxRequests
    } : undefined;

    if (editCompanyId !== null) {
      // Edit
      setCompanies(prev => prev.map(c => c.id === editCompanyId ? {
        ...c,
        name: compName,
        type: compType,
        dica: compDica,
        industry: compIndustry,
        contact: compContact,
        tier: compTier,
        budget: compBudget,
        status: compStatus as any,
        config: newConfig
      } : c));
      showToast('Company updated successfully.');
    } else {
      // Create new
      const newComp: Company = {
        id: Date.now(),
        name: compName,
        type: compType,
        dica: compDica,
        industry: compIndustry,
        contact: compContact,
        tier: compTier,
        budget: compBudget,
        utilized: 0,
        status: compStatus as any,
        branchesCount: compType === 'Corporate' ? 1 : 1,
        config: newConfig
      };
      setCompanies(prev => [...prev, newComp]);
      showToast('New Company registered successfully.');
    }
    setShowCompanyModal(false);
  };

  const handleDeleteCompany = (id: number) => {
    if (confirm('Are you sure you want to delete this company? This action is irreversible.')) {
      setCompanies(prev => prev.filter(c => c.id !== id));
      showToast('Company deleted successfully.');
    }
  };

  // --- Employee Form States ---
  const [empCode, setEmpCode] = useState('');
  const [empName, setEmpName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empNrc, setEmpNrc] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empPos, setEmpPos] = useState('');
  const [empBranch, setEmpBranch] = useState('Head Office');
  const [empSalary, setEmpSalary] = useState(500000);
  const [empJoinDate, setEmpJoinDate] = useState('2025-01-01');
  const [empTrusted, setEmpTrusted] = useState(true);
  const [empStatus, setEmpStatus] = useState<'Active' | 'Unverified' | 'Frozen' | 'Suspended' | 'Terminated'>('Active');
  const [empCompanyId, setEmpCompanyId] = useState(1);
  const [empEwaStage, setEmpEwaStage] = useState<'Verify Employment' | 'Allowed EWA'>('Verify Employment');
  const [empVerifyStatus, setEmpVerifyStatus] = useState<'Pending HR Invite' | 'Invited' | 'Self-Onboarded Request' | 'Verified'>('Pending HR Invite');
  const [empInviteMethod, setEmpInviteMethod] = useState<'SMS' | 'Viber' | 'Telegram'>('SMS');

  const openAddEmployee = () => {
    setEditEmployeeId(null);
    setEmpCode(`EMP-${Math.floor(100 + Math.random() * 900)}`);
    setEmpName('');
    setEmpPhone('');
    setEmpNrc('');
    setEmpDept('');
    setEmpPos('');
    setEmpBranch('Head Office');
    setEmpSalary(500000);
    setEmpJoinDate('2025-01-01');
    setEmpTrusted(false);
    setEmpStatus('Unverified');
    setEmpEwaStage('Verify Employment');
    setEmpVerifyStatus('Pending HR Invite');
    setEmpInviteMethod('SMS');
    setEmpCompanyId(companies[0]?.id || 1);
    setShowEmployeeModal(true);
  };

  const openEditEmployee = (emp: Employee) => {
    setEditEmployeeId(emp.id);
    setEmpCode(emp.code);
    setEmpName(emp.name);
    setEmpPhone(emp.phone);
    setEmpNrc(emp.nrc);
    setEmpDept(emp.dept);
    setEmpPos(emp.position);
    setEmpBranch(emp.branch);
    setEmpSalary(emp.salary);
    setEmpJoinDate(emp.joinDate);
    setEmpTrusted(emp.trusted);
    setEmpStatus(emp.status);
    setEmpEwaStage(emp.ewaStage || (emp.trusted ? 'Allowed EWA' : 'Verify Employment'));
    setEmpVerifyStatus(emp.verifyStatus || 'Verified');
    setEmpInviteMethod(emp.inviteMethod || 'SMS');
    setEmpCompanyId(emp.companyId);
    setShowEmployeeModal(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName || !empPhone || !empNrc) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editEmployeeId !== null) {
      setEmployees(prev => prev.map(emp => emp.id === editEmployeeId ? {
        ...emp,
        code: empCode,
        name: empName,
        phone: empPhone,
        nrc: empNrc,
        dept: empDept,
        position: empPos,
        branch: empBranch,
        salary: empSalary,
        joinDate: empJoinDate,
        trusted: empEwaStage === 'Allowed EWA',
        status: empStatus,
        ewaStage: empEwaStage,
        verifyStatus: empEwaStage === 'Verify Employment' ? empVerifyStatus : 'Verified',
        inviteMethod: empEwaStage === 'Verify Employment' ? empInviteMethod : undefined,
        companyId: empCompanyId
      } : emp));
      showToast('Employee details updated successfully.');
    } else {
      const newEmp: Employee = {
        id: Date.now(),
        code: empCode,
        name: empName,
        phone: empPhone,
        nrc: empNrc,
        dept: empDept,
        position: empPos,
        branch: empBranch,
        salary: empSalary,
        joinDate: empJoinDate,
        trusted: empEwaStage === 'Allowed EWA',
        status: empStatus,
        ewaStage: empEwaStage,
        verifyStatus: empEwaStage === 'Verify Employment' ? empVerifyStatus : 'Verified',
        inviteMethod: empEwaStage === 'Verify Employment' ? empInviteMethod : undefined,
        companyId: empCompanyId
      };
      setEmployees(prev => [...prev, newEmp]);
      showToast('New employee profile created.');
    }
    setShowEmployeeModal(false);
  };

  const handleDeleteEmployee = (id: number) => {
    if (confirm('Are you sure you want to remove this employee from directory?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      showToast('Employee deleted successfully.');
    }
  };

  // --- Granular Permissions Definitions ---
  const ALL_PERMISSIONS = [
    { id: 'view_ledgers', label: 'Access Ledger System', desc: 'Read Trial Balance, General Ledger, and Balance Sheet statements.', icon: 'fa-solid fa-file-invoice-dollar' },
    { id: 'approve_ewa', label: 'Approve EWA Settlements', desc: 'Maker/Checker double-entry approval of company repayments.', icon: 'fa-solid fa-stamp' },
    { id: 'edit_whitelist', label: 'Workforce Roster Whitelists', desc: 'Direct access to whitelisting parameters and bulk CSV parsing.', icon: 'fa-solid fa-id-card-clip' },
    { id: 'configure_fees', label: 'Configure GoRules Fees', desc: 'Edit fee structure, minimum/maximum limits, and payroll freeze days.', icon: 'fa-solid fa-sliders' },
    { id: 'edit_forms', label: 'DICA Onboarding Forms', desc: 'Access and modify corporate registration KYC questionnaires.', icon: 'fa-solid fa-signature' },
  ];

  const getDefaultPermissions = (role: 'Admin HR' | 'Branch HR' | 'Finance' | 'Viewer'): string[] => {
    switch (role) {
      case 'Admin HR':
        return ['view_ledgers', 'edit_whitelist', 'edit_forms'];
      case 'Branch HR':
        return ['edit_whitelist'];
      case 'Finance':
        return ['view_ledgers', 'approve_ewa', 'configure_fees'];
      case 'Viewer':
      default:
        return ['view_ledgers'];
    }
  };

  // --- User Form States ---
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<'Admin HR' | 'Branch HR' | 'Finance' | 'Viewer'>('Viewer');
  const [userBranches, setUserBranches] = useState<string[]>(['All']);
  const [userStatus, setUserStatus] = useState<'Active' | 'Inactive' | 'Invited'>('Active');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  // --- Whitelist Multi-view Controller ---
  const [employeeViewMode, setEmployeeViewMode] = useState<'list' | 'bulk' | 'payroll'>('list');

  // --- Bulk CSV Roster States ---
  const [csvText, setCsvText] = useState('');
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [parsedEmployees, setParsedEmployees] = useState<any[]>([]);
  const [bulkUploadStep, setBulkUploadStep] = useState<number>(0); // 0: upload/paste, 1: preview/verify
  const [selectedBulkCompanyId, setSelectedBulkCompanyId] = useState<number>(companies[0]?.id || 1);
  const [dragOver, setDragOver] = useState(false);

  // --- Payroll Export States ---
  const [payrollCompanyFilter, setPayrollCompanyFilter] = useState<number>(companies[0]?.id || 1);
  const [payrollTemplate, setPayrollTemplate] = useState<'standard' | 'workday' | 'sap'>('standard');

  const openAddUser = () => {
    setEditUserId(null);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setUserRole('Viewer');
    setUserBranches(['All']);
    setUserStatus('Active');
    setUserPermissions(getDefaultPermissions('Viewer'));
    setShowUserModal(true);
  };

  const openEditUser = (u: User) => {
    setEditUserId(u.id);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserPhone(u.phone);
    setUserRole(u.role);
    setUserBranches(u.branches);
    setUserStatus(u.status);
    setUserPermissions(u.permissions || getDefaultPermissions(u.role));
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) {
      alert('Please fill out name and email.');
      return;
    }

    if (editUserId !== null) {
      setUsers(prev => prev.map(u => u.id === editUserId ? {
        ...u,
        name: userName,
        email: userEmail,
        phone: userPhone,
        role: userRole,
        branches: userBranches,
        status: userStatus,
        permissions: userPermissions
      } : u));
      showToast('User permissions modified successfully.');
    } else {
      const newUser: User = {
        id: Date.now(),
        name: userName,
        email: userEmail,
        phone: userPhone,
        role: userRole,
        branches: userBranches,
        status: userStatus,
        lastLogin: 'Never',
        permissions: userPermissions
      };
      setUsers(prev => [...prev, newUser]);
      showToast('New system user invited.');
    }
    setShowUserModal(false);
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('User removed.');
    }
  };

  // --- Render Sections ---

  // Companies Management
  const renderCompanies = () => {
    const filtered = companies.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase()) || c.dica.toLowerCase().includes(companySearch.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Registered Companies (Clients)</h3>
            <p className="text-xs text-gray-500 font-sans">Manage employer company data, risk tiers, and outstanding allocations.</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search companies..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
            />
            <button
              onClick={openAddCompany}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg font-medium flex items-center space-x-1 cursor-pointer"
            >
              <i className="fa-solid fa-plus" /> <span>Add Company</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                <th className="p-3">Company Details</th>
                <th className="p-3">DICA Reg</th>
                <th className="p-3">Risk Tier</th>
                <th className="p-3">Utilized / Credit Pool (MMK)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-amber-50/10">
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{c.name}</span>
                      <span className="text-[10px] text-gray-400 font-sans">{c.industry} &bull; {c.type}</span>
                      <span className="text-[10px] text-gray-500 font-sans block mt-0.5">
                        <i className="fa-solid fa-phone text-amber-600/70 mr-1" />{c.contact} &bull; <i className="fa-solid fa-code-branch text-amber-600/70 mr-1" />{c.branchesCount || 1} Branches
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-mono">{c.dica}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.tier === 'A' ? 'bg-emerald-50 text-emerald-800' :
                      c.tier === 'B' ? 'bg-blue-50 text-blue-800' :
                      c.tier === 'C' ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      Tier {c.tier}
                    </span>
                  </td>
                  <td className="p-3 font-mono">
                    <span className="font-semibold text-gray-800">{c.utilized.toLocaleString()}</span>
                    <span className="text-gray-400"> / {c.budget.toLocaleString()}</span>
                    <div className="w-32 bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-amber-600 h-full" style={{ width: `${Math.min(100, (c.utilized / c.budget) * 100)}%` }}></div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      c.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      c.status === 'Frozen' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-gray-50 text-gray-500'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <button onClick={() => openEditCompany(c)} className="text-gray-500 hover:text-amber-700 cursor-pointer text-xs p-1">
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button onClick={() => handleDeleteCompany(c.id)} className="text-gray-400 hover:text-rose-600 cursor-pointer text-xs p-1">
                      <i className="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Employees Management with Multi-view (List, CSV Import, Payroll integration)
  const renderEmployees = () => {
    const filtered = employees.filter(emp => emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) || emp.code.toLowerCase().includes(employeeSearch.toLowerCase()));

    // Simple robust CSV parser
    const handleParseCSV = (rawText: string) => {
      try {
        const rows = rawText.split('\n').map(r => r.trim()).filter(r => r.length > 0);
        if (rows.length < 2) {
          setBulkError('CSV file or payload must contain at least a header row followed by employee records.');
          return;
        }

        const headerRow = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
        
        const codeIdx = headerRow.findIndex(h => h.includes('code') || h.includes('id') || h.includes('pernr'));
        const nameIdx = headerRow.findIndex(h => h.includes('name') || h.includes('full') || h.includes('cname'));
        const phoneIdx = headerRow.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact'));
        const nrcIdx = headerRow.findIndex(h => h.includes('nrc') || h.includes('national') || h.includes('id_number'));
        const deptIdx = headerRow.findIndex(h => h.includes('dept') || h.includes('department') || h.includes('kostl'));
        const posIdx = headerRow.findIndex(h => h.includes('pos') || h.includes('designation') || h.includes('title') || h.includes('plans'));
        const salaryIdx = headerRow.findIndex(h => h.includes('salary') || h.includes('wage') || h.includes('monthly'));
        const branchIdx = headerRow.findIndex(h => h.includes('branch') || h.includes('location'));

        if (nameIdx === -1 || phoneIdx === -1 || nrcIdx === -1) {
          setBulkError('Invalid format: Columns for Name, Phone, and NRC ID are mandatory. Please label your CSV headers appropriately (e.g. Code, Name, Phone, NRC, Department, Designation, Salary, Branch).');
          return;
        }

        const parsed: any[] = [];
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].split(',').map(c => c.trim().replace(/["']/g, ''));
          if (cells.length < 3) continue;

          const rawSalary = salaryIdx !== -1 ? Number(cells[salaryIdx]) : 500000;
          const salary = isNaN(rawSalary) ? 500000 : rawSalary;

          parsed.push({
            id: Date.now() + i,
            code: codeIdx !== -1 && cells[codeIdx] ? cells[codeIdx] : `EMP-B${Math.floor(100 + Math.random() * 900)}`,
            name: cells[nameIdx] || 'Employee Record',
            phone: cells[phoneIdx] || '+95 9 xxxxxxx',
            nrc: cells[nrcIdx] || '12/YAKANA(N)123456',
            dept: deptIdx !== -1 ? cells[deptIdx] : 'Operations',
            position: posIdx !== -1 ? cells[posIdx] : 'Associate',
            branch: branchIdx !== -1 ? cells[branchIdx] : 'Head Office',
            salary: salary,
            joinDate: '2026-06-29',
            trusted: true,
            status: 'Active',
            companyId: selectedBulkCompanyId
          });
        }

        setParsedEmployees(parsed);
        setBulkError(null);
        setBulkUploadStep(1); // Switch to mapping preview verification step
      } catch (err: any) {
        setBulkError(`CSV Parse Failure: ${err.message || 'Malformed structure detected.'}`);
      }
    };

    const handleLoadSampleCSV = () => {
      const sample = `Employee Code,Employee Name,Phone,NRC Number,Department,Job Title,Monthly Salary,Branch
EMP-391,Thura Aung,+95944512918,12/YAKANA(N)391823,Logistics,Senior Dispatcher,680000,Yangon Depot
EMP-392,May Thu,+95955182911,12/BAHANA(N)119283,HR,Compensation Officer,750000,Head Office
EMP-393,Aung Ko,+95977112839,12/SAYANA(N)229182,Maintenance,Senior Tech,620000,Mandalay Depot`;
      setCsvText(sample);
      setBulkError(null);
    };

    const handleCommitBulkUpload = () => {
      if (parsedEmployees.length === 0) return;
      setEmployees(prev => [...prev, ...parsedEmployees]);
      const activeComp = companies.find(c => c.id === selectedBulkCompanyId);
      showToast(`Successfully added ${parsedEmployees.length} employees to the whitelist roster for ${activeComp?.name || 'Client Company'}.`);
      
      // Reset bulk upload states
      setCsvText('');
      setParsedEmployees([]);
      setBulkUploadStep(0);
      setEmployeeViewMode('list');
    };

    const handleExportPayrollFile = () => {
      const comp = companies.find(c => c.id === payrollCompanyFilter);
      const companyName = comp ? comp.name : 'Client_Company';
      const compEmployees = employees.filter(emp => emp.companyId === payrollCompanyFilter);

      let csvContent = '';
      
      if (payrollTemplate === 'standard') {
        csvContent = 'Employee Code,Employee Name,NRC National ID,Department,Job Title,Base Salary (MMK),Total EWA Advanced (MMK),EWA Service Fees (MMK),Net Payable Salary (MMK)\n';
        compEmployees.forEach(emp => {
          const empDisb = disbursements.filter(d => d.employeeName === emp.name);
          const totalAdv = empDisb.reduce((sum, d) => sum + d.amount, 0);
          const totalFees = empDisb.length * (feeConfig.flatFee || 3500);
          const netPay = emp.salary - totalAdv - totalFees;
          csvContent += `"${emp.code}","${emp.name}","${emp.nrc}","${emp.dept}","${emp.position}",${emp.salary},${totalAdv},${totalFees},${netPay}\n`;
        });
      } else if (payrollTemplate === 'workday') {
        csvContent = 'WORKDAY_ID,EMP_LEGAL_NAME,GOVT_NRC,COST_CENTER,POSITION_ID,BASE_SAL_MMK,DEDUCTION_EWA_ADV,DEDUCTION_EWA_FEES,NET_PAYMENT_MMK\n';
        compEmployees.forEach(emp => {
          const empDisb = disbursements.filter(d => d.employeeName === emp.name);
          const totalAdv = empDisb.reduce((sum, d) => sum + d.amount, 0);
          const totalFees = empDisb.length * (feeConfig.flatFee || 3500);
          const netPay = emp.salary - totalAdv - totalFees;
          csvContent += `"${emp.code}","${emp.name}","${emp.nrc}","${emp.dept}","${emp.position}",${emp.salary},${totalAdv},${totalFees},${netPay}\n`;
        });
      } else {
        csvContent = 'SAP_PERNR,CNAME,ID_NUMBER,KOSTL,PLANS,SAP_LGART_BASE,SAP_LGART_EWA_PR,SAP_LGART_EWA_FE,SAP_LGART_NET\n';
        compEmployees.forEach(emp => {
          const empDisb = disbursements.filter(d => d.employeeName === emp.name);
          const totalAdv = empDisb.reduce((sum, d) => sum + d.amount, 0);
          const totalFees = empDisb.length * (feeConfig.flatFee || 3500);
          const netPay = emp.salary - totalAdv - totalFees;
          csvContent += `"${emp.code}","${emp.name}","${emp.nrc}","${emp.dept}","${emp.position}",${emp.salary},${totalAdv},${totalFees},${netPay}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `EWA_Payroll_Export_${companyName.replace(/\s+/g, '_')}_${payrollTemplate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Success: Exported payroll settlements compatible with ${payrollTemplate.toUpperCase()} schemas.`);
    };

    return (
      <div className="space-y-4">
        {/* Navigation Mode Segmented Controls */}
        <div className="bg-gray-50 p-1 rounded-xl flex items-center space-x-1 border border-gray-200/50 max-w-lg">
          <button
            onClick={() => setEmployeeViewMode('list')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              employeeViewMode === 'list'
                ? 'bg-white text-amber-700 shadow-sm border border-gray-200/60'
                : 'text-gray-500 hover:text-gray-900 cursor-pointer'
            }`}
          >
            <i className="fa-solid fa-id-card-clip" />
            <span>Whitelist Directory</span>
          </button>
          <button
            onClick={() => {
              setEmployeeViewMode('bulk');
              setBulkUploadStep(0);
              setBulkError(null);
              setParsedEmployees([]);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              employeeViewMode === 'bulk'
                ? 'bg-white text-amber-700 shadow-sm border border-gray-200/60'
                : 'text-gray-500 hover:text-gray-900 cursor-pointer'
            }`}
          >
            <i className="fa-solid fa-file-csv" />
            <span>Bulk CSV Importer</span>
          </button>
          <button
            onClick={() => setEmployeeViewMode('payroll')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              employeeViewMode === 'payroll'
                ? 'bg-white text-amber-700 shadow-sm border border-gray-200/60'
                : 'text-gray-500 hover:text-gray-900 cursor-pointer'
            }`}
          >
            <i className="fa-solid fa-file-invoice-dollar" />
            <span>Payroll Settlements</span>
          </button>
        </div>

        {/* VIEW 1: Standard whitelist table directory list */}
        {employeeViewMode === 'list' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <div>
                <h3 className="text-sm font-bold text-gray-900">EWA Workforce Whitelists</h3>
                <p className="text-xs text-gray-500 font-sans">Active directory of personnel pre-verified and whitelisted for real-time EWA withdrawals.</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white min-w-[160px]"
                />
                <button
                  onClick={openAddEmployee}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg font-medium flex items-center space-x-1 cursor-pointer"
                >
                  <i className="fa-solid fa-user-plus" /> <span>Add Employee</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                    <th className="p-3">Employee Details</th>
                    <th className="p-3">Employer & Branch</th>
                    <th className="p-3">Role & Dept</th>
                    <th className="p-3">Contact & ID</th>
                    <th className="p-3">Base Salary (MMK)</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-600">
                  {filtered.map(emp => {
                    const comp = companies.find(c => c.id === emp.companyId);
                    return (
                      <tr key={emp.id} className="hover:bg-amber-50/10">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-gray-900">{emp.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                emp.trusted ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {emp.trusted ? 'Whitelisted' : 'Verify Pipeline'}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">{emp.code}</span>
                            <span className="text-[10px] text-gray-500 font-sans mt-0.5">Joined: {emp.joinDate}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 font-sans">{comp ? comp.name : 'Unknown'}</span>
                            <span className="text-[10px] text-gray-500 font-sans mt-0.5">
                              <i className="fa-solid fa-code-branch text-amber-600/70 mr-1" />{emp.branch}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 font-sans">{emp.position}</span>
                            <span className="text-[10px] text-gray-400 font-sans mt-0.5">{emp.dept}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-mono text-gray-800">
                              <i className="fa-solid fa-phone text-amber-600/70 mr-1" />{emp.phone}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">{emp.nrc}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-gray-950">{emp.salary.toLocaleString()}</td>
                        <td className="p-3">
                          <div className="flex flex-col space-y-1 items-start">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {emp.status}
                            </span>
                            {!emp.trusted && emp.verifyStatus && (
                              <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                {emp.verifyStatus}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button onClick={() => openEditEmployee(emp)} className="text-gray-500 hover:text-amber-700 cursor-pointer text-xs p-1">
                            <i className="fa-solid fa-pen" />
                          </button>
                          <button onClick={() => handleDeleteEmployee(emp.id)} className="text-gray-400 hover:text-rose-600 cursor-pointer text-xs p-1">
                            <i className="fa-solid fa-trash" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: Bulk CSV Roster Importer */}
        {employeeViewMode === 'bulk' && (
          <div className="space-y-4 pt-1">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Workforce Whitelist CSV Import Engine</h3>
              <p className="text-xs text-gray-500 font-sans">Import bulk rosters securely into the whitelisted employee database using Excel, CSV, or raw payload arrays.</p>
            </div>

            {bulkUploadStep === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-4">
                  {/* Select Employer Company */}
                  <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2 shadow-xs">
                    <label className="block font-bold text-gray-700 text-[11px]">Select Target Client Company *</label>
                    <select
                      value={selectedBulkCompanyId}
                      onChange={(e) => setSelectedBulkCompanyId(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none text-xs"
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                      ))}
                    </select>
                  </div>

                  {/* Drag and Drop Zone or Text Paste */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 text-xs">Upload Roster Document or Paste Data</span>
                      <button
                        onClick={handleLoadSampleCSV}
                        className="text-[10px] text-amber-700 hover:underline font-semibold cursor-pointer"
                      >
                        <i className="fa-solid fa-vial mr-1" /> Load Sandbox Demo Data
                      </button>
                    </div>

                    {/* Drag and Drop */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) handleParseCSV(evt.target.result as string);
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer ${
                        dragOver ? 'border-amber-500 bg-amber-50/40' : 'border-gray-200 hover:border-amber-400 bg-gray-50/50'
                      }`}
                    >
                      <i className="fa-solid fa-cloud-arrow-up text-amber-600 text-xl" />
                      <span className="font-bold text-gray-800 text-[11px]">Drag & drop .csv / .xlsx file here</span>
                      <span className="text-[10px] text-gray-400">or click below to browse manual spreadsheet files</span>
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) handleParseCSV(evt.target.result as string);
                            };
                            reader.readAsText(file);
                          }
                        }}
                        className="mt-2 text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-800 file:font-semibold hover:file:bg-amber-200 cursor-pointer"
                      />
                    </div>

                    {/* Raw Text area paste */}
                    <div className="space-y-1.5">
                      <label className="block text-gray-500 font-semibold text-[10px]">Or paste comma-separated database values below:</label>
                      <textarea
                        rows={5}
                        placeholder="Employee Code,Employee Name,Phone,NRC Number,Department,Job Title,Monthly Salary,Branch&#10;EMP-401,Aung Lin,+95922339918,12/YAKANA(N)281922,Logistics,Dispatcher,550000,Yangon Depot"
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {bulkError && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-800 p-3 rounded-lg text-[11px] flex items-start space-x-2">
                        <i className="fa-solid fa-triangle-exclamation mt-0.5" />
                        <span>{bulkError}</span>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => {
                          if (!csvText.trim()) {
                            setBulkError('Please paste roster CSV rows or drop a file first.');
                            return;
                          }
                          handleParseCSV(csvText);
                        }}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg flex items-center space-x-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles" />
                        <span>Verify & Map Fields</span>
                      </button>
                    </div>

                  </div>
                </div>

                {/* Left Side Mapping Schema info card */}
                <div className="bg-amber-50/50 border border-amber-100/60 rounded-xl p-4 text-xs space-y-3">
                  <h4 className="font-bold text-amber-900 flex items-center space-x-1">
                    <i className="fa-solid fa-circle-info" />
                    <span>Schema Header Mapping Guidelines</span>
                  </h4>
                  <p className="text-amber-800 leading-normal font-sans">
                    Our dynamic validation parser will scan and auto-map columns matching key user headers. Ensure headers include:
                  </p>
                  <ul className="space-y-1.5 text-amber-900 font-medium">
                    <li className="flex items-center space-x-1.5">
                      <i className="fa-solid fa-square-check text-amber-700" />
                      <span><strong>Name</strong> (Employee Full Name) *</span>
                    </li>
                    <li className="flex items-center space-x-1.5">
                      <i className="fa-solid fa-square-check text-amber-700" />
                      <span><strong>Phone</strong> (Mobile Network Code) *</span>
                    </li>
                    <li className="flex items-center space-x-1.5">
                      <i className="fa-solid fa-square-check text-amber-700" />
                      <span><strong>NRC</strong> (National ID Format) *</span>
                    </li>
                    <li className="flex items-center space-x-1.5 text-gray-500">
                      <i className="fa-solid fa-square text-gray-300" />
                      <span>Code / PerNr (Optional employee code)</span>
                    </li>
                    <li className="flex items-center space-x-1.5 text-gray-500">
                      <i className="fa-solid fa-square text-gray-300" />
                      <span>Salary (Base monthly wage in MMK)</span>
                    </li>
                    <li className="flex items-center space-x-1.5 text-gray-500">
                      <i className="fa-solid fa-square text-gray-300" />
                      <span>Branch / Cost Center (Optional map)</span>
                    </li>
                  </ul>
                  <p className="text-[10px] text-amber-700/80 italic font-sans">
                    Note: Employees parsed successfully will instantly be set with is_whitelisted = true.
                  </p>
                </div>
              </div>
            ) : (
              // Step 1: Preview and verification grid before committing
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm space-y-4 p-5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-700">Step 2: Preview & Validation Grid</span>
                    <h4 className="font-bold text-gray-900">
                      Found {parsedEmployees.length} Whitelist Records mapped to{' '}
                      <span className="text-amber-600 font-extrabold font-sans">
                        {companies.find(c => c.id === selectedBulkCompanyId)?.name}
                      </span>
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setBulkUploadStep(0)}
                      className="px-3 py-1.5 border border-gray-200 hover:bg-gray-100 rounded-lg font-medium cursor-pointer"
                    >
                      Re-upload
                    </button>
                    <button
                      onClick={handleCommitBulkUpload}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center space-x-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-circle-check" />
                      <span>Commit Workforce Whitelist</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                        <th className="p-3">Employee Code</th>
                        <th className="p-3">Full Name</th>
                        <th className="p-3">Contact No.</th>
                        <th className="p-3">National NRC ID</th>
                        <th className="p-3">Dept & Designation</th>
                        <th className="p-3">Salary Base</th>
                        <th className="p-3">Whitelisted Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-600 font-sans">
                      {parsedEmployees.map((emp, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-3 font-mono font-medium text-amber-800">{emp.code}</td>
                          <td className="p-3 font-bold text-gray-900">{emp.name}</td>
                          <td className="p-3 font-mono">{emp.phone}</td>
                          <td className="p-3 font-mono">{emp.nrc}</td>
                          <td className="p-3 text-gray-500">
                            {emp.dept} &bull; {emp.position}
                          </td>
                          <td className="p-3 font-mono font-bold text-gray-950">{emp.salary.toLocaleString()} MMK</td>
                          <td className="p-3">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              Verified Whitelisted
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Payroll Settlement & Integrations */}
        {employeeViewMode === 'payroll' && (
          <div className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Third-Party Payroll Export & Settlements</h3>
                <p className="text-xs text-gray-500 font-sans">Aggregate employee salaries, advanced EWA principal pools, and accrued service fees to export cleanly into ERP frameworks.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Select Company Filter */}
                <select
                  value={payrollCompanyFilter}
                  onChange={(e) => setPayrollCompanyFilter(Number(e.target.value))}
                  className="text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {/* Template Layout Selection */}
                <select
                  value={payrollTemplate}
                  onChange={(e) => setPayrollTemplate(e.target.value as any)}
                  className="text-xs border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white font-bold text-gray-700"
                >
                  <option value="standard">Standard CSV payroll format</option>
                  <option value="workday">Workday Enterprise layout</option>
                  <option value="sap">SAP SuccessFactors Feed</option>
                </select>

                <button
                  onClick={handleExportPayrollFile}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg font-bold flex items-center space-x-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-file-arrow-down" />
                  <span>Generate Export File</span>
                </button>
              </div>
            </div>

            {/* Payroll Calculation Breakdown Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                    <th className="p-3">Employee Name / Code</th>
                    <th className="p-3">Government ID</th>
                    <th className="p-3 text-right">Base salary (MMK)</th>
                    <th className="p-3 text-right text-amber-700">Total EWA Advanced (MMK)</th>
                    <th className="p-3 text-right text-amber-700">Accrued EWA Fees (MMK)</th>
                    <th className="p-3 text-right text-emerald-800">Net Payable Salary (MMK)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-600 font-sans">
                  {employees.filter(emp => emp.companyId === payrollCompanyFilter).map(emp => {
                    // Calculate real EWA advance principal from actual disbursements state!
                    const empDisb = disbursements.filter(d => d.employeeName === emp.name);
                    const totalAdv = empDisb.reduce((sum, d) => sum + d.amount, 0);
                    // Accrued fees calculated based on flat fee
                    const totalFees = empDisb.length * (feeConfig.flatFee || 3500);
                    const netSalary = emp.salary - totalAdv - totalFees;

                    return (
                      <tr key={emp.id} className="hover:bg-gray-50/50">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{emp.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono mt-0.5">{emp.code}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-gray-500">{emp.nrc}</td>
                        <td className="p-3 text-right font-mono font-medium">{emp.salary.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-amber-700">
                          {totalAdv > 0 ? `-${totalAdv.toLocaleString()}` : '0'}
                        </td>
                        <td className="p-3 text-right font-mono text-amber-600">
                          {totalFees > 0 ? `-${totalFees.toLocaleString()}` : '0'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-800">
                          {netSalary.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                  {employees.filter(emp => emp.companyId === payrollCompanyFilter).length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        No whitelisted employees found under this client company.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Users Management
  const renderUsers = () => {
    const filtered = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">System Operators & HR Users</h3>
            <p className="text-xs text-gray-500 font-sans">Role configuration matrix (Admin HR, Branch HR, Finance) and scoped branch maps.</p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
            />
            <button
              onClick={openAddUser}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded-lg font-medium flex items-center space-x-1 cursor-pointer"
            >
              <i className="fa-solid fa-plus" /> <span>Add User</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                <th className="p-3">User</th>
                <th className="p-3">Role Designation</th>
                <th className="p-3">Scope assignment</th>
                <th className="p-3">Last Active</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-amber-50/10">
                  <td className="p-3">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-gray-900">{u.name}</span>
                        {u.code && (
                          <span className="font-mono text-[9px] text-amber-800 bg-amber-50 px-1 py-0.5 rounded font-semibold">
                            {u.code}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-sans">{u.email}</span>
                      <span className="text-[10px] text-gray-500 font-sans mt-0.5">
                        <i className="fa-solid fa-phone text-amber-600/70 mr-1" />{u.phone || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col space-y-1">
                      <span className="font-bold text-gray-800 flex items-center">
                        <i className="fa-solid fa-user-shield text-amber-600/80 mr-1 text-xs" />
                        <span>{u.role}</span>
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(u.permissions || getDefaultPermissions(u.role)).map(pId => {
                          const permObj = ALL_PERMISSIONS.find(ap => ap.id === pId);
                          return (
                            <span key={pId} className="bg-amber-50 border border-amber-100/40 text-amber-900 text-[9px] px-1.5 py-0.5 rounded font-mono font-medium flex items-center space-x-1" title={permObj?.desc}>
                              {permObj?.icon && <i className={`${permObj.icon} text-[8px]`} />}
                              <span>{permObj?.label || pId}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {u.branches.map((b, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded font-medium mr-1 flex-inline items-center space-x-1">
                        <i className="fa-solid fa-code-branch text-gray-400 mr-0.5" />
                        <span>{b}</span>
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-gray-500">{u.lastLogin}</td>
                  <td className="p-3">
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <button onClick={() => openEditUser(u)} className="text-gray-500 hover:text-amber-700 cursor-pointer text-xs p-1">
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button onClick={() => handleDeleteUser(u.id)} className="text-gray-400 hover:text-rose-600 cursor-pointer text-xs p-1">
                      <i className="fa-solid fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Fee Configuration
  const renderFeeConfig = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900">EWA Fee & GoRule Constraints Setup</h3>
          <p className="text-xs text-gray-500">Edit transaction fee rules, drawing windows, freeze days, and structural payer models.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm p-5 space-y-6 max-w-3xl">
          
          {/* Section: Fee Structure Model */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider border-b border-gray-50 pb-2">Service Fee Formula</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setFeeConfig({ ...feeConfig, model: 'flat' })}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  feeConfig.model === 'flat' ? 'border-amber-600 bg-amber-50/40' : 'border-gray-200'
                }`}
              >
                <h5 className="text-xs font-bold text-gray-900">Flat Rate Model</h5>
                <p className="text-[10px] text-gray-500 mt-1">Charged as fixed MMK per transaction.</p>
              </button>
              
              <button
                onClick={() => setFeeConfig({ ...feeConfig, model: 'percentage' })}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  feeConfig.model === 'percentage' ? 'border-amber-600 bg-amber-50/40' : 'border-gray-200'
                }`}
              >
                <h5 className="text-xs font-bold text-gray-900">Percentage Model</h5>
                <p className="text-[10px] text-gray-500 mt-1">Charged as % multiplier of advance.</p>
              </button>

              <button
                onClick={() => setFeeConfig({ ...feeConfig, model: 'tiered' })}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  feeConfig.model === 'tiered' ? 'border-amber-600 bg-amber-50/40' : 'border-gray-200'
                }`}
              >
                <h5 className="text-xs font-bold text-gray-900">Tiered Bracket Model</h5>
                <p className="text-[10px] text-gray-500 mt-1">Bracketed pricing for progressive amounts.</p>
              </button>
            </div>
          </div>

          {/* Configuration Inputs based on Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {feeConfig.model === 'flat' && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Flat Rate Amount (MMK)</label>
                <input
                  type="number"
                  value={feeConfig.flatFee}
                  onChange={(e) => setFeeConfig({ ...feeConfig, flatFee: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            )}

            {feeConfig.model === 'percentage' && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Fee Percentage (%)</label>
                <input
                  type="number"
                  value={feeConfig.percentage}
                  onChange={(e) => setFeeConfig({ ...feeConfig, percentage: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  step="0.1"
                />
              </div>
            )}

            {feeConfig.model === 'tiered' && (
              <div className="col-span-2 space-y-2">
                <label className="block font-semibold text-gray-700">Tier Brackets Rules</label>
                <div className="space-y-2 max-w-lg">
                  {feeConfig.tiers.map((t, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="text-gray-400 text-[10px] w-20">Bracket {i + 1}:</span>
                      <input
                        type="text"
                        value={`${t.min?.toLocaleString() ?? 0} to ${(t.max === Infinity || t.max === null) ? 'Max' : t.max?.toLocaleString() ?? 0}`}
                        disabled
                        className="bg-gray-100 border border-gray-200 rounded p-1.5 font-mono text-[10px] w-48 text-gray-500"
                      />
                      <span className="text-gray-500">Rate:</span>
                      <input
                        type="number"
                        value={t.rate}
                        onChange={(e) => {
                          const updated = [...feeConfig.tiers];
                          updated[i].rate = Number(e.target.value);
                          setFeeConfig({ ...feeConfig, tiers: updated });
                        }}
                        className="bg-gray-50 border border-gray-200 rounded p-1 font-mono text-[10px] w-24 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
                      />
                      <span className="text-gray-400 text-[10px]">MMK</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General parameters */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Minimum Advance Allowed (MMK)</label>
              <input
                type="number"
                value={feeConfig.minAmount}
                onChange={(e) => setFeeConfig({ ...feeConfig, minAmount: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Maximum Advance Allowed (MMK)</label>
              <input
                type="number"
                value={feeConfig.maxAmount}
                onChange={(e) => setFeeConfig({ ...feeConfig, maxAmount: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Monthly Drawing window Start (Day)</label>
              <input
                type="number"
                value={feeConfig.applyStartDay}
                onChange={(e) => setFeeConfig({ ...feeConfig, applyStartDay: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                min="1"
                max="31"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Monthly Drawing window End (Day)</label>
              <input
                type="number"
                value={feeConfig.applyEndDay}
                onChange={(e) => setFeeConfig({ ...feeConfig, applyEndDay: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                min="1"
                max="31"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Payroll Freeze Cut-off Day</label>
              <input
                type="number"
                value={feeConfig.freezeDay}
                onChange={(e) => setFeeConfig({ ...feeConfig, freezeDay: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                min="1"
                max="31"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Gap Days Before Next Cycle</label>
              <input
                type="number"
                value={feeConfig.gapDaysAfterPayroll}
                onChange={(e) => setFeeConfig({ ...feeConfig, gapDaysAfterPayroll: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                min="0"
                max="10"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Late Reminder Trigger (Days)</label>
              <input
                type="number"
                value={feeConfig.lateReminderDays}
                onChange={(e) => setFeeConfig({ ...feeConfig, lateReminderDays: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                min="1"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Max Monthly Requests (Velocity)</label>
              <input
                type="number"
                value={feeConfig.maxMonthlyRequests}
                onChange={(e) => setFeeConfig({ ...feeConfig, maxMonthlyRequests: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                min="1"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Fee Settlement Model Payer</label>
              <select
                value={feeConfig.payer}
                onChange={(e) => setFeeConfig({ ...feeConfig, payer: e.target.value as any })}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="employee">Employee Deducted (at Disbursement)</option>
                <option value="corporate">Corporate Covered (at Repayment)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => showToast('Fee parameters and GoRules committed to system state successfully.')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg flex items-center space-x-2 transition-colors duration-150 cursor-pointer"
            >
              <i className="fa-solid fa-floppy-disk" />
              <span>Save Rules Configuration</span>
            </button>
          </div>

        </div>
      </div>
    );
  };

  const renderActiveSubTab = () => {
    switch (activeSubTab) {
      case 'companies':
        return renderCompanies();
      case 'employees':
        return renderEmployees();
      case 'users':
        return renderUsers();
      case 'fee-config':
        return renderFeeConfig();
      default:
        return renderCompanies();
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2">
          <i className="fa-solid fa-circle-check" />
          <span>{toast}</span>
        </div>
      )}

      {renderActiveSubTab()}

      {/* MODAL 1: Add/Edit Company */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveCompany} className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-100 overflow-hidden text-xs">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h4 className="font-bold text-gray-900">{editCompanyId !== null ? 'Modify Company Profile' : 'Register New Client Company'}</h4>
              <button type="button" onClick={() => setShowCompanyModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Yoma Fleet Logistics"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Company Type</label>
                  <select
                    value={compType}
                    onChange={(e) => setCompType(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option value="Corporate">Corporate Model</option>
                    <option value="SME">SME Model</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">DICA Number *</label>
                  <input
                    type="text"
                    value={compDica}
                    onChange={(e) => setCompDica(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none font-mono"
                    placeholder="DICA-YYYY-XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Industry Sector</label>
                  <select
                    value={compIndustry}
                    onChange={(e) => setCompIndustry(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option value="Oil & Gas">Oil & Gas</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Retail">Retail</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Manufacturing">Manufacturing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Risk Tier Category</label>
                  <select
                    value={compTier}
                    onChange={(e) => setCompTier(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none font-bold"
                  >
                    <option value="A">Tier A (1.5x Multiplier)</option>
                    <option value="B">Tier B (1.2x Multiplier)</option>
                    <option value="C">Tier C (1.0x Multiplier)</option>
                    <option value="D">Tier D (0.7x Multiplier)</option>
                    <option value="E">Tier E (0.5x Multiplier)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Signatory Authorized Contact *</label>
                <input
                  type="text"
                  value={compContact}
                  onChange={(e) => setCompContact(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  placeholder="+95 9 xxxxxxxx"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Credit Limit Pool Budget (MMK)</label>
                  <input
                    type="number"
                    value={compBudget}
                    onChange={(e) => setCompBudget(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none font-mono"
                    step="1000000"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={compStatus}
                    onChange={(e) => setCompStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-2 flex items-center justify-between border-b border-gray-200">
                  <div className="font-semibold text-gray-800 flex items-center space-x-2">
                    <i className="fa-solid fa-sliders" />
                    <span>Company-Specific Rules & Config</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={compConfigEnabled} onChange={e => setCompConfigEnabled(e.target.checked)} />
                    <div className="w-8 h-4 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                  </label>
                </div>
                {compConfigEnabled && (
                  <div className="p-3 bg-gray-50/50 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Fee Model Override</label>
                        <select value={compFeeModel} onChange={e => setCompFeeModel(e.target.value as any)} className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none text-[11px]">
                          <option value="system_default">Inherit Default</option>
                          <option value="flat">Flat Rate</option>
                          <option value="percentage">Percentage</option>
                          <option value="tiered">Tiered</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Fee Payer</label>
                        <select value={compFeePayer} onChange={e => setCompFeePayer(e.target.value as any)} className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none text-[11px]">
                          <option value="system_default">Inherit Default</option>
                          <option value="employee">Employee Deducted</option>
                          <option value="corporate">Corporate Covered</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Settlement Cycle</label>
                        <select value={compSettlementCycle} onChange={e => setCompSettlementCycle(e.target.value as any)} className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none text-[11px]">
                          <option value="monthly">Monthly</option>
                          <option value="bi_weekly">Bi-Weekly</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Max % Salary Allowed</label>
                        <input type="number" value={compMaxPercent} onChange={e => setCompMaxPercent(Number(e.target.value))} className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none text-[11px] font-mono" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Payroll Cutoff Day</label>
                        <input type="number" value={compCutoffDay} onChange={e => setCompCutoffDay(Number(e.target.value))} min="1" max="31" className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none text-[11px] font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Gap Days (Next Cycle)</label>
                        <input type="number" value={compGapDays} onChange={e => setCompGapDays(Number(e.target.value))} min="0" max="10" className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none text-[11px] font-mono" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Late Reminder Trigger (Days)</label>
                        <input type="number" value={compLateReminder} onChange={e => setCompLateReminder(Number(e.target.value))} min="1" className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none text-[11px] font-mono" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Max Monthly Requests (Velocity)</label>
                        <input type="number" value={compMaxRequests} onChange={e => setCompMaxRequests(Number(e.target.value))} min="1" className="w-full bg-white border border-gray-200 rounded p-1.5 focus:outline-none text-[11px] font-mono" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button type="button" onClick={() => setShowCompanyModal(false)} className="px-3 py-1.5 border border-gray-200 hover:bg-gray-100 rounded-lg font-medium cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium cursor-pointer">
                {editCompanyId !== null ? 'Save Changes' : 'Register Company'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Add/Edit Employee */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEmployee} className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-100 overflow-hidden text-xs">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h4 className="font-bold text-gray-900">{editEmployeeId !== null ? 'Modify Employee Profile' : 'Add Employee to Whitelist'}</h4>
              <button type="button" onClick={() => setShowEmployeeModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2 focus:outline-none font-mono"
                    disabled={editEmployeeId !== null}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Parent Employer Company</label>
                  <select
                    value={empCompanyId}
                    onChange={(e) => setEmpCompanyId(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  placeholder="Enter name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none font-mono"
                    placeholder="+95 9 xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">NRC National ID *</label>
                  <input
                    type="text"
                    value={empNrc}
                    onChange={(e) => setEmpNrc(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none font-mono"
                    placeholder="XX/XXX(N)XXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                    placeholder="Operations"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Job Designation</label>
                  <input
                    type="text"
                    value={empPos}
                    onChange={(e) => setEmpPos(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                    placeholder="Senior Officer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Monthly Salary (MMK) *</label>
                  <input
                    type="number"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Verification Status</label>
                  <select
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option value="Active">Active & Verified</option>
                    <option value="Unverified">Unverified</option>
                    <option value="Frozen">Frozen / Suspended</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">EWA Stage Pipeline</label>
                  <select
                    value={empEwaStage}
                    onChange={(e) => setEmpEwaStage(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option value="Verify Employment">Verify Employment</option>
                    <option value="Allowed EWA">Allowed EWA (Whitelist)</option>
                  </select>
                </div>
                {empEwaStage === 'Verify Employment' && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Onboarding / Invite Status</label>
                    <select
                      value={empVerifyStatus}
                      onChange={(e) => setEmpVerifyStatus(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                    >
                      <option value="Pending HR Invite">Pending HR Invite</option>
                      <option value="Invited">Invited (Sent App Link)</option>
                      <option value="Self-Onboarded Request">Self-Onboarded Request</option>
                      <option value="Verified">Verified by HR</option>
                    </select>
                  </div>
                )}
              </div>

              {empEwaStage === 'Verify Employment' && empVerifyStatus === 'Pending HR Invite' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Invite Delivery Method</label>
                    <select
                      value={empInviteMethod}
                      onChange={(e) => setEmpInviteMethod(e.target.value as any)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                    >
                      <option value="SMS">SMS / Text Message</option>
                      <option value="Viber">Viber</option>
                      <option value="Telegram">Telegram</option>
                    </select>
                  </div>
                </div>
              )}

              {empEwaStage === 'Verify Employment' && empVerifyStatus === 'Pending HR Invite' && (
                <div className="bg-blue-50 text-blue-800 p-2 text-[10px] rounded flex items-center space-x-2">
                  <i className="fa-solid fa-paper-plane shrink-0" />
                  <span>Upon saving, system will auto-dispatch app download link & invite code via {empInviteMethod} to {empPhone}.</span>
                </div>
              )}

            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button type="button" onClick={() => setShowEmployeeModal(false)} className="px-3 py-1.5 border border-gray-200 hover:bg-gray-100 rounded-lg font-medium cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium cursor-pointer">
                {editEmployeeId !== null ? 'Save Changes' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Add/Edit User */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveUser} className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-100 overflow-hidden text-xs">
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h4 className="font-bold text-gray-900">{editUserId !== null ? 'Modify System User Access' : 'Invite System/HR Operator'}</h4>
              <button type="button" onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">User Full Name *</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none font-mono"
                  placeholder="user@unitedpetro.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Contact</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none font-mono"
                    placeholder="+95 9 xxxxx"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">System Role Badge</label>
                  <select
                    value={userRole}
                    onChange={(e) => {
                      const newRole = e.target.value as any;
                      setUserRole(newRole);
                      setUserPermissions(getDefaultPermissions(newRole));
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  >
                    <option value="Admin HR">Admin HR (Full Company View)</option>
                    <option value="Branch HR">Branch HR (Scoped View)</option>
                    <option value="Finance">Finance Checker (Repay/Budget)</option>
                    <option value="Viewer">Viewer (Read-Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Scoped Assigned Branch Map</label>
                <input
                  type="text"
                  value={userBranches.join(', ')}
                  onChange={(e) => setUserBranches(e.target.value.split(',').map(s => s.trim()))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                  placeholder="All, Head Office, Mandalay Depot"
                />
                <p className="text-[10px] text-gray-400 mt-1">Comma-separated list of branches matching employee branches.</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Operational Status</label>
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Invited">Invited (Pending login)</option>
                </select>
              </div>

              {/* Granular Permissions Section */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <label className="block font-bold text-gray-800 uppercase tracking-wide text-[10px] flex items-center space-x-1">
                  <i className="fa-solid fa-shield-halved text-amber-700" />
                  <span>Custom Granular Permissions</span>
                </label>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {ALL_PERMISSIONS.map(p => {
                    const checked = userPermissions.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-start space-x-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserPermissions([...userPermissions, p.id]);
                            } else {
                              setUserPermissions(userPermissions.filter(id => id !== p.id));
                            }
                          }}
                          className="mt-0.5 w-3.5 h-3.5 text-amber-600 focus:ring-amber-500 rounded border-gray-300 cursor-pointer"
                        />
                        <div className="space-y-0.5 pl-1">
                          <span className="font-bold text-gray-800 text-[11px] flex items-center space-x-1">
                            {p.icon && <i className={`${p.icon} text-amber-600/80 mr-1`} />}
                            <span>{p.label}</span>
                          </span>
                          <p className="text-[9px] text-gray-400 leading-tight">{p.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
              <button type="button" onClick={() => setShowUserModal(false)} className="px-3 py-1.5 border border-gray-200 hover:bg-gray-100 rounded-lg font-medium cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium cursor-pointer">
                {editUserId !== null ? 'Save User' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
