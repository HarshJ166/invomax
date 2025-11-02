import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#333', color: 'white', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>invoMax</Link>
            <Link to="/invoices" style={{ color: 'white', textDecoration: 'none' }}>Invoices</Link>
            <Link to="/clients" style={{ color: 'white', textDecoration: 'none' }}>Clients</Link>
            <Link to="/items" style={{ color: 'white', textDecoration: 'none' }}>Items</Link>
            <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>Settings</Link>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>{user?.email}</span>
            <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
