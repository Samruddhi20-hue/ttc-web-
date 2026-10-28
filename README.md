# TeamSpace — Team Leave & Task Calendar

A static web app for an eight-person team to coordinate leave and tasks. It includes a monthly calendar, overview dashboard, task status tracking, and CSV reports that open in Excel or Google Sheets.

## Features

- Monthly calendar with color-coded team members
- Add leave with start/end dates, leave type and notes
- Add tasks with a due date and status
- Mark tasks complete from the dashboard
- Complete monthly report for all eight members, detailed leave export, and task report
- Indian national holidays and major festival reference dates for 2026–2027
- Larger responsive monthly calendar
- Supabase database integration for shared data across devices
- Local demo mode before Supabase is configured

## Project files

- `index.html` — overview dashboard
- `calendar.html` — monthly calendar
- `reports.html` — monthly reports and CSV downloads
- `css/style.css` — styles
- `js/config.js` — team names and Supabase public connection settings
- `js/supabase.js` — data adapter (Supabase or local demo mode)
- `js/app.js` — dashboard and add-entry modal
- `js/leave.js` — shared leave validation and date-count helpers
- `js/tasks.js` — shared task status labels and helpers
- `js/calendar.js` — calendar rendering, holiday markers and entry management
- `js/holidays.js` — Indian national holidays and major festival reference dates
- `render.yaml` — Render static-site deployment blueprint
- `js/reports.js` — monthly calculations and CSV export
- `supabase/schema.sql` — database schema and prototype policies

## 1. Run locally

The simplest way is to use VS Code and its Live Server extension:

1. Open this folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.
4. The app works in local demo mode without Supabase. Demo data is saved in the current browser's local storage and is not shared across devices.

You can also run a local static server from this directory:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## 2. Connect Supabase

1. Create a project at https://supabase.com.
2. Open **SQL Editor** in your project.
3. Paste and run the full contents of `supabase/schema.sql`.
4. Open **Project Settings → API** (or API Keys, depending on the dashboard version) and copy the Project URL and publishable/anon key.
5. Edit `js/config.js` and replace `https://YOUR_PROJECT_ID.supabase.co` and `YOUR_SUPABASE_ANON_KEY` with those values.
6. The configured team members are Sam, Khushi, Rajat Sir, Shivam Sir, Saurabh Sir, Dipali, Ajay, and GP. Their IDs are `member-1` through `member-8`. If you already ran an older version of `schema.sql`, run the updated SQL again to add the four new members and update the existing names/colors.
7. Refresh the site. The connection badge should say **Supabase connected**.

Only use the browser-safe **publishable/anon** key. Never put a `service_role` or secret key in frontend code.

## 3. Important access/security note

This starter uses public anonymous policies in `schema.sql` so the no-login prototype can add and read entries. This means anyone who has the website and project details may be able to read, create, edit or delete records. A URL by itself is not a secure way to limit access to eight specific people. Do not enter sensitive HR or medical information in this public prototype. For a real team deployment, use Supabase Auth, a server-side access gate, or another access-control approach and tighten the Row Level Security policies before publishing.

## 4. Monthly reports

Open **Monthly reports**, select a month, and choose **Complete monthly report** to download one CSV containing a summary row for every one of the eight team members (including zero-leave members) plus all detailed leave entries for the selected month. You can also choose:

- **Leave summary** — request count and leave-day total by member
- **Detailed leave entries** — dates, type, title/reason and counted days
- **Task summary** — tasks due during the month with status and notes

Click **Download CSV**. The CSV is UTF-8 with a BOM to improve compatibility with Excel. Leave is counted only for dates inside the selected month. Full-day leave counts as one day per calendar date, and half-day leave counts as 0.5 day. If a request crosses month boundaries, the report counts only the part that falls inside the selected month. This starter does not yet exclude weekends or public holidays from leave-day totals. Indian festival dates are reference dates and can vary by state or local announcement.

## 5. Current limitations

- Local demo mode stores data only in the browser that created it.
- Supabase mode shares the data across devices but requires the SQL schema and correct config.
- The app uses the configured eight-member list in the frontend; run the updated SQL so the same member IDs/names exist in Supabase.
- Public no-login editing is convenient for a prototype but is not private or identity-verified.
- CSV is supported; native `.xlsx` export is not included in this starter.

## 6. Deploy on Render

1. Push the project folder to a GitHub repository.
2. In https://render.com, choose **New + → Static Site** and connect the repository.
3. Set the build command to blank and the publish directory to `.`. Or use the included `render.yaml` blueprint.
4. Deploy, then open the generated `onrender.com` URL.
5. Configure Supabase before expecting data to be shared across browsers/devices.

`render.yaml` is a static-site blueprint for this plain HTML/CSS/JavaScript project; no Node/Python build step is needed.

## 7. Indian calendar reference dates

The `js/holidays.js` file includes widely observed national holidays and major festival dates for 2026 and 2027. Sources used for the initial reference list include India Post's 2026 holidays list (https://www.indiapost.gov.in/holidays-list), the Government of India's 2026 holiday memorandum, and festival calendars such as Drik Panchang (https://www.drikpanchang.com/calendars/indian/indiancalendar.html?year=2027). These are not a substitute for your employer's official holiday list; Islamic dates and regional observances may change.
