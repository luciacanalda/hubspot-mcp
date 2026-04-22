import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import axios from "axios";
import { z } from "zod";

const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;
const app = express();
app.use(express.json());

const server = new McpServer({ name: "hubspot-mcp", version: "1.0.0" });

server.tool(
  "get_contacts",
  { limit: z.number().optional() },
  async ({ limit = 10 }) => {
    const res = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=${limit}`,
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
    return { content: [{ type: "text", text: JSON.stringify(res.data.results, null, 2) }] };
  }
);

server.tool(
  "get_deals",
  { limit: z.number().optional() },
  async ({ limit = 10 }) => {
    const res = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/deals?limit=${limit}`,
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
    return { content: [{ type: "text", text: JSON.stringify(res.data.results, null, 2) }] };
  }
);

server.tool(
  "get_tickets",
  { limit: z.number().optional() },
  async ({ limit = 10 }) => {
    const res = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/tickets?limit=${limit}&properties=subject,content,hs_ticket_status,hs_pipeline_stage`,
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
    return { content: [{ type: "text", text: JSON.stringify(res.data.results, null, 2) }] };
  }
);

server.tool(
  "get_ticket",
  { ticket_id: z.string() },
  async ({ ticket_id }) => {
    const res = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/tickets/${ticket_id}?properties=subject,content,hs_ticket_status,hs_pipeline_stage`,
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
    return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
  }
);

server.tool(
  "get_conversation_threads",
  { limit: z.number().optional() },
  async ({ limit = 10 }) => {
    const res = await axios.get(
      `https://api.hubapi.com/conversations/v3/conversations/threads?limit=${limit}`,
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
    return { content: [{ type: "text", text: JSON.stringify(res.data.results, null, 2) }] };
  }
);

server.tool(
  "get_thread_messages",
  { thread_id: z.string() },
  async ({ thread_id }) => {
    const res = await axios.get(
      `https://api.hubapi.com/conversations/v3/conversations/threads/${thread_id}/messages`,
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
    return { content: [{ type: "text", text: JSON.stringify(res.data.results, null, 2) }] };
  }
);

server.tool(
  "send_message_to_thread",
  { thread_id: z.string(), text: z.string() },
  async ({ thread_id, text }) => {
    const res = await axios.post(
      `https://api.hubapi.com/conversations/v3/conversations/threads/${thread_id}/messages`,
      { type: "MESSAGE", text },
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, "Content-Type": "application/json" } }
    );
    return { content: [{ type: "text", text: JSON.stringify(res.data, null, 2) }] };
  }
);

server.tool(
  "get_companies",
  { limit: z.number().optional() },
  async ({ limit = 10 }) => {
    const res = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/companies?limit=${limit}&properties=name,domain,industry`,
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}` } }
    );
    return { content: [{ type: "text", text: JSON.stringify(res.data.results, null, 2) }] };
  }
);

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => transport.close());
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.listen(3000, () => console.log("HubSpot MCP running on port 3000"));
