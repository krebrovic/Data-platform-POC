import React, { useState, useEffect } from "react";
import axios from "axios";
import DataModelPreview from "./DataModelPreview";

// Color palette
const blue = "text-[#2668d3]";
const blueBg = "bg-[#2668d3]";
const blueBorder = "border-[#2668d3]";

function CreatePipeline({ onDone }) {
  const [step, setStep] = useState(1);

  // Step 1: Table multiselect
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);

  // Step 2: Columns selection
  const [columnsByTable, setColumnsByTable] = useState({});
  const [selectedColumns, setSelectedColumns] = useState({});
  const [expanded, setExpanded] = useState({});

  // Fetch all tables on mount (Step 1)
  useEffect(() => {
    async function fetchTables() {
      setLoadingTables(true);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/connect-db/`, {}
        );
        setTables(res.data.tables || []);
      } catch (err) {
        setTables([]);
      } finally {
        setLoadingTables(false);
      }
    }
    fetchTables();
  }, []);

  // Step 2: When step advances, fetch columns for selected tables
  useEffect(() => {
    async function fetchColumnsForTables() {
      if (step !== 2 || selectedTables.length === 0) return;
      const out = {};
      for (const table of selectedTables) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/preview-table/`,
            { table_name: table }
          );
          out[table] = (res.data.columns || []).map((col) =>
            typeof col === "object"
              ? col
              : { name: col, type: "unknown" }
          );
        } catch (e) {
          out[table] = [];
        }
      }
      setColumnsByTable(out);
    }
    if (step === 2) fetchColumnsForTables();
  }, [step, selectedTables]);

  // Step 1 handler: Multiselect tables
  const handleTableSelect = (table) => {
    setSelectedTables((prev) =>
      prev.includes(table)
        ? prev.filter((t) => t !== table)
        : [...prev, table]
    );
  };

  // Step 2 handler: Multiselect columns for a table
  const handleColumnSelect = (table, colName) => {
    setSelectedColumns((prev) => {
      const prevCols = prev[table] || [];
      return {
        ...prev,
        [table]: prevCols.includes(colName)
          ? prevCols.filter((c) => c !== colName)
          : [...prevCols, colName],
      };
    });
  };

  // Step 2 handler: Accordion expand/collapse
  const toggleExpand = (table) => {
    setExpanded((prev) => ({
      ...prev,
      [table]: !prev[table],
    }));
  };

  // Step 3: Data Model Preview
  if (step === 3) {
    return (
      <DataModelPreview
        selectedColumns={selectedColumns}
        onBack={() => setStep(2)}
        onDone={onDone}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-[#202021] rounded-2xl shadow-2xl border border-[#252637] mt-8">
      <h2 className={`text-2xl font-bold mb-6 ${blue}`}>Create New Pipeline</h2>

      {step === 1 && (
        <>
          <label className={`block font-semibold mb-2 ${blue}`}>Select Tables (multiselect)</label>
          {loadingTables ? (
            <div className="text-gray-300">Loading tables...</div>
          ) : (
            <div className="space-y-3">
              {tables.map((table) => (
                <label
                  key={table}
                  className="flex items-center gap-3 bg-[#26272b] px-3 py-2 rounded-lg hover:bg-[#232536] cursor-pointer"
                  style={{ color: "#f3f4f6" }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTables.includes(table)}
                    onChange={() => handleTableSelect(table)}
                    className={`accent-[#2668d3] w-4 h-4`}
                  />
                  <span className="font-medium">{table}</span>
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-4 mt-8">
            <button
              className={`px-8 py-2 rounded-lg font-bold border-2 ${blueBorder} ${blue} hover:${blueBg} hover:text-white transition`}
              onClick={() => setStep(2)}
              disabled={selectedTables.length === 0}
              style={{
                background: selectedTables.length === 0 ? "#26272b" : "#2668d3",
                color: selectedTables.length === 0 ? "#7b8497" : "#fff",
                cursor: selectedTables.length === 0 ? "not-allowed" : "pointer"
              }}
            >
              Next
            </button>
            <button
              className="px-8 py-2 rounded-lg font-bold border-2 border-gray-400 text-gray-300 hover:bg-gray-700 transition"
              onClick={onDone}
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <label className={`block font-semibold mb-3 ${blue}`}>Select Columns for Each Table</label>
          <div>
            {selectedTables.map((table) => (
              <div key={table} className="mb-4 bg-[#232328] border border-[#2d2e36] rounded-lg">
                <button
                  onClick={() => toggleExpand(table)}
                  className={`flex items-center gap-3 w-full px-4 py-3 ${blue} text-lg font-bold rounded-t-lg focus:outline-none`}
                  style={{ background: "#18181b" }}
                >
                  <span>{expanded[table] ? "▼" : "▶"}</span>
                  {table}
                </button>
                {expanded[table] && (
                  <div className="pl-8 py-3 space-y-2 bg-[#232328] rounded-b-lg">
                    {columnsByTable[table] && columnsByTable[table].length > 0 ? (
                      columnsByTable[table].map((col, idx) => (
                        <label key={col.name || col} className="flex gap-3 items-center text-gray-100">
                          <input
                            type="checkbox"
                            checked={selectedColumns[table]?.includes(col.name || col)}
                            onChange={() => handleColumnSelect(table, col.name || col)}
                            className={`accent-[#2668d3] w-4 h-4`}
                          />
                          <span className="font-medium">{col.name || col}</span>
                          <span className="ml-2 text-gray-400 text-sm">{col.type || ""}</span>
                        </label>
                      ))
                    ) : (
                      <div className="text-gray-500">Loading columns...</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-8">
            <button
              className={`px-8 py-2 rounded-lg font-bold border-2 ${blueBorder} ${blue} hover:${blueBg} hover:text-white transition`}
              onClick={() => setStep(3)}
              disabled={
                selectedTables.length === 0 ||
                selectedTables.some(
                  (table) => !selectedColumns[table] || selectedColumns[table].length === 0
                )
              }
              style={{
                background:
                  selectedTables.length === 0 ||
                  selectedTables.some(
                    (table) => !selectedColumns[table] || selectedColumns[table].length === 0
                  )
                    ? "#26272b"
                    : "#2668d3",
                color:
                  selectedTables.length === 0 ||
                  selectedTables.some(
                    (table) => !selectedColumns[table] || selectedColumns[table].length === 0
                  )
                    ? "#7b8497"
                    : "#fff",
                cursor:
                  selectedTables.length === 0 ||
                  selectedTables.some(
                    (table) => !selectedColumns[table] || selectedColumns[table].length === 0
                  )
                    ? "not-allowed"
                    : "pointer"
              }}
            >
              Next Step
            </button>
            <button
              className="px-8 py-2 rounded-lg font-bold border-2 border-gray-400 text-gray-300 hover:bg-gray-700 transition"
              onClick={() => setStep(1)}
            >
              Previous Step
            </button>
            <button
              className="px-8 py-2 rounded-lg font-bold border-2 border-gray-400 text-gray-300 hover:bg-gray-700 transition"
              onClick={onDone}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CreatePipeline;
