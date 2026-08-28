import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiArrowLeft, FiUsers } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { Card, CardBody, Button, FormField, Input, Select, Textarea, Skeleton, EmptyState, useToast } from '../../components/ui';

const PKR = (n) => `PKR ${Number(n || 0).toLocaleString()}`;
const TRIP_LABEL = { connecting: 'Connecting flight', two_way: 'Two-way flight' };
const blankPassenger = (paxType) => ({ surname: '', givenName: '', title: 'MR.', passport: '', dob: '', doe: '', nationality: '', paxType });

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '—');

/* Read the logged-in agency from localStorage for the read-only contact block. */
function getAgency() {
  try { return JSON.parse(localStorage.getItem('user')) || {}; } catch { return {}; }
}

/* One flight segment rendered as the two-row summary grid from the screenshots. */
function SegmentSummary({ seg, airlineCode, fare, label }) {
  const cell = 'px-3 py-2 text-sm';
  const head = 'px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/70';
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      {label && <div className="bg-primary-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-700">{label}</div>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            <tr className="bg-ink text-white">
              <th className={head}>Sector</th><th className={head}>Airline</th><th className={head}>Airline SN</th><th className={head}>Baggage</th><th className={head}>Meal</th>{fare != null && <th className={head}>Fare</th>}
            </tr>
            <tr className="border-b border-neutral-200 text-ink">
              <td className={cell}>{seg.departureCity} → {seg.destinationCity}</td>
              <td className={cell}>{seg.airlineName}</td>
              <td className={cell}>{airlineCode ? `(${airlineCode})` : '—'}</td>
              <td className={cell}>{seg.baggage || '—'}</td>
              <td className={cell}>{seg.meal || '—'}</td>
              {fare != null && <td className={`${cell} font-semibold`}>{Number(fare).toLocaleString()}</td>}
            </tr>
            <tr className="bg-ink text-white">
              <th className={head}>Flight No</th><th className={head}>Flight Date</th><th className={head}>Origin</th><th className={head}>Destination</th><th className={head}>Dept Time</th><th className={head}>Ar Time</th>
            </tr>
            <tr className="text-ink">
              <td className={cell}>{seg.flightNumber}</td>
              <td className={cell}>{fmtDate(seg.departureDate)}</td>
              <td className={cell}>{seg.departureCity}</td>
              <td className={cell}>{seg.destinationCity}</td>
              <td className={cell}>{seg.departureTime}</td>
              <td className={cell}>{seg.arrivalTime}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BookingForm() {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const agency = useMemo(getAgency, []);

  const [flight, setFlight] = useState(null);
  const [airlines, setAirlines] = useState([]);
  const [counts, setCounts] = useState({ adults: 1, children: 0, infants: 0 });
  const [remarks, setRemarks] = useState('');
  const [passengers, setPassengers] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [f, a] = await Promise.allSettled([
          apiClient.get(`/api/admin/flights/${flightId}`),
          apiClient.get('/api/airlines/active'),
        ]);
        if (f.status === 'fulfilled') setFlight(f.value.data);
        else toast.error(f.reason?.response?.data?.error || 'Error fetching flight');
        if (a.status === 'fulfilled') setAirlines(Array.isArray(a.value.data) ? a.value.data : []);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightId]);

  const airlineCode = (name) => airlines.find((a) => a.name === name)?.code || (flight?.flightNumber || '').split(/[\s-]/)[0];

  const total = Number(counts.adults || 0) + Number(counts.children || 0) + Number(counts.infants || 0);

  const setCount = (k) => (e) => {
    const v = Math.max(k === 'adults' ? 1 : 0, parseInt(e.target.value, 10) || 0);
    setCounts((p) => ({ ...p, [k]: v }));
    setConfirmed(false);
    setPassengers([]);
  };

  const confirmSeats = () => {
    if (total < 1) return toast.error('Add at least one passenger');
    if (flight && total > flight.seatsRemaining) return toast.error(`Only ${flight.seatsRemaining} seat(s) available`);
    const rows = [
      ...Array.from({ length: counts.adults }, () => blankPassenger('adult')),
      ...Array.from({ length: counts.children }, () => blankPassenger('child')),
      ...Array.from({ length: counts.infants }, () => blankPassenger('infant')),
    ];
    setPassengers(rows);
    setConfirmed(true);
  };

  const setField = (index, field, value) =>
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.surname || !p.givenName || !p.passport || !p.dob || !p.doe || !p.nationality) {
        return toast.error(`Complete all required fields for Passenger ${i + 1} (surname, given name, passport, DOB, expiry, nationality)`);
      }
    }
    setSubmitting(true);
    try {
      await apiClient.post('/api/bookings', {
        flightId,
        seatsBooked: total,
        adults: counts.adults,
        children: counts.children,
        infants: counts.infants,
        remarks,
        passengers,
      });
      toast.success('Booking created! Check My Bookings for the e-ticket.');
      navigate('/agency/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error creating booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl space-y-4"><Skeleton className="h-24" /><Skeleton className="h-64" /></div>;
  }
  if (!flight) return <Card><div className="p-6"><EmptyState title="Flight not found" /></div></Card>;

  const leg1 = {
    airlineName: flight.airlineName, flightNumber: flight.flightNumber,
    departureCity: flight.departureCity, destinationCity: flight.destinationCity,
    departureDate: flight.departureDate, departureTime: flight.departureTime, arrivalTime: flight.arrivalTime,
    baggage: flight.baggage, meal: flight.meal,
  };
  const leg2 = flight.flightType && flight.flightType !== 'direct' && flight.secondLeg
    ? (typeof flight.secondLeg === 'string' ? JSON.parse(flight.secondLeg) : flight.secondLeg)
    : null;

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-primary">
        <FiArrowLeft size={15} /> Back to flights
      </button>

      <h1 className="mb-4 font-display text-xl font-bold text-ink">New Booking{leg2 && <span className="ml-2 rounded-sm bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">{TRIP_LABEL[flight.flightType]}</span>}</h1>

      {/* Flight summary */}
      <div className="space-y-3">
        <SegmentSummary seg={leg1} airlineCode={airlineCode(flight.airlineName)} fare={flight.pricePerSeat} label={leg2 ? 'Flight 1' : null} />
        {leg2 && <SegmentSummary seg={leg2} airlineCode={airlineCode(leg2.airlineName)} fare={null} label="Flight 2" />}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {/* Agency contact (read-only) + remarks */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Agency"><Input value={agency.agencyName || ''} readOnly /></FormField>
              <FormField label="E-mail"><Input value={agency.email || ''} readOnly /></FormField>
              <FormField label="Mobile"><Input value={agency.phone || agency.contactPerson || ''} readOnly /></FormField>
            </div>
            <FormField label="Remarks" className="mt-4">
              <Textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="e.g. special instruction about booking" />
            </FormField>
          </CardBody>
        </Card>

        {/* Passenger counts */}
        <Card>
          <CardBody>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <FormField label="Adults" className="sm:w-32"><Input type="number" min="1" value={counts.adults} onChange={setCount('adults')} /></FormField>
              <FormField label="Child" className="sm:w-32"><Input type="number" min="0" value={counts.children} onChange={setCount('children')} placeholder="e.g. 2" /></FormField>
              <FormField label="Infant" className="sm:w-32"><Input type="number" min="0" value={counts.infants} onChange={setCount('infants')} placeholder="e.g. 1" /></FormField>
              <div className="sm:ml-2">
                <Button type="button" variant={confirmed ? 'outline' : 'primary'} icon={<FiUsers size={15} />} onClick={confirmSeats}>Confirm Seats</Button>
              </div>
              <p className="text-xs text-neutral-500 sm:ml-auto">Available seats: <span className="font-semibold text-ink">{flight.seatsRemaining}</span></p>
            </div>
          </CardBody>
        </Card>

        {/* Passenger details */}
        {confirmed && (
          <>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-800">
              Required before confirmation: Surname, Given Name, Passport Number, Birth Date (DOB), Passport Expiry (DOE), Nationality.
            </div>
            {passengers.map((p, index) => (
              <Card key={index}>
                <CardBody>
                  <h4 className="mb-4 text-sm font-semibold capitalize text-ink">Passenger {index + 1} <span className="ml-1 rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500">{p.paxType}</span></h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <FormField label="Surname" required><Input value={p.surname} onChange={(e) => setField(index, 'surname', e.target.value)} placeholder="e.g. M Arshad" required /></FormField>
                    <FormField label="Given Name" required><Input value={p.givenName} onChange={(e) => setField(index, 'givenName', e.target.value)} placeholder="e.g. Ghafoor" required /></FormField>
                    <FormField label="Title"><Select value={p.title} onChange={(e) => setField(index, 'title', e.target.value)}>{['MR.', 'MRS.', 'MS.', 'MSTR.', 'MISS'].map((t) => <option key={t} value={t}>{t}</option>)}</Select></FormField>
                    <FormField label="Passport #" required><Input value={p.passport} onChange={(e) => setField(index, 'passport', e.target.value)} placeholder="e.g. FP1417751" required /></FormField>
                    <FormField label="DOB (Birth)" required><Input type="date" value={p.dob} onChange={(e) => setField(index, 'dob', e.target.value)} required /></FormField>
                    <FormField label="DOE (Expiry)" required><Input type="date" value={p.doe} onChange={(e) => setField(index, 'doe', e.target.value)} required /></FormField>
                    <FormField label="Nationality" required className="sm:col-span-2"><Input value={p.nationality} onChange={(e) => setField(index, 'nationality', e.target.value)} placeholder="Pakistan / Pakistani" required /></FormField>
                  </div>
                </CardBody>
              </Card>
            ))}

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-neutral-600">Total <span className="font-semibold text-ink">{total}</span> passenger(s) · <span className="font-bold text-primary">{PKR(flight.pricePerSeat * total)}</span></p>
              <Button type="submit" size="lg" icon={submitting ? null : <FiCheck size={16} />} loading={submitting}>Book Now</Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
