// frontend/src/App.jsx
import { useState } from 'react';
import axios from 'axios';

function App() {
  const [form, setForm] = useState({host: '', port: 5432, user: '', password: '', database: ''});
  const [tables, setTables] = useState([]);

  const handleSubmit = async () => {
    try {
      const res = await axios.post('/connect-db/', form);
      setTables(res.data.tables);
    } catch (err) {
      alert(err.response?.data?.detail || 'Connection failed');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Connect to Database</h1>
      <input placeholder="Host" onChange={e => setForm({...form, host: e.target.value})} />
      {/* repeat for user, password, etc */}
      <button onClick={handleSubmit}>Connect</button>
      {tables.length > 0 && (
        <ul>
          {tables.map(t => <li key={t}>{t}</li>)}
        </ul>
      )}
    </div>
  );
}

export default App;