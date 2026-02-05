// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://shuraim-travel-agency-production.up.railway.app';

export const API_ENDPOINTS = {
  // Auth
  ADMIN_LOGIN: '/api/auth/admin/login',
  AGENCY_REGISTER: '/api/auth/agency/register',
  AGENCY_LOGIN: '/api/auth/agency/login',

  // Flights
  GET_FLIGHTS: '/api/admin/flights',
  CREATE_FLIGHT: '/api/admin/flights',
  GET_FLIGHT: (id) => `/api/admin/flights/${id}`,
  UPDATE_FLIGHT: (id) => `/api/admin/flights/${id}`,
  DELETE_FLIGHT: (id) => `/api/admin/flights/${id}/cancel`,
  SEARCH_FLIGHTS: '/api/admin/flights/search',
  GET_SEAT_AVAILABILITY: (id) => `/api/admin/flights/${id}/availability`,

  // Agencies
  GET_ALL_AGENCIES: '/api/admin/agencies',
  GET_PENDING_AGENCIES: '/api/admin/agencies/pending',
  APPROVE_AGENCY: (id) => `/api/admin/agencies/${id}/approve`,
  REJECT_AGENCY: (id) => `/api/admin/agencies/${id}/reject`,
  BLOCK_AGENCY: (id) => `/api/admin/agencies/${id}/block`,

  // Bookings
  CREATE_BOOKING: '/api/bookings',
  GET_ALL_BOOKINGS: '/api/bookings',
  GET_MY_BOOKINGS: '/api/bookings/my-bookings',
  GET_BOOKING: (id) => `/api/bookings/${id}`,
  CANCEL_BOOKING: (id) => `/api/bookings/${id}/cancel`,

  // E-Tickets
  DOWNLOAD_TICKET: (bookingId) => `/api/tickets/download/${bookingId}`,
  GET_TICKET_DETAILS: (bookingId) => `/api/tickets/${bookingId}`,

  // Dashboard
  ADMIN_STATS: '/api/dashboard/admin/stats',
  AGENCY_STATS: '/api/dashboard/agency/stats'
};

// Role constants
export const ROLES = {
  ADMIN: 'admin',
  AGENCY: 'agency'
};

// Status constants
export const STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
  CANCELLED: 'cancelled',
  HOLD: 'hold',
  SOLD: 'sold'
};

// Flight class
export const FLIGHT_CLASS = {
  ECONOMY: 'economy',
  BUSINESS: 'business'
};
