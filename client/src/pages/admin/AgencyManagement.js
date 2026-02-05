import React, { useState, useEffect } from 'react';
import apiClient from '../../config/axiosConfig';
import '../../styles/Management.css';

const AgencyManagement = () => {
  const [agencies, setAgencies] = useState([]);
  const [pendingAgencies, setPendingAgencies] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const pendingResponse = await apiClient.get('/api/admin/agencies/pending');
      const allResponse = await apiClient.get('/api/admin/agencies');

      setPendingAgencies(Array.isArray(pendingResponse.data) ? pendingResponse.data : []);
      setAgencies(Array.isArray(allResponse.data) ? allResponse.data : []);
    } catch (error) {
      console.error('Error fetching agencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (agencyId) => {
    try {
      setActionId(agencyId);
      await apiClient.put(`/api/admin/agencies/${agencyId}/approve`, {});
      alert('Agency approved successfully!');
      fetchAgencies();
    } catch (error) {
      alert(error.response?.data?.error || 'Error approving agency');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (agencyId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        setActionId(agencyId);
        await apiClient.put(`/api/admin/agencies/${agencyId}/reject`, { reason });
        alert('Agency rejected!');
        fetchAgencies();
      } catch (error) {
        alert(error.response?.data?.error || 'Error rejecting agency');
      } finally {
        setActionId(null);
      }
    }
  };

  const handleBlock = async (agencyId) => {
    if (window.confirm('Are you sure you want to block this agency?')) {
      try {
        setActionId(agencyId);
        await apiClient.put(`/api/admin/agencies/${agencyId}/block`, {});
        alert('Agency blocked!');
        fetchAgencies();
      } catch (error) {
        alert(error.response?.data?.error || 'Error blocking agency');
      } finally {
        setActionId(null);
      }
    }
  };

  const matchesSearch = (agency) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const values = [
      agency.agencyName,
      agency.contactPerson,
      agency.email,
      agency.city
    ];
    return values.some((value) => value?.toLowerCase().includes(term));
  };

  const filteredPending = pendingAgencies.filter(matchesSearch);
  const filteredAll = agencies.filter((agency) => {
    const statusMatch = statusFilter === 'all' || agency.status === statusFilter;
    return statusMatch && matchesSearch(agency);
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="management-container">
      <h1>Agency Management</h1>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Approvals ({pendingAgencies.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Agencies ({agencies.length})
        </button>
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          type="text"
          placeholder="Search by agency, contact, email, or city"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {activeTab === 'all' && (
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
          </select>
        )}
      </div>

      {activeTab === 'pending' && (
        <div className="table-container">
          <h2>Pending Agency Requests</h2>
          {filteredPending.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Agency Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map(agency => (
                  <tr key={agency.id}>
                    <td>{agency.agencyName}</td>
                    <td>{agency.contactPerson}</td>
                    <td>{agency.email}</td>
                    <td>{agency.phone}</td>
                    <td>{agency.city}</td>
                    <td className="actions">
                      <button 
                        className="btn-approve"
                        onClick={() => handleApprove(agency.id)}
                        disabled={actionId === agency.id}
                      >
                        <i className="fa-solid fa-check"></i>
                        {actionId === agency.id ? ' Approving...' : ' Approve'}
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleReject(agency.id)}
                        disabled={actionId === agency.id}
                      >
                        <i className="fa-solid fa-times"></i>
                        {actionId === agency.id ? ' Rejecting...' : ' Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div className="table-container">
          <h2>All Agencies</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agency Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>City</th>
                <th>Total Bookings</th>
                <th>Revenue (PKR)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAll.map(agency => (
                <tr key={agency.id}>
                  <td>{agency.agencyName}</td>
                  <td>{agency.contactPerson}</td>
                  <td>{agency.email}</td>
                  <td>{agency.city}</td>
                  <td>{agency.totalBookings}</td>
                  <td>{agency.totalRevenue.toLocaleString()}</td>
                  <td><span className={`status ${agency.status}`}>{agency.status}</span></td>
                  <td className="actions">
                    {agency.status === 'approved' && (
                      <button 
                        className="btn-block"
                        onClick={() => handleBlock(agency.id)}
                        disabled={actionId === agency.id}
                      >
                        <i className="fa-solid fa-ban"></i>
                        {actionId === agency.id ? ' Blocking...' : ' Block'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgencyManagement;
