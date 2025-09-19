import axios from "axios";

export async function POST(req) {
  try {
    const body = await req.json();
    const response = await axios.post(
      "https://refract-ai-staging.whiteflower-fba9f868.centralindia.azurecontainerapps.io/db/query",
      body,
      { headers: { "Content-Type": "application/json" } }
    );

    let result = response.data;

    // 🛠 Parse the stringified "data" field if it exists
    if (result?.data && typeof result.data === "string") {
      try {
        result.data = JSON.parse(result.data);
      } catch (e) {
        console.error("Failed to parse nested data:", e);
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ API Error:", err.response?.data || err.message);
    return new Response(
      JSON.stringify({ error: err.response?.data || err.message }),
      { status: 500 }
    );
  }
}
