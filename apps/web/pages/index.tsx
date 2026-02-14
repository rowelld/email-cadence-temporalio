import { useEffect, useMemo, useState } from 'react';

type Step = {
  id: string;
  type: 'SEND_EMAIL' | 'WAIT';
  subject?: string;
  body?: string;
  seconds?: number;
};

type Cadence = {
  id: string;
  name: string;
  steps: Step[];
};

type WorkflowState = {
  currentStepIndex: number;
  stepsVersion: number;
  status: 'RUNNING' | 'COMPLETED';
  steps: Step[];
};

const SAMPLE: Cadence = {
  id: 'cad_123',
  name: 'Welcome Flow',
  steps: [
    {
      id: '1',
      type: 'SEND_EMAIL',
      subject: 'Welcome',
      body: 'Hello there',
    },
    {
      id: '2',
      type: 'WAIT',
      seconds: 10,
    },
    {
      id: '3',
      type: 'SEND_EMAIL',
      subject: 'Follow up',
      body: 'Checking in',
    },
  ],
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Home() {
  const [cadenceJson, setCadenceJson] = useState(() => JSON.stringify(SAMPLE, null, 2));
  const [contactEmail, setContactEmail] = useState('test@example.com');
  const [enrollmentId, setEnrollmentId] = useState('');
  const [state, setState] = useState<WorkflowState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const parsedCadence = useMemo(() => {
    try {
      return JSON.parse(cadenceJson) as Cadence;
    } catch {
      return null;
    }
  }, [cadenceJson]);

  useEffect(() => {
    if (!enrollmentId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/enrollments/${enrollmentId}`);
        if (!res.ok) throw new Error(`Failed to fetch state (${res.status})`);
        const data = (await res.json()) as WorkflowState;
        if (!cancelled) setState(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    };

    poll();
    const id = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [enrollmentId]);

  const requireCadence = () => {
    if (!parsedCadence) {
      setError('Invalid cadence JSON');
      return null;
    }
    if (!parsedCadence.id || !parsedCadence.steps) {
      setError('Cadence must include id and steps');
      return null;
    }
    setError(null);
    return parsedCadence;
  };

  const createCadence = async () => {
    const cadence = requireCadence();
    if (!cadence) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/cadences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cadence),
      });
      if (!res.ok) throw new Error(`Failed to create cadence (${res.status})`);
      await res.json();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const updateCadence = async () => {
    const cadence = requireCadence();
    if (!cadence) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/cadences/${cadence.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cadence),
      });
      if (!res.ok) throw new Error(`Failed to update cadence (${res.status})`);
      await res.json();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const enroll = async () => {
    const cadence = requireCadence();
    if (!cadence) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cadenceId: cadence.id, contactEmail }),
      });
      if (!res.ok) throw new Error(`Failed to enroll (${res.status})`);
      const data = (await res.json()) as { enrollmentId: string };
      setEnrollmentId(data.enrollmentId);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const updateRunningCadence = async () => {
    const cadence = requireCadence();
    if (!cadence || !enrollmentId) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/enrollments/${enrollmentId}/update-cadence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: cadence.steps }),
      });
      if (!res.ok) throw new Error(`Failed to update running cadence (${res.status})`);
      await res.json();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1>Email Cadence (Temporal)</h1>
      <p>API: {API_URL}</p>

      <label style={{ display: 'block', fontWeight: 600, marginTop: 16 }}>Cadence JSON</label>
      <textarea
        style={{ width: '100%', minHeight: 260, fontFamily: 'monospace', fontSize: 13 }}
        value={cadenceJson}
        onChange={(e) => setCadenceJson(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={createCadence} disabled={busy}>
          Create Cadence
        </button>
        <button onClick={updateCadence} disabled={busy}>
          Update Cadence
        </button>
      </div>

      <label style={{ display: 'block', fontWeight: 600, marginTop: 16 }}>Contact Email</label>
      <input
        style={{ width: '100%', padding: 8 }}
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        placeholder="contact@example.com"
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={enroll} disabled={busy}>
          Enroll Contact
        </button>
        <button onClick={updateRunningCadence} disabled={busy || !enrollmentId}>
          Update Running Cadence
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Enrollment ID:</strong> {enrollmentId || '—'}
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Workflow State:</strong>
        <pre style={{ background: '#f5f5f5', padding: 12 }}>
          {state ? JSON.stringify(state, null, 2) : 'No state yet'}
        </pre>
      </div>

      {error && (
        <div style={{ marginTop: 16, color: '#b00020' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </main>
  );
}
