import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function createServer() {
	const server = new McpServer({
		name: 'gymetrics-mcp',
		version: '0.0.0',
	});

	server.registerTool(
		'ping',
		{
			title: 'Ping',
			description: 'Testtool. Gibt den übergebenen Text zurück.',
			inputSchema: { text: z.string().describe('Beliebiger Text') },
		},
		async ({ text }) => {
			console.log('[tool] ping aufgerufen mit:', text);
			return {
				content: [{ type: 'text', text: `pong: ${text}` }],
			};
		},
	);

	return server;
}
