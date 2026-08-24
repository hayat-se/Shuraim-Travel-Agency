import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiArrowLeft, FiSend } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { Card, CardBody, Button, FormField, Input, Select, Skeleton, EmptyState, useToast } from '../../components/ui';

const PKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;
const blankPassenger = () => ({ givenName: '', surname: '', title: 'MR.', passport: '', dob: '', doe: '' });

export default function BookingForm() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [flight, setFlight] = useState(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [passengers, setPassengers] = useState([blankPassenger()]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get(`/api/admin/flights/${flightId}`);
        setFlight(res.data);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Error fetching flight');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightId]);

  const handleSeatsChange = (e) => {
    const seats = parseInt(e.target.value, 10);
    setSeatsToBook(seats);
    setPassengers(Array.from({ length: seats }, () => blankPassenger()));
  };

  const setField = (index, field, value) =>
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.givenName || !p.surname || !p.passport) {
        toast.error(`Fill Given Name, Surname and Passport # for Passenger ${i + 1}`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const isAgency = localStorage.getItem('token') && localStorage.getItem('user');
      const endpoint = isAgency ? '/api/bookings' : '/api/bookings/guest';
      await apiClient.post(endpoint, { flightId, seatsBooked: seatsToBook, passengers });
      toast.success('Booking confirmed! Check your email for the e-ticket.');
      navigate('/agency/search-flights');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error creating booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (!flight) return <Card><div className="p-6"><EmptyState title="Flight not found" /></div></Card>;

  const totalPrice = flight.pricePerSeat * seatsToBook;

  return (
    <div className="mx-auto max-w-5xl">
      <button onClick={() => navigate('/agency/search-flights')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-primary">
        <FiArrowLeft size={15} /> Back to search
      </button>

      {/* Flight summary */}
      <Card variant="brand" className="mb-5">
        <CardBody>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">{flight.airlineName} · {flight.flightNumber}</h2>
              <p className="mt-1 text-sm text-white/80">{flight.departureCity} → {flight.destinationCity}</p>
            </div>
            <p className="text-sm text-white/80">
              {new Date(flight.departureDate).toLocaleDateString('en-GB')} · {flight.departureTime}
            </p>
          </div>
        </CardBody>
      </Card>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card>
            <CardBody>
              <FormField label="Seats to book" htmlFor="seats" hint={`Available seats: ${flight.seatsRemaining}`}>
                <Select id="seats" value={seatsToBook} onChange={handleSeatsChange} className="max-w-[200px]">
                  {Array.from({ length: Math.min(flight.seatsRemaining, 10) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} Seat{i + 1 > 1 ? 's' : ''}</option>
                  ))}
                </Select>
              </FormField>
            </CardBody>
          </Card>

          {passengers.map((p, index) => (
            <Card key={index}>
              <CardBody>
                <h4 className="mb-4 text-sm font-semibold text-ink">Passenger {index + 1}</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField label="Given Name" required>
                    <Input value={p.givenName} onChange={(e) => setField(index, 'givenName', e.target.value)} placeholder="e.g. Muhammad" required />
                  </FormField>
                  <FormField label="Surname" required>
                    <Input value={p.surname} onChange={(e) => setField(index, 'surname', e.target.value)} placeholder="e.g. Khan" required />
                  </FormField>
                  <FormField label="Title">
                    <Select value={p.title} onChange={(e) => setField(index, 'title', e.target.value)}>
                      {['MR.', 'MRS.', 'MS.', 'MSTR.', 'MISS'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </FormField>
                  <FormField label="Passport #" required>
                    <Input value={p.passport} onChange={(e) => setField(index, 'passport', e.target.value)} placeholder="e.g. FP1417751" required />
                  </FormField>
                  <FormField label="Date of Birth">
                    <Input type="date" value={p.dob} onChange={(e) => setField(index, 'dob', e.target.value)} />
                  </FormField>
                  <FormField label="Passport Expiry">
                    <Input type="date" value={p.doe} onChange={(e) => setField(index, 'doe', e.target.value)} />
                  </FormField>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Sticky summary */}
        <div>
          <Card className="lg:sticky lg:top-4">
            <CardBody>
              <h3 className="mb-4 text-sm font-semibold text-ink">Booking Summary</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-neutral-500">Price per seat</dt><dd className="font-medium text-ink">{PKR(flight.pricePerSeat)}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Seats</dt><dd className="font-medium text-ink">{seatsToBook}</dd></div>
                <div className="mt-3 flex justify-between border-t border-neutral-200 pt-3">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd className="text-lg font-bold text-primary">{PKR(totalPrice)}</dd>
                </div>
              </dl>
              <Button type="submit" size="lg" className="mt-5 w-full" icon={submitting ? null : <FiCheck size={16} />} loading={submitting}>
                Confirm Booking
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
                <FiSend size={12} /> E-ticket emailed on confirmation
              </p>
            </CardBody>
          </Card>
        </div>
      </form>
    </div>
  );
}
