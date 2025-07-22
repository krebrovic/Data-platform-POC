import { useEffect, useState } from "react";
import axios from "axios";

function DataModelPreview({ selectedColumns, onBack, onDone }) {
  // selectedColumns: { tableName1: [col1, col2], tableName2: [col1, ...] }

  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchModel() {
      setLoading(true);
      setError("");
      try {
        // Compose payload: tables object
        // Example: { tables: { users: ["id", "email"], products: ["id"] } }
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/generate-data-model/`,
          {
            tables: selectedColumns,
          }
        );
        setModel(res.data.model || "No model returned.");
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to generate model.");
      } finally {
        setLoading(false);
      }
    }
    fetchModel();
  }, [selectedColumns]);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">AI Data Warehouse Model Preview</h3>
      {loading && <div className="text-blue-600">Generating model with AI...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <pre className="bg-gray-900 text-green-200 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-[400px]">
          {model}
        </pre>
      )}
      <div className="flex gap-4">
        <button
          className="bg-blue-700 text-white px-5 py-2 rounded font-semibold hover:bg-blue-800"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="bg-gray-300 text-gray-800 px-5 py-2 rounded font-semibold hover:bg-gray-400"
          onClick={onDone}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default DataModelPreview;
