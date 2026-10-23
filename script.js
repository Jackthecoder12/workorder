/* =========================================================
   WorkOrder | Maintenance Department Management System
   University of Ibadan | static front-end, data kept in localStorage
   ========================================================= */
(() => {
'use strict';

/* ---------------------------------------------------------
   1. Constants
--------------------------------------------------------- */
const KEYS = {
  tickets: 'tickets',
  projects: 'projects',
  reports: 'fieldReports',
  technicians: 'technicians',
  notifications: 'notifications',
  user: 'currentUser',
  settings: 'settings',
  counters: 'counters',
  seeded: 'workorderSeeded',
  users: 'users',
  activity: 'activityLog',
  resets: 'resetRequests',
  lock: 'loginLocks'
};
const DBKEY = { tickets: KEYS.tickets, projects: KEYS.projects, reports: KEYS.reports, technicians: KEYS.technicians, notifications: KEYS.notifications, users: KEYS.users, activity: KEYS.activity, resets: KEYS.resets };

const CATEGORIES = ['Electrical', 'Plumbing', 'Air Conditioning', 'Generator', 'Carpentry', 'Building', 'Water Supply', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const TICKET_STATUSES = ['Open', 'Assigned', 'In Progress', 'On Hold', 'Resolved', 'Closed'];
const TECH_ALLOWED_STATUSES = ['Assigned', 'In Progress', 'On Hold', 'Resolved'];
const PROJECT_STATUSES = ['Not Started', 'In Progress', 'On Hold', 'Completed'];
const REPORT_STATUSES = ['Submitted', 'Reviewed', 'Completed', 'Requires Follow-up'];
const TECH_REPORT_STATUSES = ['Submitted', 'Completed', 'Requires Follow-up'];
const TECH_STATUSES = ['Available', 'Busy', 'On Leave'];
const SPECIALIZATIONS = ['Electrical', 'Plumbing', 'HVAC', 'Generator', 'Carpentry', 'General Maintenance'];
const TEAMS = ['Electrical Team', 'Plumbing Team', 'HVAC Team', 'Generator Team', 'Carpentry Team', 'General Maintenance Team', 'Multi-trade Team'];
const LOCATIONS = ['Faculty of Science', 'Faculty of Arts', 'Faculty of Social Sciences', 'UI Teaching and Research Farm', 'Male Hostel B', 'Female Hostel', 'Engineering Workshop', 'Administrative Building', 'Student Union Building'];
const DEPARTMENTS = ['Faculty of Science', 'Faculty of Arts', 'Faculty of Social Sciences', 'Faculty of Agriculture', 'Faculty of Technology', 'Registry', 'Bursary', 'Library', 'Student Affairs', 'Hall Management', 'Works and Maintenance'];
const ADMIN_ONLY_PAGES = ['technicians', 'analytics', 'users', 'activity'];
const STAFF_ONLY_PAGES = ['projects', 'reports'];
const REQUEST_KINDS = ['Fault report', 'Service request', 'Complaint', 'Suggestion', 'Other'];
const SECURITY_QUESTIONS = ['What was the name of your first school?', 'What is your mother\'s maiden name?', 'What was the name of your first pet?', 'In which town or city were you born?', 'What was your childhood nickname?'];
const ACTIVITY_KINDS = ['Account', 'Request', 'Ticket', 'Comment', 'Project', 'Report', 'Technician', 'User', 'Settings', 'System'];
const KIND_TONE = { Account: 'violet', Request: 'orange', Ticket: 'orange', Comment: 'blue', Project: 'violet', Report: 'blue', Technician: 'green', User: 'teal', Settings: 'gray', System: 'slate' };
const KIND_ICON = { Account: 'fa-user-lock', Request: 'fa-hand', Ticket: 'fa-ticket', Comment: 'fa-comment', Project: 'fa-diagram-project', Report: 'fa-clipboard-list', Technician: 'fa-user-gear', User: 'fa-user-shield', Settings: 'fa-gear', System: 'fa-circle-info' };
const ROLE_LABEL = { ADMIN: 'Administrator', TECHNICIAN: 'Technician', USER: 'User' };
const RANGE_LABELS = { all: 'All time', today: 'Today', week: 'This week', month: 'This month' };

const CATEGORY_ICON = {
  'Electrical': 'fa-bolt', 'Plumbing': 'fa-faucet-drip', 'Air Conditioning': 'fa-snowflake', 'Generator': 'fa-gears',
  'Carpentry': 'fa-hammer', 'Building': 'fa-building', 'Water Supply': 'fa-droplet', 'Other': 'fa-screwdriver-wrench'
};
const TONE = {
  'Open': 'orange', 'Assigned': 'violet', 'In Progress': 'blue', 'On Hold': 'gray', 'Resolved': 'green', 'Closed': 'slate',
  'Not Started': 'gray', 'Completed': 'green',
  'Submitted': 'blue', 'Reviewed': 'violet', 'Requires Follow-up': 'red',
  'Available': 'green', 'Busy': 'orange', 'On Leave': 'gray',
  'Low': 'gray', 'Medium': 'blue', 'High': 'orange', 'Critical': 'red',
  'Administrator': 'violet', 'Technician': 'blue', 'User': 'gray', 'Active': 'green', 'Disabled': 'red'
};
const STATUS_COLORS = { 'Open': '#d9822b', 'Assigned': '#7a5af8', 'In Progress': '#1f6fe0', 'On Hold': '#8792a4', 'Resolved': '#1d9a6c', 'Closed': '#4b5a70' };

/* ---------------------------------------------------------
   2. Small helpers
--------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const pad = n => String(n).padStart(2, '0');
const toDateStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => toDateStr(new Date());
const daysFromNow = n => { const d = new Date(); d.setDate(d.getDate() + n); return toDateStr(d); };
const hoursAgo = h => new Date(Date.now() - h * 3600000).toISOString();
const parseDate = s => (!s ? null : new Date(String(s).length === 10 ? s + 'T00:00:00' : s));
const fmtDate = s => { const d = parseDate(s); return d && !isNaN(d) ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; };
const fmtDateTime = s => { const d = parseDate(s); return d && !isNaN(d) ? d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; };
const money = n => '₦' + Number(n || 0).toLocaleString('en-NG');
const initials = name => {
  const parts = String(name || '?').replace(/[^A-Za-z ]/g, ' ').split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};
const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };
const toneOf = v => TONE[v] || 'gray';
const badge = v => `<span class="badge tone-${toneOf(v)}">${esc(v)}</span>`;
const catIcon = c => CATEGORY_ICON[c] || 'fa-screwdriver-wrench';

function timeAgo(iso) {
  const d = parseDate(iso);
  if (!d || isNaN(d)) return '';
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return fmtDate(iso);
}
function fmtDuration(ms) {
  if (ms == null || isNaN(ms)) return '—';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = ms / 3600000;
  if (hrs < 24) return `${hrs.toFixed(1)} hrs`;
  const d = Math.floor(hrs / 24);
  return `${d}d ${Math.round(hrs - d * 24)}h`;
}
function daysUntil(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return null;
  const t = new Date(); t.setHours(0, 0, 0, 0);
  return Math.round((d - t) / 86400000);
}

/* ---------------------------------------------------------
   3. Storage layer (localStorage, wrapped in try/catch)
--------------------------------------------------------- */
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { toast('Could not save. Browser storage may be full or blocked.', 'error'); return false; }
  },
  remove(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }
};

let db = { tickets: [], projects: [], reports: [], technicians: [], notifications: [], users: [], activity: [], resets: [] };
let settings = null;
let user = null;
let currentPage = 'dashboard';

function loadDb() {
  Object.keys(DBKEY).forEach(name => {
    const data = store.get(DBKEY[name], []);
    db[name] = Array.isArray(data) ? data : [];
  });
  db.tickets.forEach(t => { if (!Array.isArray(t.log)) t.log = []; if (!Array.isArray(t.comments)) t.comments = []; });
}
function saveDb(name) { return store.set(DBKEY[name], db[name]); }

function nextId(prefix, list, start) {
  const counters = store.get(KEYS.counters, {}) || {};
  const max = list.reduce((m, x) => {
    const n = parseInt(String(x.id).split('-')[1], 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, start - 1);
  const next = Math.max(counters[prefix] || 0, max) + 1;
  counters[prefix] = next;
  store.set(KEYS.counters, counters);
  return `${prefix}-${next}`;
}

/* ---------------------------------------------------------
   4. Seed data (only on the very first launch)
--------------------------------------------------------- */
function seedIfNeeded() {
  if (store.get(KEYS.seeded, false)) return;
  seedData();
  store.set(KEYS.seeded, true);
}

function seedData() {
  const technicians = [
    { id: 'TC-01', name: 'K. Adeyemi', staffId: 'UI/MD/0412', team: 'HVAC Team', specialization: 'HVAC', phone: '0803 555 0201', email: 'technician@ui.edu.ng', status: 'Busy' },
    { id: 'TC-02', name: 'T. Bello', staffId: 'UI/MD/0388', team: 'Electrical Team', specialization: 'Electrical', phone: '0803 555 0202', email: 't.bello@ui.edu.ng', status: 'Busy' },
    { id: 'TC-03', name: 'A. Musa', staffId: 'UI/MD/0451', team: 'Plumbing Team', specialization: 'Plumbing', phone: '0803 555 0203', email: 'a.musa@ui.edu.ng', status: 'Busy' },
    { id: 'TC-04', name: 'S. Ibrahim', staffId: 'UI/MD/0367', team: 'Generator Team', specialization: 'Generator', phone: '0803 555 0204', email: 's.ibrahim@ui.edu.ng', status: 'Busy' },
    { id: 'TC-05', name: 'O. Okafor', staffId: 'UI/MD/0429', team: 'Carpentry Team', specialization: 'Carpentry', phone: '0803 555 0205', email: 'o.okafor@ui.edu.ng', status: 'Available' },
    { id: 'TC-06', name: 'F. Adebayo', staffId: 'UI/MD/0473', team: 'Plumbing Team', specialization: 'Plumbing', phone: '0803 555 0206', email: 'f.adebayo@ui.edu.ng', status: 'Available' },
    { id: 'TC-07', name: 'C. Nwosu', staffId: 'UI/MD/0335', team: 'General Maintenance Team', specialization: 'General Maintenance', phone: '0803 555 0207', email: 'c.nwosu@ui.edu.ng', status: 'On Leave' },
    { id: 'TC-08', name: 'M. Lawal', staffId: 'UI/MD/0491', team: 'Electrical Team', specialization: 'Electrical', phone: '0803 555 0208', email: 'm.lawal@ui.edu.ng', status: 'Available' }
  ];
  const tname = id => (technicians.find(t => t.id === id) || {}).name || '';

  const mkTicket = o => {
    const created = hoursAgo(o.h);
    const t = {
      id: o.id, requester: o.requester, department: o.department, contact: o.contact, title: o.title, description: o.description,
      category: o.category, location: o.location, priority: o.priority, technicianId: o.tech || '', created,
      due: daysFromNow(o.due), status: o.status,
      respondedAt: o.resp != null ? hoursAgo(o.h - o.resp) : null, resolvedAt: null,
      log: [{ t: created, text: 'Ticket created' }]
    };
    if (o.tech && o.resp != null) t.log.push({ t: t.respondedAt, text: `Assigned to ${tname(o.tech)}` });
    if (!['Open', 'Assigned'].includes(o.status)) {
      const when = hoursAgo(Math.max(o.h - (o.resp || 0) - 1, 0));
      t.log.push({ t: when, text: `Status changed to ${o.status}` });
      if (['Resolved', 'Closed'].includes(o.status)) t.resolvedAt = when;
    }
    return t;
  };

  const tickets = [
    mkTicket({ id: 'HD-1037', title: 'Generator fails to start during outages', requester: 'Mrs. R. Akinwale', department: 'Registry', contact: '0803 555 0111', category: 'Generator', location: 'Administrative Building', priority: 'Critical', tech: 'TC-04', status: 'In Progress', h: 30, resp: 0.5, due: 1, description: 'The standby generator does not pick up the load when mains power fails. Offices have lost power three times this week.' }),
    mkTicket({ id: 'HD-1038', title: 'AC unit not cooling in lecture theatre', requester: 'Prof. A. Olayinka', department: 'Faculty of Science', contact: '0803 555 0112', category: 'Air Conditioning', location: 'Faculty of Science', priority: 'High', tech: 'TC-01', status: 'Resolved', h: 140, resp: 2, due: -3, description: 'The split unit in Lecture Theatre 2 blows warm air. Classes are being disrupted.' }),
    mkTicket({ id: 'HD-1039', title: 'Blocked drainage behind hostel kitchen', requester: 'Mr. D. Eze', department: 'Hall Management', contact: '0803 555 0113', category: 'Plumbing', location: 'Female Hostel', priority: 'Medium', tech: 'TC-06', status: 'Closed', h: 200, resp: 4, due: -8, description: 'Waste water is pooling behind the kitchen block and smells badly.' }),
    mkTicket({ id: 'HD-1040', title: 'Broken door lock, Room 12', requester: 'Miss N. Balogun', department: 'Faculty of Social Sciences', contact: '0803 555 0114', category: 'Carpentry', location: 'Faculty of Social Sciences', priority: 'Low', tech: 'TC-05', status: 'On Hold', h: 100, resp: 6, due: 5, description: 'The lock on Room 12 no longer latches. Waiting for a replacement lock set from stores.' }),
    mkTicket({ id: 'HD-1041', title: 'No water supply on second floor', requester: 'Mr. J. Afolabi', department: 'Student Affairs', contact: '0803 555 0115', category: 'Water Supply', location: 'Student Union Building', priority: 'High', tech: 'TC-03', status: 'Assigned', h: 20, resp: 1.5, due: 1, description: 'Taps on the second floor have been dry since yesterday morning. Ground floor is fine.' }),
    mkTicket({ id: 'HD-1042', title: 'AC unit not cooling', requester: 'Dr. T. Oyekan', department: 'Faculty of Science', contact: '0803 555 0116', category: 'Air Conditioning', location: 'Faculty of Science', priority: 'High', tech: 'TC-01', status: 'Open', h: 5, resp: 0.5, due: 2, description: 'The air conditioner in the Physics laboratory is running but the room stays hot. Equipment is at risk.' }),
    mkTicket({ id: 'HD-1043', title: 'Flickering ceiling lights', requester: 'Dr. S. Olatunji', department: 'Faculty of Arts', contact: '0803 555 0117', category: 'Electrical', location: 'Faculty of Arts', priority: 'Medium', tech: 'TC-02', status: 'In Progress', h: 26, resp: 3, due: 2, description: 'Ceiling lights in Lecture Room 3 flicker and sometimes go out completely.' }),
    mkTicket({ id: 'HD-1044', title: 'Leaking pipe', requester: 'Mr. Y. Alabi', department: 'Hall Management', contact: '0803 555 0118', category: 'Plumbing', location: 'Male Hostel B', priority: 'High', tech: 'TC-03', status: 'Resolved', h: 52, resp: 1, due: -1, description: 'Water is leaking from a pipe on the first-floor corridor and dripping through the ceiling below.' }),
    mkTicket({ id: 'HD-1045', title: 'Cracked wall plaster near stairwell', requester: 'Engr. P. Ajayi', department: 'Faculty of Technology', contact: '0803 555 0119', category: 'Building', location: 'Engineering Workshop', priority: 'Medium', tech: '', status: 'Open', h: 3, resp: null, due: 7, description: 'A long crack has opened in the plaster next to the main stairwell. Please inspect for structural cause.' }),
    mkTicket({ id: 'HD-1046', title: 'Irrigation pump power failure', requester: 'Dr. E. Ogundipe', department: 'Faculty of Agriculture', contact: '0803 555 0120', category: 'Electrical', location: 'UI Teaching and Research Farm', priority: 'High', tech: 'TC-08', status: 'Assigned', h: 9, resp: 1, due: 2, description: 'The irrigation pump house has no power. Seedlings in the nursery need watering urgently.' }),
    mkTicket({ id: 'HD-1047', title: 'Broken window louvres', requester: 'Mrs. C. Adegoke', department: 'Hall Management', contact: '0803 555 0121', category: 'Carpentry', location: 'Female Hostel', priority: 'Low', tech: '', status: 'Open', h: 1, resp: null, due: 10, description: 'Three louvre blades are missing in Room 21 and rain is coming in.' }),
    mkTicket({ id: 'HD-1048', title: 'Water tank overflowing', requester: 'Mr. K. Salami', department: 'Hall Management', contact: '0803 555 0122', category: 'Water Supply', location: 'Male Hostel B', priority: 'Critical', tech: 'TC-06', status: 'Assigned', h: 2, resp: 0.4, due: 0, description: 'The rooftop tank is overflowing onto the top floor because the float valve is stuck.' }),
    mkTicket({ id: 'HD-1049', title: 'Server room air conditioner alarm', requester: 'Mr. I. Bankole', department: 'Registry', contact: '0803 555 0123', category: 'Air Conditioning', location: 'Administrative Building', priority: 'High', tech: 'TC-01', status: 'In Progress', h: 14, resp: 1, due: 1, description: 'The precision AC in the server room is showing a high-pressure alarm and the room temperature is rising.' })
  ];

  const mkProject = o => ({
    id: o.id, name: o.name, description: o.description, location: o.location, category: o.category, team: o.team,
    start: daysFromNow(o.start), deadline: daysFromNow(o.deadline), budget: o.budget, progress: o.progress, status: o.status,
    updatedAt: hoursAgo(o.upd), deadlineNotified: !!o.notified
  });
  const projects = [
    mkProject({ id: 'PJ-3001', name: 'Replacement of water pipes in Male Hostel B', description: 'Replace ageing galvanised supply lines with PPR pipes across all four floors, including valves and fittings.', location: 'Male Hostel B', category: 'Plumbing', team: 'Plumbing Team', start: -40, deadline: 12, budget: 4850000, progress: 65, status: 'In Progress', upd: 48 }),
    mkProject({ id: 'PJ-3002', name: 'Rewiring of Faculty of Arts Block C', description: 'Full rewiring of lecture rooms and corridors, new distribution boards and LED lighting.', location: 'Faculty of Arts', category: 'Electrical', team: 'Electrical Team', start: -25, deadline: 6, budget: 12300000, progress: 40, status: 'In Progress', upd: 20, notified: true }),
    mkProject({ id: 'PJ-3003', name: 'Servicing of split units, Faculty of Science', description: 'Scheduled cleaning, gas top-up and capacitor checks for all split units in the faculty.', location: 'Faculty of Science', category: 'Air Conditioning', team: 'HVAC Team', start: -10, deadline: 30, budget: 2750000, progress: 20, status: 'In Progress', upd: 72 }),
    mkProject({ id: 'PJ-3004', name: 'Installation of 250kVA generator, Student Union Building', description: 'Supply, install and commission a new standby generator with automatic changeover panel.', location: 'Student Union Building', category: 'Generator', team: 'Generator Team', start: 7, deadline: 60, budget: 18500000, progress: 0, status: 'Not Started', upd: 240 }),
    mkProject({ id: 'PJ-3005', name: 'Roof repair and repainting, Female Hostel', description: 'Replace corroded roofing sheets, repair fascia boards and repaint external walls.', location: 'Female Hostel', category: 'Building', team: 'General Maintenance Team', start: -90, deadline: -15, budget: 6200000, progress: 100, status: 'Completed', upd: 400 }),
    mkProject({ id: 'PJ-3006', name: 'Borehole pump refurbishment, Teaching and Research Farm', description: 'Overhaul the borehole pump and motor and replace the rising main.', location: 'UI Teaching and Research Farm', category: 'Water Supply', team: 'Plumbing Team', start: -30, deadline: 20, budget: 3100000, progress: 55, status: 'On Hold', upd: 150 })
  ];

  const mkReport = o => ({
    id: o.id, technicianId: o.tech, technicianName: tname(o.tech), related: o.related, location: o.location,
    date: daysFromNow(-o.d), problem: o.problem, work: o.work, materials: o.materials, recommendation: o.rec,
    status: o.status, followUp: o.follow, createdAt: hoursAgo(o.d * 24 + 1)
  });
  const reports = [
    mkReport({ id: 'FR-2001', tech: 'TC-01', related: 'HD-1038', location: 'Faculty of Science', d: 4, problem: 'AC unit not cooling properly.', work: 'Diagnosed faulty compressor capacitor and replaced the component.', materials: '35uF run capacitor, R410A refrigerant top-up, insulation tape', rec: 'Routine servicing recommended.', status: 'Completed', follow: 'No' }),
    mkReport({ id: 'FR-2002', tech: 'TC-03', related: 'HD-1044', location: 'Male Hostel B', d: 2, problem: 'Burst 25mm PVC joint on the first-floor supply line, water leaking into the ceiling below.', work: 'Isolated the section, cut out the damaged pipe, fitted a new coupling and pressure-tested the line.', materials: '25mm PVC pipe, couplings, solvent cement, PTFE tape', rec: 'Replace the remaining ageing pipes on the corridor (see PJ-3001).', status: 'Reviewed', follow: 'Yes' }),
    mkReport({ id: 'FR-2003', tech: 'TC-02', related: 'HD-1043', location: 'Faculty of Arts', d: 1, problem: 'Lights in Lecture Room 3 flicker because of a loose neutral connection and ageing ballasts.', work: 'Re-terminated connections at the distribution board and replaced two ballasts. Still monitoring.', materials: 'Ballasts x2, terminal blocks, insulation tape', rec: 'Full rewiring of the block is recommended (see PJ-3002).', status: 'Requires Follow-up', follow: 'Yes' }),
    mkReport({ id: 'FR-2004', tech: 'TC-04', related: 'HD-1037', location: 'Administrative Building', d: 0, problem: 'Generator failed to start: clogged fuel filter and weak battery.', work: 'Replaced the fuel filter and battery, then test-ran the set for 45 minutes on load.', materials: 'Fuel filter, 12V battery, 20 litres of diesel', rec: 'Run a weekly test and service the set monthly.', status: 'Submitted', follow: 'No' }),
    mkReport({ id: 'FR-2005', tech: 'TC-06', related: 'HD-1039', location: 'Female Hostel', d: 7, problem: 'Kitchen drain blocked by grease and debris.', work: 'Rodded the drain and flushed it with pressurised water until flow was restored.', materials: 'Drain rods, caustic soda', rec: 'Install a grease trap at the kitchen outlet.', status: 'Completed', follow: 'No' }),
    mkReport({ id: 'FR-2006', tech: 'TC-03', related: 'PJ-3001', location: 'Male Hostel B', d: 3, problem: 'Progress inspection of pipe replacement on the west wing.', work: 'Completed replacement of about 60% of the supply line. Pressure tests passed.', materials: '32mm PPR pipes, fittings, gate valves', rec: 'Continue with the east wing and issue water shutdown notices to residents beforehand.', status: 'Submitted', follow: 'No' })
  ];

  const mkNote = (text, type, audience, hrs, read, link) => ({ id: uid('N'), text, type, audience, time: hoursAgo(hrs), read: !!read, link });
  const notifications = [
    mkNote('New high-priority maintenance ticket received: HD-1048, water tank overflowing.', 'ticket', 'ADMIN', 2, false, { kind: 'ticket', id: 'HD-1048' }),
    mkNote('Ticket HD-1042 has been assigned to you.', 'ticket', 'TC-01', 5, false, { kind: 'ticket', id: 'HD-1042' }),
    mkNote('Project deadline approaching: PJ-3002 is due in 6 days.', 'project', 'ADMIN', 18, false, { kind: 'project', id: 'PJ-3002' }),
    mkNote('Field report submitted by S. Ibrahim.', 'report', 'ADMIN', 1, false, { kind: 'report', id: 'FR-2004' }),
    mkNote('Ticket HD-1044 has been resolved.', 'ticket', 'ADMIN', 50, true, { kind: 'ticket', id: 'HD-1044' }),
    mkNote('Field report submitted by K. Adeyemi.', 'report', 'ADMIN', 100, true, { kind: 'report', id: 'FR-2001' })
  ];

  store.set(KEYS.technicians, technicians);
  store.set(KEYS.tickets, tickets);
  store.set(KEYS.projects, projects);
  store.set(KEYS.reports, reports);
  store.set(KEYS.notifications, notifications);
  store.set(KEYS.counters, { HD: 1049, PJ: 3006, FR: 2006, TC: 8 });
}

/* ---------------------------------------------------------
   5. Settings & theme
--------------------------------------------------------- */
function defaultSettings() {
  return { dark: false, notifTicket: true, notifProject: true, notifReport: true, profiles: {} };
}
function loadSettings() {
  const s = store.get(KEYS.settings, null);
  settings = Object.assign(defaultSettings(), s && typeof s === 'object' ? s : {});
  if (!settings.profiles || typeof settings.profiles !== 'object') settings.profiles = {};
}
function saveSettings() { return store.set(KEYS.settings, settings); }
function applyTheme() { document.documentElement.setAttribute('data-theme', settings.dark ? 'dark' : 'light'); }
function profile() {
  const base = user ? { name: user.name, department: user.department, email: user.email, phone: user.phone } : {};
  return Object.assign(base, user ? settings.profiles[user.email] || {} : {});
}
function displayName() { return (user && profile().name) || (user ? user.name : ''); }

/* ---------------------------------------------------------
   6. Accounts, authentication and the activity log
--------------------------------------------------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Small pure-JS SHA-256 so hashing works on any host (http or https). */
function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const K = [], H = [];
  for (let n = 2, c = 0; c < 64; n++) {
    let prime = true;
    for (let i = 2; i * i <= n; i++) { if (n % i === 0) { prime = false; break; } }
    if (!prime) continue;
    if (c < 8) H[c] = (Math.pow(n, 0.5) % 1 * 4294967296) | 0;
    K[c++] = (Math.pow(n, 1 / 3) % 1 * 4294967296) | 0;
  }
  const len = bytes.length;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(len * 8 / 4294967296));
  view.setUint32(padded.length - 4, (len * 8) >>> 0);
  const w = new Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    [a, b, c, d, e, f, g, h].forEach((x, i) => { H[i] = (H[i] + x) | 0; });
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}
function randomBytes(n) {
  const a = new Uint8Array(n);
  if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
  else for (let i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
  return a;
}
const randomHex = n => Array.from(randomBytes(n), b => b.toString(16).padStart(2, '0')).join('');
const normAnswer = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const pwHash = (acc, pw) => sha256(`${acc.salt}:pw:${pw}`);
const ansHash = (acc, a) => sha256(`${acc.salt}:qa:${normAnswer(a)}`);
function setPassword(acc, pw) { if (!acc.salt) acc.salt = randomHex(8); acc.passHash = pwHash(acc, pw); }
function setAnswer(acc, question, answer) { if (!acc.salt) acc.salt = randomHex(8); acc.question = question; acc.answerHash = ansHash(acc, answer); }
function passwordProblem(pw) {
  if (pw !== pw.trim()) return 'The password cannot start or end with a space.';
  if (pw.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Include at least one letter and one number.';
  return '';
}
function makeTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pw = '';
  do { pw = Array.from(randomBytes(10), b => chars[b % chars.length]).join(''); } while (passwordProblem(pw));
  return pw;
}
const findUser = email => db.users.find(u => u.email === String(email || '').trim().toLowerCase());

/* The first administrator account. Only a salted hash is stored; change the password in Settings after first sign-in. */
function ensureAdminAccount() {
  const admin = db.users.find(u => u.email === 'admin@ui.edu.ng');
  if (!admin) {
    const newAdmin = {
      id: 'U-admin', email: 'admin@ui.edu.ng', name: 'Prof. E. Oladeji', role: 'ADMIN', techId: '',
      department: 'Maintenance Department', phone: '0803 555 0100', status: 'Active',
      question: '', answerHash: '', createdAt: new Date().toISOString(), lastLogin: null,
      mustChange: true /* forces a new password on first sign-in */
    };
    setPassword(newAdmin, 'ChangeMe123');
    db.users.push(newAdmin);
    saveDb('users');
    return;
  }

  const legacyHash = pwHash(admin, 'admin123');
  const currentHash = admin.passHash || '';
  if (admin.role === 'ADMIN' && (currentHash === legacyHash || !currentHash)) {
    setPassword(admin, 'ChangeMe123');
    admin.mustChange = true;
    saveDb('users');
  }
}

function seedUsersIfNeeded() {
  if (db.users.length) {
    ensureAdminAccount();
    return;
  }
  const admin = {
    id: 'U-admin', email: 'admin@ui.edu.ng', name: 'Prof. E. Oladeji', role: 'ADMIN', techId: '',
    department: 'Maintenance Department', phone: '0803 555 0100', status: 'Active',
    question: '', answerHash: '', createdAt: new Date().toISOString(), lastLogin: null,
    mustChange: true /* forces a new password on first sign-in */
  };
  setPassword(admin, 'ChangeMe123');
  db.users.push(admin);
  saveDb('users');
}

/* ---- activity log (admin can read every entry) ---- */
function logActivity(kind, text, actor) {
  const a = actor || user || null;
  db.activity.unshift({
    id: uid('A'), t: new Date().toISOString(), kind, text,
    email: a ? a.email : '', name: a ? (actor ? a.name : displayName()) : 'Visitor', role: a ? a.role : ''
  });
  if (db.activity.length > 3000) db.activity.length = 3000;
  saveDb('activity');
}

/* ---- sign-in lockout (browser-side) ---- */
function lockMinutes(key) {
  const l = store.get(KEYS.lock, {}) || {};
  const e = l[key];
  return e && e.until && e.until > Date.now() ? Math.ceil((e.until - Date.now()) / 60000) : 0;
}
function recordFail(key) {
  const l = store.get(KEYS.lock, {}) || {};
  const e = l[key] && !(l[key].until && l[key].until <= Date.now()) ? l[key] : { n: 0 };
  e.n += 1;
  if (e.n >= 5) { e.until = Date.now() + 5 * 60000; e.n = 0; }
  l[key] = e;
  store.set(KEYS.lock, l);
}
function clearFails(key) {
  const l = store.get(KEYS.lock, {}) || {};
  if (l[key]) { delete l[key]; store.set(KEYS.lock, l); }
}

/* ---- session ---- */
function publicUser(acc) {
  return { id: acc.id, email: acc.email, role: acc.role, name: acc.name, techId: acc.techId || '', department: acc.department, phone: acc.phone, mustChange: !!acc.mustChange };
}
function readSession() {
  let raw = null;
  try { raw = sessionStorage.getItem(KEYS.user) || localStorage.getItem(KEYS.user); } catch (e) { raw = null; }
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    const acc = findUser(s && s.email);
    return acc && acc.status !== 'Disabled' ? publicUser(acc) : null;
  } catch (e) { return null; }
}
function saveSession(u, remember) {
  const payload = JSON.stringify({ email: u.email, role: u.role, name: u.name, at: Date.now() });
  try {
    sessionStorage.removeItem(KEYS.user);
    localStorage.removeItem(KEYS.user);
    (remember ? localStorage : sessionStorage).setItem(KEYS.user, payload);
  } catch (e) { /* storage blocked: user stays signed in for this page view only */ }
}
function clearSession() {
  try { sessionStorage.removeItem(KEYS.user); localStorage.removeItem(KEYS.user); } catch (e) { /* ignore */ }
}

/* ---- auth screens ---- */
function showAuth(view) {
  ['login', 'signup', 'forgot'].forEach(v => { $(`#${v}Form`).hidden = v !== view; });
  $$('.form-error, .form-ok', $('.login-panel')).forEach(el => { el.hidden = true; });
  if (view === 'forgot') resetForgot();
  window.scrollTo(0, 0);
  const first = $(`#${view}Form input`);
  if (first && !(window.matchMedia && matchMedia('(pointer: coarse)').matches)) first.focus();
}

function handleLogin(e) {
  e.preventDefault();
  const email = val('loginEmail').trim().toLowerCase();
  const pass = val('loginPassword');
  const errBox = $('#loginError');
  const showErr = msg => { errBox.textContent = msg; errBox.hidden = false; };
  errBox.hidden = true;
  if (!email || !pass) { showErr('Enter your email address and password.'); return; }
  const wait = lockMinutes(email);
  if (wait) { showErr(`Too many failed attempts. Try again in ${wait} minute${wait === 1 ? '' : 's'}.`); return; }
  const acc = findUser(email);
  if (!acc || acc.passHash !== pwHash(acc, pass)) {
    recordFail(email);
    if (acc) logActivity('Account', 'Failed sign-in attempt', publicUser(acc));
    showErr('Email or password is incorrect.');
    $('#loginPassword').focus();
    return;
  }
  if (acc.status === 'Disabled') { showErr('This account has been disabled. Please contact the administrator.'); return; }
  clearFails(email);

  const btn = $('#loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in';
  setTimeout(() => {
    acc.lastLogin = new Date().toISOString();
    saveDb('users');
    user = publicUser(acc);
    saveSession(user, $('#rememberMe').checked);
    logActivity('Account', 'Signed in');
    btn.disabled = false;
    btn.textContent = 'Sign in';
    $('#loginForm').reset();
    enterApp(true);
  }, 450);
}

function setFieldError(id, msg) {
  const el = $('#' + id), er = $('#err_' + id);
  if (el) el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (er) { er.textContent = msg; er.hidden = !msg; }
  return el;
}

function handleSignup(e) {
  e.preventDefault();
  const name = val('suName').trim(), email = val('suEmail').trim().toLowerCase(), phone = val('suPhone').trim();
  const dept = val('suDept').trim(), pw = val('suPassword'), pw2 = val('suConfirm'), question = val('suQuestion'), answer = val('suAnswer');
  $('#signupError').hidden = true;
  const checks = [
    ['suName', name ? '' : 'Full name is required.'],
    ['suEmail', !email ? 'Email address is required.' : !EMAIL_RE.test(email) ? 'Enter a valid email address.' : findUser(email) ? 'An account with this email already exists. Try signing in.' : ''],
    ['suPhone', phone && !/^[+\d][\d\s()-]{6,}$/.test(phone) ? 'Enter a valid phone number.' : ''],
    ['suPassword', passwordProblem(pw)],
    ['suConfirm', pw2 === pw ? '' : 'Passwords do not match.'],
    ['suAnswer', normAnswer(answer).length >= 2 ? '' : 'Enter an answer (at least 2 characters).']
  ];
  let first = null;
  checks.forEach(([id, msg]) => { const el = setFieldError(id, msg); if (msg && !first) first = el; });
  if (first) { first.focus(); return; }

  const now = new Date().toISOString();
  const acc = { id: uid('U'), email, name, role: 'USER', techId: '', department: dept, phone, status: 'Active', createdAt: now, lastLogin: now, mustChange: false };
  setPassword(acc, pw);
  setAnswer(acc, question, answer);
  db.users.push(acc);
  saveDb('users');
  user = publicUser(acc);
  saveSession(user, false);
  logActivity('Account', 'Created an account');
  notify(`New user registered: ${name} (${email}).`, 'system', 'ADMIN', { kind: 'user', id: acc.id });
  $('#signupForm').reset();
  enterApp(true);
}

let fpAcc = null;
function resetForgot() {
  fpAcc = null;
  $('#fpStep2').hidden = true;
  $('#fpEmail').readOnly = false;
  $('#fpIntro').textContent = 'Enter the email address of your account.';
  $('#forgotBtn').textContent = 'Continue';
  $('#forgotBtn').hidden = false;
  $('#fpAskAdmin').hidden = true;
  ['fpAnswer', 'fpNew', 'fpConfirm'].forEach(id => { $('#' + id).value = ''; });
}
function handleForgot(e) {
  e.preventDefault();
  const err = $('#forgotError'), ok = $('#forgotOk');
  err.hidden = true; ok.hidden = true;
  const showErr = msg => { err.textContent = msg; err.hidden = false; };

  if (!fpAcc) {
    const email = val('fpEmail').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return showErr('Enter a valid email address.');
    const acc = findUser(email);
    if (!acc) return showErr('We could not find an account with that email address.');
    if (acc.status === 'Disabled') return showErr('This account has been disabled. Please contact the administrator.');
    fpAcc = acc;
    $('#fpEmail').readOnly = true;
    $('#fpAskAdmin').hidden = false;
    if (acc.question && acc.answerHash) {
      $('#fpQuestion').textContent = acc.question;
      $('#fpStep2').hidden = false;
      $('#fpIntro').textContent = 'Answer your security question and choose a new password.';
      $('#forgotBtn').textContent = 'Reset password';
      $('#fpAnswer').focus();
    } else {
      $('#forgotBtn').hidden = true;
      showErr('This account has no security question yet. Ask the administrator to reset your password.');
    }
    return;
  }

  const key = 'fp:' + fpAcc.email;
  const wait = lockMinutes(key);
  if (wait) return showErr(`Too many wrong answers. Try again in ${wait} minute${wait === 1 ? '' : 's'}.`);
  if (ansHash(fpAcc, val('fpAnswer')) !== fpAcc.answerHash) { recordFail(key); return showErr('That answer is not correct.'); }
  const pw = val('fpNew');
  const problem = passwordProblem(pw);
  if (problem) return showErr(problem);
  if (pw !== val('fpConfirm')) return showErr('Passwords do not match.');
  clearFails(key);
  setPassword(fpAcc, pw);
  fpAcc.mustChange = false;
  saveDb('users');
  logActivity('Account', 'Reset their password using the security question', publicUser(fpAcc));
  const email = fpAcc.email;
  ok.textContent = 'Password updated. You can now sign in.';
  ok.hidden = false;
  setTimeout(() => { showAuth('login'); $('#loginEmail').value = email; $('#loginPassword').value = ''; toast('Password updated. Please sign in.'); }, 1200);
}
function askAdminReset() {
  const ok = $('#forgotOk'), err = $('#forgotError');
  err.hidden = true;
  const acc = fpAcc;
  if (!acc) return;
  if (db.resets.some(r => r.email === acc.email && r.status === 'Pending')) {
    ok.textContent = 'Your request is already with the administrator. Please wait for a temporary password.';
    ok.hidden = false;
    return;
  }
  db.resets.unshift({ id: uid('R'), email: acc.email, name: acc.name, requestedAt: new Date().toISOString(), status: 'Pending' });
  saveDb('resets');
  logActivity('Account', 'Asked the administrator to reset their password', publicUser(acc));
  notify(`${acc.name} (${acc.email}) asked for a password reset.`, 'system', 'ADMIN', { kind: 'user', id: acc.id });
  ok.textContent = 'Request sent. The administrator will give you a temporary password. Sign in with it and choose a new one.';
  ok.hidden = false;
}

function openForcedPasswordChange() {
  openForm({
    title: 'Choose a new password', submitLabel: 'Save password', size: 'md',
    fields: [
      { name: 'pw', label: 'New password', type: 'password', required: true, full: true, help: 'At least 8 characters with a letter and a number.' },
      { name: 'pw2', label: 'Confirm new password', type: 'password', required: true, full: true }
    ],
    onSubmit: data => {
      const problem = passwordProblem(data.pw);
      if (problem) return problem;
      if (data.pw !== data.pw2) return 'Passwords do not match.';
      const acc = findUser(user.email);
      setPassword(acc, data.pw);
      acc.mustChange = false;
      saveDb('users');
      user.mustChange = false;
      logActivity('Account', 'Chose a new password after a reset');
      toast('Password updated.');
    }
  });
}

function logout() {
  if (user) logActivity('Account', 'Signed out');
  closeModal(); closeConfirm();
  clearSession();
  user = null;
  document.body.removeAttribute('data-role');
  $('#appView').hidden = true;
  $('#loginView').hidden = false;
  closeSidebar();
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  showAuth('login');
  toast('You have been signed out.', 'info');
}

function bindAuth() {
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-auth]');
    if (b) { e.preventDefault(); showAuth(b.dataset.auth); }
  });
  $('#signupForm').addEventListener('submit', handleSignup);
  $('#forgotForm').addEventListener('submit', handleForgot);
  $('#fpAskAdmin').addEventListener('click', askAdminReset);
  $('#signupForm').addEventListener('input', e => {
    const el = e.target;
    if (el.getAttribute('aria-invalid') === 'true') { el.setAttribute('aria-invalid', 'false'); const er = $('#err_' + el.id); if (er) er.hidden = true; }
  });
}

