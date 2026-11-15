# ETHIODROUGHT launch commands

The frontend and `/api/v1` backend are part of the same Next.js application. There is no separate backend process or frontend launch command; one command starts both.

## Install

Run once from the project directory:

```powershell
npm ci
```

## Development: frontend and backend

```powershell
Set-Location 'C:\Users\ezraa\Desktop\nasaSA'
$env:SMS_MODE = 'sample'
$env:ADMIN_API_TOKEN = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
$env:ADMIN_REVIEWER_ID = 'local-reviewer'
$env:CORS_ORIGINS = 'http://localhost:3000'
npm run dev
```

Open the frontend at [http://localhost:3000](http://localhost:3000). The API is served by the same process under `http://localhost:3000/api/v1`.

## Production: frontend and backend

Set production secrets in the process environment or secret manager, then run:

```powershell
npm run build
npm start
```

Keep `SMS_MODE=sample` unless a separately reviewed SMS provider is implemented. Email sending is disabled unless `EMAIL_MODE=smtp` and valid SMTP credentials are configured. The default email recipient is `ezraambaw@gmail.com`; change it with `ALERT_EMAIL_RECIPIENT`. Gmail SMTP defaults to `smtp.gmail.com:465`; use a Google App Password in `EMAIL_SMTP_PASS`, not your account password. Never commit credentials or expose them through `NEXT_PUBLIC_*`.

Email alerts currently support only reviewed **sample-workflow** notifications; the app has no verified environmental observations and cannot issue a real drought warning. To change the email provider or recipient, set `EMAIL_SMTP_HOST`, `EMAIL_SMTP_PORT`, `EMAIL_SMTP_SECURE`, `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASS`, `EMAIL_FROM_ADDRESS`, and `ALERT_EMAIL_RECIPIENT` before starting Next.
