import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FolderTree, ClipboardList, Users, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Products', path: '/admin/products', icon: <ShoppingBag size={18} /> },
    { name: 'Categories', path: '/admin/categories', icon: <FolderTree size={18} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ClipboardList size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={18} /> },
  ];

  const isActive = (path) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout" id="admin-root-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ marginBottom: '2rem', padding: '0 0.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Admin Panel</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Mangrove Management</p>
        </div>

        <p className="admin-sidebar__title">Menu</p>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
              id={`admin-nav-${item.name.toLowerCase()}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem 0.75rem 0' }}>
          <Link to="/" className="btn btn-ghost btn-sm flex-center gap-1 btn-full">
            <ArrowLeft size={14} /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
