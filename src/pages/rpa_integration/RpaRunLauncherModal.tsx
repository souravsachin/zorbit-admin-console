/**
 * RpaRunLauncherModal — launches a new RPA run for a specified adapter.
 *
 * Form contains:
 *   - trigger (manual | scheduled | event) — defaults to manual
 *   - payload — free JSON blob passed to the adapter executor
 *
 * POSTs to /api/rpa_integration/api/v1/G/adapters/:code/runs, then returns
 * the created runId to the parent so it can navigate to the SSE console.
 */
import React, { useState } from 'react';
import Modal from '../../components/shared/Modal';
import api from '../../services/api';
import { Loader2, Play } from 'lucide-react';

interface AdapterLite {
  code: string;
  displayName: string;
}

interface Props {
  adapter: AdapterLite;
  onClose: () => void;
  onLaunched: (runId: string) => void;
}

const RpaRunLauncherModal: React.FC<Props> = ({ adapter, onClose, onLaunched }) => {
  const [trigger, setTrigger] = useState<'manual' | 'scheduled' | 'event'>('manual');
  const [payloadText, setPayloadText] = useState<string>('{}');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    let payload: Record<string, unknown>;
    try {
      payload = payloadText.trim() === '' ? {} : JSON.parse(payloadText);
    } catch (e) {
      setError('Payload is not valid JSON');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(
        `/api/rpa_integration/api/v1/G/adapters/${encodeURIComponent(adapter.code)}/runs`,
        { trigger, payload },
      );
      const run = res.data?.data ?? res.data;
      const runId = run?.hashId || run?.runId || run?.id;
      if (!runId) {
        setError('Backend did not return a run id');
        return;
      }
      onLaunched(runId);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to launch run');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Launch: ${adapter.displayName}`}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Adapter</label>
          <code className="text-xs font-mono text-gray-700 dark:text-gray-200">{adapter.code}</code>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Trigger</label>
          <select
            value={trigger}
            onChange={(e) => setTrigger(e.target.value as 'manual' | 'scheduled' | 'event')}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md px-3 py-2 text-sm"
            disabled={submitting}
          >
            <option value="manual">manual</option>
            <option value="scheduled">scheduled</option>
            <option value="event">event</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payload (JSON)</label>
          <textarea
            rows={8}
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="w-full font-mono text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-md px-3 py-2"
            disabled={submitting}
            placeholder='{"orgId":"O-OZPY","dryRun":true}'
          />
        </div>

        {error && (
          <div className="p-2 bg-red-50 border border-red-200 text-red-800 rounded text-sm">{error}</div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 text-white inline-flex items-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
            {submitting ? 'Launching…' : 'Launch Run'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RpaRunLauncherModal;
