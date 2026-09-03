import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';
import { string } from 'zod';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
	res.json({ ok: true });
});

app.post('/mcp', async (req, res) => {
	try {
		const auth = req.header('authorization');
		const server = createServer(auth ?? null);
		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: undefined,
		});

		res.on('close', () => {
			void transport.close();
			void server.close();
		});

		await server.connect(transport);
		await transport.handleRequest(req, res, req.body);
	} catch (err) {
		console.error('[mcp] Request fehlgeschlagen:', err);
		if (!res.headersSent) {
			res.status(500).json({
				jsonrpc: '2.0',
				error: { code: -32603, message: 'Internal server error' },
				id: null,
			});
		}
	}
});

process.on('unhandledRejection', (reason) => {
	console.error('[fatal] Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
	console.error('[fatal] Uncaught exception:', err);
});

const PORT = Number(process.env.PORT ?? 3001);

app.listen(PORT, '0.0.0.0', () => {
	console.log(`MCP server listening on :${PORT}`);
});