import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  Megaphone,
  Plus,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { operationsApi } from '../services/api';
import {
  Employee,
  ExpenseRequest,
  LeaveRequest,
  MarketingCampaign,
  PurchaseRequest,
  SalesLead,
} from '../types';

export const OperationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hr' | 'finance' | 'marketing' | 'sales'>('hr');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRequest[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRequest[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leave_type: 'vacation',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    total_days: 3,
    reason: '',
  });

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'travel',
    amount: 150,
    currency: 'USD',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, lRes, expRes, pRes, campRes, leadRes] = await Promise.all([
        operationsApi.getEmployees(),
        operationsApi.getLeaves(),
        operationsApi.getExpenses(),
        operationsApi.getPurchases(),
        operationsApi.getCampaigns(),
        operationsApi.getLeads(),
      ]);
      setEmployees(empRes.data);
      setLeaves(lRes.data);
      setExpenses(expRes.data);
      setPurchases(pRes.data);
      setCampaigns(campRes.data);
      setLeads(leadRes.data);
    } catch (err) {
      console.error('Failed to load operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await operationsApi.submitLeave(newLeave);
      setShowLeaveModal(false);
      const res = await operationsApi.getLeaves();
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to submit leave:', err);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await operationsApi.submitExpense(newExpense);
      setShowExpenseModal(false);
      const res = await operationsApi.getExpenses();
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to submit expense:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Enterprise Operations Hub
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
              Integrated Workflows
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Department-level operations for HR personnel, Finance expenditure, Marketing campaigns, and Sales pipeline
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Records
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { key: 'hr', label: `HR & People (${employees.length})`, icon: Users },
          { key: 'finance', label: `Finance & Expenses (${expenses.length})`, icon: DollarSign },
          { key: 'marketing', label: `Marketing (${campaigns.length})`, icon: Megaphone },
          { key: 'sales', label: `Sales CRM (${leads.length})`, icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: HR & People */}
      {activeTab === 'hr' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Employee Directory</h3>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" /> Request Leave
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div key={emp.id} className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-blue-400">{emp.employee_code}</span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 capitalize">
                    {emp.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{emp.full_name}</h4>
                <p className="text-xs text-slate-400">{emp.job_title}</p>
                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/60">
                  {emp.email} • Hired {new Date(emp.hire_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          {/* Leaves Table */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-white">Leave Requests & Approvals</h3>
            <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Total Days</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-semibold text-white">{l.employee_name}</td>
                      <td className="py-3 px-4 capitalize text-slate-300">{l.leave_type}</td>
                      <td className="py-3 px-4 text-slate-400">{l.start_date} to {l.end_date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-200">{l.total_days} days</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20 capitalize">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Finance & Expenses */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Expense & Reimbursement Requests</h3>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" /> Submit Expense
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Item & Reason</th>
                  <th className="py-3 px-4">Claimant</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{exp.title}</p>
                      <p className="text-[11px] text-slate-500">{exp.notes}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{exp.user_name}</td>
                    <td className="py-3 px-4 capitalize text-slate-400">{exp.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ${exp.amount.toFixed(2)} {exp.currency}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20 capitalize">
                        {exp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Purchase Requisitions */}
          <div className="space-y-3 pt-4">
            <h3 className="text-sm font-bold text-white">Purchase Orders & Capital Requisitions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchases.map((p) => (
                <div key={p.id} className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Vendor: {p.vendor}</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">${p.estimated_cost.toLocaleString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{p.title}</h4>
                  <p className="text-xs text-slate-400">{p.justification}</p>
                  <div className="pt-2 text-[10px] text-slate-500 border-t border-slate-800/60 capitalize">
                    Requested by {p.user_name} • Status: {p.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Marketing */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((camp) => (
            <div key={camp.id} className="glass-panel rounded-2xl border border-slate-800/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 capitalize">
                  {camp.channel}
                </span>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 capitalize">
                  {camp.status}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{camp.name}</h4>
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-400 block">Budget</span>
                  <span className="text-xs font-bold text-white">${camp.budget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Spent</span>
                  <span className="text-xs font-bold text-emerald-400">${camp.spent.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Leads</span>
                  <span className="text-xs font-bold text-indigo-400">{camp.leads_generated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Sales Pipeline CRM */}
      {activeTab === 'sales' && (
        <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Pipeline Stage</th>
                <th className="py-3 px-4">Deal Value</th>
                <th className="py-3 px-4">Account Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-4 font-bold text-white">{l.company_name}</td>
                  <td className="py-3 px-4">
                    <p className="text-slate-200">{l.contact_name}</p>
                    <p className="text-[10px] text-slate-500">{l.contact_email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 capitalize border border-indigo-500/20">
                      {l.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    ${l.deal_value.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{l.owner_name || 'Alex Vance'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals for Leave and Expense */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Submit Leave Request</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLeave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Leave Type</label>
                <select
                  value={newLeave.leave_type}
                  onChange={(e) => setNewLeave({ ...newLeave, leave_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                >
                  <option value="vacation">Annual Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="parental">Parental Leave</option>
                  <option value="unpaid">Unpaid Personal</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.start_date}
                    onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.end_date}
                    onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="Notes for manager..."
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Submit Expense Claim</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certification Exam Fee"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                  >
                    <option value="travel">Travel & Lodging</option>
                    <option value="equipment">Equipment</option>
                    <option value="software">Software Tools</option>
                    <option value="training">Training & Certs</option>
                    <option value="meals">Meals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-500/20"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
