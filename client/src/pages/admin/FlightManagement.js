import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import AIRPORT_CITIES, { AIRPORT_COUNTRIES } from '../../config/airportCities';
import {
  PageHeader, Button, Table, Badge, Modal, ConfirmDialog, FormField, Input, Select, useToast,
} from '../../components/ui';

// Per-leg fields (leg 1 is stored flat on the flight; leg 2 in `secondLeg`).
const emptyLeg = {
  airlineName: '', flightNumber: '', departureCity: '', destinationCity: '',
  departureDate: '', departureTime: '', arrivalDate: '', arrivalTime: '',
  meal: 'Yes', baggage: '20kg', pnr: '',
};

const initialFormState = {
  ...emptyLeg,
  flightType: 'direct',
  flightClass: 'economy',
  group: 'ALL',
  status: 'active',
  totalSeatsAvailable: '',
  pricePerSeat: '',
  secondLeg: { ...emptyLeg },
};

const TRIP_LABEL = { direct: 'Direct', connecting: 'Connecting', two_way: 'Two-way' };

const formatDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const CityOptions = () =>
  AIRPORT_COUNTRIES.map((country) => (
    <optgroup key={country} label={country}>
      {AIRPORT_CITIES.filter((a) => a.country === country).map((a) => (
        <option key={a.code} value={`${a.city} (${a.code})`}>{a.city} ({a.code})</option>
      ))}
    </optgroup>
  ));

/* The per-leg flight fields, reused for leg 1 and leg 2. `onField(name)` returns an onChange handler. */
function FlightSegment({ values, onField, airlines }) {
  return (
    <>
      <FormField label="Airline" required>
        <Select value={values.airlineName} onChange={onField('airlineName')} required>
          <option value="">Select airline</option>
          {airlines.map((a) => <option key={a.id} value={a.name}>{a.name}{a.code ? ` (${a.code})` : ''}</option>)}
        </Select>
      </FormField>
      <FormField label="Flight Number" required>
        <Input value={values.flightNumber} onChange={onField('flightNumber')} placeholder="e.g. PK-309" required />
      </FormField>
      <FormField label="Departure City" required>
        <Select value={values.departureCity} onChange={onField('departureCity')} required><option value="">Select city</option><CityOptions /></Select>
      </FormField>
      <FormField label="Destination City" required>
        <Select value={values.destinationCity} onChange={onField('destinationCity')} required><option value="">Select city</option><CityOptions /></Select>
      </FormField>
      <FormField label="Departure Date" required><Input type="date" value={values.departureDate} onChange={onField('departureDate')} required /></FormField>
      <FormField label="Departure Time" required><Input type="time" value={values.departureTime} onChange={onField('departureTime')} required /></FormField>
      <FormField label="Arrival Date" required><Input type="date" value={values.arrivalDate} onChange={onField('arrivalDate')} required /></FormField>
      <FormField label="Arrival Time" required><Input type="time" value={values.arrivalTime} onChange={onField('arrivalTime')} required /></FormField>
      <FormField label="Meal">
        <Select value={values.meal} onChange={onField('meal')}><option value="Yes">Meal: Yes</option><option value="No">Meal: No</option></Select>
      </FormField>
      <FormField label="Baggage"><Input value={values.baggage} onChange={onField('baggage')} placeholder="e.g. 20kg, 30kg" /></FormField>
      <FormField label="PNR" className="sm:col-span-2"><Input value={values.pnr} onChange={onField('pnr')} placeholder="e.g. 77BQGM" /></FormField>
    </>
  );
}

