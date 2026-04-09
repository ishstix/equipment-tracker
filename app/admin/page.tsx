'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Equipment, CheckoutRequest, CheckoutItem, EquipmentCondition } from '@/lib/types';

const CONDITION_OPTS: { value: EquipmentCondition; label: string; color: string }[] = [
  { value: 'good', label: 'Good', color: 'bg-green-100 text-green-800' },
  { value: 'needs_repair', label: 'Needs Repair', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'out_of_commission', label: 'Out of Service', color: 'bg-red-100 text-red-800' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  returned: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

function conditionLabel(c: string) {
  return CONDITION_OPTS.find((o) => o.value === c) ?? CONDITION_OPTS[0];
}

type RequestWithItems = CheckoutRequest & { items: (CheckoutItem & { equipment: Equipment })[] };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<'equipment' | 'requests'>('equipment');

  // Equipment state
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [eqLoading, setEqLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Equipment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Equipment | null>(null);

  // Requests state
  const [requests, setRequests] = useState<RequestWithItems[]>([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Equipment form
  const [eqForm, setEqForm] = useState({
    name: '', description: '', category: '',
    total_quantity: 1, available_quantity: 1,
    condition: 'good' as EquipmentCondition,
  });
  const [eqSaving, setEqSaving] = useState(false);
  const [eqError, setEqError] = useState('');

  const adminKey = typeof window !== 'undefined' ? sessionStorage.getItem('admin_key') ?? '' : '';

  function authHeaders() {
    const key = sessionStorage.getItem('admin_key') ?? '';
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
  }

  const loadEquipment = useCallback(async () => {
    setEqLoading(true);
    const data = await fetch('/api/equipment', { headers: authHeaders() }).then((r) => r.json());
    setEquipment(data);
    setEqLoading(false);
  }, []);

  const loadRequests = useCallback(async () => {
    setReqLoading(true);
    const data = await fetch('/api/checkouts', { headers: authHeaders() }).then((r) => r.json());
    setRequests(data);
    setReqLoading(false);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_key');
    if (stored) { setAuthed(true); }
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadEquipment();
    loadRequests();
  }, [authed, loadEquipment, loadRequests]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/checkouts', {
      headers: { Authorization: `Bearer ${password}` },
    });
    if (res.ok) {
      sessionStorage.setItem('admin_key', password);
      setAuthed(true);
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  }

  function openAdd() {
    setEqForm({ name: '', description: '', category: '', total_quantity: 1, available_quantity: 1, condition: 'good' });
    setEqError('');
    setAddModalOpen(true);
  }

  function openEdit(item: Equipment) {
    setEqForm({
      name: item.name,
      description: item.description ?? '',
      category: item.category ?? '',
      total_quantity: item.total_quantity,
      available_quantity: item.available_quantity,
      condition: item.condition,
    });
    setEqError('');
    setEditItem(item);
  }

  async function saveEquipment() {
    if (!eqForm.name.trim()) { setEqError('Name is required.'); return; }
    setEqSaving(true);
    setEqError('');
    try {
      const body = JSON.stringify(eqForm);
      if (editItem) {
        await fetch(`/api/equipment/${editItem.id}`, { method: 'PUT', headers: authHeaders(), body });
        setEditItem(null);
      } else {
        await fetch('/api/equipment', { method: 'POST', headers: authHeaders(), body });
        setAddModalOpen(false);
      }
      await loadEquipment();
    } catch {
      setEqError('Failed to save. Please try again.');
    } finally {
      setEqSaving(false);
    }
  }

  async function deleteEquipment(item: Equipment) {
    await fetch(`/api/equipment/${item.id}`, { method: 'DELETE', headers: authHeaders() });
    setDeleteConfirm(null);
    await loadEquipment();
  }

  async function markAllReturned(reqId: string) {
    await fetch(`/api/checkouts/${reqId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ action: 'return_all' }),
    });
    await loadRequests();
    await loadEquipment();
  }

  async function markItemReturned(reqId: string, itemId: string) {
    await fetch(`/api/checkouts/${reqId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ action: 'return_item', item_id: itemId }),
    });
    await loadRequests();
    await loadEquipment();
  }

  async function updateCondition(item: Equipment, condition: EquipmentCondition) {
    await fetch(`/api/equipment/${item.id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ ...item, condition }),
    });
    await loadEquipment();
  }

  // Compute overdue
  const now = new Date();
  const enrichedRequests = requests.map((r) => ({
    ...r,
    status: r.status === 'active' && new Date(r.due_date) < now ? 'overdue' : r.status,
  }));

  const filteredRequests = statusFilter === 'all'
    ? enrichedRequests
    : enrichedRequests.filter((r) => r.status === statusFilter);

  const stats = {
    total: equipment.reduce((s, e) => s + e.total_quantity, 0),
    available: equipment.reduce((s, e) => s + e.available_quantity, 0),
    checkedOut: equipment.reduce((s, e) => s + (e.total_quantity - e.available_quantity), 0),
    overdue: enrichedRequests.filter((r) => r.status === 'overdue').length,
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
          <div className="text-center mb-6">
            <Image src="/logo.png" alt="Indy Brain" width={140} height={56} className="object-contain mx-auto mb-4" />
            <h1 className="text-xl font-bold">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">Equipment Tracker Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {authError && <p className="text-red-600 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-[#F5A623] text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-sm sticky top-0 z-30" style={{ backgroundColor: '#F5A623' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl px-3 py-1.5">
              <Image src="/logo.png" alt="Indy Brain" width={110} height={44} className="object-contain h-11 w-auto" />
            </div>
            <div className="border-l-2 border-white/40 pl-4">
              <h1 className="text-white font-extrabold text-2xl leading-tight drop-shadow">Equipment Tracker</h1>
              <p className="text-white/80 text-sm">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-sm text-white/80 hover:text-white">
              View Public Page ↗
            </a>
            <button
              onClick={() => { sessionStorage.removeItem('admin_key'); setAuthed(false); }}
              className="text-sm text-white/70 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Items', value: stats.total, color: 'text-gray-800' },
            { label: 'Available', value: stats.available, color: 'text-green-600' },
            { label: 'Checked Out', value: stats.checkedOut, color: 'text-blue-600' },
            { label: 'Overdue', value: stats.overdue, color: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
          {(['equipment', 'requests'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition capitalize ${
                tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'requests' ? 'Checkout Requests' : 'Equipment'}
            </button>
          ))}
        </div>

        {/* Equipment Tab */}
        {tab === 'equipment' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-700">All Equipment</h2>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 bg-[#F5A623] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Equipment
              </button>
            </div>

            {eqLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Photo</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Condition</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Available / Total</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {equipment.map((item) => {
                      const cond = conditionLabel(item.condition);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="relative w-14 h-14 group">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="w-14 h-14 bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer transition">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><circle cx="12" cy="13" r="3" strokeWidth={2} />
                                </svg>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const fd = new FormData();
                                    fd.append('image', file);
                                    await fetch(`/api/equipment/${item.id}/image`, {
                                      method: 'POST',
                                      headers: { Authorization: `Bearer ${sessionStorage.getItem('admin_key')}` },
                                      body: fd,
                                    });
                                    await loadEquipment();
                                  }}
                                />
                              </label>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.name}
                            {item.description && (
                              <p className="text-xs text-gray-400 font-normal">{item.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{item.category ?? '—'}</td>
                          <td className="px-4 py-3">
                            <select
                              value={item.condition}
                              onChange={(e) => updateCondition(item, e.target.value as EquipmentCondition)}
                              className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${cond.color}`}
                            >
                              {CONDITION_OPTS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`font-bold ${item.available_quantity === 0 ? 'text-red-500' : 'text-green-600'}`}>
                              {item.available_quantity}
                            </span>
                            <span className="text-gray-400"> / {item.total_quantity}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEdit(item)}
                                className="text-[#F5A623] hover:opacity-70 text-xs font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(item)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {equipment.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-8 text-gray-400">No equipment yet. Click &quot;Add Equipment&quot; to get started.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-base font-semibold text-gray-700">Checkout Requests</h2>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {['all', 'active', 'overdue', 'returned'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition capitalize ${
                      statusFilter === s ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {reqLoading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => setExpandedReq(expandedReq === req.id ? null : req.id)}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <svg
                          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedReq === req.id ? 'rotate-90' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{req.requester_name}</p>
                          <p className="text-xs text-gray-400">{req.requester_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-gray-400">Due</p>
                          <p className="text-sm font-medium text-gray-700">
                            {new Date(req.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[req.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {req.status}
                        </span>
                        {req.status !== 'returned' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markAllReturned(req.id); }}
                            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 font-medium"
                          >
                            Mark All Returned
                          </button>
                        )}
                      </div>
                    </div>

                    {expandedReq === req.id && (
                      <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                        {req.notes && (
                          <p className="text-sm text-gray-500 mb-3 italic">&ldquo;{req.notes}&rdquo;</p>
                        )}
                        <div className="text-xs text-gray-400 mb-3">
                          Pickup: {new Date(req.checkout_date).toLocaleDateString()}
                          {' · '}
                          Due Back: {new Date(req.due_date).toLocaleDateString()}
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-gray-500 border-b border-gray-200">
                              <th className="text-left pb-2">Item</th>
                              <th className="text-center pb-2">Qty</th>
                              <th className="text-right pb-2">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {req.items?.map((item) => (
                              <tr key={item.id} className="py-2">
                                <td className="py-2 text-gray-900">{item.equipment?.name ?? 'Unknown'}</td>
                                <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-2 text-right">
                                  {item.returned ? (
                                    <span className="text-xs text-green-600 font-medium">Returned</span>
                                  ) : (
                                    <button
                                      onClick={() => markItemReturned(req.id, item.id)}
                                      className="text-xs text-[#F5A623] hover:opacity-70 font-medium"
                                    >
                                      Mark Returned
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
                {filteredRequests.length === 0 && (
                  <p className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-200">
                    No requests found.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Equipment Modal */}
      {(addModalOpen || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setAddModalOpen(false); setEditItem(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-5">{editItem ? 'Edit Equipment' : 'Add Equipment'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={eqForm.name}
                  onChange={(e) => setEqForm({ ...eqForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                  placeholder="e.g. Canon EOS R5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={eqForm.description}
                  onChange={(e) => setEqForm({ ...eqForm, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623] resize-none"
                  placeholder="Optional description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={eqForm.category}
                  onChange={(e) => setEqForm({ ...eqForm, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                  placeholder="e.g. Cameras, Audio, Lighting"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={eqForm.total_quantity}
                    onChange={(e) => setEqForm({ ...eqForm, total_quantity: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Qty</label>
                  <input
                    type="number"
                    min={0}
                    max={eqForm.total_quantity}
                    value={eqForm.available_quantity}
                    onChange={(e) => setEqForm({ ...eqForm, available_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={eqForm.condition}
                  onChange={(e) => setEqForm({ ...eqForm, condition: e.target.value as EquipmentCondition })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]"
                >
                  {CONDITION_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {eqError && <p className="text-red-600 text-sm">{eqError}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setAddModalOpen(false); setEditItem(null); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEquipment}
                  disabled={eqSaving}
                  className="flex-1 bg-[#F5A623] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {eqSaving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Equipment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2">Delete Equipment?</h2>
            <p className="text-gray-500 text-sm mb-6">
              This will permanently delete <strong>{deleteConfirm.name}</strong> and all associated checkout records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteEquipment(deleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
