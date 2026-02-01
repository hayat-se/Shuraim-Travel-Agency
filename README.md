# Shuraim Air Travel & Tours

Production-ready B2B flight booking platform for travel agencies.

## Tech Stack

- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB

## Environment

Create server environment variables in server/.env:

```
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_password
EMAIL_FROM=noreply@yourdomain.com
SMS_API_KEY=your_sms_key
```

## Run Locally

Server:

```
cd server
npm install
npm start
```

Client:

```
cd client
npm install
npm start
```

## Build for Production

```
cd client
npm run build
```

Serve the build output via a static host or your reverse proxy.

## Folder Structure

```
client/   # React app
server/   # Express API
```

## Deployment

See DEPLOYMENT.md for a concise production checklist.

## License

Proprietary. All rights reserved.
