import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS_BY_ROLE = {
  FARMER: [{ label: 'Dashboard', to: '/farmer/dashboard' }],
  OFFICER: [{ label: 'Dashboard', to: '/officer/dashboard' }],
  ADMINISTRATOR: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Users', to: '/admin/users' },
    { label: 'Locations', to: '/admin/locations' },
  ],
};

function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = NAV_LINKS_BY_ROLE[role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="text-primary-700 font-semibold text-lg">IAS</span>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-5">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm text-gray-600 hover:text-primary-700 font-medium">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop right side */}
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/profile" className="text-sm text-gray-600 hover:text-primary-700">
            {user?.first_name} {user?.last_name}
          </Link>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">
            Log Out
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="sm:hidden text-gray-600"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-gray-600 hover:text-primary-700 font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className="text-sm text-gray-600 hover:text-primary-700"
          >
            {user?.first_name} {user?.last_name}
          </Link>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium text-left">
            Log Out
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;