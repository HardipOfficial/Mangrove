import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fadeIn">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to your Mangrove account to continue shopping.</p>

        <form onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              type="email"
              id="login-email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
              <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              id="login-password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="login-submit-btn">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
