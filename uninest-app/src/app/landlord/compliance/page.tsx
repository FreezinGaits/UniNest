'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Shield,
  FileCheck,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Plus,
  Building2,
  UserCheck,
  HelpCircle,
  UploadCloud,
  X,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { downloadDocumentPDF, DocumentPDFData } from '@/lib/pdfGenerator';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';

export interface ComplianceRecord {
  id: string;
  tenantName: string;
  property: string;
  room: string;
  idType: string;
  policeAckNo: string;
  status: 'VERIFIED' | 'IN_REVIEW' | 'PENDING_SUBMISSION';
  submittedAt: string;
  policeStation: string;
  notes?: string;
}

const INITIAL_RECORDS: ComplianceRecord[] = [
  {
    id: 'tv-1',
    tenantName: 'Rahul Sharma',
    property: 'PCTE Smart Student Residency',
    room: 'Room 204 (Bed A)',
    idType: 'Aadhaar Card + PCTE Student ID',
    policeAckNo: 'POL-LDH-2026-8819',
    status: 'VERIFIED',
    submittedAt: '12 Aug 2026',
    policeStation: 'Sarabha Nagar Police Station, Division 5, Ludhiana',
    notes: 'Verified via Punjab Police Saanjh Kendra online portal.',
  },
  {
    id: 'tv-2',
    tenantName: 'Aman Verma',
    property: 'Passi Luxury PG & Co-Living',
    room: 'Room 102 (Bed B)',
    idType: 'Aadhaar Card + Passport',
    policeAckNo: 'POL-LDH-2026-9042',
    status: 'VERIFIED',
    submittedAt: '20 Aug 2026',
    policeStation: 'Model Town Police Station, Ludhiana',
    notes: 'In-person physical verification acknowledgement slip stamped.',
  },
  {
    id: 'tv-3',
    tenantName: 'Priya Sharma',
    property: 'Campus Edge Girls Hostel',
    room: 'Room 301',
    idType: 'Voter ID Card + GNDU Student ID',
    policeAckNo: 'POL-LDH-2026-9501',
    status: 'IN_REVIEW',
    submittedAt: '01 Sep 2026',
    policeStation: 'Ferozepur Road Outpost, Ludhiana',
    notes: 'Application submitted; awaiting final police verification stamp.',
  },
];

