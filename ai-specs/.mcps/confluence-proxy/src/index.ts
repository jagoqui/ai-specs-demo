#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosError } from "axios";
import { marked } from "marked";

// Environment variables
const CONFLUENCE_URL = process.env.CONFLUENCE_URL || "https://segurosti.atlassian.net";
const CONFLUENCE_COOKIES = process.env.CONFLUENCE_COOKIES;

if (!CONFLUENCE_COOKIES) {
  console.error("Error: CONFLUENCE_COOKIES environment variable is required");
  console.error("Example: CONFLUENCE_COOKIES='atl.xsrf.token=xxx; tenant.session.token=yyy; JSESSIONID=zzz'");
  process.exit(1);
}

// Create axios instance with cookie authentication for API v1 (legacy)
const confluenceApi = axios.create({
  baseURL: `${CONFLUENCE_URL}/wiki/rest/api`,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Cookie": CONFLUENCE_COOKIES,
  },
});

// Create axios instance for API v2 (new Fabric editor with ADF)
const confluenceApiV2 = axios.create({
  baseURL: `${CONFLUENCE_URL}/wiki/api/v2`,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Cookie": CONFLUENCE_COOKIES,
  },
});

/**
 * Converts Markdown to Confluence ADF (Atlassian Document Format)
 * ADF is a JSON structure used by the new Fabric editor
 */
function markdownToADF(markdown: string): any {
  // Parse markdown to HTML first
  const html = marked.parse(markdown) as string;
  
  // Convert HTML to ADF nodes
  const nodes: any[] = [];
  
  // Split by paragraphs and headings
  const lines = markdown.split('\n');
  let currentParagraph: string[] = [];
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join('\n').trim();
      if (text) {
        nodes.push(createParagraphNode(text));
      }
      currentParagraph = [];
    }
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Headings
    if (trimmed.startsWith('#')) {
      flushParagraph();
      const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        nodes.push(createHeadingNode(text, level));
      }
      continue;
    }
    
    // Code blocks
    if (trimmed.startsWith('```')) {
      flushParagraph();
      const language = trimmed.substring(3).trim();
      const codeLines: string[] = [];
      let i = lines.indexOf(line) + 1;
      
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      if (codeLines.length > 0) {
        nodes.push(createCodeBlockNode(codeLines.join('\n'), language));
      }
      continue;
    }
    
    // Unordered lists
    if (trimmed.match(/^[-*+]\s+/)) {
      flushParagraph();
      const items: string[] = [];
      let i = lines.indexOf(line);
      
      while (i < lines.length && lines[i].trim().match(/^[-*+]\s+/)) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ''));
        i++;
      }
      
      nodes.push(createBulletListNode(items));
      continue;
    }
    
    // Ordered lists
    if (trimmed.match(/^\d+\.\s+/)) {
      flushParagraph();
      const items: string[] = [];
      let i = lines.indexOf(line);
      
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s+/)) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      
      nodes.push(createOrderedListNode(items));
      continue;
    }
    
    // Tables
    if (trimmed.includes('|')) {
      flushParagraph();
      const tableLines: string[] = [];
      let i = lines.indexOf(line);
      
      while (i < lines.length && lines[i].includes('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      
      if (tableLines.length > 2) { // At least header + separator + 1 row
        nodes.push(createTableNode(tableLines));
      }
      continue;
    }
    
    // Block quotes
    if (trimmed.startsWith('>')) {
      flushParagraph();
      const text = trimmed.substring(1).trim();
      nodes.push(createBlockquoteNode(text));
      continue;
    }
    
    // Regular paragraph
    if (trimmed) {
      currentParagraph.push(line);
    } else {
      flushParagraph();
    }
  }
  
  flushParagraph();
  
  return {
    version: 1,
    type: "doc",
    content: nodes.length > 0 ? nodes : [createParagraphNode("")],
  };
}

