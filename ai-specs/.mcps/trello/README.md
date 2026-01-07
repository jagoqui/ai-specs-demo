# Trello CLI & MCP Server

CLI tool and Model Context Protocol server for Trello integration. Enrich user stories, manage cards, and automate workflows directly from the command line or with AI agents.

## Features

- 🔍 **Search and retrieve cards** by ID, URL, or keywords
- ✏️ **Update card details** (name, description)
- 🚀 **Move cards** between lists
- 📋 **List boards and lists**
- 💬 **Add comments** to cards
- 🔎 **Search across boards**
- 📝 **Enrich user stories** with technical details and best practices

## Installation

### 1. Install Dependencies

```bash
cd ai-specs/.mcps/trello
npm install
```

### 2. Get Trello API Credentials

1. Go to [Trello App Key page][trello-app-key]
2. Copy your **API Key**
3. Click on the **Token** link to generate a token
4. Copy your **Token**

[trello-app-key]: https://trello.com/app-key

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your credentials
TRELLO_API_KEY=your-api-key-here
TRELLO_TOKEN=your-token-here
```

### 4. Build the Tool

```bash
npm run build
```

### 5. Install Globally (Optional)

```bash
npm run install-global
# Or manually: npm link
```

## Usage

### CLI Commands

The CLI is the primary way to interact with Trello from the command line. Perfect for scripting, automation, and direct usage with GitHub Copilot.

#### 🌟 Enrich User Story

Generate an enriched template for a Trello card following product best practices:

```bash
# Search by keywords
trello-cli enrich-us "in progress" --output enriched.md

# By card ID
trello-cli enrich-us abc12345 --output SCRUM-10-enriched.md

# By URL
trello-cli enrich-us "https://trello.com/c/abc12345" --output enriched.md

# Without file (prints to console)
trello-cli enrich-us "SCRUM-10"
```

This command:

1. Finds the card
2. Shows current description
3. Generates a comprehensive template with:
   - User story format
   - Acceptance criteria
   - Technical implementation details
   - API endpoints structure
   - Files to modify
   - Testing requirements
   - Definition of Done
4. Suggests next actions (update card, move to validation)

#### 📝 Update Card

Update a card's description or name:

```bash
# Update from file
trello-cli update-card abc12345 --file enriched.md

# Update description directly
trello-cli update-card abc12345 --desc "New description"

# Update name
trello-cli update-card abc12345 --name "Updated Card Name"

# Update both
trello-cli update-card abc12345 --name "New Name" --file content.md
```

#### 🚀 Move Card

Move a card to a different list:

```bash
trello-cli move-card <cardId> <listId>
```

#### 🔍 Get Card Details

View detailed information about a card:

```bash
# Formatted output
trello-cli get-card abc12345

# JSON output
trello-cli get-card abc12345 --json

# By URL
trello-cli get-card "https://trello.com/c/abc12345"

# By search
trello-cli get-card "in progress"
```

#### 🔎 Search Cards

Search for cards across all boards:

```bash
# Search all boards
trello-cli search "user authentication"

# Filter by board
trello-cli search "login" --board <boardId>
```

#### 📋 List Boards

Get all your Trello boards:

```bash
# Formatted output
trello-cli get-boards

# JSON output
trello-cli get-boards --json
```

#### 📑 List Board Lists

Get all lists from a specific board:

```bash
# Formatted output
trello-cli get-lists <boardId>

# JSON output
trello-cli get-lists <boardId> --json
```

#### 💬 Add Comment

Add a comment to a card:

```bash
trello-cli add-comment <cardId> "This looks good to me!"
```

### Workflow Example

Complete workflow for enriching a user story:

```bash
# 1. Search for the card
trello-cli search "SCRUM-10"

# 2. Enrich the user story
trello-cli enrich-us "SCRUM-10" --output SCRUM-10-enriched.md

# 3. Edit the file with your specific details
# (Open SCRUM-10-enriched.md in your editor)

# 4. Update the card
trello-cli update-card abc12345 --file SCRUM-10-enriched.md

# 5. Get list IDs
trello-cli get-lists <boardId>

# 6. Move to validation
trello-cli move-card abc12345 <validationListId>
```

## MCP Server (Claude Desktop)

If you're using Claude Desktop or Cursor, you can also use this as an MCP server.

Add this configuration to your Claude Desktop config file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "trello": {
      "command": "node",
      "args": [
        "C:\\Users\\User\\Desktop\\ai-specs-demo\\ai-specs\\.mcps\\trello\\dist\\index.js"
      ],
      "env": {
        "TRELLO_API_KEY": "your-api-key-here",
        "TRELLO_TOKEN": "your-token-here"
      }
    }
  }
}
```

**Important:** Replace the path with your actual project path.

## MCP Available Tools

### `get_card`

Get details of a Trello card.

**Parameters:**

- `identifier` (string): Card ID, URL, or search keywords

**Example:**

```bash
Get card "SCRUM-123"
Get card https://trello.com/c/abc12345/card-name
Get card "the one in progress"
```

