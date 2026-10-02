'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Download,
  FilePlus,
  Eye,
  Lock,
  Edit3,
  Archive,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  FolderLock,
  Users,
  FileText,
  Building,
  HelpCircle,
} from 'lucide-react';
import { downloadDocumentPDF } from '@/lib/pdfGenerator';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { DocumentItem } from '@/lib/documentsStore';

export default function RentalAgreementsRecordsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Vikram Singh (Passi Group)');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Modals state
  const [viewerDoc, setViewerDoc] = useState<any | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditDoc, setSelectedEditDoc] = useState<DocumentItem | null>(null);

  // Upload Form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'PROPERTY' | 'AGREEMENT' | 'RECEIPT' | 'AUDIT'>('PROPERTY');
  const [uploadProperty, setUploadProperty] = useState('PCTE Smart Student Residency');
  const [uploadShareScope, setUploadShareScope] = useState<'ALL_TENANTS' | 'PRIVATE_LANDLORD'>('ALL_TENANTS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form state
  const [editTitle, setEditTitle] = useState('');
  const [editProperty, setEditProperty] = useState('');
  const [editShareScope, setEditShareScope] = useState<'ALL_TENANTS' | 'PRIVATE_LANDLORD'>('ALL_TENANTS');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/documents?role=LANDLORD');
      if (res.ok) {
        const data = await res.json();
        if (data.documents && Array.isArray(data.documents)) {
          setDocs(data.documents);
        }
      }
    } catch (err) {
      console.error('Failed to fetch landlord documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();

    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.name) setUserName(data.user.name);
      })
      .catch(() => {});
  }, []);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
    setIsUploadModalOpen(true);
    e.target.value = '';
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      alert('Please enter a document title');
      return;
    }

    setIsSubmitting(true);
    const sizeKB = uploadFile ? Math.max(1, Math.round(uploadFile.size / 1024)) : 350;
    const formattedSize = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    try {
      const res = await fetch('/api/demo/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle.trim(),
          category: uploadCategory,
          property: uploadProperty,
          sharedWithTenant: uploadShareScope === 'ALL_TENANTS',
          sharedScope: uploadShareScope,
          fileSize: formattedSize,
          issuer: `${userName} (PG Management)`,
          tenantName: uploadShareScope === 'ALL_TENANTS' ? 'All PG Tenants' : userName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.document) {
          setDocs((prev) => [data.document, ...prev]);
          showToast(`Document "${data.document.title}" saved & shared with tenants successfully!`);
          setIsUploadModalOpen(false);
          setUploadFile(null);
          setUploadTitle('');
        }
      } else {
        alert('Failed to save document. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading doc:', err);
      alert('Network error while saving document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (doc: DocumentItem) => {
    if (doc.isPlatformLocked) {
      alert('This is a legally binding platform contract and cannot be modified.');
      return;
    }
    setSelectedEditDoc(doc);
    setEditTitle(doc.title);
    setEditProperty(doc.property);
    setEditShareScope(doc.sharedWithTenant ? 'ALL_TENANTS' : 'PRIVATE_LANDLORD');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditDoc) return;

    try {
      const res = await fetch('/api/demo/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedEditDoc.id,
          patch: {
            title: editTitle.trim(),
            property: editProperty,
            sharedWithTenant: editShareScope === 'ALL_TENANTS',
            sharedScope: editShareScope,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDocs((prev) =>
          prev.map((d) => (d.id === selectedEditDoc.id ? { ...d, ...data.document } : d))
        );
        showToast(`Document updated successfully!`);
        setIsEditModalOpen(false);
        setSelectedEditDoc(null);
      } else {
        alert('Failed to update document.');
      }
    } catch (err) {
      console.error('Edit document error:', err);
    }
  };

  const handleArchive = async (doc: DocumentItem) => {
    if (doc.isPlatformLocked) {
      alert(
        'Action Denied: Platform contracts (Leases, Escrow Deposits, Rent Receipts, Handover Audits) are legally binding and immutable. They cannot be archived or removed.'
      );
      return;
    }

    const confirmArchive = window.confirm(
      `Archive "${doc.title}"?\n\nThe document will be safely archived and hidden from student tenants while preserving audit history.`
    );
    if (!confirmArchive) return;

    try {
      const res = await fetch(`/api/demo/documents?id=${doc.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== doc.id));
        showToast(`Document "${doc.title}" archived safely.`);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to archive document.');
      }
    } catch (err) {
      console.error('Archive error:', err);
    }
  };

  const handleDownloadPdf = (d: DocumentItem) => {
    downloadDocumentPDF({
      id: d.id,
      title: d.title,
      category: d.category,
      referenceNo: d.referenceNo,
      issueDate: d.issueDate,
      fileSize: d.fileSize,
      status: d.status,
      issuer: d.issuer,
      tenantName: d.tenantName,
      roomDetails: d.property,
      amount: d.amount,
      paymentMethod: d.paymentMethod,
      transactionId: d.transactionId,
    });
  };

  const handleViewDoc = (d: DocumentItem) => {
    setViewerDoc({
      id: d.id,
      title: d.title,
      category: d.category,
      referenceNo: d.referenceNo,
      issueDate: d.issueDate,
      fileSize: d.fileSize,
      status: d.status,
      issuer: d.issuer,
      tenantName: d.tenantName,
      roomDetails: d.property,
      amount: d.amount,
      paymentMethod: d.paymentMethod,
      transactionId: d.transactionId,
    });
    setIsViewerOpen(true);
  };

  // Filter logic
  const filterOptions = [
    { key: 'ALL', label: 'All Records' },
    { key: 'AGREEMENT', label: 'Lease Deeds' },
    { key: 'RECEIPT', label: 'Rent & Escrow Receipts' },
    { key: 'KYC', label: 'KYC & Police NOC' },
    { key: 'AUDIT', label: 'Move-In Audits' },
    { key: 'PROPERTY', label: 'Property Rules & Notices' },
  ];

  const filteredDocs = docs.filter((d) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'KYC') return d.category === 'KYC' || d.category === 'POLICE' || d.category === 'COLLEGE';
    return d.category === selectedFilter;
  });

  const platformCount = docs.filter((d) => d.isPlatformLocked).length;
  const customCount = docs.filter((d) => !d.isPlatformLocked).length;
  const sharedCount = docs.filter((d) => d.sharedWithTenant).length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hidden File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.png"
        onChange={handleSelectFile}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Rental Agreements & Document Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete compliance repository: Digital e-signed 11-month leases, escrow deposit receipts, KYC verifications, and property rule notices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <FilePlus className="w-4 h-4" /> Upload Document / Notice
          </Button>
        </div>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-emerald-700 text-white text-xs font-bold p-3.5 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[11px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-200">
            Real-Time Synced
          </span>
        </div>
      )}

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Documents</div>
          <div className="text-xl font-black text-slate-900 mt-1">{docs.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all properties</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> Platform Locked
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">{platformCount}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Immutable Legal Contracts</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-purple-600" /> Landlord Uploads
          </div>
          <div className="text-xl font-black text-purple-700 mt-1">{customCount}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-0.5">Rules, Notices & NOCs</div>
        </div>
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-600" /> Tenant Shared
          </div>
          <div className="text-xl font-black text-blue-700 mt-1">{sharedCount}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Visible to Student Tenants</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedFilter(opt.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors border ${
              selectedFilter === opt.key
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Document Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm">
          Loading document records...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
          No documents found for this filter. Click &quot;Upload Document / Notice&quot; above to add property rules or NOCs.
        </div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Document Name & Size</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Associated Tenant & PG</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Protection Level</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tenant Access</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <span>{d.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="font-mono">{d.referenceNo}</span>
                        <span>•</span>
                        <span>{d.fileSize}</span>
                        <span>•</span>
                        <span>Issued {d.issueDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-bold text-slate-800">{d.tenantName || 'All PG Tenants'}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-xs">{d.property}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                        {d.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {d.isPlatformLocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                          <Lock className="w-3 h-3 text-emerald-600" /> Platform Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-bold">
                          <Edit3 className="w-3 h-3 text-purple-600" /> Landlord Upload
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {d.sharedWithTenant ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          <Users className="w-3 h-3" /> Shared in Vault
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Private (Landlord Only)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2.5 py-1 font-bold border-slate-200 hover:bg-slate-100"
                          onClick={() => handleViewDoc(d)}
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 mr-1" /> View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs px-2.5 py-1 font-bold border-slate-200 hover:bg-slate-100"
                          onClick={() => handleDownloadPdf(d)}
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> PDF
                        </Button>

                        {/* Edit & Archive for Landlord Uploads */}
                        {!d.isPlatformLocked && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1 border-purple-200 hover:bg-purple-50 text-purple-700"
                              onClick={() => handleOpenEdit(d)}
                              title="Edit metadata"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1 border-rose-200 hover:bg-rose-50 text-rose-600"
                              onClick={() => handleArchive(d)}
                              title="Archive safely (preserves audit log)"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Upload Document / Notice Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Property Document / Notice"
        size="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
          {uploadFile && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">{uploadFile.name}</span>
              </div>
              <span className="text-slate-400">
                {(uploadFile.size / 1024).toFixed(0)} KB
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Document Title *
            </label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g., Hostel Code of Conduct, Sub-meter Electricity Rules, Municipal NOC"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Document Category
              </label>
              <select
                value={uploadCategory}
                onChange={(e: any) => setUploadCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              >
                <option value="PROPERTY">Property Rules & Guidelines</option>
                <option value="AGREEMENT">Custom Addendum / Lease</option>
                <option value="RECEIPT">Utility / Bill Receipt</option>
                <option value="AUDIT">Inspection / Maintenance Audit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Property
              </label>
              <select
                value={uploadProperty}
                onChange={(e) => setUploadProperty(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              >
                <option value="PCTE Smart Student Residency">PCTE Smart Student Residency</option>
                <option value="Passi Luxury PG & Co-Living">Passi Luxury PG & Co-Living</option>
                <option value="All Managed Properties">All Managed Properties</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-blue-900">Share with PG Student Tenants</div>
                <div className="text-[11px] text-blue-700">
                  Instantly publish to Student Document Vault for tenants of this property.
                </div>
              </div>
              <input
                type="checkbox"
                checked={uploadShareScope === 'ALL_TENANTS'}
                onChange={(e) =>
                  setUploadShareScope(e.target.checked ? 'ALL_TENANTS' : 'PRIVATE_LANDLORD')
                }
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              {isSubmitting ? 'Uploading...' : 'Save & Synchronize'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Document Metadata Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Document Settings"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Document Title *
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Property
            </label>
            <select
              value={editProperty}
              onChange={(e) => setEditProperty(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
            >
              <option value="PCTE Smart Student Residency">PCTE Smart Student Residency</option>
              <option value="Passi Luxury PG & Co-Living">Passi Luxury PG & Co-Living</option>
              <option value="All Managed Properties">All Managed Properties</option>
            </select>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">Publish in Student Vault</div>
              <div className="text-[11px] text-slate-500">
                Visible to student tenants residing in the assigned property.
              </div>
            </div>
            <input
              type="checkbox"
              checked={editShareScope === 'ALL_TENANTS'}
              onChange={(e) =>
                setEditShareScope(e.target.checked ? 'ALL_TENANTS' : 'PRIVATE_LANDLORD')
              }
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Update Document
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        doc={viewerDoc}
      />
    </div>
  );
}