/* ---------------------------------------------------------
   7. UI primitives: toast, modal, confirm, forms
--------------------------------------------------------- */
function toast(msg, type = 'success') {
  const box = $('#toasts');
  if (!box) return;
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  const icon = type === 'error' ? 'fa-circle-exclamation' : type === 'info' ? 'fa-circle-info' : 'fa-circle-check';
  el.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i><span>${esc(msg)}</span>`;
  box.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 3800);
}

let lastFocus = null;
function openModal({ title, body, size = 'md' }) {
  if ($('#modalOverlay').hidden) lastFocus = document.activeElement;
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = body;
  $('#modal').className = `modal modal-${size}`;
  $('#modalOverlay').hidden = false;
  document.body.classList.add('no-scroll');
  const first = $('#modalForm input:not([type=hidden]), #modalForm select, #modalForm textarea');
  (first || $('#modal')).focus();
}
function closeModal() {
  if ($('#modalOverlay').hidden) return;
  $('#modalOverlay').hidden = true;
  $('#modalBody').innerHTML = '';
  document.body.classList.remove('no-scroll');
  if (lastFocus && document.contains(lastFocus)) { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
}

let confirmCb = null;
function confirmDialog({ title, message, confirmLabel = 'Delete', tone = 'danger', onConfirm }) {
  confirmCb = onConfirm;
  $('#confirmTitle').textContent = title;
  $('#confirmMsg').textContent = message;
  const ok = $('#confirmOk');
  ok.textContent = confirmLabel;
  ok.className = `btn btn-${tone}`;
  $('#confirmOverlay').hidden = false;
  ok.focus();
}
function closeConfirm() {
  $('#confirmOverlay').hidden = true;
  confirmCb = null;
}

const opts = arr => arr.map(o => (typeof o === 'string' ? { value: o, label: o } : o));

function fieldHTML(f, values) {
  const raw = values[f.name];
  const v = raw !== undefined && raw !== null ? raw : (f.default !== undefined ? f.default : '');
  const id = `f_${f.name}`;
  const req = f.required ? ' required' : '';
  const err = `<small class="field-error" id="err_${f.name}" hidden></small>`;
  const label = `<label for="${id}">${esc(f.label)}${f.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>`;
  const cls = `form-field${f.full ? ' full' : ''}`;
  const attrs = `id="${id}" name="${f.name}" aria-describedby="err_${f.name}"${req}`;
  let control;

  switch (f.type) {
    case 'static':
      return `<div class="${cls}"><span class="form-label-static" style="font-size:.88rem;font-weight:600">${esc(f.label)}</span><div class="static-value">${esc(f.text)}</div></div>`;
    case 'textarea':
      control = `<textarea ${attrs} rows="${f.rows || 3}" placeholder="${esc(f.placeholder || '')}">${esc(v)}</textarea>`;
      break;
    case 'select':
      control = `<select ${attrs}>` +
        (f.placeholder !== undefined ? `<option value="">${esc(f.placeholder)}</option>` : '') +
        opts(f.options).map(o => `<option value="${esc(o.value)}"${String(o.value) === String(v) ? ' selected' : ''}${o.disabled ? ' disabled' : ''}>${esc(o.label)}</option>`).join('') +
        '</select>';
      break;
    case 'range':
      control = `<div class="range-row"><input ${attrs} type="range" min="0" max="100" step="5" value="${esc(v || 0)}"><output id="out_${f.name}" for="${id}">${esc(v || 0)}%</output></div>`;
      break;
    default:
      control = `<input ${attrs} type="${f.type || 'text'}" value="${esc(v)}" placeholder="${esc(f.placeholder || '')}"${f.list ? ` list="${f.list}"` : ''}${f.min !== undefined ? ` min="${f.min}"` : ''}${f.type === 'number' ? ' step="any" inputmode="decimal"' : ''}>`;
  }
  return `<div class="${cls}">${label}${control}${f.help ? `<small class="field-help">${esc(f.help)}</small>` : ''}${err}</div>`;
}

function validateForm(form, fields) {
  let firstBad = null;
  fields.forEach(f => {
    if (f.type === 'static') return;
    const el = form.elements[f.name];
    if (!el) return;
    const errEl = form.querySelector(`#err_${f.name}`);
    const v = String(el.value || '').trim();
    let msg = '';
    if (f.required && !v) msg = `${f.label} is required.`;
    else if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid email address.';
    else if (v && f.type === 'tel' && !/^[+\d][\d\s()-]{6,}$/.test(v)) msg = 'Enter a valid phone number.';
    else if (v && f.type === 'number' && (isNaN(Number(v)) || (f.min !== undefined && Number(v) < f.min))) msg = `${f.label} must be a number${f.min !== undefined ? ' of at least ' + f.min : ''}.`;
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (errEl) { errEl.textContent = msg; errEl.hidden = !msg; }
    if (msg && !firstBad) firstBad = el;
  });
  if (firstBad) firstBad.focus();
  return !firstBad;
}

