# Airline Agency Management System - Frontend

Professional B2B Airline Agency Management Platform Frontend

## Features

- **Responsive Design**: Mobile-friendly interface
- **Admin Dashboard**: Analytics and management tools
- **Agency Dashboard**: Booking and account management
- **Flight Search**: Advanced search and filtering
- **Booking Management**: Quantity-based bookings with passenger details
- **E-Ticket Management**: Download and manage tickets
- **Role-Based UI**: Different interfaces for Admin and Agency

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

3. Build for production:
```bash
npm build
```

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Navigation.js
│   │   └── PrivateRoute.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── AdminLogin.js
│   │   │   ├── AgencyLogin.js
│   │   │   └── AgencyRegister.js
│   │   ├── admin/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── FlightManagement.js
│   │   │   ├── AgencyManagement.js
│   │   │   └── AllBookings.js
│   │   └── agency/
│   │       ├── AgencyDashboard.js
│   │       ├── SearchFlights.js
│   │       ├── BookingForm.js
│   │       └── MyBookings.js
│   ├── styles/
│   │   ├── Navigation.css
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   ├── Management.css
│   │   ├── Search.css
│   │   ├── Booking.css
│   │   └── MyBookings.css
│   ├── App.js
│   ├── index.js
│   └── index.css
└── public/
    └── index.html
```

## Key Pages

### Admin Pages
- **Admin Dashboard**: Overview of flights, bookings, agencies, and revenue
- **Flight Management**: Create, edit, and cancel flights
- **Agency Management**: Approve/reject agency requests
- **All Bookings**: View and manage all bookings

### Agency Pages
- **Agency Dashboard**: Overview of bookings and revenue
- **Search Flights**: Search and filter available flights
- **Booking Form**: Book flights with passenger details
- **My Bookings**: View booking history and download e-tickets

### Auth Pages
- **Admin Login**: Secure admin authentication
- **Agency Login**: Agency account login
- **Agency Register**: Agency registration request form

## Design Features

- **Professional Theme**: Enterprise-friendly color scheme
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Clear Navigation**: Intuitive menu structure
- **Data Tables**: Sortable and filterable tables
- **Forms**: Validated input forms with error handling
- **Status Indicators**: Visual status badges for flights, bookings, and agencies

## Backend Integration

The frontend communicates with the backend API at `http://localhost:5000`

Update the API endpoint in `App.js` if using a different backend URL:
```javascript
const API_URL = 'http://your-backend-url';
```

## Authentication

- Login credentials are stored in localStorage
- JWT tokens are sent with each API request
- Automatic logout on token expiration
- Redirect to login for unauthorized access

## State Management

- React hooks for local state management
- axios for API communication
- Context API for user authentication

## Testing

Test credentials (after setup):

**Admin:**
- Email: admin@airline.com
- Password: admin123

**Agency (after approval):**
- Register new account
- Wait for admin approval
- Use registered credentials to login

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance

- Code splitting with React Router
- Lazy loading components
- Optimized CSS files
- Minimal external dependencies

## Known Limitations

- Seat map visualization not included (quantity-based booking only)
- Real-time updates require page refresh
- SMS notifications use API-ready template (requires SMS provider setup)

## Future Enhancements

- Real-time notifications using WebSockets
- Advanced reporting and analytics
- Multi-language support
- Dark mode
- Payment gateway integration
- Refund management system

## Support

For issues or questions, contact: support@airlineagency.com
