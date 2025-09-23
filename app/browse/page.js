"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function TableDataBrowser() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await axios.get("/api/tables");
        setTables(res.data || []);
      } catch (e) {
        setError("Failed to load tables");
      }
    };
    fetchTables();
  }, []);

  const loadTableData = async (tableName) => {
    setSelectedTable(tableName);
    setRows([]);
    setColumns([]);
    setLoading(true);
    setError(null);
    try {
      const q = `SELECT TOP 50 * FROM ${tableName}`;
      const res = await axios.post("/api/query", { query: q });
      const data = res.data?.data || res.data || [];
      setRows(Array.isArray(data) ? data : []);
      setColumns(data.length > 0 ? Object.keys(data[0]) : []);
    } catch (e) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <aside className="w-[280px] border-r bg-gray-50 p-4 overflow-y-auto">
        <div className="mb-3 text-sm text-gray-600">
          {tables.length === 1 ? "1 table" : `${tables.length} tables`}
        </div>
        <ul className="space-y-1">
          {tables.map((t) => (
            <li key={t}>
              <button
                onClick={() => loadTableData(t)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm overflow-hidden ${
                  selectedTable === t
                    ? "bg-violet-600 text-white"
                    : "hover:bg-gray-200 text-gray-800"
                }`}
              >
                <span className="block truncate">{t}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-6 overflow-auto bg-white">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            {selectedTable ? selectedTable : "Select a table"}
          </h1>
          {loading && <span className="text-sm text-gray-500">Loading…</span>}
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}

        {selectedTable && rows.length > 0 && (
          <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 text-left font-medium text-gray-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-gray-800">
                        {formatCell(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedTable && !loading && rows.length === 0 && !error && (
          <p className="text-gray-500">No rows to display.</p>
        )}
      </main>
    </div>
  );
}

function formatCell(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}


