import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';

export default function Invoices() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', { page, status }],
    queryFn: async () => {
      const res = await api.get('/invoices', { params: { page, limit: 20, status: status || undefined } });
      return res.data;
    },
  });

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Invoices</h1>
        <Link to="/invoices/new" style={{ padding: '0.5rem 1rem', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Create Invoice
        </Link>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : data?.data?.length > 0 ? (
        <>
          <div>
            {data.data.map((invoice: { id: string; invoiceNo: string; date: string; totalAmount: number; status: string; client: { name: string } }) => (
              <Link key={invoice.id} to={`/invoices/${invoice.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '1rem', border: '1px solid #ddd', marginBottom: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{invoice.invoiceNo}</strong> - {invoice.client.name}
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>{new Date(invoice.date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      ₹{Number(invoice.totalAmount).toFixed(2)}
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>{invoice.status}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {data.pagination && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </button>
              <span>Page {data.pagination.page} of {data.pagination.totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.pagination.totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p>No invoices found</p>
      )}
    </Layout>
  );
}
