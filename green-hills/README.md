# Green Hills Catering — website

Arabic / English catering website with an event-booking form.
**Frontend:** React (Vite) · **Backend:** Django (bookings saved to the Django admin panel).

```
green-hills/
├── frontend/              React website
│   ├── public/media/      ← photos (img/), videos (videos/), logo
│   └── src/content/
│       ├── site.js        ← EDIT HERE: dishes, events, Ramadan, locations, phone, WhatsApp, email
│       └── strings.js     ← EDIT HERE: headings, buttons, form text (EN + AR)
└── backend/               Django: booking API + admin panel
```

## Run it in VS Code (recommended)

You need **Python 3.11+**, **Node.js 18+** and **Git** installed once.

1. Open VS Code → **File → Open Folder…** → choose this `green-hills` folder.
   Accept the pop-up to install the recommended extensions.
2. **Terminal → Run Task… → `1. Setup (first time only)`**
   (creates the Python environment, installs everything, prepares the database)
3. **Terminal → Run Task… → `2. Create admin login`**: choose a username and password for the bookings panel.
4. **Terminal → Run Task… → `3. Run website`** (or press `Ctrl+Shift+B`).
   - Website with live reload: **http://localhost:5180**. Save any file and the page updates instantly.
   - Bookings admin: **http://localhost:8010/admin**
   - On your phone (same Wi-Fi): VS Code's terminal shows a `Network:` address like `http://192.168.1.25:5180`. Open that.

Other tasks: **Build for production**, **Run backend tests**. To debug Django with breakpoints, open the
**Run and Debug** panel and start **Debug Django**.

## Run it without VS Code (Windows)

You need **Python 3.11+** and **Node.js 18+** installed once.

Double-click **`start-windows.bat`**. It installs everything, builds the site and opens
http://127.0.0.1:8010. The first time, it asks you to create an admin username and password.

- Website: http://127.0.0.1:8010
- Bookings admin: http://127.0.0.1:8010/admin

Manual steps (any OS):

```bash
cd frontend
npm install
npm run build              # builds the website into frontend/dist

cd ../backend
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # your admin login
python manage.py runserver
```

While designing, run `npm run dev` in `frontend` (http://localhost:5180) next to
`python manage.py runserver`. The dev server reloads on every save and forwards booking requests to Django.

## Things to fill in before launch

Open `frontend/src/content/site.js`:

1. **CONTACT**: Green Hills' own phone, WhatsApp (digits only, e.g. `96512345678`), email and Instagram. Empty values stay hidden.
2. **BRANDS**: Wok n Roll, Dine and Luma, with each branch's hours, phone and map link. Brand logos live in
   `frontend/public/media/brands/` (square images, 300×300 px or larger look sharpest).
3. **Dishes**: the sample menus are suggestions. Change them to your real dishes.
4. **Photos**: put new photos in `frontend/public/media/img/`, then change the file name in `site.js`
   (e.g. `image: img('arabic-ouzi.jpg')`). Use JPG, about 1400px wide, under 400 KB.
5. **Logo**: the current logo file is small (232×82). Send a large PNG or SVG and replace
   `frontend/public/media/logo-light@3x.png` (used on the dark header) and `logo@3x.png`.

After any change, run `npm run build` again inside `frontend`.

## The bookings admin

`/admin` → **Booking requests**:
- every request has a reference like `GH-261008-K7QM` (the customer sees it too)
- filter by status, event type, governorate or date; search by name, phone or company
- open a booking to see all details, a one-click WhatsApp link, and add team notes
- select bookings → *Actions* → mark as contacted / quote sent / confirmed / completed / cancelled
- *Export selected to Excel (CSV)*, which keeps Arabic text intact

**Email alerts (optional):** copy `backend/.env.example` to `backend/.env`, set
`BOOKING_NOTIFY_EMAILS` and the SMTP settings, and every new booking is emailed to the team.

## Going live on Render

The repository includes `render.yaml` (at the repository root) and `green-hills/build.sh`.

1. On render.com: **New → Blueprint** → connect GitHub → choose the **Catering** repository → **Apply**.
2. Render asks for the secret values:
   - `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_EMAIL`, `DJANGO_SUPERUSER_PASSWORD`: your admin login (created on the first deploy)
   - `BOOKING_NOTIFY_EMAILS`: optional, leave empty for now
3. Wait for the first deploy (about 5 minutes). Your site is live at `https://green-hills.onrender.com` (or the name Render shows),
   and the admin panel at `/admin`.

Every push to GitHub redeploys automatically.

Free-plan limits:
- the website sleeps after 15 minutes without visitors; the next visitor waits about a minute
- the free database **expires after 30 days**. Upgrade it to a paid plan in Render before then, or bookings are deleted.

Own domain: Render → the `green-hills` service → **Settings → Custom Domains**, then add the DNS records it shows, and add the
domain to `DJANGO_ALLOWED_HOSTS` and `DJANGO_CSRF_TRUSTED_ORIGINS` (with `https://`) in **Environment**.

## Built-in protection on the booking form
- Validation in the browser and again on the server (dates, Kuwaiti phone number, guest count, allowed options)
- Hidden honeypot field against spam bots
- Rate limit: 6 requests per 10 minutes per visitor
- A customer's unfinished form is remembered on their device until they send it

## Tests

```bash
cd backend && python manage.py test bookings
```
