"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function SqlQueryRunner() {
  const [query, setQuery] = useState("SELECT TOP 20 * FROM AIAPIResponses");
  const [results, setResults] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]); // ✅ holds list of tables
  const [selectedTable, setSelectedTable] = useState(null);

  // 🔹 Fetch tables from backend API
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get("/api/tables"); // calls your handler
        setTables(res.data || []);
      } catch (err) {
        console.error("Failed to fetch tables:", err);
      }
    };
    fetchTables();
  }, []);

  // 🔹 Run SQL query
  const runQuery = async (customQuery) => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.post("/api/query", {
      query: customQuery || query,
    });

    const rows = response.data?.data || response.data || [];
    if (rows.length > 0) {
      const cols = Object.keys(rows[0]).filter((c) => c !== "data");
      setColumns(cols);
    } else {
      setColumns([]);
    }

    setResults(rows);
  } catch (err) {
    setError(err.message || "Error fetching data");
  } finally {
    setLoading(false);
  }
};


  // 🔹 Handle table click → auto-run query
  const handleTableClick = (table) => {
    setSelectedTable(table);
    const newQuery = `SELECT TOP 20 * FROM ${table}`;
    setQuery(newQuery);
    runQuery(newQuery);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with tables */}
      <div className="w-70 border-r bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Tables</h2>
        <ul className="space-y-2">
          {tables.map((table) => (
            <li
              key={table}
              onClick={() => handleTableClick(table)}
              className={`cursor-pointer px-3 py-2 rounded-md text-sm ${
                selectedTable === table
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-500"
              }`}
            >
              {table}
            </li>
          ))}
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 overflow-x-auto">
        <h1 className="text-2xl font-semibold mb-4">SQL Query Runner</h1>

        <textarea
          rows={4}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md mb-3 font-mono"
        />

        <button
          onClick={() => runQuery()}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Running..." : "Run Query"}
        </button>

        {error && <p className="text-red-500 mt-3">{error}</p>}

        {results.length > 0 && (
          <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 border-b text-left font-semibold text-gray-700"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50">
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-2 border-b text-sm text-gray-700 align-top"
                      >
                        {row[col] !== null ? String(row[col]) : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <p className="mt-4 text-gray-500">No results to display</p>
        )}
      </div>
    </div>
  );
}
