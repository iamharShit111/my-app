"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import QueryRunner from "./query/page";

export default function TablesHomePage() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [tables, setTables] = useState([]);
  const [expanded, setExpanded] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [schema, setSchema] = useState([]);
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

  const tableCountLabel = useMemo(() => {
    const count = tables.length;
    return count === 1 ? "1 table" : `${count} tables`;
  }, [tables]);

  const handleSelectTable = async (table) => {
    setSelectedTable(table);
    setSchema([]);
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/tables", { table });
      const rows = Array.isArray(res.data?.data) ? res.data.data : res.data;
      setSchema(rows || []);
    } catch (e) {
      setError("Failed to load schema");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex border-b bg-white px-6 py-4 shadow-sm">
        {["Overview", "Query Runner"].map((tab) => (
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

      {activeTab === "Overview" ? (
        <div className="flex flex-1">
          <aside className="w-[280px] border-r bg-gray-50 p-4 overflow-y-auto">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-white border text-sm"
            >
              <span className="font-medium text-gray-800">Tables</span>
              <span className="text-gray-500">{tableCountLabel}</span>
            </button>

            {expanded && (
              <ul className="mt-3 space-y-1">
                {tables.map((t) => (
                  <li key={t}>
                    <button
                      onClick={() => handleSelectTable(t)}
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
            )}
          </aside>

          <main className="flex-1 p-6 overflow-auto bg-white">
            <h1 className="text-xl font-semibold mb-4 text-gray-800">Table Schema</h1>
            {!selectedTable && (
              <p className="text-gray-500">Select a table to view its schema.</p>
            )}

            {selectedTable && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">{selectedTable}</h2>
                  {loading && <span className="text-sm text-gray-500">Loading…</span>}
                </div>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                {schema.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg shadow-sm">
                    <pre className="p-4 text-sm overflow-auto bg-gray-50 text-gray-800">
{JSON.stringify(schema, null, 2)}
                    </pre>
                  </div>
                ) : (
                  selectedTable && !loading && !error && (
                    <p className="text-gray-500">No schema details available.</p>
                  )
                )}
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="flex-1">
          <QueryRunner />
        </div>
      )}
    </div>
  );
}

function formatBool(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return value ? "Yes" : "No";
  const normalized = String(value).toLowerCase();
  if (["1", "true", "yes", "y"].includes(normalized)) return "Yes";
  if (["0", "false", "no", "n"].includes(normalized)) return "No";
  if (["nullable", "yes"].includes(normalized)) return "Yes";
  return value;
}
