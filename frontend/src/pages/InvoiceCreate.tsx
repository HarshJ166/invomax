import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';

export default function InvoiceCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<Array<{ itemId?: string; name: string; hsnCode: string; quantity: number; rate: number; taxRate: number }>>([
    { name: '', hsnCode: '', quantity: 1, rate: 0, taxRate: 18 },
  ]);
  const [notes, setNotes] = useState('');

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients');
      return res.data;
    },
  });

  const { data: itemList } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await api.get('/items');
      return res.data;
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: { clientId: string; date: string; items: typeof items; notes?: string }) => {
      const res = await api.post('/invoices', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
  });

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const item = itemList?.find((i: { id: string }) => i.id === itemId);
    if (item) {
      const newItems = [...items];
      newItems[index] = {
        itemId: item.id,
        name: item.name,
        hsnCode: item.hsnCode || '',
        quantity: 1,
        rate: Number(item.basePrice),
        taxRate: Number(item.taxRate),
      };
      setItems(newItems);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', hsnCode: '', quantity: 1, rate: 0, taxRate: 18 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Please select a client');
      return;
    }
    if (items.some((item) => !item.name || item.quantity <= 0 || item.rate <= 0)) {
      alert('Please fill all item fields correctly');
      return;
    }
    createInvoiceMutation.mutate({ clientId, date, items, notes: notes || undefined });
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const amount = item.quantity * item.rate;
      const tax = (amount * item.taxRate) / 100;
      return sum + amount + tax;
    }, 0);
  };

  return (
    <Layout>
      <h1>Create Invoice</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Client *</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">Select a client</option>
            {clients?.map((client: { id: string; name: string }) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3>Items</h3>
          {items.map((item, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Item</label>
                  {itemList ? (
                    <select
                      value={item.itemId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleItemSelect(index, e.target.value);
                        } else {
                          handleItemChange(index, 'name', '');
                        }
                      }}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    >
                      <option value="">Custom Item</option>
                      {itemList.map((i: { id: string; name: string }) => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="Item name"
                      required
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>HSN Code</label>
                  <input
                    type="text"
                    value={item.hsnCode}
                    onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0.001"
                    step="0.001"
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Rate</label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Tax Rate %</label>
                  <input
                    type="number"
                    value={item.taxRate}
                    onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <span>Amount: ₹{(item.quantity * item.rate).toFixed(2)}</span>
                {' + '}
                <span>Tax: ₹{((item.quantity * item.rate * item.taxRate) / 100).toFixed(2)}</span>
                {' = '}
                <strong>₹{((item.quantity * item.rate * (1 + item.taxRate / 100))).toFixed(2)}</strong>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItem} style={{ padding: '0.5rem 1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem' }}>
            Add Item
          </button>
        </div>

        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
          <div style={{ textAlign: 'right' }}>
            <strong>Total: ₹{calculateTotal().toFixed(2)}</strong>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={createInvoiceMutation.isPending}
            style={{ padding: '0.75rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            style={{ padding: '0.75rem 1.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}
