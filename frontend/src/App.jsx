import { useState } from "react";

function App() {
  // Dummy data for demonstration
  const [pipelines, setPipelines] = useState([
    {
      name: "Demonstration Pipeline",
      created: "2025-07-21",
      lastRun: "2025-07-21",
      status: "Active",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-48 bg-white border-r shadow flex flex-col">
        <nav className="mt-10 space-y-4">
          <a href="#" className="block pl-6 py-2 text-lg font-semibold text-blue-700 bg-blue-100 rounded-r-full">
            Pipelines
          </a>
          <a href="#" className="block pl-6 py-2 text-lg text-gray-700 hover:bg-blue-50 rounded-r-full">
            Connections
          </a>
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

        {/* Pipelines Panel */}
        <section className="w-[90%] max-w-5xl bg-white border shadow-lg rounded p-8 relative">
          {/* New Pipeline Button */}
          <button
            className="absolute right-8 top-8 px-5 py-2 border-2 border-black rounded text-lg font-semibold hover:bg-gray-100"
          >
            New Pipeline
          </button>

          {/* Section Title */}
          <h2 className="text-xl font-semibold mb-2">Pipelines</h2>

          {/* Explanation */}
          <div className="mb-4 text-sm text-gray-600">
            [explanation] - this is big div where all the pipelines that are created will show, they will have button on the right side. For the beginning you can just create a dummy pipeline for showcase like shown below.
          </div>

          {/* Pipelines Table */}
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-center text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Demonstration Pipeline</th>
                  <th className="p-2 border">Created: 2025-07-21</th>
                  <th className="p-2 border">Last Run: 2025-07-21</th>
                  <th className="p-2 border">Status: Active</th>
                  <th className="p-2 border"></th>
                  <th className="p-2 border"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border font-semibold">{pipelines[0].name}</td>
                  <td className="p-2 border">{pipelines[0].created}</td>
                  <td className="p-2 border">{pipelines[0].lastRun}</td>
                  <td className="p-2 border">{pipelines[0].status}</td>
                  <td className="p-2 border">
                    <button className="px-4 py-1 border rounded bg-gray-200 hover:bg-gray-300 font-semibold">edit</button>
                  </td>
                  <td className="p-2 border">
                    <button className="px-4 py-1 border rounded bg-gray-200 hover:bg-gray-300 font-semibold text-red-600">delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;