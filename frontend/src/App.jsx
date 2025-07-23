import { useState } from "react";
import CreatePipeline from "./CreatePipeline";

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

  // Callback for finishing or canceling CreatePipeline
  function handlePipelineDone() {
    setShowNewPipeline(false);
  }

  return (
    <div className="min-h-screen flex font-sans bg-[#222]">
      {/* Sidebar */}
      <aside className="w-48 bg-[#1d1d1d] flex flex-col shadow">
        <nav className="mt-10 space-y-4">
          <button
            className={`block pl-6 py-2 text-lg font-semibold rounded-r-full transition-all ${
              activePage === "pipelines"
                ? "text-[#2967d6] bg-[#191919]"
                : "text-[#2967d6] hover:bg-[#232323]"
            }`}
            onClick={() => {
              setActivePage("pipelines");
              setShowNewPipeline(false);
            }}
          >
            Pipelines
          </button>
          <button
            className={`block pl-6 py-2 text-lg font-semibold rounded-r-full transition-all ${
              activePage === "connections"
                ? "text-[#2967d6] bg-[#191919]"
                : "text-[#2967d6] hover:bg-[#232323]"
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
      <main className="flex-1 flex flex-col items-center text-[#2967d6] bg-[#222]">
        {/* Header */}
        <header className="w-full py-8 text-center">
          <h1 className="text-2xl font-bold">
            CloudBricks AI powered Data Platform - demonstration
          </h1>
        </header>

        <section className="w-[95%] max-w-5xl bg-[#1d1d1d] border border-[#232323] shadow-xl rounded-xl p-8 relative">
          {/* Top-right button (hide on new pipeline form) */}
          {activePage === "pipelines" && !showNewPipeline && (
            <button
              className="absolute right-8 top-8 px-5 py-2 border-2 border-[#2967d6] rounded text-lg font-semibold hover:bg-[#232323] text-[#2967d6] bg-[#1d1d1d] transition"
              onClick={() => setShowNewPipeline(true)}
            >
              New Pipeline
            </button>
          )}

          {/* Section Title */}
          <h2 className="text-xl font-bold mb-4 text-[#2967d6]">
            {activePage === "pipelines"
              ? showNewPipeline
                ? "Create New Pipeline"
                : "Pipelines"
              : "Connections"}
          </h2>

          {/* Main Panel Content */}
          {activePage === "pipelines" && showNewPipeline ? (
            <CreatePipeline onDone={handlePipelineDone} />
          ) : activePage === "pipelines" ? (
            // Pipelines Table
            <div className="overflow-x-auto border border-[#232323] rounded-lg bg-[#232323]">
              <table className="min-w-full text-center text-base text-[#2967d6] bg-[#232323] rounded-lg">
                <thead className="bg-[#191e24]">
                  <tr>
                    <th className="p-2 border-b border-[#232323] font-semibold">
                      Demonstration Pipeline
                    </th>
                    <th className="p-2 border-b border-[#232323] font-semibold">
                      Created: 2025-07-21
                    </th>
                    <th className="p-2 border-b border-[#232323] font-semibold">
                      Last Run: 2025-07-21
                    </th>
                    <th className="p-2 border-b border-[#232323] font-semibold">
                      Status: Active
                    </th>
                    <th className="p-2 border-b border-[#232323]"></th>
                    <th className="p-2 border-b border-[#232323]"></th>
                  </tr>
                </thead>
                <tbody>
                  {pipelines.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#222]">
                      <td className="p-2 border-b border-[#232323] font-semibold">
                        {item.name}
                      </td>
                      <td className="p-2 border-b border-[#232323]">
                        {item.created}
                      </td>
                      <td className="p-2 border-b border-[#232323]">
                        {item.lastRun}
                      </td>
                      <td className="p-2 border-b border-[#232323]">
                        {item.status}
                      </td>
                      <td className="p-2 border-b border-[#232323]">
                        <button className="px-4 py-1 border border-[#2967d6] rounded bg-[#191e24] hover:bg-[#232323] font-semibold text-[#2967d6] transition">
                          edit
                        </button>
                      </td>
                      <td className="p-2 border-b border-[#232323]">
                        <button className="px-4 py-1 border border-red-500 rounded bg-[#191e24] hover:bg-[#361d1d] font-semibold text-red-500 transition">
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
            <div className="overflow-x-auto border border-[#232323] rounded-lg bg-[#232323]">
              <table className="min-w-full text-center text-base text-[#2967d6] bg-[#232323] rounded-lg">
                <thead className="bg-[#191e24]">
                  <tr>
                    <th className="p-2 border-b border-[#232323] font-semibold">
                      Demo connection
                    </th>
                    <th className="p-2 border-b border-[#232323] font-semibold">
                      Created: 2025-07-21
                    </th>
                    <th className="p-2 border-b border-[#232323] font-semibold">
                      Last Run: 2025-07-21
                    </th>
                    <th className="p-2 border-b border-[#232323] font-semibold">
                      Status: Active
                    </th>
                    <th className="p-2 border-b border-[#232323]"></th>
                    <th className="p-2 border-b border-[#232323]"></th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#222]">
                      <td className="p-2 border-b border-[#232323] font-semibold">
                        {item.name}
                      </td>
                      <td className="p-2 border-b border-[#232323]">
                        2025-07-21
                      </td>
                      <td className="p-2 border-b border-[#232323]">
                        2025-07-21
                      </td>
                      <td className="p-2 border-b border-[#232323]">
                        Active
                      </td>
                      <td className="p-2 border-b border-[#232323]">
                        <button className="px-4 py-1 border border-[#2967d6] rounded bg-[#191e24] hover:bg-[#232323] font-semibold text-[#2967d6] transition">
                          edit
                        </button>
                      </td>
                      <td className="p-2 border-b border-[#232323]">
                        <button className="px-4 py-1 border border-red-500 rounded bg-[#191e24] hover:bg-[#361d1d] font-semibold text-red-500 transition">
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
