import { useState } from "react";

function App() {
  const [activePage, setActivePage] = useState("pipelines");

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
      name: "Demo connection",
      created: "2025-07-21",
      lastRun: "2025-07-21",
      status: "Active",
    },
  ];

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
            onClick={() => setActivePage("pipelines")}
          >
            Pipelines
          </button>
          <button
            className={`block pl-6 py-2 text-lg font-semibold rounded-r-full ${
              activePage === "connections"
                ? "text-blue-700 bg-blue-100"
                : "text-gray-700 hover:bg-blue-50"
            }`}
            onClick={() => setActivePage("connections")}
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

        {/* Main Panel */}
        <section className="w-[90%] max-w-5xl bg-white border shadow-lg rounded p-8 relative">
          {/* Top-right button */}
          <button
            className="absolute right-8 top-8 px-5 py-2 border-2 border-black rounded text-lg font-semibold hover:bg-gray-100"
          >
            {activePage === "pipelines" ? "New Pipeline" : "New Connection"}
          </button>

          {/* Section Title */}
          <h2 className="text-xl font-semibold mb-4">
            {activePage === "pipelines" ? "Pipelines" : "Connections"}
          </h2>

          {/* Table */}
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-center text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border font-semibold">
                    {activePage === "pipelines"
                      ? "Demonstration Pipeline"
                      : "Demo connection"}
                  </th>
                  <th className="p-2 border font-semibold">Created: 2025-07-21</th>
                  <th className="p-2 border font-semibold">
                    Last Run: 2025-07-21
                  </th>
                  <th className="p-2 border font-semibold">Status: Active</th>
                  <th className="p-2 border"></th>
                  <th className="p-2 border"></th>
                </tr>
              </thead>
              <tbody>
                {(activePage === "pipelines" ? pipelines : connections).map((item, idx) => (
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
        </section>
      </main>
    </div>
  );
}

export default App;