import React, { useState, useEffect } from "react";
import axios from "axios";

function CreatePipeline() {
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
          // If your API returns type info, use it here. Otherwise just show name
          out[table] = (res.data.columns || []).map((col, i) =>
            typeof col === "object"
              ? col // in case columns: [{name, type}]
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

  // UI
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Pipeline</h2>

      {step === 1 && (
        <>
          <label className="block font-semibold mb-2">
            Select Tables (multiselect)
          </label>
          {loadingTables ? (
            <div>Loading tables...</div>
          ) : (
            <div className="space-y-2">
              {tables.map((table) => (
                <label key={table} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTables.includes(table)}
                    onChange={() => handleTableSelect(table)}
                  />
                  {table}
                </label>
              ))}
            </div>
          )}
          <button
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setStep(2)}
            disabled={selectedTables.length === 0}
          >
            Next
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <label className="block font-semibold mb-2">
            Select Columns for Each Table
          </label>
          <div>
            {selectedTables.map((table) => (
              <div key={table} className="mb-4 border rounded">
                <button
                  onClick={() => toggleExpand(table)}
                  className="flex items-center gap-2 w-full p-2 bg-gray-200 font-semibold rounded-t"
                >
                  <span>
                    {expanded[table] ? "▼" : "▶"}
                  </span>
                  {table}
                </button>
                {expanded[table] && (
                  <div className="pl-8 py-2 space-y-2 bg-white">
                    {columnsByTable[table] && columnsByTable[table].length > 0 ? (
                      columnsByTable[table].map((col, idx) => (
                        <label key={col.name || col} className="flex gap-2 items-center">
                          <input
                            type="checkbox"
                            checked={selectedColumns[table]?.includes(col.name || col)}
                            onChange={() => handleColumnSelect(table, col.name || col)}
                          />
                          <span className="font-semibold">
                            {col.name || col}
                          </span>
                          <span className="ml-2 text-gray-500">
                            {col.type || ""}
                          </span>
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
          {/* Example: add a Next or Save button for the next step */}
          <button
            className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
            Save Pipeline
          </button>
        </>
      )}
    </div>
  );
}

export default CreatePipeline;
