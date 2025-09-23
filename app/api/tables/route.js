import axios from "axios";
import https from "https";

export async function GET() {
  try {
    const sql = `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `;

    const agent = new https.Agent({ rejectUnauthorized: false });

    const response = await axios.post(
      "https://refract-ai-staging.whiteflower-fba9f868.centralindia.azurecontainerapps.io/db/query",
      { query: sql },
      {
        headers: { "Content-Type": "application/json" },
        httpsAgent: agent,
      }
    );

    const rows = response.data?.data || [];
    const tables = rows.map((row) => row.TABLE_NAME || row.table_name || Object.values(row)[0]);

    return new Response(JSON.stringify(tables), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching tables:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch tables" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req) {
  try {
    const { table } = await req.json();
    if (!table) {
      return new Response(JSON.stringify({ error: "Missing table" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sql = `
      SELECT 
        c.COLUMN_NAME as column_name,
        c.DATA_TYPE as data_type,
        c.CHARACTER_MAXIMUM_LENGTH as max_length,
        c.IS_NULLABLE as is_nullable,
        COLUMNPROPERTY(object_id(c.TABLE_SCHEMA + '.' + c.TABLE_NAME), c.COLUMN_NAME, 'IsIdentity') as is_identity,
        CASE WHEN k.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as is_primary_key
      FROM INFORMATION_SCHEMA.COLUMNS c
      LEFT JOIN (
        SELECT ku.TABLE_NAME, ku.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
          ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
        WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
      ) k ON k.TABLE_NAME = c.TABLE_NAME AND k.COLUMN_NAME = c.COLUMN_NAME
      WHERE c.TABLE_NAME = '${table}'
      ORDER BY c.ORDINAL_POSITION
    `;

    const agent = new https.Agent({ rejectUnauthorized: false });
    const response = await axios.post(
      "https://refract-ai-staging.whiteflower-fba9f868.centralindia.azurecontainerapps.io/db/query",
      { query: sql },
      {
        headers: { "Content-Type": "application/json" },
        httpsAgent: agent,
      }
    );

    const rows = response.data?.data || [];
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching table schema:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch table schema" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
