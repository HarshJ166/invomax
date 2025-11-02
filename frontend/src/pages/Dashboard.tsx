import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { data: invoices } = useQuery({
    queryKey: ['invoices', { page: 1, limit: 5 }],
    queryFn: async () => {
      const res = await api.get('/invoices', { params: { page: 1, limit: 5 } });
      return res.data;
    },
  });

  return (
    <Layout>
      <h1>Dashboard</h1>
      <div style={{ marginTop: '2rem' }}>
        <h2>Recent Invoices</h2>
        {invoices?.data ? (
          <div>
            {invoices.data.map((invoice: { id: string; invoiceNo: string; date: string; totalAmount: number; status: string }) => (
              <div key={invoice.id} style={{ padding: '1rem', border: '1px solid #ddd', marginBottom: '0.5rem', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{invoice.invoiceNo}</strong> - {new Date(invoice.date).toLocaleDateString()}
                  </div>
                  <div>
                    ₹{Number(invoice.totalAmount).toFixed(2)} - {invoice.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No invoices yet</p>
        )}
        <Link to="/invoices/new" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Create New Invoice
        </Link>
      </div>
    </Layout>
  );
}
