/* Shared data adapter. Uses Supabase when configured; otherwise local demo data. */
(function () {
  const cfg = window.APP_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes('YOUR_PROJECT_ID') && !cfg.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');
  let client = null;
  if (configured && window.supabase?.createClient) client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  const isRemote = !!client;
  const STORAGE_KEY = 'teamspace-demo-data-v1';
  const members = (cfg.TEAM_MEMBERS || []).map((m, i) => ({ ...m, id: String(m.id || `member-${i + 1}`) }));
  const today = new Date();
  const iso = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  function seedData() {
    const first = new Date(today.getFullYear(), today.getMonth(), Math.min(4, new Date(today.getFullYear(), today.getMonth()+1, 0).getDate()));
    const second = new Date(today.getFullYear(), today.getMonth(), Math.min(10, new Date(today.getFullYear(), today.getMonth()+1, 0).getDate()));
    const later = new Date(today.getFullYear(), today.getMonth(), Math.min(18, new Date(today.getFullYear(), today.getMonth()+1, 0).getDate()));
    return {
      leaves: [
        { id: 'demo-leave-1', member_id: members[1]?.id || 'member-2', title: 'Personal leave', start_date: iso(first), end_date: iso(first), leave_type: 'casual', notes: '', created_at: new Date().toISOString() },
        { id: 'demo-leave-2', member_id: members[2]?.id || 'member-3', title: 'Appointment', start_date: iso(second), end_date: iso(second), leave_type: 'half_day', notes: '', created_at: new Date().toISOString() }
      ],
      tasks: [
        { id: 'demo-task-1', member_id: members[0]?.id || 'member-1', title: 'Prepare weekly team update', due_date: iso(later), status: 'open', notes: '', created_at: new Date().toISOString() },
        { id: 'demo-task-2', member_id: members[3]?.id || 'member-4', title: 'Review pending requests', due_date: iso(second), status: 'in_progress', notes: '', created_at: new Date().toISOString() }
      ]
    };
  }
  function readLocal() {
    try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) return JSON.parse(saved); } catch (_) {}
    const initial = seedData(); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(initial)); } catch (_) {} return initial;
  }
  function writeLocal(data) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {} }
  async function getAll() {
    if (!isRemote) return readLocal();
    const [l, t] = await Promise.all([
      client.from('leaves').select('*').order('start_date'),
      client.from('tasks').select('*').order('due_date')
    ]);
    if (l.error) throw l.error; if (t.error) throw t.error;
    return { leaves: l.data || [], tasks: t.data || [] };
  }
  async function addEntry(type, payload) {
    if (type === 'leave') {
      const row = { member_id: payload.member_id, title: payload.title, start_date: payload.start_date, end_date: payload.end_date, leave_type: payload.leave_type, notes: payload.notes || '' };
      if (isRemote) { const { data, error } = await client.from('leaves').insert(row).select().single(); if (error) throw error; return data; }
      const db = readLocal(); const item = { ...row, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), created_at: new Date().toISOString() }; db.leaves.push(item); writeLocal(db); return item;
    }
    const row = { member_id: payload.member_id, title: payload.title, due_date: payload.start_date, status: payload.status || 'open', notes: payload.notes || '' };
    if (isRemote) { const { data, error } = await client.from('tasks').insert(row).select().single(); if (error) throw error; return data; }
    const db = readLocal(); const item = { ...row, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), created_at: new Date().toISOString() }; db.tasks.push(item); writeLocal(db); return item;
  }
  async function updateTask(id, patch) {
    if (isRemote) { const { error } = await client.from('tasks').update(patch).eq('id', id); if (error) throw error; return; }
    const db = readLocal(); db.tasks = db.tasks.map(t => t.id === id ? { ...t, ...patch } : t); writeLocal(db);
  }
  async function deleteEntry(type, id) {
    if (isRemote) { const { error } = await client.from(type === 'leave' ? 'leaves' : 'tasks').delete().eq('id', id); if (error) throw error; return; }
    const db = readLocal(); const key = type === 'leave' ? 'leaves' : 'tasks'; db[key] = db[key].filter(x => x.id !== id); writeLocal(db);
  }
  function memberById(id) { return members.find(m => String(m.id) === String(id)) || { id, name: 'Unknown member', color: '#8b93a7' }; }
  function setStatusBadge() {
    document.querySelectorAll('#connectionStatus').forEach(el => { el.textContent = isRemote ? 'Supabase connected' : 'Demo mode'; el.className = `status-pill ${isRemote ? 'status-live' : 'status-demo'}`; });
  }
  document.addEventListener('DOMContentLoaded', setStatusBadge);
  window.TeamSpace = { members, isRemote, getAll, addEntry, updateTask, deleteEntry, memberById, setStatusBadge };
})();
