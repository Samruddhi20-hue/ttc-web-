(function () {
  const $ = id => document.getElementById(id);
  const colors = ['#6c63df','#1d9b83','#e39a36','#3987d7','#d9577b','#8a63d2','#0f9bb5','#7c8d35'];
  let data = { leaves: [], tasks: [] };
  let toastTimer;
  const pad = n => String(n).padStart(2,'0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const dateObj = s => new Date(`${s}T12:00:00`);
  const fmt = s => dateObj(s).toLocaleDateString(undefined,{month:'short',day:'numeric'});
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const allEntries = () => [...data.leaves.map(x=>({...x,kind:'leave',date:x.start_date})), ...data.tasks.map(x=>({...x,kind:'task',date:x.due_date}))];
  function toast(message) { const el=$('toast'); if(!el)return; el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600); }
  function populateMembers() { const select=$('memberSelect'); if(!select)return; select.innerHTML=TeamSpace.members.map(m=>`<option value="${esc(m.id)}">${esc(m.name)}</option>`).join(''); }
  function setupModal() {
    const dialog=$('entryDialog'), form=$('entryForm'); if(!dialog||!form)return;
    populateMembers();
    $('quickAddBtn')?.addEventListener('click',()=>openDialog()); $('addTaskBtn')?.addEventListener('click',()=>openDialog('task'));
    document.querySelectorAll('[data-close="entryDialog"]').forEach(b=>b.addEventListener('click',()=>dialog.close()));
    $('entryType')?.addEventListener('change',syncFormType);
    $('entryStart')?.addEventListener('change',()=>{ if($('entryEnd') && (!$('entryEnd').value || $('entryEnd').value < $('entryStart').value)) $('entryEnd').value=$('entryStart').value; });
    form.addEventListener('submit',async e=>{e.preventDefault();$('formError').textContent='';
      const type=$('entryType').value, start=$('entryStart').value, end=$('entryEnd').value, title=$('entryTitle').value.trim();
      if(!title){$('formError').textContent='Please enter a title or reason.';return;} if(type==='leave'&&end<start){$('formError').textContent='End date cannot be before the start date.';return;}
      const payload={member_id:$('memberSelect').value,title,start_date:start,end_date:type==='task'?start:end,leave_type:$('leaveType').value,status:$('taskStatus').value,notes:$('entryNotes').value.trim()};
      try { await TeamSpace.addEntry(type,payload); dialog.close();form.reset();syncFormType();await refresh();toast('Entry saved.'); } catch(err) { $('formError').textContent=`Could not save: ${err.message || 'check your Supabase setup and permissions'}`; }
    });
  }
  function syncFormType() { const task=$('entryType')?.value==='task'; $('endDateWrap')?.classList.toggle('hidden',task); $('leaveTypeWrap')?.classList.toggle('hidden',task); $('taskStatusWrap')?.classList.toggle('hidden',!task); if($('entryEnd'))$('entryEnd').required=!task; }
  function openDialog(type='leave',date=iso(new Date())) { const d=$('entryDialog');if(!d)return; $('entryType').value=type;$('entryStart').value=date;$('entryEnd').value=date;$('entryTitle').value='';$('entryNotes').value='';$('formError').textContent='';syncFormType();d.showModal(); }
  function miniCalendar() {
    const el=$('miniCalendar');if(!el)return;const now=new Date(),y=now.getFullYear(),m=now.getMonth(),first=new Date(y,m,1),startOffset=(first.getDay()+6)%7,start=new Date(y,m,1-startOffset),days=['M','T','W','T','F','S','S'];
    let html=days.map(d=>`<div class="mini-weekday">${d}</div>`).join('');
    for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const key=iso(d),outside=d.getMonth()!==m,today=key===iso(now);const matches=allEntries().filter(x=>entryCovers(x,key)).slice(0,3),hs=window.indianHolidaysForDate?window.indianHolidaysForDate(key):[];html+=`<button class="mini-day ${outside?'outside':''} ${today?'today':''} ${hs.length?'mini-holiday':''}" data-date="${key}" title="${matches.length} entries${hs.length?'; '+hs.map(h=>h.name).join(', '):''}">${d.getDate()}<span class="day-dots">${matches.map(x=>`<i class="dot" style="background:${TeamSpace.memberById(x.member_id).color}"></i>`).join('')}${hs.length?'<i class="dot holiday-dot"></i>':''}</span></button>`;}
    el.innerHTML=html;el.querySelectorAll('[data-date]').forEach(b=>b.addEventListener('click',()=>{location.href=`calendar.html?date=${b.dataset.date}`;}));
  }
  function entryCovers(e,key){if(e.kind==='task')return e.due_date===key;return e.start_date<=key&&e.end_date>=key;}
  function renderLegend(){const el=$('memberLegend');if(!el)return;el.innerHTML=TeamSpace.members.map(m=>`<span class="legend-item"><i class="legend-dot" style="background:${m.color}"></i>${esc(m.name)}</span>`).join('');}
  function renderUpcoming(){const el=$('upcomingList');if(!el)return;const today=iso(new Date()),limit=new Date();limit.setDate(limit.getDate()+30);const limitIso=iso(limit);const items=allEntries().filter(e=>e.kind==='task'?e.due_date>=today&&e.due_date<=limitIso:e.end_date>=today&&e.start_date<=limitIso).sort((a,b)=>(a.date||a.start_date).localeCompare(b.date||b.start_date)).slice(0,6);
    if(!items.length){el.innerHTML='<div class="empty-state">Nothing upcoming yet. Add leave or a task to get started.</div>';return;}
    el.innerHTML=items.map(e=>{const date=e.kind==='task'?e.due_date:(e.start_date===e.end_date?e.start_date:`${fmt(e.start_date)} – ${fmt(e.end_date)}`),m=TeamSpace.memberById(e.member_id);return `<div class="upcoming-item"><div class="date-chip"><b>${dateObj(e.kind==='task'?e.due_date:e.start_date).getDate()}</b><small>${dateObj(e.kind==='task'?e.due_date:e.start_date).toLocaleDateString(undefined,{month:'short'})}</small></div><div class="entry-details"><strong>${esc(e.title)}</strong><p>${esc(m.name)} · ${e.kind==='leave'?'Leave':'Task'}${e.kind==='task'?` · ${esc((e.status||'open').replace('_',' '))}`:''}</p><span class="entry-tag ${e.kind==='leave'?'tag-leave':'tag-task'}">${e.kind==='leave'?'LEAVE':'TASK'}</span></div></div>`;}).join('');}
  function renderTasks(){const el=$('taskList');if(!el)return;const tasks=[...data.tasks].sort((a,b)=>(a.due_date||'').localeCompare(b.due_date||'')).slice(0,7);if(!tasks.length){el.innerHTML='<div class="empty-state">No tasks yet. Add a task to get started.</div>';return;}el.innerHTML=tasks.map(t=>{const m=TeamSpace.memberById(t.member_id),done=t.status==='done';return `<div class="task-row ${done?'done':''}"><input class="task-check" type="checkbox" data-task="${esc(t.id)}" ${done?'checked':''} aria-label="Mark ${esc(t.title)} complete"><div class="entry-details"><strong>${esc(t.title)}</strong><p>${esc(m.name)} · Due ${fmt(t.due_date)}</p></div><span class="entry-tag tag-task">${esc((t.status||'open').replace('_',' ').toUpperCase())}</span></div>`;}).join('');el.querySelectorAll('[data-task]').forEach(c=>c.addEventListener('change',async()=>{try{await TeamSpace.updateTask(c.dataset.task,{status:c.checked?'done':'open'});await refresh();toast('Task status updated.');}catch(e){toast(`Could not update task: ${e.message}`);}}));}
  async function refresh(){try{data=await TeamSpace.getAll();const today=iso(new Date()),limit=new Date();limit.setDate(limit.getDate()+30);const limitIso=iso(limit);$('statToday')&&($('statToday').textContent=data.leaves.filter(l=>l.start_date<=today&&l.end_date>=today).length);$('statUpcoming')&&($('statUpcoming').textContent=data.leaves.filter(l=>l.end_date>=today&&l.start_date<=limitIso).length);$('statTasks')&&($('statTasks').textContent=data.tasks.filter(t=>t.status!=='done').length);$('statMembers')&&($('statMembers').textContent=TeamSpace.members.length);$('todayLabel')&&($('todayLabel').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}));miniCalendar();renderLegend();renderUpcoming();renderTasks();}catch(e){toast(`Could not load entries: ${e.message || 'check Supabase setup'}`);}}
  document.addEventListener('DOMContentLoaded',()=>{setupModal();syncFormType();refresh();});
  window.TeamSpaceUI={toast,refresh,openDialog,escapeHtml:esc};
})();
