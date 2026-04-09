'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Equipment, CartItem } from '@/lib/types';

const CONDITION_LABELS: Record<string, { label: string; color: string }> = {
  good: { label: 'Good Condition', color: 'bg-green-100 text-green-800' },
  needs_repair: { label: 'Needs Repair', color: 'bg-yellow-100 text-yellow-800' },
  out_of_commission: { label: 'Out of Service', color: 'bg-red-100 text-red-800' },
};

const CATEGORY_ORDER = [
  'All',
  'Camera Bodies',
  'Lenses',
  'Lens Kits',
  'Camera Support',
  'Camera Accessories',
  'Audio',
  'Lights',
  'Grip',
];

const BRAND = '#F5A623';

export default function PublicPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [form, setForm] = useState({
    name: '',
    email: '',
    pickup_date: '',
    due_date: '',
    notes: '',
  });

  useEffect(() => {
    fetch('/api/equipment')
      .then((r) => r.json())
      .then((data) => setEquipment(data))
      .finally(() => setLoading(false));
  }, []);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  function addToCart(item: Equipment) {
    setCart((prev) => {
      const existing = prev.find((c) => c.equipment.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.equipment.id === item.id
            ? { ...c, quantity: Math.min(c.quantity + 1, item.available_quantity) }
            : c
        );
      }
      return [...prev, { equipment: item, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.equipment.id !== id));
  }

  function updateCartQty(id: string, qty: number) {
    if (qty < 1) { removeFromCart(id); return; }
    setCart((prev) =>
      prev.map((c) =>
        c.equipment.id === id
          ? { ...c, quantity: Math.min(qty, c.equipment.available_quantity) }
          : c
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.pickup_date || !form.due_date) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.due_date < form.pickup_date) {
      setError('Due back date must be after the pickup date.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/checkouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_name: form.name,
          requester_email: form.email,
          pickup_date: form.pickup_date,
          due_date: form.due_date,
          notes: form.notes,
          items: cart.map((c) => ({ equipment_id: c.equipment.id, quantity: c.quantity })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }
      setSubmitted(true);
      setCart([]);
      setForm({ name: '', email: '', pickup_date: '', due_date: '', notes: '' });
      const updated = await fetch('/api/equipment').then((r) => r.json());
      setEquipment(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  const categories = CATEGORY_ORDER.filter(
    (c) => c === 'All' || equipment.some((e) => e.category === c)
  );

  const filtered = equipment.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.category ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const inCart = (id: string) => cart.find((c) => c.equipment.id === id);
  const canCheckout = (item: Equipment) =>
    item.available_quantity > 0 && item.condition !== 'out_of_commission';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="text-white shadow-md sticky top-0 z-30" style={{ backgroundColor: BRAND }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl px-3 py-1.5">
              <Image src="/logo.png" alt="Indy Brain" width={130} height={52} className="object-contain h-12 w-auto" />
            </div>
            <div className="border-l-2 border-white/40 pl-4">
              <h1 className="text-white font-extrabold text-2xl leading-tight drop-shadow">Equipment Checkout</h1>
              <p className="text-white/80 text-sm">Browse and request gear</p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 bg-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition"
            style={{ color: BRAND }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h11M7 13H5.4M9 21a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2"
            style={{ outlineColor: BRAND }}
          />
        </div>

        {/* Category Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap border"
              style={
                activeCategory === cat
                  ? { backgroundColor: BRAND, color: 'white', borderColor: BRAND }
                  : { backgroundColor: 'white', color: '#4B5563', borderColor: '#E5E7EB' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Equipment Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading equipment...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No equipment found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => {
              const cond = CONDITION_LABELS[item.condition];
              const cartItem = inCart(item.id);
              const available = canCheckout(item);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden ${!available ? 'opacity-60' : ''}`}
                >
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-semibold text-gray-900 leading-snug">{item.name}</h2>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${cond.color}`}>
                        {cond.label}
                      </span>
                    </div>
                    {item.category && (
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{item.category}</p>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-600 flex-1">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600">
                        <span className={`font-bold ${item.available_quantity === 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {item.available_quantity}
                        </span>
                        <span className="text-gray-400"> / {item.total_quantity} available</span>
                      </span>
                      {cartItem ? (
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          disabled={!available}
                          onClick={() => addToCart(item)}
                          className="text-sm px-3 py-1.5 rounded-lg font-medium transition text-white"
                          style={available ? { backgroundColor: BRAND } : { backgroundColor: '#D1D5DB', color: '#9CA3AF', cursor: 'not-allowed' }}
                        >
                          {item.available_quantity === 0
                            ? 'Unavailable'
                            : item.condition === 'out_of_commission'
                            ? 'Out of Service'
                            : 'Add to Cart'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-10">Your cart is empty.</p>
              ) : (
                <ul className="space-y-4">
                  {cart.map((item) => (
                    <li key={item.equipment.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.equipment.name}</p>
                        <p className="text-xs text-gray-400">Max: {item.equipment.available_quantity}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateCartQty(item.equipment.id, item.quantity - 1)} className="w-6 h-6 rounded border text-gray-500 hover:bg-gray-100 text-sm font-bold">−</button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.equipment.id, item.quantity + 1)} className="w-6 h-6 rounded border text-gray-500 hover:bg-gray-100 text-sm font-bold">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.equipment.id)} className="text-red-400 hover:text-red-600 ml-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {cart.length > 0 && (
              <div className="px-5 py-4 border-t">
                <button
                  onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  className="w-full text-white py-2.5 rounded-lg font-semibold transition"
                  style={{ backgroundColor: BRAND }}
                >
                  Request Checkout ({cartCount} item{cartCount !== 1 ? 's' : ''})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { if (!submitted) setCheckoutOpen(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Request Submitted!</h2>
                <p className="text-gray-500 mb-6">A confirmation email has been sent to you and the equipment manager.</p>
                <button
                  onClick={() => { setCheckoutOpen(false); setSubmitted(false); }}
                  className="text-white px-6 py-2 rounded-lg font-semibold"
                  style={{ backgroundColor: BRAND }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">Request Checkout</h2>
                  <button onClick={() => setCheckoutOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Cart Summary */}
                <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm">
                  <p className="font-medium text-gray-700 mb-2">Items in your request:</p>
                  <ul className="space-y-1">
                    {cart.map((item) => (
                      <li key={item.equipment.id} className="flex justify-between text-gray-600">
                        <span>{item.equipment.name}</span>
                        <span className="font-medium">×{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
                      <input
                        type="text" required value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input
                        type="email" required value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date <span className="text-red-500">*</span></label>
                      <input
                        type="date" required
                        min={new Date().toISOString().split('T')[0]}
                        value={form.pickup_date}
                        onChange={(e) => setForm({ ...form, pickup_date: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Back Date <span className="text-red-500">*</span></label>
                      <input
                        type="date" required
                        min={form.pickup_date || new Date().toISOString().split('T')[0]}
                        value={form.due_date}
                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      placeholder="Any special instructions..."
                    />
                  </div>

                  {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setCheckoutOpen(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
                      style={{ backgroundColor: BRAND }}
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
