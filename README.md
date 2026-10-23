# WorkOrder – Maintenance Department Management System

Static web app (HTML, CSS, JavaScript). Upload the three files together to any web host
(`index.html`, `style.css`, `script.js`) and open `index.html`.

## First sign-in (administrator)

- Email: `admin@ui.edu.ng`
- Temporary password: `ChangeMe123`

The app forces a new password on the first sign-in. After that, remove sample data from
Settings > Sample data if you want to start clean.

## Roles

| Role | Can do |
|------|--------|
| User (anyone who signs up) | Send requests (faults, service requests, complaints, suggestions), follow them, message the team |
| Technician | See assigned tickets, update status, write field reports |
| Administrator | Everything, plus Users and Activity Log pages |

Admins promote a user to Technician or Administrator in Users > Edit.

## Forgotten passwords

1. Sign-up asks for a security question. Forgot password on the sign-in screen checks the answer and lets the person choose a new password.
2. If they cannot answer, "Ask the administrator" creates a request. The admin sees it in Users and issues a temporary password; the user must choose a new one at next sign-in.

## Important limitation

Data is stored in each visitor's own browser (localStorage). Accounts, requests and the activity
log are NOT shared between different devices or browsers, so an administrator only sees activity
that happened in the same browser. To share data between everyone (and to send real reset emails),
the app needs a backend and database. Passwords are salted and hashed, but browser-only storage is
not secure enough for sensitive production use.
