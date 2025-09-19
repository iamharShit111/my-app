// app/api/tables/route.js
import axios from "axios";
import https from "https";

export async function GET() {
  try {
    const sql = `
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `;

    const agent = new https.Agent({ rejectUnauthorized: false }); // ignore SSL (debug only)

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
    console.error("❌ Error fetching tables:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });

    return new Response(
      JSON.stringify({
        error: "Failed to fetch tables",
        details: error.message,
        code: error.code,
        serverResponse: error.response?.data || null,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
