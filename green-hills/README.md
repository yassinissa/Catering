# Green Hills Catering — website

Arabic / English catering website with an event-booking form.
**Frontend:** React (Vite) · **Backend:** Django (bookings and all website content managed in the Django admin panel).

```
green-hills/
├── frontend/              React website
│   ├── public/media/      ← the original photos, videos and logo
│   └── src/content/
│       ├── site.js        ← built-in content (copied into the admin on first setup) + booking-form options
│       └── strings.js     ← buttons and booking-form text (EN + AR); headings are editable in the admin
└── backend/
    ├── bookings/          booking API + bookings admin
    └── content/           website content admin (texts, photos, videos, menus, restaurants, social links)
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

## Editing the website (admin → Website content)

Everything below is changed at `/admin` and shows on the website as soon as you press **Save** (reload the page).
No rebuild is needed.

| Admin page | What you can change |
|---|---|
| **Contact, logo & photos** | phone, WhatsApp, email, the logo, the two "Who we are" photos |
| **Social media links** | add / edit / hide / reorder Instagram, TikTok, Snapchat, X, Facebook, YouTube, LinkedIn… (shown in the footer) |
| **Page texts** | every heading and paragraph in English and Arabic. Filter by section on the right. Put `*stars*` around words in a title to make them green italic. Select texts → *Restore the original text* to undo |
| **Videos** | upload/replace reels, captions, order, hide; pick which three play in the top banner |
| **Cuisines** | add new cuisines, change photo, tagline and sample menu dishes |
| **Service styles / Event types** | change names, descriptions, photos, order, hide (these can't be added: their ids are saved with bookings) |
| **Ramadan packages** | add / edit / hide, with photos |
| **Restaurants** | Wok n Roll, Dine, Luma (or new ones): logo, Instagram, hotline, branches with hours, phone and map link |

Every list has **Position** (lower shows first) and **Show on website** columns you can change right in the list.

Photos: JPG/PNG/WebP up to 10 MB, about 1400px wide. Videos: MP4, vertical, up to 60 MB (shorter is faster for visitors).

The content was copied from `frontend/src/content/site.js` and `strings.js` on the first `migrate`. Those files are
now only the fallback for a static preview, so change things in the admin instead.

**Before launch:** fill in Green Hills' phone, WhatsApp and email, add the social links, and replace the sample dishes
with your real menus.

### Photos & videos on Render (Cloudinary)

Render's free plan erases uploaded files at every deploy, so uploads are kept on **Cloudinary** (free: 25 GB).

1. Create a free account at https://cloudinary.com.
2. On the Cloudinary **Dashboard**, copy the **API environment variable**: it looks like
   `cloudinary://123456789:abcDEF@your-cloud-name`.
3. Render → the `green-hills` service → **Environment** → add `CLOUDINARY_URL` with that value → **Save** (it redeploys).

Until this is set, the admin shows a warning on every upload page. Locally, uploads are saved in `backend/media/`.

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
   - `CLOUDINARY_URL`: for photo/video uploads, see *Photos & videos on Render* above
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
cd backend && python manage.py test bookings content
```
