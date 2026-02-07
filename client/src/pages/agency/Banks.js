import React, { useState, useEffect } from 'react';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import '../../styles/Finance.css';

const Banks = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedBank, setCopiedBank] = useState(null);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/banks');
      setBanks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load banks');
      console.error('Error fetching banks:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, bankId) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bankId);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  if (loading) {
    return (
      <div className="finance-container">
        <div className="loading-spinner">Loading banks...</div>
      </div>
    );
  }

  return (
    <div className="finance-container">
      <div className="finance-header">
        <h1>Available Banks</h1>
        <p>Select a bank and copy the account details for payment transfer</p>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {banks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><i className="fa-solid fa-university"></i></div>
          <h2>No Banks Available</h2>
          <p>The admin has not added any bank accounts yet. Please check back later.</p>
        </div>
      ) : (
        <div className="banks-grid">
          {banks.map((bank) => (
            <div key={bank.id} className="bank-card">
              {bank.imageUrl && (
                <div className="bank-image">
                  <img
                    src={`${API_BASE_URL}${bank.imageUrl}`}
                    alt={bank.bankName}
                  />
                </div>
              )}
              <div className="bank-header">
                <h3>{bank.bankName}</h3>
                <span className="bank-status">Active</span>
              </div>

              <div className="bank-details">
                <div className="detail-item">
                  <label>Account Title</label>
                  <div className="detail-value-with-copy">
                    <span>{bank.accountTitle}</span>
                    <button
                      className={`copy-btn ${copiedBank === bank.id ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(bank.accountTitle, bank.id)}
                      title="Copy to clipboard"
                    >
                      <i className={`fa-solid ${copiedBank === bank.id ? 'fa-check' : 'fa-copy'}`}></i>
                      {copiedBank === bank.id ? ' Copied' : ' Copy'}
                    </button>
                  </div>
                </div>

                <div className="detail-item">
                  <label>Account Number</label>
                  <div className="detail-value-with-copy">
                    <code className="account-number">{bank.accountNumber}</code>
                    <button
                      className={`copy-btn ${copiedBank === `acc-${bank.id}` ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(bank.accountNumber, `acc-${bank.id}`)}
                      title="Copy to clipboard"
                    >
                      <i className={`fa-solid ${copiedBank === `acc-${bank.id}` ? 'fa-check' : 'fa-copy'}`}></i>
                      {copiedBank === `acc-${bank.id}` ? ' Copied' : ' Copy'}
                    </button>
                  </div>
                </div>

                {bank.iban && (
                  <div className="detail-item">
                    <label>IBAN</label>
                    <div className="detail-value-with-copy">
                      <code className="account-number">{bank.iban}</code>
                      <button
                        className={`copy-btn ${copiedBank === `iban-${bank.id}` ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(bank.iban, `iban-${bank.id}`)}
                        title="Copy to clipboard"
                      >
                        <i className={`fa-solid ${copiedBank === `iban-${bank.id}` ? 'fa-check' : 'fa-copy'}`}></i>
                        {copiedBank === `iban-${bank.id}` ? ' Copied' : ' Copy'}
                      </button>
                    </div>
                  </div>
                )}

                {(bank.branchName || bank.branchCode) && (
                  <div className="detail-item">
                    <label>Branch</label>
                    <p className="branch-info">
                      {bank.branchName}{bank.branchCode ? ` (${bank.branchCode})` : ''}
                    </p>
                  </div>
                )}

                {bank.city && (
                  <div className="detail-item">
                    <label>City</label>
                    <p className="branch-info">{bank.city}</p>
                  </div>
                )}

                {bank.branchAddress && (
                  <div className="detail-item">
                    <label>Branch Address</label>
                    <p className="branch-info">{bank.branchAddress}</p>
                  </div>
                )}
              </div>

              <div className="bank-footer">
                <p className="instruction">Use these details for your payment transfer, then submit proof in the Payments section.</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .banks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 24px;
          margin-top: 40px;
        }

        .bank-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .bank-card:hover {
          border-color: #667eea;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.12);
          transform: translateY(-4px);
        }

        .bank-image {
          width: 100%;
          height: 140px;
          margin-bottom: 16px;
          border-radius: 8px;
          overflow: hidden;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bank-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .bank-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f1f5f9;
        }

        .bank-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .bank-status {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .bank-details {
          margin-bottom: 20px;
        }

        .detail-item {
          margin-bottom: 20px;
        }

        .detail-item label {
          display: block;
          font-weight: 600;
          color: #475569;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .detail-value-with-copy {
          display: flex;
          gap: 8px;
          align-items: center;
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .detail-value-with-copy span,
        .detail-value-with-copy code {
          flex: 1;
          word-break: break-all;
        }

        .account-number {
          font-family: 'Courier New', monospace;
          font-weight: 600;
          color: #1e293b;
          letter-spacing: 1px;
        }

        .copy-btn {
          flex-shrink: 0;
          background: #667eea;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .copy-btn:hover {
          background: #5568d3;
          transform: translateY(-2px);
        }

        .copy-btn.copied {
          background: #10b981;
        }

        .branch-info {
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin: 0;
          color: #475569;
          font-size: 14px;
        }

        .bank-footer {
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .instruction {
          margin: 0;
          font-size: 13px;
          color: #64748b;
          font-style: italic;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .empty-state h2 {
          color: #1e293b;
          margin-bottom: 10px;
          font-size: 24px;
        }

        .empty-state p {
          color: #64748b;
        }

        @media (max-width: 768px) {
          .banks-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Banks;