function openForm({ title, fields, values = {}, submitLabel = 'Save', size = 'lg', onSubmit, after }) {
  const body = `<form id="modalForm" class="form-grid" novalidate>
    ${fields.map(f => fieldHTML(f, values)).join('')}
    <div id="formError" class="form-error full" role="alert" hidden></div>
    <div class="modal-foot full">
      <button type="button" class="btn btn-outline" data-action="close-modal">Cancel</button>
      <button type="submit" class="btn btn-primary">${esc(submitLabel)}</button>
    </div>
  </form>`;
  openModal({ title, body, size });
  const form = $('#modalForm');
  form.addEventListener('input', e => {
    const el = e.target;
    if (el.getAttribute('aria-invalid') === 'true') {
      el.setAttribute('aria-invalid', 'false');
      const er = form.querySelector(`#err_${el.name}`);
      if (er) er.hidden = true;
    }
    if (el.type === 'range') { const out = form.querySelector(`#out_${el.name}`); if (out) out.textContent = `${el.value}%`; }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const box = $('#formError');
    box.hidden = true;
    if (!validateForm(form, fields)) return;
    const data = {};
    fields.forEach(f => { if (f.type !== 'static' && form.elements[f.name]) data[f.name] = String(form.elements[f.name].value).trim(); });
    const problem = onSubmit(data);
    if (typeof problem === 'string' && problem) { box.textContent = problem; box.hidden = false; return; }
    closeModal();
  });
  if (after) after(form);
}

function emptyState(icon, title, text, actionHtml = '') {
  return `<span class="chip-icon"><i class="fa-solid ${icon}" aria-hidden="true"></i></span><h3>${esc(title)}</h3><p>${esc(text)}</p>${actionHtml}`;
}

/* ---------------------------------------------------------
   8. Permissions and data scoping
--------------------------------------------------------- */
const isAdmin = () => !!user && user.role === 'ADMIN';
const isTech = () => !!user && user.role === 'TECHNICIAN';
const isUser = () => !!user && user.role === 'USER';
function requireAdmin() {
  if (isAdmin()) return true;
  toast('Only administrators can do that.', 'error');
  return false;
}
const techById = id => db.technicians.find(t => t.id === id);
const techName = id => { const t = techById(id); return t ? t.name : ''; };
const reportTechName = r => techName(r.technicianId) || r.technicianName || 'Unknown technician';
const techLabel = id => (techName(id) ? esc(techName(id)) : '<span class="unassigned">Unassigned</span>');

function scopedTickets() {
  if (isAdmin()) return db.tickets;
  if (isUser()) return db.tickets.filter(t => t.createdBy === user.email);
  return user.techId ? db.tickets.filter(t => t.technicianId === user.techId) : [];
}
function scopedProjects() {
  if (isAdmin()) return db.projects;
  if (isUser()) return [];
  const me = techById(user.techId);
  return me ? db.projects.filter(p => p.team === me.team) : [];
}
function scopedReports() {
  if (isAdmin()) return db.reports;
  return user.techId && !isUser() ? db.reports.filter(r => r.technicianId === user.techId) : [];
}
const canSeeTicket = t => isAdmin() || (isUser() ? t.createdBy === user.email : !!user.techId && t.technicianId === user.techId);
const canEditReport = r => isAdmin() || (isTech() && !!user.techId && r.technicianId === user.techId);

/* ---------------------------------------------------------
   9. Notifications
--------------------------------------------------------- */
function notify(text, type = 'system', audience = 'ADMIN', link = null) {
  const prefs = { ticket: 'notifTicket', project: 'notifProject', report: 'notifReport' };
  if (prefs[type] && settings[prefs[type]] === false) return;
  db.notifications.unshift({ id: uid('N'), text, type, audience, time: new Date().toISOString(), read: false, link });
  db.notifications = db.notifications.slice(0, 100);
  saveDb('notifications');
}
function myNotifications() {
  return db.notifications
    .filter(n => n.audience === 'ALL' || (isAdmin() && n.audience === 'ADMIN') || (user && user.techId && n.audience === user.techId) || (user && n.audience === user.email))
    .sort((a, b) => new Date(b.time) - new Date(a.time));
}
const NOTE_ICON = { ticket: ['fa-ticket', 'orange'], project: ['fa-diagram-project', 'violet'], report: ['fa-clipboard-list', 'blue'], system: ['fa-circle-info', 'gray'] };
function noteItem(n) {
  const [icon, tone] = NOTE_ICON[n.type] || NOTE_ICON.system;
  return `<li><button type="button" class="notif-item${n.read ? '' : ' unread'}" data-action="open-notification" data-id="${esc(n.id)}">
    <span class="chip-icon tone-${tone}"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
    <span><p>${esc(n.text)}</p><small>${esc(timeAgo(n.time))}</small></span>
    ${n.read ? '' : '<span class="notif-dot" aria-label="Unread"></span>'}
  </button></li>`;
}
function renderBell() {
  const list = myNotifications();
  const unread = list.filter(n => !n.read).length;
  const bc = $('#bellCount'), nc = $('#navNotifCount');
  bc.textContent = unread > 9 ? '9+' : unread; bc.hidden = !unread;
  nc.textContent = unread; nc.hidden = !unread;
  const rc = $('#navResetCount');
  if (rc) { const pend = isAdmin() ? db.resets.filter(r => r.status === 'Pending').length : 0; rc.textContent = pend; rc.hidden = !pend; }
  $('#bellBtn').setAttribute('aria-label', unread ? `Notifications, ${unread} unread` : 'Notifications');
  $('#bellList').innerHTML = list.length ? list.slice(0, 7).map(noteItem).join('') : '<li class="sr-empty">You are all caught up.</li>';
}
function renderNotificationsPage() {
  const list = myNotifications();
  $('#notifPage').innerHTML = list.map(noteItem).join('');
  const empty = $('#notifEmpty');
  empty.hidden = list.length > 0;
  if (!list.length) empty.innerHTML = emptyState('fa-bell-slash', 'No notifications', 'New tickets, project deadlines and field reports will appear here.');
}
function markAllRead() {
  const mine = new Set(myNotifications().map(n => n.id));
  db.notifications.forEach(n => { if (mine.has(n.id)) n.read = true; });
  saveDb('notifications');
  refresh();
}
function checkDeadlines() {
  let changed = false;
  db.projects.forEach(p => {
    if (p.status === 'Completed' || p.deadlineNotified) return;
    const d = daysUntil(p.deadline);
    if (d !== null && d >= 0 && d <= 7) {
      notify(`Project deadline approaching: ${p.id} is due ${d === 0 ? 'today' : `in ${d} day${d === 1 ? '' : 's'}`}.`, 'project', 'ADMIN', { kind: 'project', id: p.id });
      p.deadlineNotified = true;
      changed = true;
    }
  });
  if (changed) saveDb('projects');
}

/* ---------------------------------------------------------
   10. Statistics & chart helpers
--------------------------------------------------------- */
function ticketCounts(list) {
  const c = { open: 0, progress: 0, done: 0 };
  list.forEach(t => {
    if (['Open', 'Assigned'].includes(t.status)) c.open++;
    else if (['In Progress', 'On Hold'].includes(t.status)) c.progress++;
    else c.done++;
  });
  return c;
}
function avgResponse(list) {
  const times = list.filter(t => t.respondedAt).map(t => new Date(t.respondedAt) - new Date(t.created)).filter(ms => ms >= 0);
  return times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
}
const activeTicketCount = id => db.tickets.filter(t => t.technicianId === id && !['Resolved', 'Closed'].includes(t.status)).length;

function statCard(c) {
  const inner = `<span class="chip-icon tone-${c.tone}"><i class="fa-solid ${c.icon}" aria-hidden="true"></i></span><div><strong>${esc(c.value)}</strong><span>${esc(c.label)}</span></div>`;
  return c.page ? `<a class="stat" href="#/${c.page}" title="${esc(c.hint || '')}">${inner}</a>` : `<div class="stat" title="${esc(c.hint || '')}">${inner}</div>`;
}

function donutChart(segments) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (!total) return '<p class="chart-empty">No tickets to chart yet.</p>';
  const R = 40, C = 2 * Math.PI * R;
  let offset = 0;
  const arcs = segments.filter(s => s.value > 0).map(s => {
    const len = (s.value / total) * C;
    const el = `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${s.color}" stroke-width="18" stroke-dasharray="${len.toFixed(2)} ${(C - len).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 60 60)"></circle>`;
    offset += len;
    return el;
  }).join('');
  const legend = segments.map(s => `<li><i style="background:${s.color}"></i>${esc(s.label)}<b>${s.value}</b></li>`).join('');
  return `<div class="donut-wrap">
    <svg class="donut" viewBox="0 0 120 120" role="img" aria-label="Ticket status chart, ${total} tickets in total">
      ${arcs}<text class="donut-total" x="60" y="61" text-anchor="middle">${total}</text><text class="donut-cap" x="60" y="73" text-anchor="middle">tickets</text>
    </svg>
    <ul class="legend">${legend}</ul></div>`;
}
function barList(items) {
  const max = Math.max(1, ...items.map(i => i.value));
  if (!items.length || items.every(i => !i.value)) return '<p class="chart-empty">Nothing to show for this period.</p>';
  return `<div class="bars">${items.map(i => `<div class="bar-row"><span title="${esc(i.label)}">${esc(i.label)}</span><div class="bar-track"><span style="width:${(i.value / max) * 100}%"></span></div><b>${i.value}</b></div>`).join('')}</div>`;
}
function columnChart(items) {
  const max = Math.max(1, ...items.map(i => i.value));
  return `<div class="cols" role="img" aria-label="Tickets logged per day for the last 7 days">${items.map(i =>
    `<div class="col"><b>${i.value}</b><div class="col-bar${i.value ? '' : ' zero'}" style="height:${i.value ? Math.max(8, (i.value / max) * 130) : 3}px"></div><small>${esc(i.label)}</small></div>`).join('')}</div>`;
}
function statusSegments(list) {
  return TICKET_STATUSES.map(s => ({ label: s, value: list.filter(t => t.status === s).length, color: STATUS_COLORS[s] }));
}
function dueInfo(t) {
  if (['Resolved', 'Closed'].includes(t.status)) return { text: fmtDate(t.due), over: false };
  const d = daysUntil(t.due);
  return { text: fmtDate(t.due), over: d !== null && d < 0 };
}
function deadlineInfo(p) {
  if (p.status === 'Completed') return { text: 'Completed', tone: 'good' };
  const d = daysUntil(p.deadline);
  if (d === null) return { text: 'No deadline', tone: '' };
  if (d < 0) return { text: `Overdue by ${-d} day${d === -1 ? '' : 's'}`, tone: 'bad' };
  if (d === 0) return { text: 'Due today', tone: 'warn' };
  return { text: `${d} day${d === 1 ? '' : 's'} left`, tone: d <= 7 ? 'warn' : '' };
}