function createParagraphNode(text: string): any {
  const content = parseInlineMarkdown(text);
  return {
    type: "paragraph",
    content,
  };
}

function createHeadingNode(text: string, level: number): any {
  const content = parseInlineMarkdown(text);
  return {
    type: "heading",
    attrs: {
      level: Math.min(level, 6),
    },
    content,
  };
}

function createCodeBlockNode(code: string, language: string): any {
  return {
    type: "codeBlock",
    attrs: {
      language: language || "plain",
    },
    content: [
      {
        type: "text",
        text: code,
      },
    ],
  };
}

function createBulletListNode(items: string[]): any {
  return {
    type: "bulletList",
    content: items.map(item => ({
      type: "listItem",
      content: [createParagraphNode(item)],
    })),
  };
}

function createOrderedListNode(items: string[]): any {
  return {
    type: "orderedList",
    content: items.map(item => ({
      type: "listItem",
      content: [createParagraphNode(item)],
    })),
  };
}

function createTableNode(lines: string[]): any {
  const rows = lines
    .filter(line => !line.includes('---'))
    .map(line => 
      line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell)
    );
  
  if (rows.length < 2) return createParagraphNode("");
  
  const [header, ...bodyRows] = rows;
  
  return {
    type: "table",
    attrs: {
      isNumberColumnEnabled: false,
      layout: "default",
    },
    content: [
      {
        type: "tableRow",
        content: header.map(cell => ({
          type: "tableHeader",
          content: [createParagraphNode(cell)],
        })),
      },
      ...bodyRows.map(row => ({
        type: "tableRow",
        content: row.map(cell => ({
          type: "tableCell",
          content: [createParagraphNode(cell)],
        })),
      })),
    ],
  };
}

function createBlockquoteNode(text: string): any {
  return {
    type: "blockquote",
    content: [createParagraphNode(text)],
  };
}

