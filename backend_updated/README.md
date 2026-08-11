# Faculty Lecture Hall Management — Backend

FastAPI + SQLite backend covering: Auth, Halls, Timetable, Bookings (with automatic
conflict detection), and Notifications. Matches the entities from your proposal's
ER diagram (User, Hall, Timetable, Booking, Notification).

## 1. Setup (5 minutes)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. Run

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API base URL: `http://localhost:8000`
- Interactive docs (auto-generated, great for testing without Postman):
  `http://localhost:8000/docs`
- A `faculty.db` SQLite file is created automatically on first run — no DB setup needed.

### Connecting from your Flutter app
- Android emulator: use `http://10.0.2.2:8000` instead of `localhost`.
- Physical phone: use your laptop's local IP, e.g. `http://192.168.1.X:8000`
  (must be on the same Wi-Fi network).

## 3. API Reference

### Auth
| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | body: name, email, password, role (`student`/`lecturer`/`admin`) |
| POST | `/auth/login` | public | returns `access_token` — send as `Authorization: Bearer <token>` on all requests below |
| GET | `/auth/me` | logged in | returns current user |

### Halls
| Method | Endpoint | Access |
|---|---|---|
| GET | `/halls/` | public |
| GET | `/halls/{id}` | public |
| POST | `/halls/` | admin only |
| DELETE | `/halls/{id}` | admin only |

### Timetable
| Method | Endpoint | Access |
|---|---|---|
| GET | `/timetable/?hall_id=&batch=` | public |
| POST | `/timetable/` | lecturer/admin — **rejects with 409 if it overlaps an existing slot** |
| PUT | `/timetable/{id}` | lecturer/admin |
| DELETE | `/timetable/{id}` | lecturer/admin |

### Bookings
| Method | Endpoint | Access |
|---|---|---|
| GET | `/bookings/` | logged in — admin sees all, others see only their own |
| POST | `/bookings/` | logged in — **rejects with 409 on conflict** (checks both timetable and other bookings) |
| PUT | `/bookings/{id}/status?status=approved` | admin only — also auto-creates a notification for the booking's owner |
| DELETE | `/bookings/{id}` | owner or admin |

### Notifications
| Method | Endpoint | Access |
|---|---|---|
| GET | `/notifications/` | logged in — returns the current user's notifications, newest first |

## 4. How the "AI conflict detection" from your proposal is implemented

`conflict_check.py` checks any new timetable entry or booking against **all**
existing timetable entries and bookings for the same hall and date, using a
simple time-overlap test. If the new slot overlaps anything, the API returns
`409 Conflict` and the request is rejected before it's saved. This is what
your proposal describes as the app warning users about clashing bookings —
you can describe this in your demo/report as rule-based conflict detection
(no need to claim it's ML-based unless you actually add that later).

## 5. If you get extra time later (optional, not needed for the deadline)
- Swap the in-memory token store in `auth.py` for real JWT (`python-jose`) so
  logins survive server restarts.
- Add push notifications (Firebase Cloud Messaging) instead of just storing
  notification rows.
- Switch SQLite → MySQL for production (`database.py` has a commented example URL).