/* ---------------------------------------------------------
   11. Routing and page rendering
--------------------------------------------------------- */
const PAGES = {
  dashboard: { render: () => renderDashboard() },
  helpdesk: { render: () => renderHelpdesk() },
  projects: { render: () => renderProjects() },
  reports: { render: () => renderReports() },
  technicians: { render: () => renderTechnicians() },
  analytics: { render: () => renderAnalytics() },
  notifications: { render: () => renderNotificationsPage() },
  users: { render: () => renderUsers() },
  activity: { render: () => renderActivity() },
  settings: { render: () => renderSettings() }
};

function navigate(page) {
  if (location.hash !== `#/${page}`) location.hash = `#/${page}`;
  else route();
}
function route() {
  if (!user) return;
  let page = location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard';
  if (!PAGES[page]) page = 'dashboard';
  if ((!isAdmin() && ADMIN_ONLY_PAGES.includes(page)) || (isUser() && STAFF_ONLY_PAGES.includes(page))) {
    toast('You do not have access to that page.', 'error');
    page = 'dashboard';
    history.replaceState(null, '', '#/dashboard');
  }
  showPage(page);
}
function showPage(page) {
  currentPage = page;
  $$('.page').forEach(p => { p.hidden = p.id !== `page-${page}`; });
  $$('.nav-link').forEach(a => {
    const on = a.dataset.page === page;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const titles = { dashboard: 'Dashboard', helpdesk: isUser() ? 'My Requests' : 'Help Desk', projects: 'Projects', reports: 'Field Reports', technicians: 'Technicians', analytics: 'Analytics', users: 'Users', activity: 'Activity Log', notifications: 'Notifications', settings: 'Settings' };
  document.title = `${titles[page]} | WorkOrder`;
  closeSidebar();
  closeBell();
  hideSearch();
  PAGES[page].render();
  window.scrollTo(0, 0);
}
function refresh() {
  if (!user) return;
  renderBell();
  if (PAGES[currentPage]) PAGES[currentPage].render();
}

/* ---------- Dashboard ---------- */
function activityFeed() {
  if (isAdmin()) return db.activity.slice(0, 8).map(a => ({ t: a.t, text: `${a.name || 'Someone'}: ${a.text}`, icon: KIND_ICON[a.kind] || 'fa-circle-info', tone: KIND_TONE[a.kind] || 'gray', kind: 'activity', id: a.id }));
  const items = [];
  scopedTickets().forEach(t => (t.log || []).forEach(l => items.push({ t: l.t, text: `${t.id}: ${l.text}`, icon: 'fa-ticket', tone: 'orange', kind: 'ticket', id: t.id })));
  scopedReports().forEach(r => items.push({ t: r.createdAt || r.date, text: `${r.id} submitted by ${reportTechName(r)}`, icon: 'fa-clipboard-list', tone: 'blue', kind: 'report', id: r.id }));
  scopedProjects().forEach(p => items.push({ t: p.updatedAt || p.start, text: `${p.id} updated: ${p.status}, ${p.progress}% complete`, icon: 'fa-diagram-project', tone: 'violet', kind: 'project', id: p.id }));
  return items.filter(i => i.t).sort((a, b) => new Date(b.t) - new Date(a.t)).slice(0, 8);
}

function renderDashboard() {
  const tickets = scopedTickets(), projects = scopedProjects(), reports = scopedReports();
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  $('#dashTitle').textContent = `${greet}, ${displayName()}`;
  $('#dashSub').textContent = isAdmin()
    ? 'Here is where maintenance work stands across the university.'
    : isUser() ? 'Send a request and follow it until the job is done.'
      : 'These are the tickets, projects and reports assigned to you.';

  const c = ticketCounts(tickets);
  const cards = [
    { label: 'Open tickets', value: c.open, icon: 'fa-envelope-open-text', tone: 'orange', page: 'helpdesk', hint: 'Open and assigned' },
    { label: 'In progress', value: c.progress, icon: 'fa-screwdriver-wrench', tone: 'blue', page: 'helpdesk', hint: 'In progress and on hold' },
    { label: 'Completed tickets', value: c.done, icon: 'fa-circle-check', tone: 'green', page: 'helpdesk', hint: 'Resolved and closed' },
    { label: 'Active projects', value: projects.filter(p => p.status === 'In Progress').length, icon: 'fa-diagram-project', tone: 'violet', page: 'projects' },
    { label: 'Completed projects', value: projects.filter(p => p.status === 'Completed').length, icon: 'fa-flag-checkered', tone: 'teal', page: 'projects' },
    { label: 'Field reports', value: reports.length, icon: 'fa-clipboard-list', tone: 'slate', page: 'reports' },
    { label: 'Average response time', value: fmtDuration(avgResponse(tickets)), icon: 'fa-stopwatch', tone: 'gold', hint: 'From logging a ticket to first action' }
  ];
  const shownCards = isUser()
    ? cards.filter(x => ['Open tickets', 'In progress', 'Completed tickets'].includes(x.label)).map(x => Object.assign({}, x, { label: x.label.replace('tickets', 'requests') }))
    : isAdmin() ? cards.concat([{ label: 'Registered users', value: db.users.length, icon: 'fa-users', tone: 'teal', page: 'users' }]) : cards;
  $('#statsGrid').innerHTML = shownCards.map(statCard).join('');
  const staffGrid = $('#dashProjects').closest('.grid-2');
  if (staffGrid) staffGrid.hidden = isUser();
  $('#dashTickets').closest('.panel').querySelector('h2').textContent = isUser() ? 'My recent requests' : 'Recent help desk tickets';

  $('#chartStatus').innerHTML = donutChart(statusSegments(tickets));
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = toDateStr(d);
    days.push({ label: d.toLocaleDateString('en-GB', { weekday: 'short' }), value: tickets.filter(t => toDateStr(new Date(t.created)) === key).length });
  }
  $('#chartWeek').innerHTML = columnChart(days);

  const recent = tickets.slice().sort((a, b) => new Date(b.created) - new Date(a.created)).slice(0, 5);
  $('#dashTickets').innerHTML = recent.length
    ? `<ul class="mini-list">${recent.map(t => `<li><button type="button" class="mini-row" data-action="view-ticket" data-id="${esc(t.id)}">
        <span class="chip-icon tone-blue"><i class="fa-solid ${catIcon(t.category)}" aria-hidden="true"></i></span>
        <span class="mini-main"><b>${esc(t.title)}</b><small>${esc(t.id)} in ${esc(t.location)}</small></span>${badge(t.priority)}${badge(t.status)}</button></li>`).join('')}</ul>`
    : '<p class="mini-empty">No tickets yet.</p>';

  $('#dashActivity').innerHTML = activityFeed().map(a => `<li><span class="chip-icon tone-${a.tone}"><i class="fa-solid ${a.icon}" aria-hidden="true"></i></span>
    <div><button type="button" data-action="open-record" data-kind="${a.kind}" data-id="${esc(a.id)}">${esc(a.text)}</button><small>${esc(timeAgo(a.t))}</small></div></li>`).join('') || '<li class="mini-empty">No activity yet.</li>';

  const active = projects.filter(p => p.status === 'In Progress').slice(0, 4);
  $('#dashProjects').innerHTML = active.length
    ? `<ul class="mini-list">${active.map(p => `<li><button type="button" class="mini-row" data-action="view-project" data-id="${esc(p.id)}">
        <span class="mini-main"><b>${esc(p.name)}</b><small>${esc(p.team)}</small>
        <span class="mini-progress"><span class="progress"><span style="width:${p.progress}%"></span></span><small>${p.progress}%</small></span></span></button></li>`).join('')}</ul>`
    : '<p class="mini-empty">No active projects.</p>';

  const recentReports = reports.slice().sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 4);
  $('#dashReports').innerHTML = recentReports.length
    ? `<ul class="mini-list">${recentReports.map(r => `<li><button type="button" class="mini-row" data-action="view-report" data-id="${esc(r.id)}">
        <span class="mini-main"><b>${esc(r.problem)}</b><small>${esc(r.id)} by ${esc(reportTechName(r))}, ${esc(fmtDate(r.date))}</small></span>${badge(r.status)}</button></li>`).join('')}</ul>`
    : '<p class="mini-empty">No field reports yet.</p>';
}

/* ---------- Help desk ---------- */
function filteredTickets() {
  const q = val('ticketSearch').trim().toLowerCase(), st = val('ticketStatus'), pr = val('ticketPriority'), cat = val('ticketCategory');
  return scopedTickets().filter(t =>
    (!st || t.status === st) && (!pr || t.priority === pr) && (!cat || t.category === cat) &&
    (!q || [t.id, t.title, t.requester, t.department, t.location, t.category, t.description, techName(t.technicianId)].join(' ').toLowerCase().includes(q))
  ).sort((a, b) => new Date(b.created) - new Date(a.created));
}
function renderHelpdesk() {
  const list = filteredTickets();
  const total = scopedTickets().length;
  $('#ticketRows').innerHTML = list.map(t => {
    const due = dueInfo(t);
    return `<tr>
      <td data-label="Ticket"><span class="mono id">${esc(t.id)}</span></td>
      <td data-label="Issue"><button type="button" class="link-btn cell-title" data-action="view-ticket" data-id="${esc(t.id)}">${esc(t.title)}</button><span class="cell-sub">${esc(t.requester)}, ${esc(t.department)}</span></td>
      <td data-label="Category"><i class="fa-solid ${catIcon(t.category)}" aria-hidden="true" style="color:var(--blue);margin-right:6px"></i>${esc(t.category)}</td>
      <td data-label="Location">${esc(t.location)}</td>
      <td data-label="Priority">${badge(t.priority)}</td>
      <td data-label="Technician">${techLabel(t.technicianId)}</td>
      <td data-label="Due"><span class="${due.over ? 'due-over' : ''}">${esc(due.text)}</span>${due.over ? '<span class="chip-flag">Overdue</span>' : ''}</td>
      <td data-label="Status">${badge(t.status)}</td>
      <td data-label=""><span class="row-actions">
        <button type="button" class="icon-btn" data-action="view-ticket" data-id="${esc(t.id)}" aria-label="View ticket ${esc(t.id)}" title="View"><i class="fa-regular fa-eye"></i></button>
        <button type="button" class="icon-btn admin-only" data-action="edit-ticket" data-id="${esc(t.id)}" aria-label="Edit ticket ${esc(t.id)}" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
        <button type="button" class="icon-btn danger admin-only" data-action="delete-ticket" data-id="${esc(t.id)}" aria-label="Delete ticket ${esc(t.id)}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
      </span></td></tr>`;
  }).join('');
  $('.table-wrap', $('#page-helpdesk')).hidden = !list.length;
  const empty = $('#ticketEmpty');
  empty.hidden = list.length > 0;
  if (!list.length) {
    empty.innerHTML = total
      ? emptyState('fa-filter-circle-xmark', 'No tickets match your filters', 'Try a different search term or clear the filters.', '<button type="button" class="btn btn-outline" data-action="clear-filters" data-id="helpdesk">Clear filters</button>')
      : emptyState('fa-inbox', isTech() ? 'No tickets assigned to you' : isUser() ? 'No requests yet' : 'No tickets yet', isTech() ? 'Tickets assigned to you by the administrator will appear here.' : isUser() ? 'Report a fault or ask for something to be done and follow it here.' : 'Create the first maintenance ticket to start tracking work.',
        !isTech() ? `<button type="button" class="btn btn-primary" data-action="new-ticket"><i class="fa-solid fa-plus"></i> ${isUser() ? 'New request' : 'New ticket'}</button>` : '');
  }
  $('#ticketCount').textContent = `Showing ${list.length} of ${total} ticket${total === 1 ? '' : 's'}`;
}

function techOptions(currentId) {
  return db.technicians.map(x => ({
    value: x.id,
    label: `${x.name}, ${x.specialization} (${x.status}, ${activeTicketCount(x.id)} active)`,
    disabled: x.status === 'On Leave' && x.id !== currentId
  }));
}

function openTicketForm(id) {
  if (isTech()) return toast('Only administrators and registered users can create tickets.', 'error');
  if (isUser()) { if (id) return toast('Only administrators can edit tickets.', 'error'); return openRequestForm(); }
  if (!requireAdmin()) return;
  const t = id ? db.tickets.find(x => x.id === id) : null;
  if (id && !t) return toast('Ticket not found.', 'error');
  closeModal();
  const fields = [
    { name: 'requester', label: 'Requester name', required: true, placeholder: 'e.g. Dr. A. Ogunleye' },
    { name: 'department', label: 'Department or unit', required: true, list: 'dl-departments' },
    { name: 'contact', label: 'Contact phone or email', required: true, placeholder: '0803 000 0000' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: CATEGORIES },
    { name: 'kind', label: 'Request type', type: 'select', required: true, options: REQUEST_KINDS, default: 'Fault report' },
    { name: 'title', label: 'Issue title', required: true, full: true, placeholder: 'Short summary of the fault' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, full: true, rows: 4, placeholder: 'What is wrong, and since when?' },
    { name: 'location', label: 'Location', required: true, list: 'dl-locations', placeholder: 'Building, floor or room' },
    { name: 'priority', label: 'Priority', type: 'select', required: true, options: PRIORITIES, default: 'Medium' },
    { name: 'technicianId', label: 'Assigned technician', type: 'select', placeholder: 'Unassigned', options: techOptions(t && t.technicianId) },
    { name: 'due', label: 'Due date', type: 'date', required: true, default: daysFromNow(3) },
    { name: 'status', label: 'Status', type: 'select', required: true, options: TICKET_STATUSES, default: 'Open' }
  ];
  openForm({
    title: t ? `Edit ticket ${t.id}` : 'New maintenance ticket',
    submitLabel: t ? 'Save changes' : 'Create ticket',
    fields, values: t || {},
    onSubmit: data => {
      const floor = t ? toDateStr(new Date(t.created)) : today();
      if (data.due < floor) return t ? 'The due date cannot be earlier than the date the ticket was created.' : 'The due date cannot be in the past.';
      const now = new Date().toISOString();
      if (t) {
        const keys = ['requester', 'department', 'contact', 'category', 'kind', 'title', 'description', 'location', 'priority', 'due'];
        const changed = keys.some(k => t[k] !== data[k]);
        keys.forEach(k => { t[k] = data[k]; });
        if (changed) t.log.push({ t: now, text: `Ticket details edited by ${displayName()}` });
        applyTicketChanges(t, { status: data.status, technicianId: data.technicianId });
        saveDb('tickets');
        logActivity('Ticket', `Edited ticket ${t.id}: ${t.title}`);
        toast(`Ticket ${t.id} updated.`);
      } else {
        const n = {
          id: nextId('HD', db.tickets, 1001), requester: data.requester, department: data.department, contact: data.contact,
          title: data.title, description: data.description, category: data.category, location: data.location, priority: data.priority,
          technicianId: '', created: now, due: data.due, status: 'Open', respondedAt: null, resolvedAt: null,
          kind: data.kind, createdBy: user.email, comments: [],
          log: [{ t: now, text: `Ticket created by ${displayName()}` }]
        };
        db.tickets.push(n);
        applyTicketChanges(n, { status: data.status, technicianId: data.technicianId });
        const high = ['High', 'Critical'].includes(n.priority);
        notify(high ? `New high-priority maintenance ticket received: ${n.id}, ${n.title}.` : `New maintenance ticket logged: ${n.id}, ${n.title}.`, 'ticket', 'ADMIN', { kind: 'ticket', id: n.id });
        saveDb('tickets');
        logActivity('Ticket', `Created ticket ${n.id}: ${n.title}`);
        toast(`Ticket ${n.id} created.`);
      }
      refresh();
    }
  });
}

/* Applies status/technician changes with automatic rules, logging and notifications. */
function applyTicketChanges(t, { status, technicianId }) {
  const origStatus = t.status;
  const now = new Date().toISOString();
  const actor = displayName();
  const link = { kind: 'ticket', id: t.id };

  if (technicianId !== undefined && technicianId !== (t.technicianId || '')) {
    const prev = t.technicianId;
    t.technicianId = technicianId;
    if (technicianId) {
      t.log.push({ t: now, text: `Assigned to ${techName(technicianId)} by ${actor}` });
      logActivity('Ticket', `Assigned ${t.id} to ${techName(technicianId)}`);
      if (t.createdBy && t.createdBy !== (user && user.email)) notify(`Your request ${t.id} has been assigned to ${techName(technicianId)}.`, 'ticket', t.createdBy, link);
      if (!t.respondedAt) t.respondedAt = now;
      if (t.status === 'Open') t.status = 'Assigned';
      notify(`Ticket ${t.id} has been assigned to you.`, 'ticket', technicianId, link);
    } else {
      t.log.push({ t: now, text: `${techName(prev) || 'Technician'} removed from the ticket by ${actor}` });
      if (t.status === 'Assigned') t.status = 'Open';
    }
  }

  if (status !== undefined && status !== origStatus) {
    if (t.status !== status) {
      t.log.push({ t: now, text: `Status changed from ${t.status} to ${status} by ${actor}` });
      logActivity('Ticket', `Changed ${t.id} from ${t.status} to ${status}`);
      if (t.createdBy && t.createdBy !== (user && user.email)) notify(`Your request ${t.id} is now ${status}.`, 'ticket', t.createdBy, link);
    }
    t.status = status;
    if (status !== 'Open' && !t.respondedAt) t.respondedAt = now;
    if (['Resolved', 'Closed'].includes(status)) { if (!t.resolvedAt) t.resolvedAt = now; } else t.resolvedAt = null;
    if (status === 'Resolved') notify(`Ticket ${t.id} has been resolved.`, 'ticket', 'ADMIN', link);
  } else if (t.status !== origStatus) {
    t.log.push({ t: now, text: `Status set to ${t.status} automatically` });
  }
}

