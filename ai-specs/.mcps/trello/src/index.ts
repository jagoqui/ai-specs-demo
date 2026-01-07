#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { TrelloClient } from "./trello-client.js";

// Load environment variables
dotenv.config();

const API_KEY = process.env.TRELLO_API_KEY;
const TOKEN = process.env.TRELLO_TOKEN;

if (!API_KEY || !TOKEN) {
  console.error(
    "Error: TRELLO_API_KEY and TRELLO_TOKEN must be set in environment variables"
  );
  process.exit(1);
}

// Initialize Trello client
const trelloClient = new TrelloClient(API_KEY, TOKEN);

// Create MCP server
const server = new Server(
  {
    name: "trello-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_card",
        description: "Get details of a Trello card by ID, URL, or search query",
        inputSchema: {
          type: "object",
          properties: {
            identifier: {
              type: "string",
              description:
                "Card ID, card URL, or search keywords to find the card",
            },
          },
          required: ["identifier"],
        },
      },
      {
        name: "update_card",
        description: "Update a Trello card description and/or name",
        inputSchema: {
          type: "object",
          properties: {
            cardId: {
              type: "string",
              description: "The ID of the card to update",
            },
            name: {
              type: "string",
              description: "New name for the card (optional)",
            },
            desc: {
              type: "string",
              description: "New description for the card (optional)",
            },
          },
          required: ["cardId"],
        },
      },
      {
        name: "move_card",
        description: "Move a card to a different list",
        inputSchema: {
          type: "object",
          properties: {
            cardId: {
              type: "string",
              description: "The ID of the card to move",
            },
            listId: {
              type: "string",
              description: "The ID of the destination list",
            },
          },
          required: ["cardId", "listId"],
        },
      },
      {
        name: "get_lists",
        description: "Get all lists from a Trello board",
        inputSchema: {
          type: "object",
          properties: {
            boardId: {
              type: "string",
              description: "The ID of the board",
            },
          },
          required: ["boardId"],
        },
      },
      {
        name: "get_boards",
        description: "Get all boards for the authenticated user",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_cards",
        description: "Search for cards across all boards",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query (card name, description, or keywords)",
            },
            boardId: {
              type: "string",
              description: "Optional: Filter by specific board ID",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "add_comment",
        description: "Add a comment to a Trello card",
        inputSchema: {
          type: "object",
          properties: {
            cardId: {
              type: "string",
              description: "The ID of the card",
            },
            text: {
              type: "string",
              description: "The comment text",
            },
          },
          required: ["cardId", "text"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_card": {
        const { identifier } = args as { identifier: string };
        const card = await trelloClient.getCard(identifier);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(card, null, 2),
            },
          ],
        };
      }

      case "update_card": {
        const { cardId, name, desc } = args as {
          cardId: string;
          name?: string;
          desc?: string;
        };
        const updatedCard = await trelloClient.updateCard(cardId, {
          name,
          desc,
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(updatedCard, null, 2),
            },
          ],
        };
      }

      case "move_card": {
        const { cardId, listId } = args as { cardId: string; listId: string };
        const movedCard = await trelloClient.moveCard(cardId, listId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(movedCard, null, 2),
            },
          ],
        };
      }

      case "get_lists": {
        const { boardId } = args as { boardId: string };
        const lists = await trelloClient.getLists(boardId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(lists, null, 2),
            },
          ],
        };
      }

      case "get_boards": {
        const boards = await trelloClient.getBoards();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(boards, null, 2),
            },
          ],
        };
      }

      case "search_cards": {
        const { query, boardId } = args as { query: string; boardId?: string };
        const cards = await trelloClient.searchCards(query, boardId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(cards, null, 2),
            },
          ],
        };
      }

      case "add_comment": {
        const { cardId, text } = args as { cardId: string; text: string };
        const comment = await trelloClient.addComment(cardId, text);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(comment, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Trello MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