export default function FlightManagement() {
  const toast = useToast();
  const [flights, setFlights] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [editFlightId, setEditFlightId] = useState(null);
  const [editSeatsBooked, setEditSeatsBooked] = useState(0);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFlights();
    fetchAirlines();
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFlights = async () => {
    try {
      const res = await apiClient.get('/api/admin/flights');
      setFlights(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error fetching flights');
    } finally {
      setLoading(false);
    }
  };
  const fetchAirlines = async () => {
    try { const res = await apiClient.get('/api/airlines/active'); setAirlines(Array.isArray(res.data) ? res.data : []); } catch { /* non-fatal */ }
  };
  const fetchGroups = async () => {
    try { const res = await apiClient.get('/api/groups/admin'); setGroups(Array.isArray(res.data) ? res.data : []); } catch { /* non-fatal */ }
  };

  // Top-level field setter (leg 1 + product-level fields).
  const onField = (name) => (e) => setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  // Leg-2 field setter (writes into secondLeg).
  const onLeg2 = (name) => (e) => setFormData((prev) => ({ ...prev, secondLeg: { ...prev.secondLeg, [name]: e.target.value } }));

  const openCreate = () => {
    setIsEditing(false);
    setEditFlightId(null);
    setEditSeatsBooked(0);
    setFormData(initialFormState);
    setShowForm(true);
  };

  const openEdit = (flight) => {
    setIsEditing(true);
    setEditFlightId(flight.id);
    setEditSeatsBooked(flight.seatsBooked || 0);
    const leg2 = flight.secondLeg
      ? (typeof flight.secondLeg === 'string' ? JSON.parse(flight.secondLeg) : flight.secondLeg)
      : { ...emptyLeg };
    setFormData({
      airlineName: flight.airlineName || '',
      flightNumber: flight.flightNumber || '',
      departureCity: flight.departureCity || '',
      destinationCity: flight.destinationCity || '',
      departureDate: formatDate(flight.departureDate),
      departureTime: flight.departureTime || '',
      arrivalDate: formatDate(flight.arrivalDate),
      arrivalTime: flight.arrivalTime || '',
      meal: flight.meal || 'No',
      baggage: flight.baggage || '20kg',
      pnr: flight.pnr || '',
      flightType: flight.flightType || 'direct',
      flightClass: flight.flightClass || 'economy',
      group: flight.group || 'ALL',
      status: flight.status || 'active',
      totalSeatsAvailable: flight.totalSeatsAvailable || '',
      pricePerSeat: flight.pricePerSeat || '',
      secondLeg: {
        ...emptyLeg,
        ...leg2,
        departureDate: formatDate(leg2.departureDate),
        arrivalDate: formatDate(leg2.arrivalDate),
      },
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let groupCode = formData.group;
      if (typeof groupCode === 'string' && groupCode.includes(' ')) groupCode = groupCode.split(' ')[0];
      const isDirect = formData.flightType === 'direct';
      const payload = {
        ...formData,
        group: groupCode,
        totalSeatsAvailable: Number(formData.totalSeatsAvailable),
        pricePerSeat: Number(formData.pricePerSeat),
        secondLeg: isDirect ? null : formData.secondLeg,
      };
      if (isEditing && editFlightId) {
        payload.seatsRemaining = Math.max(0, payload.totalSeatsAvailable - editSeatsBooked);
        await apiClient.put(`/api/admin/flights/${editFlightId}`, payload);
        toast.success('Flight updated successfully');
      } else {
        await apiClient.post('/api/admin/flights', payload);
        toast.success('Flight created successfully');
      }
      setShowForm(false);
      fetchFlights();
    } catch (err) {
      toast.error(err.response?.data?.error || (isEditing ? 'Error updating flight' : 'Error creating flight'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/admin/flights/${deleteTarget.id}`);
      toast.success(`Flight ${deleteTarget.flightNumber} deleted`);
      setDeleteTarget(null);
      fetchFlights();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error deleting flight');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'airlineName',
      header: 'Airline',
      render: (f) => {
        const airline = airlines.find((a) => a.name === f.airlineName);
        return (
          <div className="flex items-center gap-2">
            {airline?.logoUrl && <img src={`${API_BASE_URL}${airline.logoUrl}`} alt="" className="h-5 w-7 shrink-0 rounded-sm object-contain" />}
            <span className="font-medium text-neutral-900">{f.airlineName}</span>
          </div>
        );
      },
    },
    { key: 'flightNumber', header: 'Flight #', render: (f) => <span className="font-mono">{f.flightNumber}</span> },
    {
      key: 'route',
      header: 'Route',
      render: (f) => (
        <div className="flex items-center gap-2">
          <span>{f.departureCity} → {f.destinationCity}</span>
          {f.flightType && f.flightType !== 'direct' && (
            <span className="rounded-sm bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary-700">{TRIP_LABEL[f.flightType]}</span>
          )}
        </div>
      ),
    },
    { key: 'departureDate', header: 'Departure', render: (f) => new Date(f.departureDate).toLocaleDateString('en-GB') },
    { key: 'pnr', header: 'PNR', render: (f) => <span className="font-mono text-xs">{f.pnr || '—'}</span> },
    { key: 'seats', header: 'Seats', render: (f) => `${f.seatsBooked}/${f.totalSeatsAvailable}` },
    { key: 'pricePerSeat', header: 'Price', align: 'right', render: (f) => `PKR ${Number(f.pricePerSeat).toLocaleString()}` },
    { key: 'status', header: 'Status', render: (f) => <Badge status={f.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (f) => (
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="outline" icon={<FiEdit2 size={13} />} onClick={() => openEdit(f)}>Edit</Button>
          <Button size="sm" variant="danger" icon={<FiTrash2 size={13} />} onClick={() => setDeleteTarget(f)}>Delete</Button>
        </div>
      ),
    },
  ];

  const isDirect = formData.flightType === 'direct';

  return (
    <div>
      <PageHeader
        title="Flight Management"
        subtitle="Add, edit and cancel flight inventory."
        actions={<Button icon={<FiPlus size={15} />} onClick={openCreate}>Add Flight</Button>}
      />

      <Table columns={columns} data={flights} loading={loading} rowKey="id" emptyTitle="No flights yet" emptyMessage="Add your first flight to get started." />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={isEditing ? 'Edit Flight' : 'Add Flight'}
        size="2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" form="flight-form" loading={saving}>{isEditing ? 'Update Flight' : 'Add Flight'}</Button>
          </>
        }
      >
        <form id="flight-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Trip type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Trip Type" htmlFor="flightType">
              <Select id="flightType" value={formData.flightType} onChange={onField('flightType')}>
                <option value="direct">Direct Flight</option>
                <option value="connecting">Connecting Flight</option>
                <option value="two_way">Two-way Flight</option>
              </Select>
            </FormField>
          </div>

          {/* Leg 1 */}
          <div>
            {!isDirect && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-700">Flight 1</p>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FlightSegment values={formData} onField={onField} airlines={airlines} />
            </div>
          </div>

          {/* Leg 2 (connecting / two-way) */}
          {!isDirect && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-700">Flight 2</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FlightSegment values={formData.secondLeg} onField={onLeg2} airlines={airlines} />
              </div>
            </div>
          )}

          {/* Product-level fields (once) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Class" htmlFor="flightClass">
              <Select id="flightClass" value={formData.flightClass} onChange={onField('flightClass')}>
                <option value="economy">Economy</option>
                <option value="business">Business</option>
              </Select>
            </FormField>
            <FormField label="Group" htmlFor="group">
              <Select id="group" value={formData.group} onChange={onField('group')}>
                <option value="ALL">ALL Groups</option>
                {groups.map((g) => <option key={g.id} value={g.code || g.name}>{g.name || g.code}</option>)}
              </Select>
            </FormField>
            <FormField label="Total Seats" htmlFor="totalSeatsAvailable" required>
              <Input id="totalSeatsAvailable" type="number" value={formData.totalSeatsAvailable} onChange={onField('totalSeatsAvailable')} placeholder="e.g. 180" required />
            </FormField>
            <FormField label="Fare per Seat (PKR)" htmlFor="pricePerSeat" required>
              <Input id="pricePerSeat" type="number" value={formData.pricePerSeat} onChange={onField('pricePerSeat')} placeholder="e.g. 85000" required />
            </FormField>
            <FormField label="Status" htmlFor="status">
              <Select id="status" value={formData.status} onChange={onField('status')}>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </Select>
            </FormField>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete flight?"
        message={deleteTarget ? `Permanently delete flight ${deleteTarget.flightNumber} (${deleteTarget.departureCity} → ${deleteTarget.destinationCity})? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
