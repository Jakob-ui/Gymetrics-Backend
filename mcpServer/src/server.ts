import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getEquipment, getMonthlyTrainings } from './backend-client.js';

export function createServer(auth: string | null) {
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
  
  server.registerTool(
		'get_current_month_trainings',
		{
			title: 'Trainings des laufenden Monats',
			description:
				'Liefert alle Trainings des aktuellen Monats mit Soll- und Ist-Werten ' +
				'(geplante und tatsächlich geschaffte Wiederholungen und Gewichte). ' +
				'Nutze dieses Tool, um den aktuellen Trainingsstand und Fortschritt zu ermitteln. ' +
				'Fehlende Ist-Werte bedeuten "nicht erfasst", nicht "nicht geschafft".',
			inputSchema: {},
		},
		async () => {
			console.log('[tool] get_current_month_trainings');

			try {
				const trainings = await getMonthlyTrainings(auth);

				if (trainings?.length === 0) {
					return {
						content: [
							{
								type: 'text',
								text: 'In diesem Monat wurden noch keine Trainings erfasst.',
							},
						],
					};
				}

				return {
					content: [{ type: 'text', text: JSON.stringify(trainings, null, 2) }],
				};
			} catch (err) {
				console.error('[tool] get_current_month_trainings:', err);
				return {
					content: [{ type: 'text', text: `Fehler: ${err}` }],
					isError: true,
				};
			}
		},
  );

	server.registerTool(
		'get_studio_equipment',
		{
			title: 'Geräte eines Fitnessstudios',
			description:
				'Liefert alle Geräte eines Fitnessstudios, gruppiert nach Muskelgruppe. ' +
				'Nutze dieses Tool, wenn nach der Ausstattung, den Geräten oder den ' +
				'Trainingsmöglichkeiten eines Studios gefragt wird.',
			inputSchema: {
				studio: z.string().describe('Vollständiger Name des Studios, z.B. "Wien 1, Rathausplatz"'),
			},
		},
		async ({ studio }) => {
			try {
				const data = await getEquipment(studio, auth);

				if (!data) {
					return {
						content: [{ type: 'text', text: `Studio "${studio}" wurde nicht gefunden.` }],
						isError: true,
					};
				}

				return {
					content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
				};
			} catch (err) {
				console.error('[tool] get_studio_equipment:', err);
				return {
					content: [{ type: 'text', text: `Fehler: ${err}` }],
					isError: true,
				};
			}
		},
	);

	return server;
}