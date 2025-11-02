import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import Layout from '../components/Layout';

export default function Clients() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<{ id: string; name: string; gstin: string; billingAddress: string; shippingAddress: string; state: string } | null>(null);
  const [formData, setFormData] = useState({ name: '', gstin: '', billingAddress: '', shippingAddress: '', state: '' });

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post('/clients', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsModalOpen(false);
      setFormData({ name: '', gstin: '', billingAddress: '', shippingAddress: '', state: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await api.patch(`/clients/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsModalOpen(false);
      setEditingClient(null);
      setFormData({ name: '', gstin: '', billingAddress: '', shippingAddress: '', state: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const handleEdit = (client: { id: string; name: string; gstin: string | null; billingAddress: string | null; shippingAddress: string | null; state: string | null }) => {
    setEditingClient({
      id: client.id,
      name: client.name,
      gstin: client.gstin || '',
      billingAddress: client.billingAddress || '',
      shippingAddress: client.shippingAddress || '',
      state: client.state || '',
    });
    setFormData({
      name: client.name,
      gstin: client.gstin || '',
      billingAddress: client.billingAddress || '',
      shippingAddress: client.shippingAddress || '',
      state: client.state || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Clients</h1>
        <button onClick={() => { setIsModalOpen(true); setEditingClient(null); setFormData({ name: '', gstin: '', billingAddress: '', shippingAddress: '', state: '' }); }} style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Add Client
        </button>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : clients?.length > 0 ? (
        <div>
          {clients.map((client: { id: string; name: string; gstin: string | null; billingAddress: string | null }) => (
            <div key={client.id} style={{ padding: '1rem', border: '1px solid #ddd', marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{client.name}</strong>
                {client.gstin && <div style={{ fontSize: '0.875rem', color: '#666' }}>GSTIN: {client.gstin}</div>}
                {client.billingAddress && <div style={{ fontSize: '0.875rem', color: '#666' }}>{client.billingAddress}</div>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleEdit(client)} style={{ padding: '0.25rem 0.5rem', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Edit
                </button>
                <button onClick={() => deleteMutation.mutate(client.id)} style={{ padding: '0.25rem 0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No clients found</p>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
            <h2>{editingClient ? 'Edit Client' : 'Add Client'}</h2>
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
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>GSTIN</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Billing Address</label>
                <textarea
                  value={formData.billingAddress}
                  onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Shipping Address</label>
                <textarea
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: '0.75rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  {editingClient ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingClient(null); setFormData({ name: '', gstin: '', billingAddress: '', shippingAddress: '', state: '' }); }} style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
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
