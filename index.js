import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import axios from "axios";
import { z } from "zod";

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
const app = express();
app.use(express.json());

const server = new McpServer({ name: "hubspot-mcp", version: "1.0.0" });

// Tool: Get Contacts
server.tool(
  "get_contacts",
  { limit: z.number().optional() },
  async ({ limit = 10 }) => {
    const res = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=${limit}`,
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
    return {
      content: [{ type: "text", text: JSON.stringify(res.data.results, null, 2) }]
    };
  }
);

// Tool: Get Deals
server.tool(
  "get_deals",
  { limit: z.number().optional() },
  async ({ limit = 10 }) => {
    const res = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/deals?limit=${limit}`,
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
    return {
      content: [{ type: "text", text: JSON.stringify(res.data.results, null, 2) }]
    };
  }
);

// MCP HTTP endpoint
app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3000, () => console.log("HubSpot MCP running on port 3000"));
