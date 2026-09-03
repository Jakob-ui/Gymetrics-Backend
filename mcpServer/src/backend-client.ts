const BACKEND_URL = 'http://localhost:3000';

export interface EquipmentResponse {
	name: string;
	muscleGroups: { name: string; equipment: string[] }[];
}

export class BackendError extends Error {
	constructor(
		message: string,
		public readonly status?: number,
	) {
		super(message);
		this.name = 'BackendError';
	}
}

export interface TrainingExercise {
	title: string;
	reps: number;
	weight?: number;
	repsDone?: number;
	weightDone?: number;
	factor?: number;
}

export interface TrainingResponse {
	title: string;
	description?: string;
	activeDate: string;
	plan?: TrainingExercise[];
}

export async function getMonthlyTrainings(auth: string | null): Promise<TrainingResponse[] | null> {
	if (!auth) {
		throw new BackendError('Not Authorized');
		return null;
	}
	const now = new Date();
	const url = new URL('/training/monthlyTrainings', BACKEND_URL);
	url.searchParams.set('year', String(now.getFullYear()));
	url.searchParams.set('month', String(now.getMonth() + 1));
	url.searchParams.set('withPlan', 'true');

	let res: Response;
	try {
		res = await fetch(url, {
			headers: auth ? { authorization: auth } : {},
			signal: AbortSignal.timeout(10_000),
		});
	} catch (err) {
		console.error('[backend-client] fetch fehlgeschlagen:', err);
		throw new BackendError('Backend ist nicht erreichbar.');
	}

	if (res.status === 401 || res.status === 403) {
		throw new BackendError('Nicht angemeldet oder keine Berechtigung.', res.status);
	}

	if (!res.ok) {
		throw new BackendError(`Backend antwortete mit ${res.status}.`, res.status);
	}

	try {
		return (await res.json()) as TrainingResponse[];
	} catch {
		throw new BackendError('Antwort des Backends war kein gültiges JSON.');
	}
}

export async function getEquipment(studio: string, auth: string | null): Promise<EquipmentResponse | null> {
	if (!auth) {
		throw new BackendError('Not Authorized');
		return null;
	}
	const url = new URL('/studios/equipment', BACKEND_URL);
	url.searchParams.set('studio', studio);
	let res: Response;
	try {
		res = await fetch(url, {
			headers: auth ? { authorization: auth } : {},
			signal: AbortSignal.timeout(10_000),
		});
	} catch (err) {
		console.error('[backend-client] fetch fehlgeschlagen:', err);
		throw new BackendError('Backend ist nicht erreichbar.');
	}

	if (res.status === 404) return null;

	if (res.status === 401 || res.status === 403) {
		throw new BackendError('Keine Berechtigung für diese Daten.', res.status);
	}

	if (!res.ok) {
		throw new BackendError(`Backend antwortete mit ${res.status}.`, res.status);
	}

	try {
		return (await res.json()) as EquipmentResponse;
	} catch {
		throw new BackendError('Antwort des Backends war kein gültiges JSON.');
	}
}
