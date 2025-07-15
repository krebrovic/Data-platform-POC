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
  const [selectedTable, setSelectedTable] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/connect-db/`, form);
      setTables(res.data.tables);
      setSelectedTable(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (tableName) => {
    setError('');
    setLoading(true);
    setSelectedTable(tableName);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/preview-table/`, {
        ...form,
        table_name: tableName
      });
      setPreview(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to preview table');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">Data Platform POC</h1>

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
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Tables:</h2>
          <ul className="list-disc list-inside space-y-1">
            {tables.map((t) => (
              <li key={t}>
                <button className="text-blue-600 underline" onClick={() => handlePreview(t)}>
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {preview && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Preview: {selectedTable}</h2>
          <div className="overflow-auto border rounded">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  {preview.columns.map((col) => (
                    <th key={col} className="text-left p-2 border-b">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {preview.columns.map((col) => (
                      <td key={col} className="p-2 border-b">{String(row[col])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;