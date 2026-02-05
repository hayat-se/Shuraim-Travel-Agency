import React, { useEffect, useState } from 'react';
import apiClient from '../../config/axiosConfig';
import '../../styles/Finance.css';

const GiveFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [form, setForm] = useState({
    rating: '5',
    category: 'general',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const response = await apiClient.get('/api/feedback/my');
      setFeedbackList(response.data);
      setError('');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error loading feedback';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    try {
      await apiClient.post('/api/feedback', {
        ...form,
        rating: Number(form.rating)
      });
      setForm({ rating: '5', category: 'general', subject: '', message: '' });
      setSuccess('Thanks for your feedback!');
      await loadFeedback();
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Error submitting feedback';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading feedback...</div>;

  return (
    <div className="finance-container">
      <h1>Give Feedback</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="notice">{success}</div>}

      <div className="finance-form">
        <h2>Submit Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <select name="rating" value={form.rating} onChange={handleChange} required>
              <option value="5">
                <i className="fa-solid fa-star"></i> 5 Stars
              </option>
              <option value="4">
                <i className="fa-solid fa-star"></i> 4 Stars
              </option>
              <option value="3">
                <i className="fa-solid fa-star"></i> 3 Stars
              </option>
              <option value="2">
                <i className="fa-solid fa-star"></i> 2 Stars
              </option>
              <option value="1">
                <i className="fa-solid fa-star"></i> 1 Star
              </option>
            </select>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="general">General</option>
              <option value="booking">Booking</option>
              <option value="payment">Payment</option>
              <option value="technical">Technical</option>
              <option value="other">Other</option>
            </select>
            <input
              type="text"
              name="subject"
              placeholder="Subject (optional)"
              value={form.subject}
              onChange={handleChange}
            />
          </div>
          <textarea
            name="message"
            placeholder="Write your feedback..."
            value={form.message}
            onChange={handleChange}
            rows="4"
            required
          />
          <div style={{ marginTop: '12px' }}>
            <button className="primary-btn" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>

      <div className="table-card">
        <h2>My Feedback</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {feedbackList.length === 0 ? (
              <tr>
                <td colSpan="5">No feedback submitted yet.</td>
              </tr>
            ) : (
              feedbackList.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>{item.category}</td>
                  <td>
                    <span className="rating-stars">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <i key={i} className="fa-solid fa-star"></i>
                      ))}
                    </span>
                  </td>
                  <td>{item.subject || '-'}</td>
                  <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GiveFeedback;
