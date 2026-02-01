# Airline Agency Management System - Backend

Professional B2B Airline Agency Management Platform for Pakistan

## Features

- **Admin Dashboard**: Complete analytics and flight management
- **Flight Management**: Add, edit, and cancel flights
- **Agency Management**: Approve/reject agency registration requests
- **Booking System**: Quantity-based flight booking with seat management
- **PDF E-Tickets**: Auto-generated professional e-tickets with QR codes
- **Email Notifications**: HTML email templates for confirmations
- **SMS Notifications**: Pakistan-ready SMS integration
- **Security**: JWT-based authentication with role-based access control

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with configuration:
```bash
cp .env.example .env
```

3. Update `.env` with your settings:
- MongoDB connection URL
- JWT secret key
- Email configuration (Gmail or any SMTP)
- SMS API credentials

4. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/agency/register` - Agency registration request
- `POST /api/auth/agency/login` - Agency login

### Flights (Admin)
- `POST /api/admin/flights` - Create flight
- `GET /api/admin/flights` - Get all flights
- `GET /api/admin/flights/:flightId` - Get flight details
- `GET /api/admin/flights/search` - Search flights
- `PUT /api/admin/flights/:flightId` - Update flight
- `DELETE /api/admin/flights/:flightId/cancel` - Cancel flight

### Agencies (Admin)
- `GET /api/admin/agencies` - Get all agencies
- `GET /api/admin/agencies/pending` - Get pending approvals
- `PUT /api/admin/agencies/:agencyId/approve` - Approve agency
- `PUT /api/admin/agencies/:agencyId/reject` - Reject agency
- `PUT /api/admin/agencies/:agencyId/block` - Block agency

### Bookings
- `POST /api/bookings` - Create booking (Agency)
- `GET /api/bookings` - Get all bookings (Admin)
- `GET /api/bookings/my-bookings` - Get agency bookings
- `GET /api/bookings/:bookingId` - Get booking details
- `PUT /api/bookings/:bookingId/cancel` - Cancel booking (Admin)

### E-Tickets
- `GET /api/tickets/download/:bookingId` - Download e-ticket PDF
- `GET /api/tickets/:bookingId` - Get ticket details

### Dashboard
- `GET /api/dashboard/admin/stats` - Admin statistics
- `GET /api/dashboard/agency/stats` - Agency statistics

## Database Models

- **Admin**: Super Admin users
- **Agency**: Partner agencies with approval status
- **Flight**: Flight information with availability
- **Booking**: Flight bookings with passenger details
- **AuditLog**: Activity logging for compliance

## Services

- **Email Service**: Nodemailer integration for confirmations
- **SMS Service**: API-ready SMS integration for Pakistan
- **PDF Service**: PDFKit-based e-ticket generation with QR codes

## Security Features

- Bcrypt password hashing
- JWT token-based authentication
- Role-based access control (Admin/Agency)
- Email verification system
- Overbooking prevention
- Audit logging

## Configuration

### Email Setup
1. Create a Gmail app password
2. Add to `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@airlineagency.com
```

### SMS Setup
Compatible with Pakistan SMS providers:
- Jazz SMS API
- Zong SMS API
- Telenor SMS API

Add to `.env`:
```
SMS_API_KEY=your_api_key
SMS_PROVIDER=your_provider_name
```

## Error Handling

The system includes comprehensive error handling:
- Input validation
- Database error management
- Transaction rollback for booking failures
- Detailed error messages for debugging

## Production Deployment

1. Set `NODE_ENV=production`
2. Use environment-specific `.env` file
3. Enable HTTPS
4. Configure CORS for frontend domain
5. Set strong JWT secret
6. Use production email/SMS credentials

## Support

For issues or questions, contact: support@airlineagency.com
