import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [activePage, setActivePage] = useState("pipelines");
  const [showNewPipeline, setShowNewPipeline] = useState(false);

  // Dummy data
  const pipelines = [
    {
      name: "Demonstration Pipeline",
      created: "2025-07-21",
      lastRun: "2025-07-21",
      status: "Active",
    },
  ];
  const connections = [
    {
      name: "Demo Connection",
      id: "demo",
    },
    // Add more connections later
  ];

  // For New Pipeline form
  const [selectedConnection, setSelectedConnection] = useState(connections[0].id);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState("");

  // When the form shows (or connection changes), load tables from backend
  useEffect(() => {
    if (!showNewPipeline) return;

    const fetchTables = async () => {
      setLoadingTables(true);
      setError("");
      try {
        // For now, always use the demo connection (no credentials needed)
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/connect-db/`, {});
        setTables(res.data.tables || []);
        setSelectedTable(res.data.tables ? res.data.tables[0] : "");
      } catch (err) {
        setError("Failed to fetch tables");
        setTables([]);
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, [showNewPipeline, selectedConnection]);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-48 bg-white border-r shadow flex flex-col">
        <nav className="mt-10 space-y-4">
          <button
            className={`block pl-6 py-2 text-lg font-semibold rounded-r-full ${
              activePage === "pipelines"
                ? "text-blue-700 bg-blue-100"
                : "text-gray-700 hover:bg-blue-50"
            }`}
            onClick={() => {
              setActivePage("pipelines");
              setShowNewPipeline(false);
            }}
          >
            Pipelines
          </button>
          <button
            className={`block pl-6 py-2 text-lg font-semibold rounded-r-full ${
              activePage === "connections"
                ? "text-blue-700 bg-blue-100"
                : "text-gray-700 hover:bg-blue-50"
            }`}
            onClick={() => {
              setActivePage("connections");
              setShowNewPipeline(false);
            }}
          >
            Connections
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center">
        {/* Header */}
        <header className="w-full py-8 text-center">
          <h1 className="text-2xl font-semibold">
            CloudBricks AI powered Data Platform - demonstration
          </h1>
        </header>

        <section className="w-[90%] max-w-5xl bg-white border shadow-lg rounded p-8 relative">
          {/* Top-right button (hide on new pipeline form) */}
          {activePage === "pipelines" && !showNewPipeline && (
            <button
              className="absolute right-8 top-8 px-5 py-2 border-2 border-black rounded text-lg font-semibold hover:bg-gray-100"
              onClick={() => setShowNewPipeline(true)}
            >
              New Pipeline
            </button>
          )}

          {/* Section Title */}
          <h2 className="text-xl font-semibold mb-4">
            {activePage === "pipelines"
              ? showNewPipeline
                ? "Create New Pipeline"
                : "Pipelines"
              : "Connections"}
          </h2>

          {/* Main Panel Content */}
          {activePage === "pipelines" && showNewPipeline ? (
            // New Pipeline Form
            <div className="max-w-lg mx-auto space-y-6">
              {/* Connections Dropdown */}
              <div>
                <label className="block mb-1 font-semibold">Connection</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedConnection}
                  onChange={(e) => setSelectedConnection(e.target.value)}
                >
                  {connections.map((conn) => (
                    <option key={conn.id} value={conn.id}>
                      {conn.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Tables Dropdown */}
              <div>
                <label className="block mb-1 font-semibold">Table</label>
                {loadingTables ? (
                  <div>Loading tables...</div>
                ) : error ? (
                  <div className="text-red-600">{error}</div>
                ) : (
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                  >
                    {tables.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  className="bg-blue-700 text-white px-5 py-2 rounded font-semibold hover:bg-blue-800"
                  onClick={() => {
                    // Submit/save pipeline action here
                    alert(
                      `Pipeline created!\nConnection: ${selectedConnection}\nTable: ${selectedTable}`
                    );
                    setShowNewPipeline(false);
                  }}
                  disabled={!selectedTable}
                >
                  Save
                </button>
                <button
                  className="bg-gray-300 text-gray-800 px-5 py-2 rounded font-semibold hover:bg-gray-400"
                  onClick={() => setShowNewPipeline(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : activePage === "pipelines" ? (
            // Pipelines Table
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-center text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border font-semibold">Demonstration Pipeline</th>
                    <th className="p-2 border font-semibold">Created: 2025-07-21</th>
                    <th className="p-2 border font-semibold">Last Run: 2025-07-21</th>
                    <th className="p-2 border font-semibold">Status: Active</th>
                    <th className="p-2 border"></th>
                    <th className="p-2 border"></th>
                  </tr>
                </thead>
                <tbody>
                  {pipelines.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border font-semibold">{item.name}</td>
                      <td className="p-2 border">{item.created}</td>
                      <td className="p-2 border">{item.lastRun}</td>
                      <td className="p-2 border">{item.status}</td>
                      <td className="p-2 border">
                        <button className="px-4 py-1 border rounded bg-gray-200 hover:bg-gray-300 font-semibold">
                          edit
                        </button>
                      </td>
                      <td className="p-2 border">
                        <button className="px-4 py-1 border rounded bg-gray-200 hover:bg-gray-300 font-semibold text-red-600">
                          delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Connections Table
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-center text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border font-semibold">Demo connection</th>
                    <th className="p-2 border font-semibold">Created: 2025-07-21</th>
                    <th className="p-2 border font-semibold">Last Run: 2025-07-21</th>
                    <th className="p-2 border font-semibold">Status: Active</th>
                    <th className="p-2 border"></th>
                    <th className="p-2 border"></th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border font-semibold">{item.name}</td>
                      <td className="p-2 border">2025-07-21</td>
                      <td className="p-2 border">2025-07-21</td>
                      <td className="p-2 border">Active</td>
                      <td className="p-2 border">
                        <button className="px-4 py-1 border rounded bg-gray-200 hover:bg-gray-300 font-semibold">
                          edit
                        </button>
                      </td>
                      <td className="p-2 border">
                        <button className="px-4 py-1 border rounded bg-gray-200 hover:bg-gray-300 font-semibold text-red-600">
                          delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;