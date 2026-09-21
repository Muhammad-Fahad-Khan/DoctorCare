import { useEffect, useState } from 'react';
import { PlugZap, CheckCircle2, XCircle } from 'lucide-react';
import { api, GroqSettingsResponse } from '../lib/api';

// Used until the live catalog loads (or if it fails — e.g. no key configured yet).
const FALLBACK_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];

export function GroqSettingsPanel() {
  const [settings, setSettings] = useState<GroqSettingsResponse | null>(null);
  const [models, setModels] = useState<string[]>(FALLBACK_MODELS);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(FALLBACK_MODELS[0]);
  const [temperature, setTemperature] = useState(0.4);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refreshModels(currentModel: string) {
    api
      .listGroqModels()
      .then((live) => setModels(live.includes(currentModel) ? live : [currentModel, ...live]))
      .catch(() => {
        // No key configured yet, or the call failed — keep whatever list we already have
        // (fallback, or a previously successful fetch) rather than blanking the dropdown.
      });
  }

  useEffect(() => {
    api.getGroqSettings().then((s) => {
      setSettings(s);
      setModel(s.model);
      refreshModels(s.model);
      setTemperature(s.temperature);
    }).catch(() => setError('Could not load AI engine settings.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    setSaving(true);
    setError(null);
    setTestResult(null);
    try {
      const updated = await api.updateGroqSettings({
        ...(apiKey ? { apiKey } : {}),
        model,
        temperature,
      });
      setSettings(updated);
      setApiKey(''); // never keep the plaintext key in the form after a successful save
      refreshModels(updated.model); // a newly-saved key may unlock the live catalog for the first time
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await api.testGroqConnection();
      setTestResult(result);
      if (result.ok) refreshModels(model);
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : 'Test failed.' });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="interactive-card max-w-lg space-y-5 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-royal">
        <PlugZap size={16} className="text-magenta" />
        AI Engine Configuration
        {settings && (
          <span
            className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${
              settings.hasKey ? 'bg-wisteria/15 text-wisteria' : 'bg-royal/5 text-royal/50'
            }`}
          >
            {settings.hasKey ? 'Key configured' : 'No key set'}
          </span>
        )}
      </div>

      <label className="block text-sm font-medium text-royal/80">
        Groq API key
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={settings?.hasKey ? '•••••••••••••••• (leave blank to keep current key)' : 'gsk_…'}
          className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
        />
      </label>

      <label className="block text-sm font-medium text-royal/80">
        Model
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-royal/10 bg-white/70 px-3.5 py-2.5 text-sm outline-none transition-all duration-300 ease-docucare focus:border-magenta/50 focus:ring-2 focus:ring-magenta/20"
        >
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-royal/80">
        Temperature: {temperature.toFixed(1)}
        <input
          type="range"
          min={0}
          max={2}
          step={0.1}
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="mt-2 w-full accent-magenta"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {testResult && (
        <div
          className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm ${
            testResult.ok ? 'bg-wisteria/10 text-wisteria' : 'bg-red-50 text-red-600'
          }`}
        >
          {testResult.ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {testResult.message}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={save} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={testConnection} disabled={testing} className="btn-secondary flex-1 disabled:opacity-50">
          {testing ? 'Testing…' : 'Test Connection'}
        </button>
      </div>
    </div>
  );
}
