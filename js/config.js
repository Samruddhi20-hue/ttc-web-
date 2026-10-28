/*
 * Supabase setup:
 * 1. Create a project at https://supabase.com
 * 2. Open Project Settings -> API and copy the Project URL and anon/public key.
 * 3. Paste them below. Never use a service_role/secret key in browser code.
 * Leave the placeholders as-is to run the app in local demo mode.
 */
window.APP_CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  TEAM_MEMBERS: [
    { id: 'member-1', name: 'Sam', color: '#6c63df' },
    { id: 'member-2', name: 'Khushi', color: '#1d9b83' },
    { id: 'member-3', name: 'Rajat Sir', color: '#e39a36' },
    { id: 'member-4', name: 'Shivam Sir', color: '#3987d7' },
    { id: 'member-5', name: 'Saurabh Sir', color: '#d9577b' },
    { id: 'member-6', name: 'Dipali', color: '#8a63d2' },
    { id: 'member-7', name: 'Ajay', color: '#0f9bb5' },
    { id: 'member-8', name: 'GP', color: '#7c8d35' }
  ]
};