function viewTicket(id) {
  const t = db.tickets.find(x => x.id === id);
  if (!t || !canSeeTicket(t)) return toast('Ticket not found.', 'error');
  const admin = isAdmin();
  const due = dueInfo(t);
  const statusList = admin ? TICKET_STATUSES : Array.from(new Set([t.status, ...TECH_ALLOWED_STATUSES]));
  const locked = isUser() || (!admin && t.status === 'Closed');
  const relatedReports = db.reports.filter(r => r.related === t.id);
  const body = `
    <div class="detail-top"><span class="mono id">${esc(t.id)}</span>${badge(t.priority)}${badge(t.status)}${due.over ? '<span class="chip-flag">Overdue</span>' : ''}</div>
    <h3 class="detail-title">${esc(t.title)}</h3>
    <dl class="detail-grid">
      <div><dt>Requester</dt><dd>${esc(t.requester)}</dd></div>
      <div><dt>Request type</dt><dd>${esc(t.kind || 'Fault report')}</dd></div>
      <div><dt>Department</dt><dd>${esc(t.department)}</dd></div>
      <div><dt>Contact</dt><dd>${esc(t.contact)}</dd></div>
      <div><dt>Category</dt><dd><i class="fa-solid ${catIcon(t.category)}" aria-hidden="true" style="color:var(--blue);margin-right:6px"></i>${esc(t.category)}</dd></div>
      <div><dt>Location</dt><dd>${esc(t.location)}</dd></div>
      <div><dt>Assigned technician</dt><dd>${techLabel(t.technicianId)}</dd></div>
      <div><dt>Date created</dt><dd>${esc(fmtDateTime(t.created))}</dd></div>
      <div><dt>Due date</dt><dd class="${due.over ? 'due-over' : ''}">${esc(due.text)}</dd></div>
      <div><dt>Response time</dt><dd>${t.respondedAt ? esc(fmtDuration(new Date(t.respondedAt) - new Date(t.created))) : 'Awaiting first action'}</dd></div>
      <div><dt>Resolved</dt><dd>${t.resolvedAt ? esc(fmtDateTime(t.resolvedAt)) : '—'}</dd></div>
    </dl>
    <div class="detail-block"><h3>Description</h3><p>${esc(t.description)}</p></div>

    <form id="manageForm" class="manage" novalidate>
      <div class="form-field"><label for="mStatus">Status</label>
        <select id="mStatus"${locked ? ' disabled' : ''}>${statusList.map(s => `<option${s === t.status ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
      ${admin ? `<div class="form-field"><label for="mTech">Assigned technician</label>
        <select id="mTech"><option value="">Unassigned</option>${opts(techOptions(t.technicianId)).map(o => `<option value="${esc(o.value)}"${o.value === t.technicianId ? ' selected' : ''}${o.disabled ? ' disabled' : ''}>${esc(o.label)}</option>`).join('')}</select></div>` : ''}
      <button type="submit" class="btn btn-primary"${locked ? ' disabled' : ''}>Save changes</button>
    </form>

    ${relatedReports.length ? `<div class="detail-block"><h3>Field reports</h3><div class="link-list">${relatedReports.map(r => `<button type="button" class="pill-btn" data-action="view-report" data-id="${esc(r.id)}">${esc(r.id)}</button>`).join('')}</div></div>` : ''}

    ${commentsHTML(t)}
    <div class="detail-block"><h3>Activity</h3>
      <ul class="timeline">${(t.log || []).slice().reverse().map(l => `<li>${esc(l.text)}<small>${esc(fmtDateTime(l.t))}</small></li>`).join('')}</ul></div>

    <div class="modal-foot">
      <button type="button" class="btn btn-outline spacer staff-only" data-action="new-report" data-related="${esc(t.id)}"><i class="fa-solid fa-file-pen"></i> Write field report</button>
      <button type="button" class="btn btn-danger-outline admin-only" data-action="delete-ticket" data-id="${esc(t.id)}"><i class="fa-regular fa-trash-can"></i> Delete</button>
      <button type="button" class="btn btn-outline admin-only" data-action="edit-ticket" data-id="${esc(t.id)}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
      <button type="button" class="btn btn-primary" data-action="close-modal">Close</button>
    </div>`;
  openModal({ title: 'Ticket details', body, size: 'lg' });
  bindComments(t);
  const mf = $('#manageForm');
  if (isUser()) mf.remove(); else mf.addEventListener('submit', e => {
    e.preventDefault();
    const changes = { status: $('#mStatus').value };
    if (admin) changes.technicianId = $('#mTech').value;
    applyTicketChanges(t, changes);
    saveDb('tickets');
    toast(`Ticket ${t.id} updated.`);
    refresh();
    viewTicket(t.id);
  });
}

function deleteTicket(id) {
  if (!requireAdmin()) return;
  const t = db.tickets.find(x => x.id === id);
  if (!t) return;
  confirmDialog({
    title: `Delete ticket ${t.id}?`,
    message: `"${t.title}" will be permanently removed. This cannot be undone.`,
    onConfirm: () => {
      db.tickets = db.tickets.filter(x => x.id !== id);
      saveDb('tickets');
      closeModal();
      logActivity('Ticket', `Deleted ticket ${id}: ${t.title}`);
      toast(`Ticket ${id} deleted.`);
      refresh();
    }
  });
}

/* ---------- Projects ---------- */
function filteredProjects() {
  const q = val('projectSearch').trim().toLowerCase(), st = val('projectStatus'), cat = val('projectCategory');
  const order = { 'In Progress': 0, 'On Hold': 1, 'Not Started': 2, 'Completed': 3 };
  return scopedProjects().filter(p =>
    (!st || p.status === st) && (!cat || p.category === cat) &&
    (!q || [p.id, p.name, p.description, p.location, p.team, p.category].join(' ').toLowerCase().includes(q))
  ).sort((a, b) => (order[a.status] - order[b.status]) || (new Date(a.deadline) - new Date(b.deadline)));
}
function progressBar(p) {
  const cls = p.status === 'Completed' ? ' done' : p.status === 'On Hold' ? ' hold' : '';
  return `<div class="progress${cls}" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.progress}"><span style="width:${p.progress}%"></span></div>`;
}
function renderProjects() {
  const list = filteredProjects();
  const total = scopedProjects().length;
  $('#projectGrid').innerHTML = list.map(p => {
    const info = deadlineInfo(p);
    return `<article class="project-card">
      <header><span class="mono id">${esc(p.id)}</span>${badge(p.status)}</header>
      <h3><button type="button" class="link-btn" data-action="view-project" data-id="${esc(p.id)}">${esc(p.name)}</button></h3>
      <p class="muted clamp">${esc(p.description)}</p>
      <ul class="meta">
        <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${esc(p.location)}</li>
        <li><i class="fa-solid ${catIcon(p.category)}" aria-hidden="true"></i>${esc(p.category)}</li>
        <li><i class="fa-solid fa-users" aria-hidden="true"></i>${esc(p.team)}</li>
      </ul>
      <div class="progress-row">${progressBar(p)}<strong>${p.progress}%</strong></div>
      <footer>
        <span class="deadline ${info.tone}"><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${esc(info.text)}</span>
        <span class="row-actions">
          <button type="button" class="icon-btn" data-action="view-project" data-id="${esc(p.id)}" aria-label="View project ${esc(p.id)}" title="View"><i class="fa-regular fa-eye"></i></button>
          <button type="button" class="icon-btn admin-only" data-action="edit-project" data-id="${esc(p.id)}" aria-label="Edit project ${esc(p.id)}" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
          <button type="button" class="icon-btn danger admin-only" data-action="delete-project" data-id="${esc(p.id)}" aria-label="Delete project ${esc(p.id)}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
        </span>
      </footer></article>`;
  }).join('');
  const empty = $('#projectEmpty');
  empty.hidden = list.length > 0;
  if (!list.length) {
    empty.innerHTML = total
      ? emptyState('fa-filter-circle-xmark', 'No projects match your filters', 'Try a different search term or clear the filters.', '<button type="button" class="btn btn-outline" data-action="clear-filters" data-id="projects">Clear filters</button>')
      : emptyState('fa-diagram-project', isAdmin() ? 'No projects yet' : 'No projects for your team', isAdmin() ? 'Create a project to track a larger piece of maintenance work.' : 'Projects assigned to your team will appear here.',
        isAdmin() ? '<button type="button" class="btn btn-primary" data-action="new-project"><i class="fa-solid fa-plus"></i> New project</button>' : '');
  }
}

function normalizeProject(p) {
  p.progress = Math.max(0, Math.min(100, Number(p.progress) || 0));
  if (p.status === 'Completed') p.progress = 100;
  else if (p.progress === 100) p.status = 'Completed';
  else if (p.status === 'Not Started' && p.progress > 0) p.status = 'In Progress';
  else if (p.status === 'Not Started') p.progress = 0;
}

function openProjectForm(id) {
  if (!requireAdmin()) return;
  const p = id ? db.projects.find(x => x.id === id) : null;
  if (id && !p) return toast('Project not found.', 'error');
  closeModal();
  const fields = [
    { name: 'name', label: 'Project name', required: true, full: true, placeholder: 'e.g. Rewiring of Faculty of Arts Block C' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, full: true, rows: 3 },
    { name: 'location', label: 'Location', required: true, list: 'dl-locations' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: CATEGORIES },
    { name: 'team', label: 'Assigned team', type: 'select', required: true, options: TEAMS },
    { name: 'budget', label: 'Budget (₦)', type: 'number', min: 0, required: true, default: 0 },
    { name: 'start', label: 'Start date', type: 'date', required: true, default: today() },
    { name: 'deadline', label: 'Deadline', type: 'date', required: true, default: daysFromNow(30) },
    { name: 'status', label: 'Status', type: 'select', required: true, options: PROJECT_STATUSES, default: 'Not Started' },
    { name: 'progress', label: 'Progress', type: 'range', default: 0 }
  ];
  openForm({
    title: p ? `Edit project ${p.id}` : 'New project',
    submitLabel: p ? 'Save changes' : 'Create project',
    fields, values: p || {},
    onSubmit: data => {
      if (data.deadline < data.start) return 'The deadline cannot be earlier than the start date.';
      const now = new Date().toISOString();
      const fieldsToCopy = { name: data.name, description: data.description, location: data.location, category: data.category, team: data.team, budget: Number(data.budget), start: data.start, deadline: data.deadline, status: data.status, progress: Number(data.progress) };
      if (p) {
        if (p.deadline !== data.deadline) p.deadlineNotified = false;
        Object.assign(p, fieldsToCopy);
        normalizeProject(p);
        p.updatedAt = now;
        logActivity('Project', `Edited project ${p.id}: ${p.name}`);
        toast(`Project ${p.id} updated.`);
      } else {
        const n = Object.assign({ id: nextId('PJ', db.projects, 3001), updatedAt: now, deadlineNotified: false }, fieldsToCopy);
        normalizeProject(n);
        db.projects.push(n);
        notify(`New project created: ${n.id}, ${n.name}.`, 'project', 'ADMIN', { kind: 'project', id: n.id });
        logActivity('Project', `Created project ${n.id}: ${n.name}`);
        toast(`Project ${n.id} created.`);
      }
      saveDb('projects');
      checkDeadlines();
      refresh();
    }
  });
}

