'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Download, FilePlus } from 'lucide-react';
import { downloadDocumentPDF } from '@/lib/pdfGenerator';

interface LandlordDoc {
  id: string;
  title: string;
  tenantName: string;
  property: string;
  docType: string;
  fileSize: string;
  status: string;
  signedDate: string;
}

const DEMO_DOCUMENTS: LandlordDoc[] = [
  {
    id: 'doc-1',
    title: '11-Month Digital Student Lease Agreement',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency (Room 204)',
    docType: 'LEASE_AGREEMENT',
    fileSize: '1.4 MB',
    status: 'ACTIVE',
    signedDate: '15 Aug 2026',
  },
  {
    id: 'doc-2',
    title: 'Security Deposit Escrow Receipt (₹12,000)',
    tenantName: 'Aman Verma',
    property: 'Passi Luxury PG (Room 102)',
    docType: 'DEPOSIT_RECEIPT',
    fileSize: '450 KB',
    status: 'ACTIVE',
    signedDate: '20 Aug 2026',
  },
  {
    id: 'doc-3',
    title: 'PG Property Registration Certificate',
    tenantName: 'Passi Residency Management',
    property: 'Passi Luxury PG & Co-Living',
    docType: 'PROPERTY_LICENSE',
    fileSize: '2.8 MB',
    status: 'VERIFIED',
    signedDate: '01 Jan 2026',
  },
];

export default function RentalAgreementsRecordsPage() {
  const [docs, setDocs] = useState<LandlordDoc[]>([]);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [userName, setUserName] = useState('Property Management');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let customDocs: LandlordDoc[] = [];
    try {
      const saved = localStorage.getItem('uninest_landlord_docs');
      if (saved) customDocs = JSON.parse(saved);
    } catch {
      // ignore storage errors
    }

    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        const email = data?.user?.email?.toLowerCase() || '';
        const isDemo =
          email.includes('demo') ||
          email === 'landlord@uninest.in' ||
          email === 'vikram@passiresidency.in';
        setIsDemoUser(isDemo);
        if (data?.user?.name) setUserName(data.user.name);
        setDocs(isDemo ? [...customDocs, ...DEMO_DOCUMENTS] : customDocs);
      })
      .catch(() => {
        setDocs(customDocs);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    const newDoc: LandlordDoc = {
      id: `doc-up-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      tenantName: userName,
      property: 'Uploaded Compliance / Lease Document',
      docType: 'PROPERTY_DOCUMENT',
      fileSize: sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`,
      status: 'VERIFIED',
      signedDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    setDocs((prev) => {
      const updated = [newDoc, ...prev];
      try {
        const customOnly = updated.filter((d) => d.id.startsWith('doc-up-'));
        localStorage.setItem('uninest_landlord_docs', JSON.stringify(customOnly));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
    e.target.value = '';
  };

  const handleDownloadPdf = (d: LandlordDoc) => {
    downloadDocumentPDF({
      id: d.id,
      title: d.title,
      category: d.docType === 'DEPOSIT_RECEIPT' ? 'RECEIPT' : 'AGREEMENT',
      referenceNo: d.id.toUpperCase(),
      issueDate: d.signedDate,
      fileSize: d.fileSize,
      status: d.status,
      issuer: userName,
      tenantName: d.tenantName,
      roomDetails: d.property,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Rental Agreements & Document Vault</h1>
          <p className="text-text-secondary mt-1">
            Digital e-signed 11-month lease deeds, security deposit receipts, and municipal NOCs
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold"
          >
            <FilePlus className="w-4 h-4 mr-1.5" /> Upload Document
          </Button>
        </div>
      </div>

      {!isDemoUser && docs.length === 0 ? (
        <div className="text-center py-12 text-sm text-text-secondary">
          No documents yet. Click &quot;Upload Document&quot; above to add a lease agreement or NOC.
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-tertiary border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Document Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Associated Tenant / PG</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Signed Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-secondary/50">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{d.title}</div>
                      <div className="text-xs text-slate-400">{d.fileSize}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      <span className="font-semibold text-slate-800">{d.tenantName}</span>
                      <div className="text-slate-500">{d.property}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded text-xs">
                        {d.docType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-tertiary text-xs">{d.signedDate}</td>
                    <td className="px-4 py-3">
                      <Badge variant={d.status === 'ACTIVE' || d.status === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                        {d.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleDownloadPdf(d)}
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
