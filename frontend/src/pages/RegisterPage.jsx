import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, phone);
      toast.success('Registration successful');
      navigate(redirect);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fadeIn">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join Mangrove to start purchasing and tracking your orders.</p>

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <input
              type="text"
              id="register-name"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <input
              type="email"
              id="register-email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-phone">Phone Number (Optional)</label>
            <input
              type="text"
              id="register-phone"
              className="form-input"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input
              type="password"
              id="register-password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="register-submit-btn">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}>Log in here</Link>
        </p>
      </div>
    </div>
  );
}