function viewProject(id) {
  const p = db.projects.find(x => x.id === id);
  if (!p || (!isAdmin() && !scopedProjects().includes(p))) return toast('Project not found.', 'error');
  const info = deadlineInfo(p);
  const admin = isAdmin();
  const linked = db.reports.filter(r => r.related === p.id);
  const body = `
    <div class="detail-top"><span class="mono id">${esc(p.id)}</span>${badge(p.status)}</div>
    <h3 class="detail-title">${esc(p.name)}</h3>
    <div class="progress-row" style="margin-bottom:18px">${progressBar(p)}<strong>${p.progress}%</strong></div>
    <dl class="detail-grid">
      <div><dt>Location</dt><dd>${esc(p.location)}</dd></div>
      <div><dt>Category</dt><dd><i class="fa-solid ${catIcon(p.category)}" aria-hidden="true" style="color:var(--blue);margin-right:6px"></i>${esc(p.category)}</dd></div>
      <div><dt>Assigned team</dt><dd>${esc(p.team)}</dd></div>
      <div><dt>Budget</dt><dd>${esc(money(p.budget))}</dd></div>
      <div><dt>Start date</dt><dd>${esc(fmtDate(p.start))}</dd></div>
      <div><dt>Deadline</dt><dd>${esc(fmtDate(p.deadline))} <span class="deadline ${info.tone}">(${esc(info.text)})</span></dd></div>
    </dl>
    <div class="detail-block"><h3>Description</h3><p>${esc(p.description)}</p></div>
    ${admin ? `<form id="projectQuick" class="manage" novalidate>
      <div class="form-field"><label for="qStatus">Status</label><select id="qStatus">${PROJECT_STATUSES.map(s => `<option${s === p.status ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
      <div class="form-field"><label for="qProgress">Progress</label><div class="range-row"><input id="qProgress" type="range" min="0" max="100" step="5" value="${p.progress}"><output id="qOut">${p.progress}%</output></div></div>
      <button type="submit" class="btn btn-primary">Update project</button></form>` : ''}
    ${linked.length ? `<div class="detail-block"><h3>Field reports</h3><div class="link-list">${linked.map(r => `<button type="button" class="pill-btn" data-action="view-report" data-id="${esc(r.id)}">${esc(r.id)}</button>`).join('')}</div></div>` : ''}
    <div class="modal-foot">
      <button type="button" class="btn btn-outline spacer" data-action="new-report" data-related="${esc(p.id)}"><i class="fa-solid fa-file-pen"></i> Write field report</button>
      <button type="button" class="btn btn-danger-outline admin-only" data-action="delete-project" data-id="${esc(p.id)}"><i class="fa-regular fa-trash-can"></i> Delete</button>
      <button type="button" class="btn btn-outline admin-only" data-action="edit-project" data-id="${esc(p.id)}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
      <button type="button" class="btn btn-primary" data-action="close-modal">Close</button>
    </div>`;
  openModal({ title: 'Project details', body, size: 'lg' });
  if (admin) {
    $('#qProgress').addEventListener('input', e => { $('#qOut').textContent = `${e.target.value}%`; });
    $('#projectQuick').addEventListener('submit', e => {
      e.preventDefault();
      p.status = $('#qStatus').value;
      p.progress = Number($('#qProgress').value);
      normalizeProject(p);
      p.updatedAt = new Date().toISOString();
      saveDb('projects');
      logActivity('Project', `Updated ${p.id} to ${p.status}, ${p.progress}% complete`);
      toast(`Project ${p.id} updated.`);
      refresh();
      viewProject(p.id);
    });
  }
}

function deleteProject(id) {
  if (!requireAdmin()) return;
  const p = db.projects.find(x => x.id === id);
  if (!p) return;
  confirmDialog({
    title: `Delete project ${p.id}?`,
    message: `"${p.name}" will be permanently removed. This cannot be undone.`,
    onConfirm: () => {
      db.projects = db.projects.filter(x => x.id !== id);
      saveDb('projects');
      closeModal();
      logActivity('Project', `Deleted project ${id}: ${p.name}`);
      toast(`Project ${id} deleted.`);
      refresh();
    }
  });
}

/* ---------- Field reports ---------- */
function relatedLabel(id) {
  if (!id) return '—';
  const item = db.tickets.find(t => t.id === id) || db.projects.find(p => p.id === id);
  return item ? `${id}, ${item.title || item.name}` : `${id} (removed)`;
}
function filteredReports() {
  const q = val('reportSearch').trim().toLowerCase(), st = val('reportStatus'), fu = val('reportFollow');
  return scopedReports().filter(r =>
    (!st || r.status === st) && (!fu || r.followUp === fu) &&
    (!q || [r.id, reportTechName(r), r.location, r.problem, r.work, r.materials, r.recommendation, r.related].join(' ').toLowerCase().includes(q))
  ).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id));
}
function renderReports() {
  const list = filteredReports();
  const total = scopedReports().length;
  $('#reportRows').innerHTML = list.map(r => `<tr>
    <td data-label="Report"><span class="mono id">${esc(r.id)}</span></td>
    <td data-label="Technician"><button type="button" class="link-btn cell-title" data-action="view-report" data-id="${esc(r.id)}">${esc(reportTechName(r))}</button><span class="cell-sub">${esc(r.problem.length > 60 ? r.problem.slice(0, 60) + '…' : r.problem)}</span></td>
    <td data-label="Related job">${esc(r.related || '—')}</td>
    <td data-label="Location">${esc(r.location)}</td>
    <td data-label="Date">${esc(fmtDate(r.date))}</td>
    <td data-label="Follow-up">${r.followUp === 'Yes' ? '<span class="chip-flag">Required</span>' : 'No'}</td>
    <td data-label="Status">${badge(r.status)}</td>
    <td data-label=""><span class="row-actions">
      <button type="button" class="icon-btn" data-action="view-report" data-id="${esc(r.id)}" aria-label="View report ${esc(r.id)}" title="View"><i class="fa-regular fa-eye"></i></button>
      ${canEditReport(r) ? `<button type="button" class="icon-btn" data-action="edit-report" data-id="${esc(r.id)}" aria-label="Edit report ${esc(r.id)}" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>` : ''}
      <button type="button" class="icon-btn danger admin-only" data-action="delete-report" data-id="${esc(r.id)}" aria-label="Delete report ${esc(r.id)}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
    </span></td></tr>`).join('');
  $('.table-wrap', $('#page-reports')).hidden = !list.length;
  const empty = $('#reportEmpty');
  empty.hidden = list.length > 0;
  if (!list.length) {
    empty.innerHTML = total
      ? emptyState('fa-filter-circle-xmark', 'No reports match your filters', 'Try a different search term or clear the filters.', '<button type="button" class="btn btn-outline" data-action="clear-filters" data-id="reports">Clear filters</button>')
      : emptyState('fa-clipboard-list', 'No field reports yet', 'Submit a report after inspecting or repairing a fault.', '<button type="button" class="btn btn-primary" data-action="new-report"><i class="fa-solid fa-plus"></i> New field report</button>');
  }
  $('#reportCount').textContent = `Showing ${list.length} of ${total} report${total === 1 ? '' : 's'}`;
}

function openReportForm(id, relatedId) {
  if (isUser()) return toast('Field reports are written by technicians.', 'error');
  const r = id ? db.reports.find(x => x.id === id) : null;
  if (id && (!r || !canEditReport(r))) return toast('You cannot edit that report.', 'error');
  closeModal();
  const admin = isAdmin();
  const relOpts = [
    ...scopedTickets().map(t => ({ value: t.id, label: `${t.id}: ${t.title}` })),
    ...scopedProjects().map(p => ({ value: p.id, label: `${p.id}: ${p.name}` }))
  ];
  if (r && r.related && !relOpts.some(o => o.value === r.related)) relOpts.push({ value: r.related, label: `${r.related} (no longer available)` });
  const statusList = admin ? REPORT_STATUSES : Array.from(new Set([...(r ? [r.status] : []), ...TECH_REPORT_STATUSES]));
  const values = r ? Object.assign({}, r) : { date: today(), status: 'Submitted', followUp: 'No', related: relatedId || '' };
  if (!r && relatedId) {
    const src = db.tickets.find(t => t.id === relatedId) || db.projects.find(p => p.id === relatedId);
    if (src) values.location = src.location;
    if (admin && src && src.technicianId) values.technicianId = src.technicianId;
  }
  const fields = [
    admin
      ? { name: 'technicianId', label: 'Technician', type: 'select', required: true, placeholder: 'Choose technician', options: db.technicians.map(t => ({ value: t.id, label: `${t.name}, ${t.specialization}` })) }
      : { name: 'technicianId', label: 'Technician', type: 'static', text: displayName() },
    { name: 'related', label: 'Related ticket or project', type: 'select', placeholder: 'Not linked to a job', options: relOpts },
    { name: 'location', label: 'Location', required: true, list: 'dl-locations' },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'problem', label: 'Problem observed', type: 'textarea', required: true, full: true },
    { name: 'work', label: 'Work carried out', type: 'textarea', required: true, full: true },
    { name: 'materials', label: 'Materials used', type: 'textarea', full: true, rows: 2, placeholder: 'List parts and quantities' },
    { name: 'recommendation', label: 'Recommendation', type: 'textarea', full: true, rows: 2 },
    { name: 'status', label: 'Status', type: 'select', required: true, options: statusList },
    { name: 'followUp', label: 'Follow-up required', type: 'select', required: true, options: ['No', 'Yes'] }
  ];
  openForm({
    title: r ? `Edit report ${r.id}` : 'New field report',
    submitLabel: r ? 'Save changes' : 'Submit report',
    fields, values,
    after: form => {
      form.elements.related.addEventListener('change', () => {
        const src = db.tickets.find(t => t.id === form.elements.related.value) || db.projects.find(p => p.id === form.elements.related.value);
        if (src && !form.elements.location.value.trim()) form.elements.location.value = src.location;
      });
      form.elements.status.addEventListener('change', () => { if (form.elements.status.value === 'Requires Follow-up') form.elements.followUp.value = 'Yes'; });
    },
    onSubmit: data => {
      const techId = admin ? data.technicianId : (r ? r.technicianId : user.techId);
      const rec = {
        technicianId: techId, technicianName: techName(techId) || (r && r.technicianName) || displayName(),
        related: data.related, location: data.location, date: data.date, problem: data.problem, work: data.work,
        materials: data.materials, recommendation: data.recommendation, status: data.status,
        followUp: data.status === 'Requires Follow-up' ? 'Yes' : data.followUp
      };
      if (r) {
        Object.assign(r, rec);
        logActivity('Report', `Edited field report ${r.id}`);
        toast(`Report ${r.id} updated.`);
      } else {
        const n = Object.assign({ id: nextId('FR', db.reports, 2001), createdAt: new Date().toISOString() }, rec);
        db.reports.push(n);
        notify(`Field report submitted by ${rec.technicianName}.`, 'report', 'ADMIN', { kind: 'report', id: n.id });
        logActivity('Report', `Submitted field report ${n.id}${n.related ? ' for ' + n.related : ''}`);
        toast(`Report ${n.id} submitted.`);
      }
      saveDb('reports');
      refresh();
    }
  });
}

function viewReport(id) {
  const r = db.reports.find(x => x.id === id);
  if (!r || !(isAdmin() || (isTech() && user.techId && r.technicianId === user.techId))) return toast('Report not found.', 'error');
  const relKind = r.related && r.related.startsWith('PJ-') ? 'project' : 'ticket';
  const exists = r.related && (db.tickets.some(t => t.id === r.related) || db.projects.some(p => p.id === r.related));
  const body = `
    <div class="detail-top"><span class="mono id">${esc(r.id)}</span>${badge(r.status)}${r.followUp === 'Yes' ? '<span class="chip-flag">Follow-up required</span>' : ''}</div>
    <h3 class="detail-title">${esc(r.location)}</h3>
    <dl class="detail-grid">
      <div><dt>Technician</dt><dd>${esc(reportTechName(r))}</dd></div>
      <div><dt>Date</dt><dd>${esc(fmtDate(r.date))}</dd></div>
      <div class="full"><dt>Related ticket or project</dt><dd>${exists ? `<button type="button" class="link-btn" data-action="open-record" data-kind="${relKind}" data-id="${esc(r.related)}">${esc(relatedLabel(r.related))}</button>` : esc(relatedLabel(r.related))}</dd></div>
    </dl>
    <div class="detail-block"><h3>Problem observed</h3><p>${esc(r.problem)}</p></div>
    <div class="detail-block"><h3>Work carried out</h3><p>${esc(r.work)}</p></div>
    <div class="detail-block"><h3>Materials used</h3><p>${esc(r.materials || 'None recorded')}</p></div>
    <div class="detail-block"><h3>Recommendation</h3><p>${esc(r.recommendation || 'None')}</p></div>
    <div class="modal-foot">
      ${isAdmin() && r.status === 'Submitted' ? `<button type="button" class="btn btn-outline spacer" data-action="review-report" data-id="${esc(r.id)}"><i class="fa-solid fa-check"></i> Mark as reviewed</button>` : ''}
      <button type="button" class="btn btn-danger-outline admin-only" data-action="delete-report" data-id="${esc(r.id)}"><i class="fa-regular fa-trash-can"></i> Delete</button>
      ${canEditReport(r) ? `<button type="button" class="btn btn-outline" data-action="edit-report" data-id="${esc(r.id)}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>` : ''}
      <button type="button" class="btn btn-primary" data-action="close-modal">Close</button>
    </div>`;
  openModal({ title: 'Field report', body, size: 'lg' });
}

function reviewReport(id) {
  if (!requireAdmin()) return;
  const r = db.reports.find(x => x.id === id);
  if (!r) return;
  r.status = 'Reviewed';
  saveDb('reports');
  logActivity('Report', `Marked field report ${r.id} as reviewed`);
  toast(`Report ${r.id} marked as reviewed.`);
  refresh();
  viewReport(id);
}

function deleteReport(id) {
  if (!requireAdmin()) return;
  const r = db.reports.find(x => x.id === id);
  if (!r) return;
  confirmDialog({
    title: `Delete report ${r.id}?`,
    message: 'This field report will be permanently removed. This cannot be undone.',
    onConfirm: () => {
      db.reports = db.reports.filter(x => x.id !== id);
      saveDb('reports');
      closeModal();
      logActivity('Report', `Deleted field report ${id}`);
      toast(`Report ${id} deleted.`);
      refresh();
    }
  });
}

/* ---------- Technicians ---------- */
function filteredTechs() {
  const q = val('techSearch').trim().toLowerCase(), st = val('techStatus'), sp = val('techSpec');
  return db.technicians.filter(t =>
    (!st || t.status === st) && (!sp || t.specialization === sp) &&
    (!q || [t.name, t.staffId, t.team, t.specialization, t.email, t.phone].join(' ').toLowerCase().includes(q))
  ).sort((a, b) => a.name.localeCompare(b.name));
}
function renderTechnicians() {
  if (!isAdmin()) return;
  const list = filteredTechs();
  const total = db.technicians.length;
  $('#techRows').innerHTML = list.map(t => {
    const n = activeTicketCount(t.id);
    return `<tr>
      <td data-label="Technician"><span class="tech-cell"><span class="avatar" aria-hidden="true">${esc(initials(t.name))}</span><span><button type="button" class="link-btn cell-title" data-action="view-tech" data-id="${esc(t.id)}">${esc(t.name)}</button><span class="cell-sub">${esc(t.staffId)}</span></span></span></td>
      <td data-label="Team">${esc(t.team)}</td>
      <td data-label="Specialization">${esc(t.specialization)}</td>
      <td data-label="Phone">${esc(t.phone)}</td>
      <td data-label="Email">${esc(t.email)}</td>
      <td data-label="Workload"><span class="load"><span class="bar-track"><span style="width:${Math.min(100, n * 20)}%"></span></span><small>${n} active</small></span></td>
      <td data-label="Status">${badge(t.status)}</td>
      <td data-label=""><span class="row-actions">
        <button type="button" class="icon-btn" data-action="view-tech" data-id="${esc(t.id)}" aria-label="View ${esc(t.name)}" title="View"><i class="fa-regular fa-eye"></i></button>
        <button type="button" class="icon-btn" data-action="edit-tech" data-id="${esc(t.id)}" aria-label="Edit ${esc(t.name)}" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
        <button type="button" class="icon-btn danger" data-action="delete-tech" data-id="${esc(t.id)}" aria-label="Delete ${esc(t.name)}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
      </span></td></tr>`;
  }).join('');
  $('.table-wrap', $('#page-technicians')).hidden = !list.length;
  const empty = $('#techEmpty');
  empty.hidden = list.length > 0;
  if (!list.length) {
    empty.innerHTML = total
      ? emptyState('fa-filter-circle-xmark', 'No technicians match your filters', 'Try a different search term or clear the filters.', '<button type="button" class="btn btn-outline" data-action="clear-filters" data-id="technicians">Clear filters</button>')
      : emptyState('fa-users-gear', 'No technicians yet', 'Add technicians so tickets and projects can be assigned.', '<button type="button" class="btn btn-primary" data-action="new-tech"><i class="fa-solid fa-user-plus"></i> Add technician</button>');
  }
  $('#techCount').textContent = `Showing ${list.length} of ${total} technician${total === 1 ? '' : 's'}`;
}

function openTechForm(id) {
  if (!requireAdmin()) return;
  const t = id ? techById(id) : null;
  if (id && !t) return toast('Technician not found.', 'error');
  closeModal();
  const fields = [
    { name: 'name', label: 'Full name', required: true, placeholder: 'e.g. K. Adeyemi' },
    { name: 'staffId', label: 'Staff ID', required: true, placeholder: 'UI/MD/0000' },
    { name: 'team', label: 'Department or team', type: 'select', required: true, options: TEAMS },
    { name: 'specialization', label: 'Specialization', type: 'select', required: true, options: SPECIALIZATIONS },
    { name: 'phone', label: 'Phone', type: 'tel', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: TECH_STATUSES, default: 'Available' }
  ];
  openForm({
    title: t ? `Edit ${t.name}` : 'Add technician',
    submitLabel: t ? 'Save changes' : 'Add technician',
    size: 'md', fields, values: t || {},
    onSubmit: data => {
      if (db.technicians.some(x => x.id !== (t && t.id) && x.staffId.toLowerCase() === data.staffId.toLowerCase())) return `Staff ID ${data.staffId} is already used by another technician.`;
      if (t) {
        Object.assign(t, data);
        db.reports.forEach(r => { if (r.technicianId === t.id) r.technicianName = t.name; });
        saveDb('reports');
        logActivity('Technician', `Edited technician ${t.name}`);
        toast(`${t.name} updated.`);
      } else {
        const n = Object.assign({ id: nextId('TC', db.technicians, 1) }, data);
        n.id = 'TC-' + pad(parseInt(n.id.split('-')[1], 10));
        db.technicians.push(n);
        logActivity('Technician', `Added technician ${n.name}`);
        toast(`${n.name} added to the roster.`);
      }
      saveDb('technicians');
      refresh();
    }
  });
}

function viewTechnician(id) {
  const t = techById(id);
  if (!t || !isAdmin()) return toast('Technician not found.', 'error');
  const active = db.tickets.filter(x => x.technicianId === t.id && !['Resolved', 'Closed'].includes(x.status));
  const body = `
    <div class="detail-top"><span class="mono id">${esc(t.staffId)}</span>${badge(t.status)}</div>
    <h3 class="detail-title">${esc(t.name)}</h3>
    <dl class="detail-grid">
      <div><dt>Department or team</dt><dd>${esc(t.team)}</dd></div>
      <div><dt>Specialization</dt><dd>${esc(t.specialization)}</dd></div>
      <div><dt>Phone</dt><dd>${esc(t.phone)}</dd></div>
      <div><dt>Email</dt><dd>${esc(t.email)}</dd></div>
      <div><dt>Current workload</dt><dd>${active.length} active ticket${active.length === 1 ? '' : 's'}</dd></div>
      <div><dt>Field reports filed</dt><dd>${db.reports.filter(r => r.technicianId === t.id).length}</dd></div>
    </dl>
    <div class="detail-block"><h3>Active tickets</h3>
      ${active.length ? `<div class="link-list">${active.map(x => `<button type="button" class="pill-btn" data-action="view-ticket" data-id="${esc(x.id)}">${esc(x.id)}: ${esc(x.title)}</button>`).join('')}</div>` : '<p class="muted">No active tickets.</p>'}</div>
    <div class="modal-foot">
      <button type="button" class="btn btn-danger-outline" data-action="delete-tech" data-id="${esc(t.id)}"><i class="fa-regular fa-trash-can"></i> Delete</button>
      <button type="button" class="btn btn-outline" data-action="edit-tech" data-id="${esc(t.id)}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
      <button type="button" class="btn btn-primary" data-action="close-modal">Close</button>
    </div>`;
  openModal({ title: 'Technician profile', body, size: 'md' });
}

function deleteTechnician(id) {
  if (!requireAdmin()) return;
  const t = techById(id);
  if (!t) return;
  const n = activeTicketCount(id);
  confirmDialog({
    title: `Delete ${t.name}?`,
    message: n
      ? `${n} active ticket${n === 1 ? ' is' : 's are'} assigned to this technician. They will be unassigned. This cannot be undone.`
      : 'This technician will be removed from the roster. This cannot be undone.',
    onConfirm: () => {
      const now = new Date().toISOString();
      db.tickets.forEach(x => {
        if (x.technicianId === id) {
          x.technicianId = '';
          if (x.status === 'Assigned') x.status = 'Open';
          x.log.push({ t: now, text: `${t.name} was removed from the roster; ticket unassigned` });
        }
      });
      db.technicians = db.technicians.filter(x => x.id !== id);
      db.users.forEach(u => { if (u.techId === id) { u.techId = ''; if (u.role === 'TECHNICIAN') u.role = 'USER'; } });
      saveDb('tickets'); saveDb('technicians'); saveDb('users');
      logActivity('Technician', `Deleted technician ${t.name}`);
      closeModal();
      toast(`${t.name} deleted.`);
      refresh();
    }
  });
}

/* ---------- Analytics ---------- */
function rangeStart(range) {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  if (range === 'today') return d;
  if (range === 'week') { d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }
  if (range === 'month') { d.setDate(1); return d; }
  return null;
}
const inRange = (v, start) => !start || (parseDate(v) && parseDate(v) >= start);

function analyticsData(range) {
  const start = rangeStart(range);
  const tickets = db.tickets.filter(t => inRange(t.created, start));
  const projects = db.projects.filter(p => inRange(p.updatedAt || p.start, start));
  const reports = db.reports.filter(r => inRange(r.date, start));
  const c = ticketCounts(tickets);
  return {
    tickets, projects, reports, total: tickets.length, resolved: c.done, pending: tickets.length - c.done,
    avg: avgResponse(tickets),
    projDone: projects.filter(p => p.status === 'Completed').length,
    projActive: projects.filter(p => p.status === 'In Progress').length
  };
}
function renderAnalytics() {
  if (!isAdmin()) return;
  const range = val('analyticsRange') || 'all';
  const a = analyticsData(range);
  $('#analyticsStats').innerHTML = [
    { label: 'Total tickets', value: a.total, icon: 'fa-ticket', tone: 'blue' },
    { label: 'Resolved tickets', value: a.resolved, icon: 'fa-circle-check', tone: 'green' },
    { label: 'Pending tickets', value: a.pending, icon: 'fa-hourglass-half', tone: 'orange' },
    { label: 'Average response time', value: fmtDuration(a.avg), icon: 'fa-stopwatch', tone: 'gold' },
    { label: 'Projects completed', value: a.projDone, icon: 'fa-flag-checkered', tone: 'teal' },
    { label: 'Projects in progress', value: a.projActive, icon: 'fa-diagram-project', tone: 'violet' },
    { label: 'Field reports submitted', value: a.reports.length, icon: 'fa-clipboard-list', tone: 'slate' }
  ].map(statCard).join('');
  $('#anStatus').innerHTML = donutChart(statusSegments(a.tickets));
  $('#anCategory').innerHTML = barList(CATEGORIES.map(c => ({ label: c, value: a.tickets.filter(t => t.category === c).length })).filter(x => x.value));
  $('#anPriority').innerHTML = barList(PRIORITIES.map(p => ({ label: p, value: a.tickets.filter(t => t.priority === p).length })));
  $('#anTech').innerHTML = barList(db.technicians.map(t => ({ label: t.name, value: a.tickets.filter(x => x.technicianId === t.id && ['Resolved', 'Closed'].includes(x.status)).length })).filter(x => x.value).sort((x, y) => y.value - x.value));
}

function printReport() {
  if (!requireAdmin()) return;
  const range = val('analyticsRange') || 'all';
  const a = analyticsData(range);
  const row = cells => `<tr>${cells.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`;
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>WorkOrder report | ${esc(RANGE_LABELS[range])}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:32px;font-size:13px;line-height:1.45}
  h1{font-size:22px;margin:0 0 2px} h2{font-size:15px;margin:26px 0 8px;border-bottom:2px solid #0b2a55;padding-bottom:4px;color:#0b2a55}
  .head{border-bottom:3px solid #0b2a55;padding-bottom:12px;margin-bottom:8px} .sub{color:#555;margin:0}
  table{width:100%;border-collapse:collapse;margin-top:6px} th,td{border:1px solid #bbb;padding:6px 8px;text-align:left;vertical-align:top} th{background:#eef2f8}
  .kpi td:first-child{width:60%} .no-print{margin-bottom:16px} button{padding:8px 16px;font-size:14px;cursor:pointer}
  .foot{margin-top:28px;color:#666;font-size:11px}
  @media print{.no-print{display:none} body{margin:14mm}}
</style></head><body>
<div class="no-print"><button onclick="window.print()">Print this report</button></div>
<div class="head"><h1>WorkOrder: Maintenance Activity Report</h1>
<p class="sub">Maintenance Department, University of Ibadan</p>
<p class="sub">Period: ${esc(RANGE_LABELS[range])} | Generated: ${esc(fmtDateTime(new Date().toISOString()))} | Prepared by: ${esc(displayName())}</p></div>
<h2>Summary</h2>
<table class="kpi"><tbody>
${row(['Total tickets', a.total])}${row(['Resolved tickets (resolved and closed)', a.resolved])}${row(['Pending tickets', a.pending])}
${row(['Average response time', fmtDuration(a.avg)])}${row(['Projects completed', a.projDone])}${row(['Projects in progress', a.projActive])}${row(['Field reports submitted', a.reports.length])}
</tbody></table>
<h2>Tickets by status</h2>
<table><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>${TICKET_STATUSES.map(s => row([s, a.tickets.filter(t => t.status === s).length])).join('')}</tbody></table>
<h2>Tickets by category</h2>
<table><thead><tr><th>Category</th><th>Count</th></tr></thead><tbody>${CATEGORIES.map(c => row([c, a.tickets.filter(t => t.category === c).length])).join('')}</tbody></table>
<h2>Ticket register</h2>
<table><thead><tr><th>ID</th><th>Issue</th><th>Location</th><th>Priority</th><th>Technician</th><th>Status</th></tr></thead><tbody>
${a.tickets.length ? a.tickets.map(t => row([t.id, t.title, t.location, t.priority, techName(t.technicianId) || 'Unassigned', t.status])).join('') : row(['No tickets in this period', '', '', '', '', ''])}
</tbody></table>
<h2>Projects</h2>
<table><thead><tr><th>ID</th><th>Project</th><th>Team</th><th>Deadline</th><th>Progress</th><th>Status</th></tr></thead><tbody>
${a.projects.length ? a.projects.map(p => row([p.id, p.name, p.team, fmtDate(p.deadline), p.progress + '%', p.status])).join('') : row(['No projects in this period', '', '', '', '', ''])}
</tbody></table>
<h2>Field reports</h2>
<table><thead><tr><th>ID</th><th>Technician</th><th>Location</th><th>Date</th><th>Status</th><th>Follow-up</th></tr></thead><tbody>
${a.reports.length ? a.reports.map(r => row([r.id, reportTechName(r), r.location, fmtDate(r.date), r.status, r.followUp])).join('') : row(['No reports in this period', '', '', '', '', ''])}
</tbody></table>
<p class="foot">Generated by WorkOrder (demo data stored in the browser).</p>
</body></html>`;

  const w = window.open('', '_blank');
  if (w) {
    w.document.open(); w.document.write(html); w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch (e) { /* user can use the on-page button */ } }, 500);
    return;
  }
  // Pop-ups blocked: print through a hidden frame instead
  const f = document.createElement('iframe');
  f.setAttribute('aria-hidden', 'true');
  f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(f);
  f.contentDocument.open(); f.contentDocument.write(html); f.contentDocument.close();
  setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { toast('Could not open the print dialog.', 'error'); } setTimeout(() => f.remove(), 2000); }, 400);
}

