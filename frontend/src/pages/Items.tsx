import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import Layout from '../components/Layout';

export default function Items() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; hsnCode: string; unit: string; basePrice: number; taxRate: number } | null>(null);
  const [formData, setFormData] = useState({ name: '', hsnCode: '', unit: '', basePrice: 0, taxRate: 18 });

  const { data: items, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await api.get('/items');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post('/items', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setIsModalOpen(false);
      setFormData({ name: '', hsnCode: '', unit: '', basePrice: 0, taxRate: 18 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await api.patch(`/items/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ name: '', hsnCode: '', unit: '', basePrice: 0, taxRate: 18 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const handleEdit = (item: { id: string; name: string; hsnCode: string | null; unit: string; basePrice: number; taxRate: number }) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      hsnCode: item.hsnCode || '',
      unit: item.unit,
      basePrice: Number(item.basePrice),
      taxRate: Number(item.taxRate),
    });
    setFormData({
      name: item.name,
      hsnCode: item.hsnCode || '',
      unit: item.unit,
      basePrice: Number(item.basePrice),
      taxRate: Number(item.taxRate),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Items</h1>
        <button onClick={() => { setIsModalOpen(true); setEditingItem(null); setFormData({ name: '', hsnCode: '', unit: '', basePrice: 0, taxRate: 18 }); }} style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Add Item
        </button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : items?.length > 0 ? (
        <div>
          {items.map((item: { id: string; name: string; hsnCode: string | null; unit: string; basePrice: number; taxRate: number }) => (
            <div key={item.id} style={{ padding: '1rem', border: '1px solid #ddd', marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{item.name}</strong>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {item.hsnCode && `HSN: ${item.hsnCode} | `}
                  Unit: {item.unit} | Price: ₹{Number(item.basePrice).toFixed(2)} | Tax: {Number(item.taxRate).toFixed(2)}%
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleEdit(item)} style={{ padding: '0.25rem 0.5rem', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Edit
                </button>
                <button onClick={() => deleteMutation.mutate(item.id)} style={{ padding: '0.25rem 0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No items found</p>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
            <h2>{editingItem ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>HSN Code</label>
                <input
                  type="text"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Unit *</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., kg, pcs, m"
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Base Price *</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tax Rate % *</label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '0.75rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingItem(null); setFormData({ name: '', hsnCode: '', unit: '', basePrice: 0, taxRate: 18 }); }} style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
