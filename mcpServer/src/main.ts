import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
	res.json({ ok: true });
});

app.post('/mcp', async (req, res) => {
	const server = createServer();
	const transport = new StreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
	});

	res.on('close', () => {
		void transport.close();
		void server.close();
	});

	await server.connect(transport);
	await transport.handleRequest(req, res, req.body);
});

const PORT = Number(process.env.PORT ?? 3001);

app.listen(PORT, '0.0.0.0', () => {
	console.log(`MCP server listening on :${PORT}`);
});