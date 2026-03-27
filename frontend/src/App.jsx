import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import AddProperty from './pages/AddProperty';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminPropertyList from './pages/AdminPropertyList';
import AmenitiesFallbackForm from './pages/AmenitiesFallbackForm';



function App() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard');

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">Real Estate TN</Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-md">Home</Link>
                <a href="/#about" className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-md">About</a>
                {!user && (
                  <>
                    <Link to="/signin" className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-md">User Login</Link>
                    <Link to="/admin/login" className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-md">Admin Login</Link>
                  </>
                )}
              </div>
              {user && (
                <div className="flex items-center space-x-4 border-l pl-4 border-gray-100">
                  {!isDashboardRoute && (
                    <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn-secondary">Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium px-3 transition-colors">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/properties" element={<AdminPropertyList />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/add-property" element={<AddProperty />} />
          <Route path="/dashboard/provide-amenities/:id" element={<AmenitiesFallbackForm />} />
        </Routes>
      </main>

      <footer className="bg-gray-800 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Real Estate TN</h3>
            <p className="text-sm">Connecting buyers and sellers across South Tamil Nadu with intelligent ML-based price predictions.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-blue-400">Home</Link></li>
              <li><Link to="/properties" className="hover:text-blue-400">Browse Properties</Link></li>
              <li><Link to="/admin/login" className="hover:text-gray-200 text-xs mt-4 block">Admin Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Contact</h4>
            <p className="text-sm border-b border-gray-700 pb-2">support@realestatetn.in</p>
            <p className="text-sm pt-2">+91 98765 43210</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-700 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Real Estate Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
