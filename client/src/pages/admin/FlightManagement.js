import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import AIRPORT_CITIES, { AIRPORT_COUNTRIES } from '../../config/airportCities';
import {
  PageHeader, Button, Table, Badge, Modal, ConfirmDialog, FormField, Input, Select, useToast,
} from '../../components/ui';

const initialFormState = {
  airlineName: '',
  flightNumber: '',
  departureCity: '',
  destinationCity: '',
  departureDate: '',
  departureTime: '',
  arrivalDate: '',
  arrivalTime: '',
  flightClass: 'economy',
  group: 'ALL',
  status: 'active',
  meal: 'Yes',
  baggage: '20kg',
  totalSeatsAvailable: '',
  pricePerSeat: '',
};

const formatDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const CityOptions = () =>
  AIRPORT_COUNTRIES.map((country) => (
    <optgroup key={country} label={country}>
      {AIRPORT_CITIES.filter((a) => a.country === country).map((a) => (
        <option key={a.code} value={`${a.city} (${a.code})`}>
          {a.city} ({a.code})
        </option>
      ))}
    </optgroup>
  ));

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
    try {
      const res = await apiClient.get('/api/airlines/active');
      setAirlines(Array.isArray(res.data) ? res.data : []);
    } catch { /* non-fatal */ }
  };
  const fetchGroups = async () => {
    try {
      const res = await apiClient.get('/api/groups/admin');
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch { /* non-fatal */ }
  };

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
    setFormData({
      airlineName: flight.airlineName || '',
      flightNumber: flight.flightNumber || '',
      departureCity: flight.departureCity || '',
      destinationCity: flight.destinationCity || '',
      departureDate: formatDate(flight.departureDate),
      departureTime: flight.departureTime || '',
      arrivalDate: formatDate(flight.arrivalDate),
      arrivalTime: flight.arrivalTime || '',
      flightClass: flight.flightClass || 'economy',
      group: flight.group || 'ALL',
      status: flight.status || 'active',
      meal: flight.meal || 'No',
      baggage: flight.baggage || '20kg',
      totalSeatsAvailable: flight.totalSeatsAvailable || '',
      pricePerSeat: flight.pricePerSeat || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let groupCode = formData.group;
      if (typeof groupCode === 'string' && groupCode.includes(' ')) groupCode = groupCode.split(' ')[0];
      const payload = {
        ...formData,
        group: groupCode,
        totalSeatsAvailable: Number(formData.totalSeatsAvailable),
        pricePerSeat: Number(formData.pricePerSeat),
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
            {airline?.logoUrl && (
              <img src={`${API_BASE_URL}${airline.logoUrl}`} alt="" className="h-5 w-7 shrink-0 rounded-sm object-contain" />
            )}
            <span className="font-medium text-neutral-900">{f.airlineName}</span>
          </div>
        );
      },
    },
    { key: 'flightNumber', header: 'Flight #', render: (f) => <span className="font-mono">{f.flightNumber}</span> },
    { key: 'route', header: 'Route', render: (f) => `${f.departureCity} → ${f.destinationCity}` },
    { key: 'departureDate', header: 'Departure', render: (f) => new Date(f.departureDate).toLocaleDateString('en-GB') },
    { key: 'flightClass', header: 'Class', render: (f) => <span className="capitalize">{f.flightClass}</span> },
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
        <form id="flight-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Airline" htmlFor="airlineName" required>
            <Select id="airlineName" name="airlineName" value={formData.airlineName} onChange={handleChange} required>
              <option value="">Select airline</option>
              {airlines.map((a) => (
                <option key={a.id} value={a.name}>{a.name}{a.code ? ` (${a.code})` : ''}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Flight Number" htmlFor="flightNumber" required>
            <Input id="flightNumber" name="flightNumber" value={formData.flightNumber} onChange={handleChange} placeholder="e.g. PK-309" required />
          </FormField>

          <FormField label="Departure City" htmlFor="departureCity" required>
            <Select id="departureCity" name="departureCity" value={formData.departureCity} onChange={handleChange} required>
              <option value="">Select city</option>
              <CityOptions />
            </Select>
          </FormField>
          <FormField label="Destination City" htmlFor="destinationCity" required>
            <Select id="destinationCity" name="destinationCity" value={formData.destinationCity} onChange={handleChange} required>
              <option value="">Select city</option>
              <CityOptions />
            </Select>
          </FormField>

          <FormField label="Departure Date" htmlFor="departureDate" required>
            <Input id="departureDate" type="date" name="departureDate" value={formData.departureDate} onChange={handleChange} required />
          </FormField>
          <FormField label="Departure Time" htmlFor="departureTime" required>
            <Input id="departureTime" type="time" name="departureTime" value={formData.departureTime} onChange={handleChange} required />
          </FormField>
          <FormField label="Arrival Date" htmlFor="arrivalDate" required>
            <Input id="arrivalDate" type="date" name="arrivalDate" value={formData.arrivalDate} onChange={handleChange} required />
          </FormField>
          <FormField label="Arrival Time" htmlFor="arrivalTime" required>
            <Input id="arrivalTime" type="time" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} required />
          </FormField>

          <FormField label="Class" htmlFor="flightClass">
            <Select id="flightClass" name="flightClass" value={formData.flightClass} onChange={handleChange}>
              <option value="economy">Economy</option>
              <option value="business">Business</option>
            </Select>
          </FormField>
          <FormField label="Group" htmlFor="group">
            <Select id="group" name="group" value={formData.group} onChange={handleChange}>
              <option value="ALL">ALL Groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.code || g.name}>{g.name || g.code}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Total Seats" htmlFor="totalSeatsAvailable" required>
            <Input id="totalSeatsAvailable" type="number" name="totalSeatsAvailable" value={formData.totalSeatsAvailable} onChange={handleChange} placeholder="e.g. 180" required />
          </FormField>
          <FormField label="Fare per Seat (PKR)" htmlFor="pricePerSeat" required>
            <Input id="pricePerSeat" type="number" name="pricePerSeat" value={formData.pricePerSeat} onChange={handleChange} placeholder="e.g. 85000" required />
          </FormField>

          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </Select>
          </FormField>
          <FormField label="Meal" htmlFor="meal">
            <Select id="meal" name="meal" value={formData.meal} onChange={handleChange}>
              <option value="Yes">Meal: Yes</option>
              <option value="No">Meal: No</option>
            </Select>
          </FormField>
          <FormField label="Baggage" htmlFor="baggage" className="sm:col-span-2">
            <Input id="baggage" name="baggage" value={formData.baggage} onChange={handleChange} placeholder="e.g. 20kg, 30kg" />
          </FormField>
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
