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
    <div className="min-h-screen flex font-sans bg-[#232323]">
      {/* Sidebar */}
      <aside className="w-52 bg-[#16181a] border-r border-[#232b38] flex flex-col pt-10 min-h-screen">
        <nav className="space-y-4">
          <button
            className={`block pl-6 py-2 text-lg font-bold rounded-r-full transition ${
              activePage === "pipelines"
                ? "text-[#2967d6] bg-[#141d26] shadow"
                : "text-[#7ca0de] hover:bg-[#232b38] hover:text-[#2967d6]"
            }`}
            onClick={() => {
              setActivePage("pipelines");
              setShowNewPipeline(false);
            }}
          >
            Pipelines
          </button>
          <button
            className={`block pl-6 py-2 text-lg font-bold rounded-r-full transition ${
              activePage === "connections"
                ? "text-[#2967d6] bg-[#141d26] shadow"
                : "text-[#7ca0de] hover:bg-[#232b38] hover:text-[#2967d6]"
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
      <main className="flex-1 flex flex-col items-center bg-[#232323]">
        {/* Header */}
        <header className="w-full py-10 text-center">
          <h1 className="text-3xl font-extrabold text-[#2967d6] tracking-tight drop-shadow">
            CloudBricks AI powered Data Platform
          </h1>
          <div className="text-lg mt-2 text-[#b0b4c1] font-semibold">demonstration</div>
        </header>

        <section className="w-[96%] max-w-5xl bg-[#1d1d1d] border border-[#283552] shadow-2xl rounded-2xl p-8 mb-10 relative">
          {/* Top-right button (hide on new pipeline form) */}
          {activePage === "pipelines" && !showNewPipeline && (
            <button
              className="absolute right-10 top-10 px-6 py-2 border-2 border-[#2967d6] text-[#2967d6] bg-[#232323] rounded-lg font-bold hover:bg-[#162136] hover:text-[#60aaff] shadow transition"
              onClick={() => setShowNewPipeline(true)}
            >
              New Pipeline
            </button>
          )}

          {/* Section Title */}
          <h2 className="text-2xl font-bold mb-7 text-[#2967d6]">
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
            <div className="overflow-x-auto rounded-2xl shadow border border-[#283552] bg-[#191a1e]">
              <table className="min-w-full rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[#162136]">
                    <th className="py-4 px-6 font-bold text-[#2967d6] text-left rounded-tl-xl">
                      Pipeline
                    </th>
                    <th className="py-4 px-6 font-bold text-[#2967d6] text-left">
                      Created
                    </th>
                    <th className="py-4 px-6 font-bold text-[#2967d6] text-left">
                      Last Run
                    </th>
                    <th className="py-4 px-6 font-bold text-[#2967d6] text-left">
                      Status
                    </th>
                    <th className="py-4 px-6 rounded-tr-xl"></th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {pipelines.map((item, idx) => (
                    <tr
                      key={idx}
                      className="bg-[#232323] hover:bg-[#282c34] border-b border-[#283552] transition"
                    >
                      <td className="py-3 px-6 font-bold text-[#2967d6]">{item.name}</td>
                      <td className="py-3 px-6 text-[#b0b4c1]">{item.created}</td>
                      <td className="py-3 px-6 text-[#b0b4c1]">{item.lastRun}</td>
                      <td className="py-3 px-6">
                        <span className="text-green-400 font-semibold">{item.status}</span>
                      </td>
                      <td className="py-3 px-6">
                        <button className="px-4 py-1 border border-[#2967d6] rounded hover:bg-[#162136] font-bold text-[#2967d6] transition">
                          edit
                        </button>
                      </td>
                      <td className="py-3 px-6">
                        <button className="px-4 py-1 border border-red-500 rounded hover:bg-[#361d1d] font-bold text-red-400 transition">
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
            <div className="overflow-x-auto rounded-2xl shadow border border-[#283552] bg-[#191a1e]">
              <table className="min-w-full rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[#162136]">
                    <th className="py-4 px-6 font-bold text-[#2967d6] text-left rounded-tl-xl">
                      Connection
                    </th>
                    <th className="py-4 px-6 font-bold text-[#2967d6] text-left">
                      Created
                    </th>
                    <th className="py-4 px-6 font-bold text-[#2967d6] text-left">
                      Last Run
                    </th>
                    <th className="py-4 px-6 font-bold text-[#2967d6] text-left">
                      Status
                    </th>
                    <th className="py-4 px-6 rounded-tr-xl"></th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((item, idx) => (
                    <tr
                      key={idx}
                      className="bg-[#232323] hover:bg-[#282c34] border-b border-[#283552] transition"
                    >
                      <td className="py-3 px-6 font-bold text-[#2967d6]">{item.name}</td>
                      <td className="py-3 px-6 text-[#b0b4c1]">2025-07-21</td>
                      <td className="py-3 px-6 text-[#b0b4c1]">2025-07-21</td>
                      <td className="py-3 px-6">
                        <span className="text-green-400 font-semibold">Active</span>
                      </td>
                      <td className="py-3 px-6">
                        <button className="px-4 py-1 border border-[#2967d6] rounded hover:bg-[#162136] font-bold text-[#2967d6] transition">
                          edit
                        </button>
                      </td>
                      <td className="py-3 px-6">
                        <button className="px-4 py-1 border border-red-500 rounded hover:bg-[#361d1d] font-bold text-red-400 transition">
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
