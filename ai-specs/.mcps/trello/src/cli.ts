#!/usr/bin/env node

import { Command } from "commander";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { TrelloClient } from "./trello-client.js";

dotenv.config();

const API_KEY = process.env.TRELLO_API_KEY;
const TOKEN = process.env.TRELLO_TOKEN;

if (!API_KEY || !TOKEN) {
  console.error("Error: TRELLO_API_KEY and TRELLO_TOKEN must be set");
  console.error(
    "Please create a .env file with your credentials or set them as environment variables"
  );
  process.exit(1);
}

const trello = new TrelloClient(API_KEY, TOKEN);
const program = new Command();

program
  .name("trello-cli")
  .description("Trello CLI for enriching user stories")
  .version("1.0.0");

// Command: enrich-us
program
  .command("enrich-us <identifier>")
  .description("Enrich a Trello card following product best practices")
  .option("-b, --board <boardId>", "Board ID to search in")
  .option("-o, --output <file>", "Output file for the enriched story")
  .action(async (identifier: string, options) => {
    try {
      console.log("🔍 Searching for card:", identifier);

      // Get the card
      let card;
      try {
        card = await trello.getCard(identifier);
      } catch (error) {
        console.error("❌ No card found matching:", identifier);
        console.log("\n💡 Troubleshooting:");
        console.log("  1. Make sure the card exists and you have access to it");
        console.log('  2. Try using the full card ID (e.g., "abc123xyz")');
        console.log("  3. Try using the card URL");
        console.log(
          '  4. Use the search command first: trello-cli search "keyword"'
        );
        console.log("\n📋 Example searches:");
        console.log('  trello-cli search "SCRUM-10"');
        console.log('  trello-cli search "in progress"');
        console.log("  trello-cli get-boards  # to see your boards");
        process.exit(1);
      }

      console.log("✅ Found card:", card.name);
      console.log("🔗 URL:", card.url);
      console.log(
        "📋 Current description length:",
        card.desc?.length || 0,
        "chars"
      );

      // Get the board and lists
      const lists = await trello.getLists(card.idBoard);
      const currentList = lists.find((l) => l.id === card.idList);

      console.log("📍 Current list:", currentList?.name || "Unknown");
      console.log("\n--- ORIGINAL CONTENT ---");
      console.log(card.desc || "(empty)");
      console.log("\n--- END ORIGINAL ---\n");

      // Prepare enriched content template
      const enrichedTemplate = `## [Original]

${card.desc || "(No description provided)"}

## [Enhanced]

### 📋 User Story
**As a** [user type]  
**I want** [goal]  
**So that** [benefit]

### 🎯 Acceptance Criteria
- [ ] Criterion 1: [Specific, measurable requirement]
- [ ] Criterion 2: [Specific, measurable requirement]
- [ ] Criterion 3: [Specific, measurable requirement]

### 🔧 Technical Implementation

#### Endpoints
\`\`\`
POST /api/[resource]
  - Request: { field1: type, field2: type }
  - Response: { id: string, ...data }

GET /api/[resource]/:id
  - Response: { id: string, ...data }

PUT /api/[resource]/:id
  - Request: { field1: type, field2: type }
  - Response: { id: string, ...data }

DELETE /api/[resource]/:id
  - Response: { success: boolean }
\`\`\`

#### Data Model Changes
**[ModelName]**
- \`fieldName\`: \`Type\` - Description and purpose
- \`anotherField\`: \`Type\` - Description and purpose

#### Files to Modify
Based on DDD architecture standards:

**Domain Layer**
- \`src/domain/models/[ModelName].ts\` - Entity definition
- \`src/domain/repositories/[ModelName]Repository.ts\` - Repository interface

**Application Layer**
- \`src/application/services/[ServiceName].ts\` - Business logic
- \`src/application/validators/[ValidatorName].ts\` - Input validation

**Presentation Layer**
- \`src/presentation/controllers/[ControllerName].ts\` - HTTP handlers
- \`src/presentation/routes/[routeName].ts\` - Route definitions

**Infrastructure** (if needed)
- \`prisma/schema.prisma\` - Database schema updates
- \`prisma/migrations/\` - Database migrations

### ✅ Definition of Done
- [ ] Code implemented following DDD and SOLID principles
- [ ] Unit tests written (minimum 90% coverage)
- [ ] Integration tests added for API endpoints
- [ ] Prisma migrations created and tested
- [ ] API documentation updated (OpenAPI/Swagger)
- [ ] Code reviewed and approved
- [ ] Tested in development environment
- [ ] No linting or TypeScript errors
- [ ] Performance tested (if applicable)

### 📚 Documentation Updates
- [ ] Update API specification (\`specs/api-spec.yml\`)
- [ ] Update data model documentation (\`specs/data-model.md\`)
- [ ] Update README.md if new features added
- [ ] Add inline code comments for complex logic
- [ ] Update technical documentation

### 🔒 Non-Functional Requirements

**Security**
- [ ] Input validation and sanitization
- [ ] Authentication/authorization checks
- [ ] SQL injection prevention (via Prisma)
- [ ] XSS prevention
- [ ] Rate limiting (if public endpoint)

**Performance**
- [ ] Database queries optimized
- [ ] Proper indexing on frequently queried fields
- [ ] Response time < [X]ms for 95th percentile
- [ ] Caching strategy (if applicable)

**Error Handling**
- [ ] Proper HTTP status codes
- [ ] Descriptive error messages
- [ ] Logging for debugging
- [ ] Graceful degradation

### 🧪 Testing Strategy

**Unit Tests**
\`\`\`typescript
// Example test structure
describe('[ServiceName]', () => {
  describe('[methodName]', () => {
    it('should [expected behavior] when [condition]', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
\`\`\`

**Integration Tests**
- Test API endpoints with real HTTP requests
- Test database operations with test database
- Test error scenarios and edge cases

### 📖 References
- [Link to related tickets]
- [Link to design specs/mockups]
- [Link to external documentation]
- Backend Standards: \`ai-specs/specs/backend-standards.mdc\`
- API Specification: \`ai-specs/specs/api-spec.yml\`
- Data Model: \`ai-specs/specs/data-model.md\`
`;

      // Save to file if requested
      if (options.output) {
        const outputPath = path.resolve(options.output);
        fs.writeFileSync(outputPath, enrichedTemplate, "utf-8");
        console.log("💾 Template saved to:", outputPath);
        console.log("\n📝 Next steps:");
        console.log(
          "1. Open the file and fill in the template with specific details"
        );
        console.log("2. Review based on project context and standards");
        console.log(
          "3. Update the card: trello-cli update-card",
          card.id,
          "--file",
          outputPath
        );
      } else {
        console.log("📝 ENRICHMENT TEMPLATE:");
        console.log(enrichedTemplate);
        console.log("\n💡 Tip: Use --output flag to save to a file");
        console.log(
          "Example: trello-cli enrich-us",
          identifier,
          "--output enriched.md"
        );
      }

      // Show next actions
      console.log("\n🔄 Suggested workflow:");
      console.log(
        `  1. trello-cli enrich-us "${identifier}" --output enriched-${card.id}.md`
      );
      console.log(`  2. Edit enriched-${card.id}.md with specific details`);
      console.log(
        `  3. trello-cli update-card ${card.id} --file enriched-${card.id}.md`
      );

      if (currentList?.name?.toLowerCase().includes("refine")) {
        const validationList = lists.find(
          (l) =>
            l.name.toLowerCase().includes("validation") ||
            l.name.toLowerCase().includes("pending")
        );
        if (validationList) {
          console.log(
            `  4. trello-cli move-card ${card.id} ${validationList.id}  # Move to validation`
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Command: update-card
program
  .command("update-card <cardId>")
  .description("Update a Trello card description")
  .option("-f, --file <path>", "Read description from file")
  .option("-d, --desc <text>", "Description text")
  .option("-n, --name <name>", "Card name")
  .action(async (cardId: string, options) => {
    try {
      let desc = options.desc;

      if (options.file) {
        const filePath = path.resolve(options.file);
        if (!fs.existsSync(filePath)) {
          console.error("❌ File not found:", filePath);
          process.exit(1);
        }
        desc = fs.readFileSync(filePath, "utf-8");
        console.log("📄 Read description from:", filePath);
      }

      if (!desc && !options.name) {
        console.error("❌ Please provide either --file, --desc, or --name");
        console.log("Examples:");
        console.log("  trello-cli update-card <cardId> --file enriched.md");
        console.log(
          '  trello-cli update-card <cardId> --desc "New description"'
        );
        console.log('  trello-cli update-card <cardId> --name "New Name"');
        process.exit(1);
      }

      console.log("🔄 Updating card:", cardId);
      const updated = await trello.updateCard(cardId, {
        name: options.name,
        desc,
      });

      console.log("✅ Card updated successfully");
      console.log("📇 Name:", updated.name);
      console.log("🔗 URL:", updated.url);
      console.log("📝 Description length:", updated.desc?.length || 0, "chars");
    } catch (error) {
      console.error(
        "❌ Error updating card:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Command: move-card
program
  .command("move-card <cardId> <listId>")
  .description("Move a card to a different list")
  .action(async (cardId: string, listId: string) => {
    try {
      console.log("🔄 Moving card:", cardId);
      console.log("📍 To list:", listId);

      const moved = await trello.moveCard(cardId, listId);
      console.log("✅ Card moved successfully");
      console.log("📇 Name:", moved.name);
      console.log("🔗 URL:", moved.url);
    } catch (error) {
      console.error(
        "❌ Error moving card:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Command: get-card
program
  .command("get-card <identifier>")
  .description("Get card details")
  .option("-j, --json", "Output as JSON")
  .action(async (identifier: string, options) => {
    try {
      console.log("🔍 Getting card:", identifier);
      const card = await trello.getCard(identifier);

      if (options.json) {
        console.log(JSON.stringify(card, null, 2));
      } else {
        console.log("\n📇 Card Details:");
        console.log("  Name:", card.name);
        console.log("  ID:", card.id);
        console.log("  URL:", card.url);
        console.log("  Board ID:", card.idBoard);
        console.log("  List ID:", card.idList);
        console.log("\n📝 Description:");
        console.log(card.desc || "(empty)");
      }
    } catch (error) {
      console.error("❌ Card not found:", identifier);
      console.log("\n💡 Try using:");
      console.log("  - Full card ID");
      console.log("  - Card URL");
      console.log('  - Search first: trello-cli search "keyword"');
      process.exit(1);
    }
  });

// Command: search
program
  .command("search <query>")
  .description("Search for cards")
  .option("-b, --board <boardId>", "Filter by board")
  .option("-l, --limit <number>", "Limit number of results", "10")
  .action(async (query: string, options) => {
    try {
      console.log("🔍 Searching for:", query);
      if (options.board) {
        console.log("📋 In board:", options.board);
      }

      const cards = await trello.searchCards(query, options.board);

      if (cards.length === 0) {
        console.log("❌ No cards found");
        console.log("\n💡 Tips:");
        console.log("  - Try different keywords");
        console.log("  - Check if you have access to the boards");
        console.log("  - List your boards: trello-cli get-boards");
        return;
      }

      const limit = parseInt(options.limit, 10);
      const displayCards = cards.slice(0, limit);

      console.log(
        `\n✅ Found ${cards.length} card(s), showing ${displayCards.length}:\n`
      );
      displayCards.forEach((card, i) => {
        console.log(`${i + 1}. ${card.name}`);
        console.log(`   ID: ${card.id}`);
        console.log(`   URL: ${card.url}`);
        console.log("");
      });

      if (cards.length > limit) {
        console.log(
          `... and ${cards.length - limit} more. Use --limit to see more.`
        );
      }
    } catch (error) {
      console.error(
        "❌ Error searching:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Command: get-boards
program
  .command("get-boards")
  .description("Get all your Trello boards")
  .option("-j, --json", "Output as JSON")
  .action(async (options) => {
    try {
      console.log("📋 Fetching your boards...\n");
      const boards = await trello.getBoards();

      if (boards.length === 0) {
        console.log("No boards found");
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(boards, null, 2));
      } else {
        console.log(`Found ${boards.length} board(s):\n`);
        boards.forEach((board, i) => {
          console.log(`${i + 1}. ${board.name}`);
          console.log(`   ID: ${board.id}`);
          console.log(`   URL: ${board.url}`);
          console.log("");
        });
      }
    } catch (error) {
      console.error(
        "❌ Error fetching boards:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Command: get-lists
program
  .command("get-lists <boardId>")
  .description("Get all lists from a board")
  .option("-j, --json", "Output as JSON")
  .action(async (boardId: string, options) => {
    try {
      console.log("📋 Fetching lists for board:", boardId, "\n");
      const lists = await trello.getLists(boardId);

      if (lists.length === 0) {
        console.log("No lists found in this board");
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(lists, null, 2));
      } else {
        console.log(`Found ${lists.length} list(s):\n`);
        lists.forEach((list, i) => {
          console.log(`${i + 1}. ${list.name}`);
          console.log(`   ID: ${list.id}`);
          console.log("");
        });
      }
    } catch (error) {
      console.error(
        "❌ Error fetching lists:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Command: add-comment
program
  .command("add-comment <cardId> <text>")
  .description("Add a comment to a card")
  .action(async (cardId: string, text: string) => {
    try {
      console.log("💬 Adding comment to card:", cardId);
      await trello.addComment(cardId, text);
      console.log("✅ Comment added successfully");
    } catch (error) {
      console.error(
        "❌ Error adding comment:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

// Command: create-card
program
  .command("create-card <listId> <name>")
  .description("Create a new card in a list")
  .option("-d, --desc <description>", "Card description")
  .option("-p, --pos <position>", "Position: top, bottom, or number", "top")
  .action(async (listId: string, name: string, options) => {
    try {
      console.log("🆕 Creating card:", name);
      console.log("📍 In list:", listId);

      const card = await trello.createCard(
        listId,
        name,
        options.desc,
        options.pos
      );

      console.log("✅ Card created successfully");
      console.log("📇 Name:", card.name);
      console.log("🆔 ID:", card.id);
      console.log("🔗 URL:", card.url);
      console.log("\n💡 Next steps:");
      console.log(
        `  trello-cli enrich-us ${card.id} --output ${card.id}-enriched.md`
      );
    } catch (error) {
      console.error(
        "❌ Error creating card:",
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

program.parse();
