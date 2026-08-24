import React, { useState, useEffect } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import apiClient from '../../config/axiosConfig';
import { API_BASE_URL } from '../../config/api';
import { PageHeader, Card, Badge, Skeleton, EmptyState, useToast } from '../../components/ui';

function CopyRow({ label, value, mono }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      <div className="flex items-center gap-2 rounded-sm border border-neutral-200 bg-neutral-50 px-3 py-2">
        <span className={`min-w-0 flex-1 break-all text-sm text-neutral-800 ${mono ? 'font-mono tracking-wide' : ''}`}>{value}</span>
        <button
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-primary px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-primary-600"
        >
          {copied ? <FiCheck size={12} /> : <FiCopy size={12} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function Banks() {
  const toast = useToast();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await apiClient.get('/api/banks');
      setBanks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load banks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Available Banks" subtitle="Copy the account details, transfer, then submit proof under Payments." />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72" />)}
        </div>
      ) : banks.length === 0 ? (
        <Card><div className="p-6"><EmptyState title="No banks available" message="The admin hasn’t added any bank accounts yet." /></div></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {banks.map((bank) => (
            <Card key={bank.id} hoverable className="p-5">
              {bank.imageUrl && (
                <div className="mb-4 flex h-28 items-center justify-center overflow-hidden rounded-sm bg-neutral-100">
                  <img src={`${API_BASE_URL}${bank.imageUrl}`} alt={bank.bankName} className="h-full w-full object-contain" />
                </div>
              )}
              <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-3">
                <h3 className="text-base font-semibold text-ink">{bank.bankName}</h3>
                <Badge tone="success">Active</Badge>
              </div>
              <div className="space-y-3">
                <CopyRow label="Account Title" value={bank.accountTitle} />
                <CopyRow label="Account Number" value={bank.accountNumber} mono />
                {bank.iban && <CopyRow label="IBAN" value={bank.iban} mono />}
                {(bank.branchName || bank.branchCode) && (
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Branch</p>
                    <p className="text-sm text-neutral-700">{bank.branchName}{bank.branchCode ? ` (${bank.branchCode})` : ''}</p>
                  </div>
                )}
                {bank.city && (
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">City</p>
                    <p className="text-sm text-neutral-700">{bank.city}</p>
                  </div>
                )}
                {bank.branchAddress && (
                  <div>
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Branch Address</p>
                    <p className="text-sm text-neutral-700">{bank.branchAddress}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