### `update_card`

Update a card's name and/or description.

**Parameters:**

- `cardId` (string): The card ID
- `name` (string, optional): New card name
- `desc` (string, optional): New card description

### `move_card`

Move a card to a different list.

**Parameters:**

- `cardId` (string): The card ID
- `listId` (string): The destination list ID

### `get_lists`

Get all lists from a board.

**Parameters:**

- `boardId` (string): The board ID

### `get_boards`

Get all boards for the authenticated user.

**Parameters:** None

### `search_cards`

Search for cards across all boards.

**Parameters:**

- `query` (string): Search query
- `boardId` (string, optional): Filter by specific board

### `add_comment`

Add a comment to a card.

**Parameters:**

- `cardId` (string): The card ID
- `text` (string): Comment text

## Using with AI Commands

### With GitHub Copilot

The CLI is designed to work seamlessly with GitHub Copilot in the terminal:

```bash
# In your terminal, GitHub Copilot can suggest commands like:
# "enrich the trello card for SCRUM-10"

# Copilot suggests:
trello-cli enrich-us "SCRUM-10" --output SCRUM-10-enriched.md

# "update the card abc12345 with the enriched content"
# Copilot suggests:
trello-cli update-card abc12345 --file SCRUM-10-enriched.md
```

### With Claude Desktop (MCP)

If using Claude Desktop, you can use the [`enrich-us-trello.md`](../../.commands/enrich-us-trello.md) command:

```bash
/enrich-us-trello "the card in To Refine"
/enrich-us-trello https://trello.com/c/abc12345
/enrich-us-trello CARD_ID
```

The command will:

1. Find the card using the Trello MCP
2. Analyze the current description
3. Enhance it with technical details from project specs
4. Update the card with structured [Original] and [Enhanced] sections
5. Move it to "Pending Refinement Validation" if needed

### Integration with Project Standards

The enrichment templates automatically reference your project standards:

- [`backend-standards.mdc`](../../specs/backend-standards.mdc) for backend tasks
- [`frontend-standards.mdc`](../../specs/frontend-standards.mdc) for frontend tasks
- [`base-standards.mdc`](../../specs/base-standards.mdc) for general standards
- [`api-spec.yml`](../../specs/api-spec.yml) for API contracts
- [`data-model.md`](../../specs/data-model.md) for data structures

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Test CLI Locally

```bash
# Test without installing globally
npm run build
node dist/cli.js enrich-us "test"
```

### Test MCP Server Locally

```bash
npm run start:mcp
```

## Project Structure

```text
.mcps/trello/
├── src/
│   ├── cli.ts             # CLI entry point
│   ├── index.ts           # MCP server entry point
│   └── trello-client.ts   # Trello API client
├── dist/                  # Compiled JavaScript
├── .env.example           # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Reusability

This tool is designed to be reusable across projects:

1. **Copy the entire `.mcps/trello` folder** to your new project's `ai-specs` directory
2. **Install dependencies**: `npm install`
3. **Configure credentials** in `.env`
4. **Build**: `npm run build`
5. **Install globally**: `npm run install-global`
6. **Start using**: `trello-cli enrich-us "card name"`

For MCP server usage, update Claude Desktop config with the new path.

## Troubleshooting

### CLI Issues

#### "TRELLO_API_KEY and TRELLO_TOKEN must be set"

- Make sure you've created a `.env` file in `ai-specs/.mcps/trello/` with your credentials
- Or export them in your shell:

  ```bash
  export TRELLO_API_KEY=your-key
  export TRELLO_TOKEN=your-token
  ```

#### "command not found: trello-cli"

- Run `npm run install-global` to link the CLI globally
- Or use it locally: `node dist/cli.js <command>`

#### "File not found" when updating card

- Check the file path is correct
- Use absolute paths or paths relative to your current directory

### API Issues

#### "Trello API error: invalid token"

- Your token may have expired
- Generate a new token at the [Trello App Key page][trello-app-key]

#### "No card found matching: ..."

- Check that the card exists and you have access to it
- Try using the full card ID or URL instead of keywords
- Verify you're searching in the correct board with `--board` option

### MCP Server Issues

#### Server not showing in Claude Desktop

- Restart Claude Desktop after updating the config
- Check that the path to `index.js` is correct
- Check the Claude Desktop logs for errors
- Make sure you built the project: `npm run build`

## Quick Reference

```bash
# Setup
npm install
cp .env.example .env
# Edit .env with your credentials
npm run build
npm run install-global

# Common Commands
trello-cli get-boards                           # List all boards
trello-cli get-lists <boardId>                  # List all lists in board
trello-cli search "keyword"                     # Search for cards
trello-cli get-card <cardId>                    # View card details
trello-cli enrich-us <cardId> -o output.md      # Generate enriched template
trello-cli update-card <cardId> -f output.md    # Update card with template
trello-cli move-card <cardId> <listId>          # Move card to list
trello-cli add-comment <cardId> "comment"       # Add comment to card

# Get help
trello-cli --help
trello-cli <command> --help
```

## License

MIT
