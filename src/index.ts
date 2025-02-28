#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createToolDefinitions } from "./tools.js";
import { setupRequestHandlers } from "./requestHandler.js";
import { ensureConfigDirectories } from "./config.js";

/**
 * Main function to run the SMTP MCP server
 */
async function runServer() {
  // Ensure config directories exist
  await ensureConfigDirectories();

  // Initialize the server
  const server = new Server(
    {
      name: "smtp-email-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // Set error handler
  server.onerror = (error) => console.error("[MCP Error]", error);

  // Create tool definitions
  const TOOLS = createToolDefinitions();

  // Setup request handlers
  await setupRequestHandlers(server, TOOLS);

  // Create transport and connect
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log("SMTP MCP Server started successfully");
}

// Run the server
runServer().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
}); 