function parseInlineMarkdown(text: string): any[] {
  const content: any[] = [];
  let current = text;
  
  // Process bold (**text**)
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;
  let lastIndex = 0;
  
  while ((match = boldRegex.exec(current)) !== null) {
    // Add text before bold
    if (match.index > lastIndex) {
      const before = current.substring(lastIndex, match.index);
      content.push(...parseLinks(before));
    }
    
    // Add bold text
    content.push({
      type: "text",
      text: match[1],
      marks: [{ type: "strong" }],
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < current.length) {
    const remaining = current.substring(lastIndex);
    content.push(...parseLinks(remaining));
  }
  
  return content.length > 0 ? content : [{ type: "text", text: current }];
}

function parseLinks(text: string): any[] {
  const content: any[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  let lastIndex = 0;
  
  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before link
    if (match.index > lastIndex) {
      const before = text.substring(lastIndex, match.index);
      if (before) {
        content.push({ type: "text", text: before });
      }
    }
    
    // Add link
    content.push({
      type: "text",
      text: match[1],
      marks: [
        {
          type: "link",
          attrs: {
            href: match[2],
          },
        },
      ],
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.substring(lastIndex);
    if (remaining) {
      content.push({ type: "text", text: remaining });
    }
  }
  
  return content.length > 0 ? content : [{ type: "text", text }];
}

// MCP Server
const server = new Server(
  {
    name: "confluence-vpn-proxy",
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
        name: "get_confluence_page",
        description: "Fetch a Confluence page by ID with full content",
        inputSchema: {
          type: "object",
          properties: {
            pageId: {
              type: "string",
              description: "The ID of the Confluence page to fetch",
            },
            expand: {
              type: "string",
              description: "Comma-separated list of properties to expand (e.g., 'body.storage,version,space')",
              default: "body.storage,body.atlas_doc_format,version,space,ancestors",
            },
          },
          required: ["pageId"],
        },
      },
      {
        name: "search_confluence",
        description: "Search for Confluence pages by CQL (Confluence Query Language)",
        inputSchema: {
          type: "object",
          properties: {
            cql: {
              type: "string",
              description: "CQL query (e.g., 'space=EAV AND type=page')",
            },
            limit: {
              type: "number",
              description: "Maximum number of results to return",
              default: 10,
            },
          },
          required: ["cql"],
        },
      },
      {
        name: "get_page_by_space_and_title",
        description: "Get a Confluence page by space key and title",
        inputSchema: {
          type: "object",
          properties: {
            spaceKey: {
              type: "string",
              description: "The space key (e.g., 'EAV')",
            },
            title: {
              type: "string",
              description: "The page title",
            },
          },
          required: ["spaceKey", "title"],
        },
      },
      {
        name: "create_confluence_page",
        description: "Create a new Confluence page from Markdown (uses new Fabric editor with ADF format)",
        inputSchema: {
          type: "object",
          properties: {
            spaceKey: {
              type: "string",
              description: "The space key where to create the page (e.g., 'EAV')",
            },
            title: {
              type: "string",
              description: "The title of the new page",
            },
            content: {
              type: "string",
              description: "The page content in Markdown format",
            },
            parentId: {
              type: "string",
              description: "Optional parent page ID",
            },
          },
          required: ["spaceKey", "title", "content"],
        },
      },
      {
        name: "update_confluence_page",
        description: "Update an existing Confluence page with Markdown content (uses new Fabric editor with ADF format)",
        inputSchema: {
          type: "object",
          properties: {
            pageId: {
              type: "string",
              description: "The ID of the page to update",
            },
            title: {
              type: "string",
              description: "New title (optional, keep current if not provided)",
            },
            content: {
              type: "string",
              description: "New content in Markdown format",
            },
          },
          required: ["pageId", "content"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "get_confluence_page": {
        const { pageId, expand = "body.storage,body.atlas_doc_format,version,space,ancestors" } = args as {
          pageId: string;
          expand?: string;
        };

        const response = await confluenceApi.get(`/content/${pageId}`, {
          params: { expand },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "search_confluence": {
        const { cql, limit = 10 } = args as { cql: string; limit?: number };

        const response = await confluenceApi.get("/content/search", {
          params: {
            cql,
            limit,
            expand: "body.storage,body.atlas_doc_format,version,space",
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "get_page_by_space_and_title": {
        const { spaceKey, title } = args as { spaceKey: string; title: string };

        const response = await confluenceApi.get("/content", {
          params: {
            spaceKey,
            title,
            expand: "body.storage,body.atlas_doc_format,version,space,ancestors",
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "create_confluence_page": {
        const { spaceKey, title, content, parentId } = args as {
          spaceKey: string;
          title: string;
          content: string;
          parentId?: string;
        };

        // Convert markdown to HTML using marked library
        const htmlContent = marked.parse(content) as string;

        const pageData: any = {
          type: "page",
          title,
          space: {
            key: spaceKey,
          },
          body: {
            storage: {
              value: htmlContent,
              representation: "storage",
            },
          },
        };

        // Add parent if provided
        if (parentId) {
          pageData.ancestors = [{ id: parentId }];
        }

        const response = await confluenceApi.post("/content", pageData);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "update_confluence_page": {
        const { pageId, title, content } = args as {
          pageId: string;
          title?: string;
          content: string;
        };

        // Get current page to get version number
        const currentPage = await confluenceApi.get(`/content/${pageId}`, {
          params: { expand: "version" },
        });

        // Convert markdown to HTML
        const htmlContent = marked.parse(content) as string;

        const updateData: any = {
          version: {
            number: currentPage.data.version.number + 1,
          },
          type: "page",
          body: {
            storage: {
              value: htmlContent,
              representation: "storage",
            },
          },
        };

        // Update title if provided
        if (title) {
          updateData.title = title;
        }

        const response = await confluenceApi.put(`/content/${pageId}`, updateData);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        content: [
          {
            type: "text",
            text: `Confluence API Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`,
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Confluence VPN Proxy MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