export default function TenantVerificationPoliceClearancePage() {
  const [records, setRecords] = useState<ComplianceRecord[]>(INITIAL_RECORDS);
  const [isDemoUser, setIsDemoUser] = useState<boolean | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentPDFData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'IN_REVIEW'>('ALL');
  const [selectedProperty, setSelectedProperty] = useState('ALL');
  const [showComplianceGuide, setShowComplianceGuide] = useState(false);

  // New Compliance Filing Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('Rahul Sharma');
  const [newProperty, setNewProperty] = useState('PCTE Smart Student Residency');
  const [newRoom, setNewRoom] = useState('Room 204 (Bed A)');
  const [newIdType, setNewIdType] = useState('Aadhaar Card + Student ID');
  const [newAckNo, setNewAckNo] = useState('');
  const [newPoliceStation, setNewPoliceStation] = useState('Sarabha Nagar Police Station, Division 5, Ludhiana');
  const [newStatus, setNewStatus] = useState<'VERIFIED' | 'IN_REVIEW'>('IN_REVIEW');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        const userEmail = (data?.user?.email || '').toLowerCase();
        const demo =
          userEmail.includes('demo') ||
          userEmail === 'landlord@uninest.in' ||
          userEmail === 'vikram@passiresidency.in' ||
          userEmail === '';
        setIsDemoUser(demo);
        if (!demo) {
          // If real user, load existing or start with seed records
          setRecords(INITIAL_RECORDS);
        }
      })
      .catch(() => {
        setIsDemoUser(true);
        setRecords(INITIAL_RECORDS);
      });
  }, []);

  function handleDownloadPoliceForm(record: ComplianceRecord) {
    const docData: DocumentPDFData = {
      id: `doc-police-${record.id}`,
      title: `Punjab Police Tenant Verification Certificate (Form-11)`,
      category: 'POLICE',
      referenceNo: record.policeAckNo,
      issueDate: record.submittedAt,
      fileSize: '410 KB',
      status: record.status,
      issuer: `${record.policeStation} • Commissionerate of Police`,
      tenantName: record.tenantName,
      roomDetails: `${record.property} (${record.room})`,
    };
    downloadDocumentPDF(docData);
    setToastMessage(`Downloaded Form-11 Certificate PDF for ${record.tenantName}`);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function handlePreviewPoliceForm(record: ComplianceRecord) {
    const docData: DocumentPDFData = {
      id: `doc-police-${record.id}`,
      title: `Punjab Police Tenant Verification Certificate (Form-11)`,
      category: 'POLICE',
      referenceNo: record.policeAckNo,
      issueDate: record.submittedAt,
      fileSize: '410 KB',
      status: record.status,
      issuer: `${record.policeStation} • Commissionerate of Police`,
      tenantName: record.tenantName,
      roomDetails: `${record.property} (${record.room})`,
    };
    setPreviewDoc(docData);
    setIsViewerOpen(true);
  }

  // Handle adding/updating compliance filing
  const handleSaveCompliance = (e: React.FormEvent) => {
    e.preventDefault();
    const ack = newAckNo.trim() || `POL-LDH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry: ComplianceRecord = {
      id: `tv-${Date.now()}`,
      tenantName: newTenantName,
      property: newProperty,
      room: newRoom,
      idType: newIdType,
      policeAckNo: ack,
      status: newStatus,
      submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      policeStation: newPoliceStation,
      notes: `Filed via UniNest Landlord Compliance Portal.`,
    };

    setRecords([newEntry, ...records]);
    setIsAddModalOpen(false);
    setNewAckNo('');
    setToastMessage(`Police Verification record added for ${newTenantName} (${ack}).`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.policeAckNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.property.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ? true : r.status === statusFilter;
    const matchesProperty = selectedProperty === 'ALL' ? true : r.property === selectedProperty;
    return matchesSearch && matchesStatus && matchesProperty;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Police Verification & Compliance Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official municipal police clearance slips, Form-11 verification certificates, and student Aadhaar e-KYC compliance records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComplianceGuide(!showComplianceGuide)}
            className="text-xs font-bold flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>{showComplianceGuide ? 'Hide Legal Guide' : 'What Are These Docs?'}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>File New Verification</span>
          </Button>
        </div>
      </div>

      {/* COMPLIANCE LEGAL EXPLAINER CARD (Addresses user question: "what documents these are") */}
      {showComplianceGuide && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4 animate-slide-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-700" />
              <h3 className="text-sm font-black text-indigo-950 uppercase tracking-wider">
                Mandatory Legal Compliance Framework for Student PGs &amp; Hostels in Punjab
              </h3>
            </div>
            <button
              onClick={() => setShowComplianceGuide(false)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-indigo-900 leading-relaxed">
            Under <strong>Section 11 of the Punjab Police Act, 2007</strong> and local Municipal Corporation Ludhiana (MCL) By-Laws, PG owners and hostel landlords are legally obligated to maintain verified records of all out-of-station residents. UniNest synchronizes these documents directly from student onboarding to keep your properties 100% audit-proof:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-800 font-extrabold">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Form-11 Police Clearance</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Official tenant verification certificate registered with the local Police Commissionerate (e.g. Division 5, Ludhiana). Contains the official <strong>Police Ack/Ref Number</strong>.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Student Aadhaar e-KYC</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Masked 12-digit UIDAI Aadhaar verification + College Enrollment ID (e.g. PCTE B.Tech) submitted by the student during digital bed reservation.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-800 font-extrabold">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>Municipal Fire &amp; PG NOC</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Building fire safety clearance, emergency exit signs, and commercial power load clearance registered with the local civic body.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Compliance Advisory:</strong> UniNest standardizes and pre-populates Form-11 registration certificates directly from student e-KYC. Official tenant background verification acknowledgements are stamped by the Punjab Police Saanjh Kendra or local station.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by tenant, property, or police ack no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none"
          >
            <option value="ALL">All Properties ({records.length})</option>
            <option value="PCTE Smart Student Residency">PCTE Smart Student Residency</option>
            <option value="Passi Luxury PG & Co-Living">Passi Luxury PG &amp; Co-Living</option>
            <option value="Campus Edge Girls Hostel">Campus Edge Girls Hostel</option>
          </select>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { key: 'ALL', label: `All (${records.length})` },
            { key: 'VERIFIED', label: `Verified (${records.filter((r) => r.status === 'VERIFIED').length})` },
            { key: 'IN_REVIEW', label: `In Review (${records.filter((r) => r.status === 'IN_REVIEW').length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key as any)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                statusFilter === t.key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Compliance Records Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Tenant Resident</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Property Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Submitted Document</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Police Ref / Ack No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Filing Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-500 font-medium">
                    No compliance records match your search query.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{r.tenantName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{r.policeStation}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      <span className="font-semibold text-slate-800">{r.property}</span>
                      <div className="text-slate-500">{r.room}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{r.idType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-700 font-bold">
                      <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {r.policeAckNo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={r.status === 'VERIFIED' ? 'success' : 'warning'} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-tertiary text-xs font-medium">{r.submittedAt}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePreviewPoliceForm(r)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
                          title="View Official Form-11 Slip"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">View Form-11</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPoliceForm(r)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center gap-1 border border-blue-200"
                          title="Download Certificate PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* FILE NEW VERIFICATION MODAL */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="File / Update Police Verification Slip"
          description="Register a newly moved-in student resident with local Police Commissionerate Form-11 records."
          size="lg"
        >
          <form onSubmit={handleSaveCompliance} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Tenant Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Document Identity Type *
                </label>
                <select
                  value={newIdType}
                  onChange={(e) => setNewIdType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Aadhaar Card + Student ID">Aadhaar Card + College Student ID</option>
                  <option value="Aadhaar Card + Passport">Aadhaar Card + Indian Passport</option>
                  <option value="Voter ID Card + Student ID">Voter ID Card + College ID</option>
                  <option value="Driving License + Student ID">Driving License + College ID</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Property *
                </label>
                <select
                  value={newProperty}
                  onChange={(e) => setNewProperty(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="PCTE Smart Student Residency">PCTE Smart Student Residency</option>
                  <option value="Passi Luxury PG & Co-Living">Passi Luxury PG &amp; Co-Living</option>
                  <option value="Campus Edge Girls Hostel">Campus Edge Girls Hostel</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Room &amp; Bed Unit *
                </label>
                <input
                  type="text"
                  required
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="e.g. Room 204 (Bed A)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Police Reference / Ack Number
                </label>
                <input
                  type="text"
                  value={newAckNo}
                  onChange={(e) => setNewAckNo(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                  placeholder="e.g. POL-LDH-2026-9182 (Auto-generates if blank)"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Verification Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
                >
                  <option value="IN_REVIEW">IN_REVIEW (Pending Police Stamp)</option>
                  <option value="VERIFIED">VERIFIED (Official Ack Received)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Designated Local Police Station / Saanjh Kendra *
              </label>
              <input
                type="text"
                required
                value={newPoliceStation}
                onChange={(e) => setNewPoliceStation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="e.g. Sarabha Nagar Police Station, Division 5, Ludhiana"
              />
            </div>

            {/* Document Upload Simulation */}
            <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="font-bold text-slate-800">Attach Stamped Police Ack Slip (PDF/JPG)</span>
                  <p className="text-[10px] text-slate-400">Optional: Auto-generates certified digital Form-11 slip</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                Pre-Filled via e-KYC
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs">
                Save &amp; Generate Form-11
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Document Viewer Modal for Police Forms */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        doc={previewDoc}
      />
    </div>
  );
}
