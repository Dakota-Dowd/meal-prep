import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const users: { username: string; password: string }[] = JSON.parse(
      localStorage.getItem('mp_users') || '[]'
    );
    const match = users.find(u => u.username === username && u.password === password);
    if (!match) {
      setError('Invalid username or password.');
      return;
    }

    localStorage.setItem('mp_auth', JSON.stringify({ username }));
    navigate('/');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Bento</h1>
        <p className="subtitle">Sign in to your meal prep dashboard</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your username"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-primary">Sign In</button>
        </form>

        <p className="auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
