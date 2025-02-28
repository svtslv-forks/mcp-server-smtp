# SMTP MCP Server

A Model Context Protocol (MCP) server for sending emails via SMTP with template management.

## Features

- Send emails via SMTP
- Send bulk emails with rate limiting
- Manage multiple SMTP configurations
- Create and manage email templates with variable substitution
- Set a default SMTP configuration
- Set a default email template

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/smtp-mcp-server.git
cd smtp-mcp-server

# Install dependencies
npm install

# Build the server
npm run build
```

## Configuration

The server stores its configuration in the user's home directory under `.smtp-mcp-server`. This includes:

- SMTP server configurations in `~/.smtp-mcp-server/smtp-config.json`
- Email templates in `~/.smtp-mcp-server/templates/`

A default SMTP configuration (Gmail) and a default email template are created on first run.

## Running the Server

```bash
# Start the server
npm start
```

## Connecting with Claude Desktop

1. Create a `claude-desktop.json` file in your project root:

```json
{
  "version": 1,
  "servers": [
    {
      "name": "SMTP Server",
      "url": "http://localhost:8085",
      "type": "mcp"
    }
  ]
}
```

2. Start the Claude Desktop application and connect to the server.

## Available Tools

### Email Sending

- `send-email`: Send an email using a template or custom content
- `send-bulk-emails`: Send emails to multiple recipients with batching and rate limiting

### SMTP Configuration Management

- `get-smtp-configs`: Get all SMTP configurations
- `add-smtp-config`: Add a new SMTP configuration
- `update-smtp-config`: Update an existing SMTP configuration
- `delete-smtp-config`: Delete an SMTP configuration

### Email Template Management

- `get-email-templates`: Get all email templates
- `add-email-template`: Add a new email template
- `update-email-template`: Update an existing email template
- `delete-email-template`: Delete an email template

## Tool Examples

### Sending an Email

```json
{
  "to": {
    "email": "recipient@example.com",
    "name": "Recipient Name"
  },
  "subject": "Custom Subject",
  "body": "Hello World!",
  "from": {
    "email": "sender@example.com",
    "name": "Sender Name"
  }
}
```

### Using a Template

```json
{
  "to": {
    "email": "recipient@example.com",
    "name": "Recipient Name"
  },
  "templateId": "default",
  "templateData": {
    "name": "John",
    "company": "Acme Corp"
  }
}
```

### Adding a Template

```json
{
  "name": "Welcome Email",
  "subject": "Welcome to {{company}}!",
  "body": "Hello {{name}},\n\nWelcome to {{company}}! We're excited to have you on board.\n\nBest regards,\nThe Team"
}
```

## License

MIT 