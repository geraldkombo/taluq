/* Work Product of Gerald Shikunyi Kombo. Trading as Gerald Shikunyi Kombo (Digital Services). Intellectual Property Rights Reserved. */
'use client';

import { useEffect, useMemo, useState } from 'react';

type Experiment = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

async function api<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || 'Request failed');
  return json as T;
}

export function ExperimentsClient() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = useMemo(
    () => experiments.find((e) => e.id === editingId) ?? null,
    [experiments, editingId]
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!editing) return;
    setName(editing.name);
    setDescription(editing.description ?? '');
    setIsActive(editing.isActive);
  }, [editing]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ ok: true; experiments: Experiment[] }>('/api/experiments');
      setExperiments(data.experiments);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await api('/api/experiments?id=' + encodeURIComponent(editingId), {
          method: 'PUT',
          body: JSON.stringify({ name, description, isActive }),
        });
      } else {
        await api('/api/experiments', {
          method: 'POST',
          body: JSON.stringify({ name, description, isActive }),
        });
      }
      setEditingId(null);
      setName('');
      setDescription('');
      setIsActive(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    }
  }

  async function onDelete(id: string) {
    setError(null);
    if (!confirm('Delete this experiment?')) return;
    try {
      await api('/api/experiments?id=' + encodeURIComponent(id), { method: 'DELETE' });
      if (editingId === id) {
        setEditingId(null);
        setName('');
        setDescription('');
        setIsActive(false);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-amber-500/15 bg-zinc-950/60 p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold tracking-widest uppercase">
            Experiments
          </h2>
          <button
            className="rounded-lg border border-amber-500/20 bg-zinc-900/40 px-3 py-1 text-xs text-amber-200/80 hover:bg-zinc-900/60"
            onClick={() => refresh()}
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-amber-500/60">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Active</th>
                <th className="py-2 pr-4">Updated</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((x) => (
                <tr key={x.id} className="border-t border-amber-500/10">
                  <td className="py-2 pr-4 font-medium">{x.name}</td>
                  <td className="py-2 pr-4">{x.isActive ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-4">
                    {new Date(x.updatedAt).toLocaleString()}
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-md border border-amber-500/20 px-2 py-1 text-[11px] text-amber-200/80 hover:bg-zinc-900/60"
                        onClick={() => setEditingId(x.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md border border-red-500/20 px-2 py-1 text-[11px] text-red-200/80 hover:bg-red-950/40"
                        onClick={() => onDelete(x.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && experiments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-amber-500/50">
                    No experiments yet
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {loading ? (
          <div className="mt-4 text-xs text-amber-500/50">Loading…</div>
        ) : null}
        {error ? (
          <div className="mt-4 text-xs text-red-200/80">{error}</div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-amber-500/15 bg-zinc-950/60 p-5">
        <h2 className="text-sm font-semibold tracking-widest uppercase">
          {editingId ? 'Edit Experiment' : 'Create Experiment'}
        </h2>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <div className="text-[10px] tracking-widest uppercase text-amber-500/60">
                Name
              </div>
              <input
                className="mt-1 w-full rounded-lg border border-amber-500/15 bg-zinc-900/40 px-3 py-2 text-xs text-amber-200/90 outline-none focus:border-amber-500/40"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <div className="text-[10px] tracking-widest uppercase text-amber-500/60">
                Active
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-amber-200/90">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <span>Enabled</span>
              </div>
            </label>
          </div>

          <label className="block">
            <div className="text-[10px] tracking-widest uppercase text-amber-500/60">
              Description
            </div>
            <textarea
              className="mt-1 w-full rounded-lg border border-amber-500/15 bg-zinc-900/40 px-3 py-2 text-xs text-amber-200/90 outline-none focus:border-amber-500/40"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg border border-amber-500/20 bg-zinc-900/40 px-4 py-2 text-xs text-amber-200/90 hover:bg-zinc-900/60"
            >
              {editingId ? 'Save' : 'Create'}
            </button>
            {editingId ? (
              <button
                type="button"
                className="rounded-lg border border-amber-500/10 px-4 py-2 text-xs text-amber-500/70 hover:bg-zinc-900/40"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setDescription('');
                  setIsActive(false);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}

