import React, { useState, useEffect } from "react";
import axios from "axios";

function CreatePipeline({ onDone }) {
  const [step, setStep] = useState(1);

  // Step 1: Table multiselect
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);

  // Step 2: Columns selection
  const [columnsByTable, setColumnsByTable] = useState({});
  const [selectedColumns, setSelectedColumns] = useState({}); // { table: [col, ...] }
  const [expanded, setExpanded] = useState({}); // Which table accordions are open

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
          out[table] = (res.data.columns || []).map((col, i) =>
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

  return (
    <div className="max-w-2xl mx-auto p-10 rounded-2xl shadow-lg bg-[#191a1e] border border-[#2a3250]">
      <h2 className="text-2xl font-bold mb-6 text-[#2967d6]">
        Create New Pipeline
      </h2>

      {step === 1 && (
        <>
          <label className="block font-semibold mb-4 text-[#2967d6]">
            Select Tables (multiselect)
          </label>
          {loadingTables ? (
            <div className="text-[#b0b4c1]">Loading tables...</div>
          ) : (
            <div className="space-y-3">
              {tables.map((table) => (
                <label key={table} className="flex items-center gap-3 text-[#b0b4c1] hover:text-[#60aaff] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTables.includes(table)}
                    onChange={() => handleTableSelect(table)}
                    className="accent-[#2967d6] w-5 h-5"
                  />
                  <span className="text-lg">{table}</span>
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-4 mt-8">
            <button
              className="px-7 py-2 bg-[#2967d6] text-white rounded-lg font-semibold hover:bg-[#185ac6] transition"
              onClick={() => setStep(2)}
              disabled={selectedTables.length === 0}
            >
              Next
            </button>
            <button
              className="px-7 py-2 bg-[#232323] border border-[#3c4562] text-[#b0b4c1] rounded-lg font-semibold hover:bg-[#232f44] transition"
              onClick={onDone}
              type="button"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <label className="block font-semibold mb-4 text-[#2967d6]">
            Select Columns for Each Table
          </label>
          <div>
            {selectedTables.map((table) => (
              <div key={table} className="mb-5 border border-[#2a3250] rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleExpand(table)}
                  className="flex items-center gap-3 w-full p-3 bg-[#1d2838] font-bold text-[#60aaff] hover:bg-[#222e3e] transition"
                >
                  <span>
                    {expanded[table] ? "▼" : "▶"}
                  </span>
                  {table}
                </button>
                {expanded[table] && (
                  <div className="pl-7 py-3 space-y-3 bg-[#191a1e]">
                    {columnsByTable[table] && columnsByTable[table].length > 0 ? (
                      columnsByTable[table].map((col, idx) => (
                        <label
                          key={col.name || col}
                          className="flex gap-3 items-center text-[#b0b4c1] hover:text-[#60aaff] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedColumns[table]?.includes(col.name || col)}
                            onChange={() => handleColumnSelect(table, col.name || col)}
                            className="accent-[#2967d6] w-5 h-5"
                          />
                          <span className="font-semibold">{col.name || col}</span>
                          <span className="ml-2 text-[#4a8ad9]">{col.type || ""}</span>
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
              className="px-7 py-2 bg-[#2967d6] text-white rounded-lg font-semibold hover:bg-[#185ac6] transition"
              onClick={() => {
                // Save logic or next step here
                alert(
                  "Selected columns:\n" +
                    JSON.stringify(selectedColumns, null, 2)
                );
              }}
              disabled={
                selectedTables.length === 0 ||
                selectedTables.some(
                  (table) => !selectedColumns[table] || selectedColumns[table].length === 0
                )
              }
            >
              Next Step
            </button>
            <button
              className="px-7 py-2 bg-[#232323] border border-[#3c4562] text-[#b0b4c1] rounded-lg font-semibold hover:bg-[#232f44] transition"
              onClick={() => setStep(1)}
              type="button"
            >
              Previous Step
            </button>
            <button
              className="px-7 py-2 bg-[#232323] border border-[#3c4562] text-[#b0b4c1] rounded-lg font-semibold hover:bg-[#232f44] transition"
              onClick={onDone}
              type="button"
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