/* ---------- Settings ---------- */
function renderSettings() {
  const p = profile();
  $('#setName').value = p.name || '';
  $('#setDept').value = p.department || '';
  $('#setEmail').value = user.email;
  $('#setEmail').readOnly = true;
  ['pwCurrent', 'pwNew', 'pwConfirm'].forEach(id => { $('#' + id).value = ''; setFieldError(id, ''); });
  $('#setPhone').value = p.phone || '';
  $('#setNotifTicket').checked = settings.notifTicket !== false;
  $('#setNotifProject').checked = settings.notifProject !== false;
  $('#setNotifReport').checked = settings.notifReport !== false;
  $('#setDark').checked = !!settings.dark;
  ['setName', 'setEmail'].forEach(id => { $('#' + id).setAttribute('aria-invalid', 'false'); $('#err_' + id).hidden = true; });
}
function saveSettingsForm(e) {
  e.preventDefault();
  const name = val('setName').trim(), email = user.email;
  let ok = true;
  const check = (id, msg) => { const el = $('#' + id), er = $('#err_' + id); el.setAttribute('aria-invalid', msg ? 'true' : 'false'); er.textContent = msg; er.hidden = !msg; if (msg && ok) { el.focus(); ok = false; } };
  check('setName', name ? '' : 'Full name is required.');
  check('setEmail', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Enter a valid email address.');
  if (!ok) return;
  settings.profiles[user.email] = { name, department: val('setDept').trim(), email, phone: val('setPhone').trim() };
  const me = findUser(user.email);
  if (me) { me.name = name; me.department = val('setDept').trim(); me.phone = val('setPhone').trim(); saveDb('users'); user.name = name; }
  settings.notifTicket = $('#setNotifTicket').checked;
  settings.notifProject = $('#setNotifProject').checked;
  settings.notifReport = $('#setNotifReport').checked;
  settings.dark = $('#setDark').checked;
  if (saveSettings()) { applyTheme(); fillUserChips(); logActivity('Settings', 'Updated profile and preferences'); toast('Settings saved.'); refresh(); }
}
function resetDemoData() {
  if (!requireAdmin()) return;
  confirmDialog({
    title: 'Restore sample data?',
    message: 'All tickets, projects, reports, technicians and notifications will be replaced with the original sample data.',
    confirmLabel: 'Reset data', tone: 'danger',
    onConfirm: () => {
      [KEYS.tickets, KEYS.projects, KEYS.reports, KEYS.technicians, KEYS.notifications, KEYS.counters].forEach(store.remove);
      seedData();
      loadDb();
      logActivity('System', 'Restored the sample data');
      toast('Sample data restored.');
      refresh();
    }
  });
}

/* ---------------------------------------------------------
   11b. Requests, messages, users, activity log, password change
--------------------------------------------------------- */
const roleLabel = r => ROLE_LABEL[r] || r;

function applyRoleLabels() {
  const u = isUser();
  $('#hdTitle').textContent = u ? 'My requests' : 'Help desk';
  $('#hdSub').textContent = u
    ? 'Report a fault or ask for something to be done, then follow it here.'
    : isTech() ? 'Tickets assigned to you. Update the status as the work moves along.'
      : 'Log maintenance faults, assign technicians and follow each ticket to completion.';
  $('#navHelpLabel').textContent = u ? 'My Requests' : 'Help Desk';
  $$('.new-ticket-label').forEach(el => { el.textContent = u ? 'New request' : 'New ticket'; });
  $$('[data-action="new-ticket"]').forEach(el => { el.hidden = isTech(); });
  $('#globalSearch').placeholder = u ? 'Search your requests' : isAdmin() ? 'Search tickets, projects, reports, technicians' : 'Search tickets, projects, reports';
  $('#ticketSearch').placeholder = u ? 'Search by ID, title or location' : 'Search by ID, title, requester or location';
  $('#noTitle').nextElementSibling.textContent = u ? 'Updates on your requests and replies from the maintenance team.' : 'Alerts about tickets, projects and field reports.';
}

/* ---- request form for registered users ---- */
function openRequestForm() {
  if (isTech()) return;
  closeModal();
  const p = profile();
  const fields = [
    { name: 'kind', label: 'What are you sending?', type: 'select', required: true, options: REQUEST_KINDS, default: 'Fault report' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: CATEGORIES, default: 'Other' },
    { name: 'title', label: 'Summary', required: true, full: true, placeholder: 'e.g. Socket sparking in Room 12' },
    { name: 'description', label: 'Details', type: 'textarea', required: true, full: true, rows: 4, placeholder: 'Describe the problem or what you need done, and since when.' },
    { name: 'location', label: 'Location', required: true, list: 'dl-locations', placeholder: 'Building, floor or room' },
    { name: 'priority', label: 'How urgent is it?', type: 'select', required: true, options: PRIORITIES, default: 'Medium' },
    { name: 'contact', label: 'Contact phone or email', required: true, full: true, default: p.phone || user.email }
  ];
  openForm({
    title: 'New request', submitLabel: 'Send request', fields,
    onSubmit: data => {
      const now = new Date().toISOString();
      const n = {
        id: nextId('HD', db.tickets, 1001), requester: displayName(), department: profile().department || 'Not stated',
        contact: data.contact, title: data.title, description: data.description, category: data.category, location: data.location,
        priority: data.priority, technicianId: '', created: now, due: daysFromNow(7), status: 'Open', respondedAt: null, resolvedAt: null,
        kind: data.kind, createdBy: user.email, comments: [],
        log: [{ t: now, text: `Request sent by ${displayName()}` }]
      };
      db.tickets.push(n);
      saveDb('tickets');
      logActivity('Request', `Sent a ${data.kind.toLowerCase()} (${n.id}): ${n.title}`);
      const high = ['High', 'Critical'].includes(n.priority);
      notify(`${high ? 'New high-priority request' : 'New request'} from ${displayName()}: ${n.id}, ${n.title}.`, 'ticket', 'ADMIN', { kind: 'ticket', id: n.id });
      toast(`Request ${n.id} sent. You can follow it here.`);
      refresh();
    }
  });
}

/* ---- messages on a ticket ---- */
function commentItems(t) {
  const list = t.comments || [];
  return list.length
    ? list.map(c => `<li class="comment"><header><b>${esc(c.name)} <span>(${esc(roleLabel(c.role))})</span></b><span>${esc(fmtDateTime(c.t))}</span></header><p>${esc(c.text)}</p></li>`).join('')
    : '<li class="muted">No messages yet.</li>';
}
function commentsHTML(t) {
  return `<div class="detail-block"><h3>Messages</h3>
    <ul id="commentList" class="comment-list">${commentItems(t)}</ul>
    <form id="commentForm" class="comment-form" novalidate>
      <label class="sr-only" for="commentText">Write a message</label>
      <textarea id="commentText" rows="2" maxlength="2000" placeholder="${isUser() ? 'Add more details or ask for an update' : 'Write a message to the requester or the team'}"></textarea>
      <button type="submit" class="btn btn-outline btn-sm"><i class="fa-regular fa-paper-plane"></i> Send message</button>
    </form></div>`;
}
function bindComments(t) {
  const form = $('#commentForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const box = $('#commentText');
    const text = box.value.trim();
    if (!text) { box.focus(); return; }
    if (!Array.isArray(t.comments)) t.comments = [];
    t.comments.push({ t: new Date().toISOString(), email: user.email, name: displayName(), role: user.role, text });
    saveDb('tickets');
    logActivity('Comment', `Sent a message on ${t.id}: ${t.title}`);
    const link = { kind: 'ticket', id: t.id };
    const targets = new Set();
    if (t.createdBy && t.createdBy !== user.email) targets.add(t.createdBy);
    if (!isAdmin()) targets.add('ADMIN');
    if (t.technicianId && !isTech()) targets.add(t.technicianId);
    targets.forEach(a => notify(`New message on ${t.id} from ${displayName()}.`, 'ticket', a, link));
    box.value = '';
    $('#commentList').innerHTML = commentItems(t);
    toast('Message sent.');
  });
}

/* ---- users page (admin) ---- */
function filteredUsers() {
  const q = val('userSearch').trim().toLowerCase(), r = val('userRole'), s = val('userStatus');
  return db.users.filter(u =>
    (!r || u.role === r) && (!s || u.status === s) &&
    (!q || [u.name, u.email, u.department, u.phone].join(' ').toLowerCase().includes(q))
  ).sort((a, b) => a.name.localeCompare(b.name));
}
function renderUsers() {
  if (!isAdmin()) return;
  const pending = db.resets.filter(r => r.status === 'Pending');
  $('#resetBox').hidden = !pending.length;
  $('#resetList').innerHTML = pending.map(r => `<li class="reset-row">
    <div class="grow"><b>${esc(r.name)}</b><small>${esc(r.email)}, requested ${esc(timeAgo(r.requestedAt))}</small></div>
    <button type="button" class="btn btn-primary btn-sm" data-action="issue-temp" data-id="${esc(r.id)}"><i class="fa-solid fa-key" aria-hidden="true"></i> Issue temporary password</button>
    <button type="button" class="btn btn-ghost btn-sm" data-action="dismiss-reset" data-id="${esc(r.id)}">Dismiss</button></li>`).join('');

  const list = filteredUsers();
  const total = db.users.length;
  $('#userRows').innerHTML = list.map(u => {
    const self = u.email === user.email;
    return `<tr>
      <td data-label="User"><span class="tech-cell"><span class="avatar" aria-hidden="true">${esc(initials(u.name))}</span><span><b class="cell-title">${esc(u.name)}${self ? ' (you)' : ''}</b><span class="cell-sub">${esc(u.email)}</span></span></span></td>
      <td data-label="Role">${badge(roleLabel(u.role))}</td>
      <td data-label="Department">${esc(u.department || '—')}</td>
      <td data-label="Phone">${esc(u.phone || '—')}</td>
      <td data-label="Joined">${esc(fmtDate(u.createdAt))}</td>
      <td data-label="Last sign-in">${u.lastLogin ? esc(timeAgo(u.lastLogin)) : 'Never'}</td>
      <td data-label="Status">${badge(u.status)}</td>
      <td data-label=""><span class="row-actions">
        <button type="button" class="icon-btn" data-action="edit-user" data-id="${esc(u.id)}" aria-label="Edit ${esc(u.name)}" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
        ${self ? '' : `<button type="button" class="icon-btn" data-action="reset-user-pw" data-id="${esc(u.id)}" aria-label="Reset password for ${esc(u.name)}" title="Reset password"><i class="fa-solid fa-key"></i></button>
        <button type="button" class="icon-btn danger" data-action="delete-user" data-id="${esc(u.id)}" aria-label="Delete ${esc(u.name)}" title="Delete"><i class="fa-regular fa-trash-can"></i></button>`}
      </span></td></tr>`;
  }).join('');
  $('.table-wrap', $('#page-users')).hidden = !list.length;
  const empty = $('#userEmpty');
  empty.hidden = list.length > 0;
  if (!list.length) empty.innerHTML = emptyState('fa-filter-circle-xmark', 'No users match your filters', 'Try a different search term or clear the filters.', '<button type="button" class="btn btn-outline" data-action="clear-filters" data-id="users">Clear filters</button>');
  $('#userCount').textContent = `Showing ${list.length} of ${total} user${total === 1 ? '' : 's'}`;
}

