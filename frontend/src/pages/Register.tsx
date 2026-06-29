import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SIGNUP_PASSCODE = 'meal-prep-passcode';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (passcode !== SIGNUP_PASSCODE) {
      setError('Incorrect signup passcode.');
      return;
    }

    const users: { username: string; password: string }[] = JSON.parse(
      localStorage.getItem('mp_users') || '[]'
    );
    if (users.find(u => u.username === username)) {
      setError('Username already taken.');
      return;
    }

    users.push({ username, password });
    localStorage.setItem('mp_users', JSON.stringify(users));
    localStorage.setItem('mp_auth', JSON.stringify({ username }));
    navigate('/');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">You'll need the signup passcode to register.</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="choose a username"
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
          <div className="form-group">
            <label>Signup Passcode</label>
            <input
              type="password"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              placeholder="enter passcode"
              required
            />
          </div>
          <button type="submit" className="btn-primary">Create Account</button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
