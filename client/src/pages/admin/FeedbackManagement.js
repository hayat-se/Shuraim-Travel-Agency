import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/Management.css';

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyMap, setReplyMap] = useState({});

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/feedback/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(response.data);
      setError('');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error loading feedback';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateFeedback = async (feedbackId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/feedback/admin/${feedbackId}`, {
        status,
        adminReply: replyMap[feedbackId] || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadFeedback();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error updating feedback';
      setError(message);
    }
  };

  if (loading) return <div className="loading">Loading feedback...</div>;

  return (
    <div className="management-container">
      <h1>Agency Feedback</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <h2>Feedback</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Agency</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Message</th>
              <th>Status</th>
              <th>Reply</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {feedback.length === 0 ? (
              <tr>
                <td colSpan="8">No feedback yet.</td>
              </tr>
            ) : (
              feedback.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>{item.agency?.agencyName || 'Agency'}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className="rating-stars">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <i key={i} className="fa-solid fa-star"></i>
                      ))}
                    </span>
                  </td>
                  <td>{item.message}</td>
                  <td><span className={`status ${item.status}`}>{item.status}</span></td>
                  <td>
                    <input
                      type="text"
                      value={replyMap[item.id] || ''}
                      onChange={(e) => setReplyMap((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="Optional reply"
                    />
                  </td>
                  <td>
                    <div className="actions">
                      {item.status !== 'reviewed' && (
                        <button className="btn-approve" onClick={() => updateFeedback(item.id, 'reviewed')}>
                          Mark Reviewed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackManagement;
