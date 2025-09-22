"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function SqlQueryRunner() {
  const [query, setQuery] = useState("SELECT TOP 20 * FROM AIAPIResponses");
  const [results, setResults] = useState([]);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTab, setActiveTab] = useState("Query");

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get("/api/tables");
        setTables(res.data || []);
      } catch (err) {
        console.error("Failed to fetch tables:", err);
      }
    };
    fetchTables();
  }, []);

  const runQuery = async (customQuery) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/query", {
        query: customQuery || query,
      });

      const rows = response.data?.data || response.data || [];
      setResults(rows);
      setColumns(rows.length > 0 ? Object.keys(rows[0]).filter((c) => c !== "data") : []);
    } catch (err) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (table) => {
    setSelectedTable(table);
    const newQuery = `SELECT TOP 20 * FROM ${table}`;
    setQuery(newQuery);
    runQuery(newQuery);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Top Tabs */}
      <div className="flex border-b bg-white px-6 py-4 shadow-sm">
        {["Query", "Roles & Permissions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm rounded-md mr-4 ${
              activeTab === tab
                ? "bg-white text-black border-b-2 border-violet-600"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
          <h2 className="text-md font-semibold mb-4 text-gray-700">Tables</h2>
          <ul className="space-y-1">
            {tables.map((table) => (
              <li
                key={table}
                onClick={() => handleTableClick(table)}
                className={`cursor-pointer px-3 py-2 rounded-md text-sm ${
                  selectedTable === table
                    ? "bg-violet-600 text-white"
                    : "hover:bg-gray-200 text-gray-800"
                }`}
              >
                {table}
              </li>
            ))}
          </ul>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-x-auto bg-white">
          <h1 className="text-xl font-semibold mb-4 text-gray-800">
            SQL Query Runner
          </h1>

          <textarea
            rows={4}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md mb-4 font-mono text-base text-gray-400"
          />

          <button
            onClick={() => runQuery()}
            disabled={loading}
            className="mb-6 inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-md font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Running..." : "Run Query"}
          </button>

          {error && <p className="text-red-500">{error}</p>}

          {results.length > 0 && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">
                      <input type="checkbox" />
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left font-medium text-gray-700"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 transition-colors duration-100"
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" />
                      </td>
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-3 text-gray-700">
                          {renderCell(row[col])}
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
        </main>
      </div>
    </div>
  );
}

// ✅ Optional helper to style badges
function renderCell(value) {
  if (typeof value !== "string") return value;

  // Simulate tag badge styling
  const normalized = value.toLowerCase();
  if (["active", "inactive"].includes(normalized)) {
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          normalized === "active"
            ? "bg-green-100 text-green-800"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {value}
      </span>
    );
  }

  if (["admin", "viewer", "supervisor"].includes(normalized)) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
        {value}
      </span>
    );
  }

  return value;
}
