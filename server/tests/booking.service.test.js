// Unit tests for the booking concurrency guard, with Prisma fully mocked so no DB
// is needed. The key invariant: when the atomic seat-reservation updateMany matches
// zero rows (someone else took the seats), the booking is rejected.

let mockSeatsRemaining;

jest.mock('../src/config/prisma', () => {
  const tx = {
    flight: {
      findUnique: jest.fn(async () => ({
        id: 1,
        status: 'active',
        pricePerSeat: 1000,
        seatsRemaining: mockSeatsRemaining,
      })),
      updateMany: jest.fn(async ({ where }) => {
        const need = where.seatsRemaining.gte;
        return { count: mockSeatsRemaining >= need ? 1 : 0 };
      }),
    },
    booking: {
      create: jest.fn(async ({ data }) => ({ id: 99, createdAt: new Date(), ...data })),
    },
  };
  return {
    $transaction: (cb) => cb(tx),
    agency: { findUnique: jest.fn(async () => ({ email: 'a@b.com', agencyName: 'A' })) },
    booking: { update: jest.fn(async () => ({})) },
    airline: { findUnique: jest.fn(async () => null) },
  };
});

// Stub side-effecting services so the success path doesn't touch disk/network.
jest.mock('../src/services/pdfService', () => ({ generateETicket: jest.fn(async () => '/tmp/x.pdf'), TICKETS_DIR: '/tmp' }));
jest.mock('../src/services/emailService', () => ({ sendBookingConfirmationEmail: jest.fn() }));
jest.mock('../src/services/auditService', () => ({ log: jest.fn() }));

const service = require('../src/modules/booking/booking.service');

describe('booking.service — seat reservation guard', () => {
  test('rejects when passenger count does not match seats', async () => {
    await expect(
      service.createForGuest({ flightId: 1, seatsBooked: 2, passengers: [{ name: 'x', email: 'e@e.com' }] })
    ).rejects.toThrow(/must match seats/i);
  });

  test('rejects when not enough seats remain (updateMany matches 0 rows)', async () => {
    mockSeatsRemaining = 1;
    await expect(
      service.createForGuest({
        flightId: 1,
        seatsBooked: 2,
        passengers: [
          { name: 'x', email: 'e@e.com' },
          { name: 'y' },
        ],
      })
    ).rejects.toThrow(/not enough seats/i);
  });

  test('succeeds when enough seats remain', async () => {
    mockSeatsRemaining = 5;
    const result = await service.createForGuest({
      flightId: 1,
      seatsBooked: 2,
      passengers: [
        { name: 'x', email: 'e@e.com' },
        { name: 'y' },
      ],
    });
    expect(result.booking).toHaveProperty('bookingId');
    expect(result.booking.status).toBe('sold');
  });
});
