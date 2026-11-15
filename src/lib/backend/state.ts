import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

export interface StoredAlert {
  id: string;
  reference: string;
  regionId: string;
  observationPeriod: string;
  classification: string;
  indicatorsInvolved: string[];
  supportingMeasurements: unknown[];
  dataQuality: string;
  sampleOnly: true;
  status: string;
  createdAt: string;
  reportReference: string;
}

export interface StoredMessage {
  id: string;
  alertId: string;
  content: string;
  templateVersion: string;
  createdAt: string;
  status: 'draft' | 'approved' | 'rejected' | 'simulated';
  reviewer: string | null;
  reviewComment: string | null;
  reviewedAt: string | null;
  simulation: { reference: string; status: 'simulated'; timestamp: string } | null;
}

export interface StoredEmailAlert {
  id: string;
  alertId: string;
  recipient: string;
  subject: string;
  text: string;
  createdAt: string;
  status: 'draft' | 'approved' | 'rejected' | 'sending' | 'sent' | 'failed';
  reviewer: string | null;
  reviewComment: string | null;
  reviewedAt: string | null;
  sentAt: string | null;
  providerMessageId: string | null;
}

export interface StoredContact {
  id: string;
  organizationName: string;
  officialRole: string;
  administrativeRegion: string;
  contactSource: string;
  verificationDate: null;
  verificationStatus: 'placeholder' | 'awaiting_verification' | 'verified_official_contact' | 'inactive';
  preferredLanguage: 'English' | 'Amharic' | 'Afaan Oromo';
  authorizedCategories: string[];
  active: boolean;
  phone: null;
}

export interface StoredIngestion {
  id: string;
  regionId: string;
  datasetId: string;
  providerDeclaredByUploader: string;
  productIdDeclaredByUploader: string;
  datasetVersionDeclaredByUploader: string;
  checksumSha256: string;
  createdAt: string;
  status: 'completed' | 'partial' | 'failed';
  rowsReceived: number;
  acceptedCount: number;
  rejectedCount: number;
  duplicateCount: number;
  rejectedRows: Array<{ rowNumber: number; reason: string }>;
  submittedBy: string;
  provenanceStatus: 'user_upload_unverified';
}

export interface StoredObservation {
  id: string;
  ingestionId: string;
  regionId: string;
  date: string;
  indicator: 'rainfall' | 'soil_moisture' | 'vegetation';
  value: number;
  units: string;
  datasetId: string;
  providerDeclaredByUploader: string;
  productIdDeclaredByUploader: string;
  datasetVersionDeclaredByUploader: string;
  qualityFlagAsSupplied: string;
  ingestedAt: string;
  quality: 'insufficient';
  analysisStatus: 'quarantined_pending_source_review';
}

interface BackendState {
  version: 1;
  alerts: StoredAlert[];
  messages: StoredMessage[];
  emailAlerts: StoredEmailAlert[];
  contacts: StoredContact[];
  audit: Array<Record<string, unknown>>;
  ingestions: StoredIngestion[];
  observations: StoredObservation[];
}

const emptyState = (): BackendState => ({
  version: 1,
  alerts: [],
  messages: [],
  emailAlerts: [],
  contacts: [],
  audit: [],
  ingestions: [],
  observations: [],
});
const statePath = () => process.env.ETHIODROUGHT_STATE_FILE || join(process.cwd(), '.local', 'ethiodrought-state.json');
let queue: Promise<void> = Promise.resolve();

async function load(): Promise<BackendState> {
  try {
    const data = await readFile(statePath(), 'utf8');
    const state = JSON.parse(data) as BackendState;
    if (state.version !== 1 || !Array.isArray(state.alerts) || !Array.isArray(state.messages) ||
        !Array.isArray(state.contacts) || !Array.isArray(state.audit)) {
      throw new Error('Backend state file has an unsupported or invalid structure.');
    }
    state.ingestions = Array.isArray(state.ingestions) ? state.ingestions : [];
    state.observations = Array.isArray(state.observations) ? state.observations : [];
    state.emailAlerts = Array.isArray(state.emailAlerts) ? state.emailAlerts : [];
    return state;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyState();
    throw error;
  }
}

async function save(state: BackendState): Promise<void> {
  const file = statePath();
  await mkdir(dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(state, null, 2), { encoding: 'utf8', mode: 0o600 });
  await rename(temporary, file);
}

export async function readBackendState(): Promise<BackendState> {
  return load();
}

export async function updateBackendState<T>(update: (state: BackendState) => T | Promise<T>): Promise<T> {
  let release: () => void = () => undefined;
  const previous = queue;
  queue = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try {
    const state = await load();
    const result = await update(state);
    await save(state);
    return result;
  } finally {
    release();
  }
}