function openUserForm(id) {
  if (!requireAdmin()) return;
  const u = db.users.find(x => x.id === id);
  if (!u) return toast('User not found.', 'error');
  closeModal();
  const self = u.email === user.email;
  const techOpts = db.technicians.map(t => {
    const other = db.users.find(x => x.techId === t.id && x.id !== u.id);
    return { value: t.id, label: `${t.name}, ${t.team}${other ? ` (linked to ${other.name})` : ''}`, disabled: !!other };
  });
  const fields = [
    { name: 'email', label: 'Email', type: 'static', text: u.email },
    { name: 'name', label: 'Full name', required: true },
    { name: 'department', label: 'Department or unit', list: 'dl-departments' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    self ? { name: 'role', label: 'Role', type: 'static', text: roleLabel(u.role) }
      : { name: 'role', label: 'Role', type: 'select', required: true, options: [{ value: 'USER', label: 'User (can send requests)' }, { value: 'TECHNICIAN', label: 'Technician' }, { value: 'ADMIN', label: 'Administrator' }], help: 'Administrators see everything. Technicians see their assigned work.' },
    { name: 'techId', label: 'Technician profile', type: 'select', placeholder: 'Not linked', options: techOpts, help: 'Needed when the role is Technician.' },
    self ? { name: 'status', label: 'Status', type: 'static', text: u.status }
      : { name: 'status', label: 'Account status', type: 'select', required: true, options: ['Active', 'Disabled'], help: 'Disabled accounts cannot sign in.' }
  ];
  openForm({
    title: `Edit ${u.name}`, submitLabel: 'Save changes', size: 'md', fields, values: u,
    onSubmit: data => {
      const role = self ? u.role : data.role;
      const status = self ? u.status : data.status;
      if (role === 'TECHNICIAN' && !data.techId) return 'Choose the technician profile this account belongs to.';
      const otherAdmins = db.users.filter(x => x.role === 'ADMIN' && x.status === 'Active' && x.id !== u.id).length;
      if (u.role === 'ADMIN' && (role !== 'ADMIN' || status !== 'Active') && !otherAdmins) return 'At least one active administrator is required.';
      const changes = [];
      if (u.role !== role) changes.push(`role ${roleLabel(u.role)} to ${roleLabel(role)}`);
      if (u.status !== status) changes.push(`status ${u.status} to ${status}`);
      u.name = data.name; u.department = data.department; u.phone = data.phone; u.role = role; u.status = status;
      u.techId = role === 'TECHNICIAN' ? data.techId : '';
      saveDb('users');
      logActivity('User', `Updated account ${u.email}${changes.length ? ' (' + changes.join(', ') + ')' : ''}`);
      if (changes.some(c => c.startsWith('role'))) notify(`Your account role is now ${roleLabel(role)}. Sign out and back in to see the change.`, 'system', u.email);
      if (self) { user.name = u.name; user.department = u.department; user.phone = u.phone; fillUserChips(); }
      toast(`${u.name} updated.`);
      refresh();
    }
  });
}

function issueTempPassword(email) {
  if (!requireAdmin()) return;
  const acc = findUser(email);
  if (!acc) return toast('That account no longer exists.', 'error');
  if (acc.email === user.email) return toast('Use Settings to change your own password.', 'error');
  const temp = makeTempPassword();
  setPassword(acc, temp);
  acc.mustChange = true;
  db.resets.forEach(r => { if (r.email === acc.email && r.status === 'Pending') { r.status = 'Resolved'; r.resolvedAt = new Date().toISOString(); } });
  saveDb('users'); saveDb('resets');
  clearFails(acc.email); clearFails('fp:' + acc.email);
  logActivity('User', `Issued a temporary password to ${acc.email}`);
  openModal({
    title: 'Temporary password', size: 'sm',
    body: `<p>Give this temporary password to <b>${esc(acc.name)}</b> (${esc(acc.email)}). They will be asked to choose a new one when they sign in.</p>
      <div class="secret">${esc(temp)}</div>
      <p class="muted">It is shown only once. Share it privately.</p>
      <div class="modal-foot">
        <button type="button" class="btn btn-outline" data-action="copy-text" data-text="${esc(temp)}"><i class="fa-regular fa-copy"></i> Copy</button>
        <button type="button" class="btn btn-primary" data-action="close-modal">Done</button>
      </div>`
  });
  refresh();
}
function resetUserPassword(id) {
  if (!requireAdmin()) return;
  const u = db.users.find(x => x.id === id);
  if (!u) return;
  confirmDialog({
    title: `Reset password for ${u.name}?`, message: 'A temporary password will be created. Their current password stops working.',
    confirmLabel: 'Reset password', tone: 'primary', onConfirm: () => issueTempPassword(u.email)
  });
}
function dismissReset(id) {
  const r = db.resets.find(x => x.id === id);
  if (!r) return;
  r.status = 'Dismissed';
  saveDb('resets');
  logActivity('User', `Dismissed the password reset request from ${r.email}`);
  refresh();
}
function deleteUser(id) {
  if (!requireAdmin()) return;
  const u = db.users.find(x => x.id === id);
  if (!u) return;
  if (u.email === user.email) return toast('You cannot delete your own account.', 'error');
  if (u.role === 'ADMIN' && db.users.filter(x => x.role === 'ADMIN' && x.status === 'Active' && x.id !== u.id).length === 0) return toast('At least one active administrator is required.', 'error');
  confirmDialog({
    title: `Delete ${u.name}?`,
    message: 'The account is removed and can no longer sign in. Their tickets and activity entries stay on record.',
    onConfirm: () => {
      db.users = db.users.filter(x => x.id !== id);
      db.resets = db.resets.filter(r => r.email !== u.email);
      saveDb('users'); saveDb('resets');
      logActivity('User', `Deleted account ${u.email}`);
      toast(`${u.name} deleted.`);
      refresh();
    }
  });
}

/* ---- activity log page (admin) ---- */
let actLimit = 100, actSig = '';
const sinceDays = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
function filteredActivity() {
  const q = val('actSearch').trim().toLowerCase(), kind = val('actKind'), who = val('actUser'), range = val('actRange');
  const start = range === 'today' ? sinceDays(0) : range === 'week' ? sinceDays(6) : range === 'month' ? sinceDays(29) : null;
  return db.activity.filter(a =>
    (!kind || a.kind === kind) && (!who || a.email === who) && (!start || new Date(a.t) >= start) &&
    (!q || [a.name, a.email, a.text, a.kind, roleLabel(a.role)].join(' ').toLowerCase().includes(q))
  );
}
function renderActivity() {
  if (!isAdmin()) return;
  const people = new Map();
  db.users.forEach(u => people.set(u.email, u.name));
  db.activity.forEach(a => { if (a.email && !people.has(a.email)) people.set(a.email, a.name); });
  const cur = val('actUser');
  $('#actUser').innerHTML = '<option value="">Everyone</option>' + Array.from(people.entries()).sort((a, b) => a[1].localeCompare(b[1])).map(([e, n]) => `<option value="${esc(e)}"${e === cur ? ' selected' : ''}>${esc(n)}</option>`).join('');

  const list = filteredActivity();
  const sig = [val('actSearch'), val('actKind'), val('actUser'), val('actRange')].join('|');
  if (sig !== actSig) { actSig = sig; actLimit = 100; }
  const shown = list.slice(0, actLimit);
  $('#actRows').innerHTML = shown.map(a => `<tr>
    <td data-label="When"><span class="nowrap">${esc(fmtDateTime(a.t))}</span></td>
    <td data-label="Person"><b class="cell-title">${esc(a.name || 'Visitor')}</b><span class="cell-sub">${esc(a.email || '')}</span></td>
    <td data-label="Role">${a.role ? badge(roleLabel(a.role)) : '—'}</td>
    <td data-label="Area"><span class="badge tone-${KIND_TONE[a.kind] || 'gray'}">${esc(a.kind)}</span></td>
    <td data-label="What happened"><span class="act-detail">${esc(a.text)}</span></td></tr>`).join('');
  $('.table-wrap', $('#page-activity')).hidden = !shown.length;
  const empty = $('#actEmpty');
  empty.hidden = shown.length > 0;
  if (!shown.length) {
    empty.innerHTML = db.activity.length
      ? emptyState('fa-filter-circle-xmark', 'No activity matches your filters', 'Try a different search term or clear the filters.', '<button type="button" class="btn btn-outline" data-action="clear-filters" data-id="activity">Clear filters</button>')
      : emptyState('fa-clock-rotate-left', 'No activity yet', 'Sign-ins, requests, tickets and account changes will be recorded here.');
  }
  $('#actCount').textContent = `Showing ${shown.length} of ${list.length} entr${list.length === 1 ? 'y' : 'ies'}`;
  $('#actMore').hidden = list.length <= actLimit;
}
function exportActivity() {
  if (!requireAdmin()) return;
  const safe = v => { let s = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  const rows = [['When', 'Person', 'Email', 'Role', 'Area', 'What happened']].concat(
    filteredActivity().map(a => [fmtDateTime(a.t), a.name, a.email, roleLabel(a.role), a.kind, a.text]));
  const blob = new Blob(['﻿' + rows.map(r => r.map(safe).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `workorder-activity-${today()}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  logActivity('System', 'Exported the activity log');
  toast('Activity log exported.');
}

/* ---- settings: password, sample data ---- */
function handlePasswordForm(e) {
  e.preventDefault();
  const acc = findUser(user.email);
  const cur = val('pwCurrent'), nw = val('pwNew'), cf = val('pwConfirm');
  const checks = [
    ['pwCurrent', acc && acc.passHash === pwHash(acc, cur) ? '' : 'Current password is incorrect.'],
    ['pwNew', passwordProblem(nw) || (nw === cur ? 'Choose a different password.' : '')],
    ['pwConfirm', nw === cf ? '' : 'Passwords do not match.']
  ];
  let first = null;
  checks.forEach(([id, msg]) => { const el = setFieldError(id, msg); if (msg && !first) first = el; });
  if (first) { first.focus(); return; }
  setPassword(acc, nw);
  acc.mustChange = false;
  saveDb('users');
  logActivity('Account', 'Changed their password');
  e.target.reset();
  toast('Password updated.');
}
function clearSampleData() {
  if (!requireAdmin()) return;
  confirmDialog({
    title: 'Remove all sample data?',
    message: 'All tickets, projects, field reports and notifications will be deleted. Technicians, user accounts and the activity log are kept. This cannot be undone.',
    confirmLabel: 'Remove data',
    onConfirm: () => {
      ['tickets', 'projects', 'reports', 'notifications'].forEach(n => { db[n] = []; saveDb(n); });
      store.remove(KEYS.counters);
      logActivity('System', 'Removed all tickets, projects, field reports and notifications');
      toast('Sample data removed.');
      refresh();
    }
  });
}

/* ---------------------------------------------------------
   12. Global search
--------------------------------------------------------- */
function runSearch() {
  const q = val('globalSearch').trim().toLowerCase();
  const box = $('#searchResults');
  if (!q) { hideSearch(); return; }
  const has = (...parts) => parts.join(' ').toLowerCase().includes(q);
  const groups = [
    { title: 'Tickets', kind: 'ticket', icon: 'fa-ticket', tone: 'orange', items: scopedTickets().filter(t => has(t.id, t.title, t.requester, t.location, t.category, t.description, techName(t.technicianId))).slice(0, 4).map(t => ({ id: t.id, main: t.title, sub: `${t.id}, ${t.status}, ${t.location}` })) },
    { title: 'Projects', kind: 'project', icon: 'fa-diagram-project', tone: 'violet', items: scopedProjects().filter(p => has(p.id, p.name, p.location, p.category, p.team)).slice(0, 4).map(p => ({ id: p.id, main: p.name, sub: `${p.id}, ${p.status}, ${p.progress}%` })) },
    { title: 'Field reports', kind: 'report', icon: 'fa-clipboard-list', tone: 'blue', items: scopedReports().filter(r => has(r.id, reportTechName(r), r.location, r.problem, r.related)).slice(0, 4).map(r => ({ id: r.id, main: r.problem, sub: `${r.id}, ${reportTechName(r)}, ${r.status}` })) }
  ];
  if (isAdmin()) groups.push({ title: 'Technicians', kind: 'technician', icon: 'fa-user-gear', tone: 'green', items: db.technicians.filter(t => has(t.name, t.staffId, t.team, t.specialization)).slice(0, 4).map(t => ({ id: t.id, main: t.name, sub: `${t.staffId}, ${t.specialization}, ${t.status}` })) });
  const shown = groups.filter(g => g.items.length);
  box.innerHTML = shown.length
    ? shown.map(g => `<div class="sr-group"><h3>${g.title}</h3>${g.items.map(i => `<button type="button" class="sr-item" data-action="open-record" data-kind="${g.kind}" data-id="${esc(i.id)}"><span class="chip-icon tone-${g.tone}"><i class="fa-solid ${g.icon}" aria-hidden="true"></i></span><span><b>${esc(i.main.length > 70 ? i.main.slice(0, 70) + '…' : i.main)}</b><small>${esc(i.sub)}</small></span></button>`).join('')}</div>`).join('')
    : `<p class="sr-empty">No results for "${esc(val('globalSearch').trim())}".</p>`;
  box.hidden = false;
}
function hideSearch() { const b = $('#searchResults'); if (b) b.hidden = true; }

function openRecord(kind, id) {
  hideSearch(); closeBell();
  const map = { ticket: ['helpdesk', viewTicket], project: ['projects', viewProject], report: ['reports', viewReport], technician: ['technicians', viewTechnician], user: ['users', () => {}], activity: ['activity', () => {}] };
  const entry = map[kind];
  if (!entry) return;
  if (['technician', 'user', 'activity'].includes(kind) && !isAdmin()) return;
  closeModal();
  navigate(entry[0]);
  entry[1](id);
}

/* ---------------------------------------------------------
   13. Sidebar / bell helpers
--------------------------------------------------------- */
function openSidebar() {
  $('#sidebar').classList.add('open');
  $('#sidebarOverlay').classList.add('show');
  $('#menuBtn').setAttribute('aria-expanded', 'true');
}
function closeSidebar() {
  $('#sidebar').classList.remove('open');
  $('#sidebarOverlay').classList.remove('show');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
}
function toggleBell() {
  const menu = $('#bellMenu');
  const open = menu.hidden;
  menu.hidden = !open;
  $('#bellBtn').setAttribute('aria-expanded', String(open));
  if (open) renderBell();
}
function closeBell() {
  const m = $('#bellMenu');
  if (m && !m.hidden) { m.hidden = true; $('#bellBtn').setAttribute('aria-expanded', 'false'); }
}

/* ---------------------------------------------------------
   14. Event wiring
--------------------------------------------------------- */
const actions = {
  'logout': () => logout(),
  'edit-user': id => openUserForm(id),
  'reset-user-pw': id => resetUserPassword(id),
  'delete-user': id => deleteUser(id),
  'issue-temp': id => { const r = db.resets.find(x => x.id === id); if (r) issueTempPassword(r.email); },
  'dismiss-reset': id => dismissReset(id),
  'export-activity': () => exportActivity(),
  'more-activity': () => { actLimit += 100; renderActivity(); },
  'clear-data': () => clearSampleData(),
  'copy-text': (id, el) => {
    const text = el.dataset.text || '';
    (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text) : Promise.reject())
      .then(() => toast('Copied.')).catch(() => toast('Could not copy. Select the text and copy it manually.', 'error'));
  },
  'close-modal': () => closeModal(),
  'close-sidebar': () => closeSidebar(),
  'close-bell': () => closeBell(),
  'new-ticket': () => openTicketForm(),
  'edit-ticket': id => openTicketForm(id),
  'view-ticket': id => { closeModal(); viewTicket(id); },
  'delete-ticket': id => deleteTicket(id),
  'new-project': () => openProjectForm(),
  'edit-project': id => openProjectForm(id),
  'view-project': id => { closeModal(); viewProject(id); },
  'delete-project': id => deleteProject(id),
  'new-report': (id, el) => openReportForm(null, el && el.dataset.related),
  'edit-report': id => openReportForm(id),
  'view-report': id => { closeModal(); viewReport(id); },
  'delete-report': id => deleteReport(id),
  'review-report': id => reviewReport(id),
  'new-tech': () => openTechForm(),
  'edit-tech': id => openTechForm(id),
  'view-tech': id => { closeModal(); viewTechnician(id); },
  'delete-tech': id => deleteTechnician(id),
  'print-report': () => printReport(),
  'reset-demo': () => resetDemoData(),
  'mark-all-read': () => markAllRead(),
  'clear-notifications': () => {
    const mine = myNotifications();
    if (!mine.length) return toast('There are no notifications to clear.', 'info');
    confirmDialog({
      title: 'Clear all notifications?', message: 'Your notifications will be permanently removed.', confirmLabel: 'Clear all',
      onConfirm: () => {
        const ids = new Set(mine.map(n => n.id));
        db.notifications = db.notifications.filter(n => !ids.has(n.id));
        saveDb('notifications');
        toast('Notifications cleared.');
        refresh();
      }
    });
  },
  'open-notification': id => {
    const n = db.notifications.find(x => x.id === id);
    if (!n) return;
    n.read = true;
    saveDb('notifications');
    closeBell();
    refresh();
    if (n.link) openRecord(n.link.kind, n.link.id);
  },
  'open-record': (id, el) => openRecord(el.dataset.kind, id),
  'clear-filters': page => {
    $$(`[data-rerender="${page}"]`).forEach(el => { el.value = ''; });
    PAGES[page].render();
  }
};

function bindEvents() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (el && actions[el.dataset.action]) {
      if (el.tagName === 'A') { if (el.dataset.action !== 'close-bell') e.preventDefault(); }
      actions[el.dataset.action](el.dataset.id, el);
      return;
    }
    if (!e.target.closest('.dropdown')) closeBell();
    if (!e.target.closest('.search')) hideSearch();
    if (e.target === $('#modalOverlay')) closeModal();
    if (e.target === $('#confirmOverlay')) closeConfirm();
  });

  document.addEventListener('input', e => {
    const t = e.target.closest('[data-rerender]');
    if (t && e.type === 'input' && t.tagName !== 'SELECT') PAGES[t.dataset.rerender].render();
  });
  document.addEventListener('change', e => {
    const t = e.target.closest('[data-rerender]');
    if (t) PAGES[t.dataset.rerender].render();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('#confirmOverlay').hidden) closeConfirm();
      else if (!$('#modalOverlay').hidden) closeModal();
      else { closeBell(); hideSearch(); closeSidebar(); }
      return;
    }
    if (e.key === '/' && user && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) && $('#modalOverlay').hidden) {
      e.preventDefault();
      $('#globalSearch').focus();
      return;
    }
    if (e.key === 'Tab') {
      const layer = !$('#confirmOverlay').hidden ? $('#confirmBox') : !$('#modalOverlay').hidden ? $('#modal') : null;
      if (!layer) return;
      const f = $$('a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', layer).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === layer)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener('hashchange', route);

  $('#loginForm').addEventListener('submit', handleLogin);
  $('#togglePassword').addEventListener('click', e => {
    const input = $('#loginPassword');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    const btn = e.currentTarget;
    btn.setAttribute('aria-pressed', String(show));
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    btn.innerHTML = `<i class="fa-regular ${show ? 'fa-eye-slash' : 'fa-eye'}"></i>`;
  });

  $('#menuBtn').addEventListener('click', () => ($('#sidebar').classList.contains('open') ? closeSidebar() : openSidebar()));
  $('#bellBtn').addEventListener('click', toggleBell);

  let timer = null;
  $('#globalSearch').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(runSearch, 120); });
  $('#globalSearch').addEventListener('focus', () => { if (val('globalSearch').trim()) runSearch(); });
  $('#globalSearch').addEventListener('keydown', e => {
    if (e.key === 'Enter') { const first = $('#searchResults .sr-item'); if (first) { e.preventDefault(); first.click(); } }
    if (e.key === 'ArrowDown') { const first = $('#searchResults .sr-item'); if (first) { e.preventDefault(); first.focus(); } }
  });
  $('#searchResults').addEventListener('keydown', e => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const items = $$('.sr-item', $('#searchResults'));
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    if (e.key === 'ArrowDown') (items[i + 1] || items[i]).focus();
    else if (i === 0) $('#globalSearch').focus(); else items[i - 1].focus();
  });

  $('#confirmOk').addEventListener('click', () => { const cb = confirmCb; closeConfirm(); if (cb) cb(); });
  $('#confirmCancel').addEventListener('click', closeConfirm);
  $('#settingsForm').addEventListener('submit', saveSettingsForm);
  $('#passwordForm').addEventListener('submit', handlePasswordForm);
  bindAuth();
  $('#setDark').addEventListener('change', e => { settings.dark = e.target.checked; saveSettings(); applyTheme(); });
}

/* ---------------------------------------------------------
   15. Start-up
--------------------------------------------------------- */
function populateStatics() {
  const sources = {
    ticketStatus: ['All statuses', TICKET_STATUSES], ticketPriority: ['All priorities', PRIORITIES], ticketCategory: ['All categories', CATEGORIES],
    projectStatus: ['All statuses', PROJECT_STATUSES], projectCategory: ['All categories', CATEGORIES], reportStatus: ['All statuses', REPORT_STATUSES],
    techStatus: ['All statuses', TECH_STATUSES], techSpec: ['All specializations', SPECIALIZATIONS], actKind: ['All areas', ACTIVITY_KINDS]
  };
  Object.keys(sources).forEach(id => {
    const [all, list] = sources[id];
    $('#' + id).innerHTML = `<option value="">${all}</option>` + list.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  });
  $('#dl-locations').innerHTML = LOCATIONS.map(l => `<option value="${esc(l)}"></option>`).join('');
  $('#dl-departments').innerHTML = DEPARTMENTS.map(l => `<option value="${esc(l)}"></option>`).join('');
  $('#suQuestion').innerHTML = SECURITY_QUESTIONS.map(q => `<option value="${esc(q)}">${esc(q)}</option>`).join('');
}
function fillUserChips() {
  const name = displayName();
  const role = roleLabel(user.role);
  ['sb', 'tb'].forEach(p => {
    $(`#${p}Name`).textContent = name;
    $(`#${p}Role`).textContent = role;
    $(`#${p}Avatar`).textContent = initials(name);
  });
}
function enterApp(fresh) {
  document.body.setAttribute('data-role', user.role);
  $('#loginView').hidden = true;
  $('#appView').hidden = false;
  fillUserChips();
  applyRoleLabels();
  checkDeadlines();
  renderBell();
  if (fresh || !location.hash) history.replaceState(null, '', '#/dashboard');
  route();
  if (fresh) toast(`Welcome back, ${displayName()}.`);
  if (user.mustChange) setTimeout(openForcedPasswordChange, 500);
}

function init() {
  seedIfNeeded();
  loadDb();
  seedUsersIfNeeded();
  loadSettings();
  applyTheme();
  populateStatics();
  bindEvents();
  const session = readSession();
  if (session) { user = session; enterApp(false); }
  else { $('#loginView').hidden = false; }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
