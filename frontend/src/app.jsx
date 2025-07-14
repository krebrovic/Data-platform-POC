// frontend/src/App.jsx
import { useState } from 'react';
import axios from 'axios';

function App() {
  const [form, setForm] = useState({
    host: '',
    port: 5432,
    user: '',
    password: '',
    database: ''
  });

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setTables([]);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/connect-db/`, form);
      setTables(res.data.tables);
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">Connect to PostgreSQL</h1>

      <div className="space-y-3 mb-4">
        <input className="w-full p-2 border rounded" name="host" placeholder="Host" onChange={handleChange} />
        <input className="w-full p-2 border rounded" name="port" placeholder="Port" type="number" value={form.port} onChange={handleChange} />
        <input className="w-full p-2 border rounded" name="user" placeholder="User" onChange={handleChange} />
        <input className="w-full p-2 border rounded" name="password" placeholder="Password" type="password" onChange={handleChange} />
        <input className="w-full p-2 border rounded" name="database" placeholder="Database" onChange={handleChange} />
        <button className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect'}
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {tables.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Tables found:</h2>
          <ul className="list-disc list-inside">
            {tables.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;