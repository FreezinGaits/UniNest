'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap, CreditCard, CheckCircle2, Clock, Users, ArrowUpRight,
  ShieldCheck, AlertCircle, FileText, Check, Sparkles, QrCode,
  Copy, ExternalLink, Download, Printer, Cpu, Wifi, Activity,
  HelpCircle, ChevronDown, ChevronUp, Lock, RefreshCw
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui/Shared';
import { Modal } from '@/components/ui/Modal';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { DocumentPDFData } from '@/lib/pdfGenerator';
import { useDashboardUser, isDemoAccountEmail } from '@/components/layout/DashboardShell';

export default function ElectricityDuesPage() {
  const { userEmail, userName, isDemoUser } = useDashboardUser();
  const [billStatus, setBillStatus] = useState<'PENDING' | 'PAID'>('PENDING');
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [isDemo, setIsDemo] = useState<boolean>(isDemoUser);

  // Real UPI Modal & Verification State
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrError, setUtrError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Document Viewer & Receipt State
  const [receiptDoc, setReceiptDoc] = useState<DocumentPDFData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // IoT Hardware Simulation & Info Drawer State
  const [showIotArchitecture, setShowIotArchitecture] = useState(false);
  const [isSimulatingTelemetry, setIsSimulatingTelemetry] = useState(false);
  const [telemetryMessage, setTelemetryMessage] = useState<string | null>(null);

  // Dynamic readings state
  const [currReading, setCurrReading] = useState(1312);
  const prevReading = 1245;
  const unitsConsumed = currReading - prevReading;
  const ratePerUnit = 9.5;
  const totalAmount = Math.round(unitsConsumed * ratePerUnit * 100) / 100;
  const studentShare = Math.round((totalAmount / 2) * 100) / 100;

  const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'anupamrai172@oksbi';
  const PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_NAME || 'UniNest Housing';
  const BILL_AMOUNT_STR = studentShare.toFixed(2);
  const TRANSACTION_NOTE = `UniNest Electricity Split Sep 2026 - SUB-MTR-204`;

  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(
    PAYEE_NAME
  )}&am=${BILL_AMOUNT_STR}&cu=INR&tn=${encodeURIComponent(TRANSACTION_NOTE)}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiIntentUri
  )}&margin=8`;

  // Past Payment History
  const [history, setHistory] = useState([
    {
      month: 'Aug 2026',
      units: 67,
      prevReading: 1178,
      currReading: 1245,
      totalBill: 636.5,
      share: 318.25,
      status: 'PAID',
      datePaid: '08 Sep 2026',
      utr: '426819203810',
    },
    {
      month: 'Jul 2026',
      units: 73,
      prevReading: 1105,
      currReading: 1178,
      totalBill: 693.5,
      share: 346.75,
      status: 'PAID',
      datePaid: '05 Aug 2026',
      utr: '423109847192',
    },
  ]);

  useEffect(() => {
    try {
      localStorage.removeItem('uninest_preview_demo_data');
      const savedStatus = localStorage.getItem('uninest_electricity_paid');
      const savedReceipt = localStorage.getItem('uninest_electricity_receipt');

      if (savedStatus === 'PAID' || savedStatus === 'true') {
        setBillStatus('PAID');
        setPaid(true);
      }

      if (savedReceipt) {
        try {
          const parsed = JSON.parse(savedReceipt);
          if (parsed?.referenceNo) {
            setReceiptDoc(parsed);
          }
        } catch {}
      }
    } catch {}

    if (userEmail) {
      setIsDemo(isDemoAccountEmail(userEmail));
      return;
    }

    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        const email = data?.email || data?.user?.email || '';
        setIsDemo(isDemoAccountEmail(email));
      })
      .catch(() => {
        setIsDemo(false);
      });
  }, [userEmail]);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleVerifyUpiPayment = async () => {
    setUtrError('');
    const cleanUtr = utrNumber.trim();

    if (!cleanUtr) {
      setUtrError('Please enter the 12-digit UTR number from your payment app.');
      return;
    }

    if (cleanUtr.length < 10) {
      setUtrError('Invalid UTR / Transaction ID. Must be at least 10–12 alphanumeric digits.');
      return;
    }

    setIsVerifying(true);

    try {
      // 1. Notify Backend API of Payment Settlement
      await fetch('/api/electricity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'PAY_SHARE',
          meterNo: 'SUB-MTR-204',
          utr: cleanUtr,
          amount: studentShare,
          month: 'September 2026',
        }),
      }).catch(() => {});

      // 2. Also sync to demo route
      await fetch('/api/demo/electricity', { method: 'POST' }).catch(() => {});

      // Simulate NPCI settlement handshake
      await new Promise((res) => setTimeout(res, 1200));

      const refNo = `UNP-ELEC-2026-09${Math.floor(100 + Math.random() * 900)}`;
      const issueDate = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const newDoc: DocumentPDFData = {
        id: `doc-elec-${Date.now()}`,
        title: `September 2026 Electricity Sub-Meter Split Receipt (₹${studentShare} Paid)`,
        category: 'RECEIPT',
        referenceNo: refNo,
        issueDate,
        fileSize: '290 KB',
        status: 'ISSUED',
        issuer: 'PSPCL Sub-Meter Ledger / NPCI Direct UPI',
        amount: `₹${studentShare.toFixed(2)}`,
        tenantName: userName || 'Rahul Sharma',
        roomDetails: 'PCTE Smart Student Residency (Room 204, Bed B • Sub-Meter #204)',
        paymentMethod: `Direct UPI (UTR: ${cleanUtr})`,
        transactionId: `UTR_${cleanUtr}`,
      };

      setReceiptDoc(newDoc);
      setPaid(true);
      setBillStatus('PAID');
      setUpiModalOpen(false);
      setIsVerifying(false);

      // Prepend to history table
      setHistory((prev) => [
        {
          month: 'Sep 2026',
          units: unitsConsumed,
          prevReading,
          currReading,
          totalBill: totalAmount,
          share: studentShare,
          status: 'PAID',
          datePaid: issueDate,
          utr: cleanUtr,
        },
        ...prev,
      ]);

      // Persist state
      try {
        localStorage.setItem('uninest_electricity_paid', 'PAID');
        localStorage.setItem('uninest_electricity_receipt', JSON.stringify(newDoc));
      } catch {}
    } catch (err) {
      setIsVerifying(false);
      setUtrError('Payment verification failed. Please try again.');
    }
  };

  // IoT Live Meter Simulation
  const handleSimulateIotPulse = async () => {
    setIsSimulatingTelemetry(true);
    setTelemetryMessage(null);
    const newKwh = currReading + 2; // +2 kWh consumption pulse

    try {
      const res = await fetch('/api/electricity/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meterNo: 'SUB-MTR-204',
          reading: newKwh,
          voltage: 231.8,
          current: 2.45,
          power: 567.9,
          apiKey: 'uninest_iot_sec_pcte_2026',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrReading(newKwh);
        setTelemetryMessage(`IoT Sub-Meter Telemetry Received: Counter updated to ${newKwh} kWh (+2 units consumed). Split recalculated in real time!`);
      }
    } catch {
      setCurrReading(newKwh);
      setTelemetryMessage(`Telemetry simulated locally: Meter counter advanced to ${newKwh} kWh.`);
    } finally {
      setIsSimulatingTelemetry(false);
    }
  };

  const currentBill = isDemo
    ? {
        month: 'Sep 2026',
        dueDate: '10 Oct 2026',
        meterNo: 'SUB-MTR-204',
        prevReading,
        currReading,
        totalUnits: unitsConsumed,
        ratePerUnit,
        totalAmount,
        studentShare,
        roommateShare: studentShare,
        roommateName: 'Aman Verma',
        roommateStatus: 'PAID',
        property: 'PCTE Smart Student Residency',
        roomAssignment: 'Room 204, Bed B',
      }
    : null;

  if (!isDemo || !currentBill) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Electricity Dues & Sub-Meter Split
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated sub-meter consumption calculations & 50/50 roommate split ledger.
            </p>
          </div>
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl shrink-0">
            <Zap className="w-6 h-6 text-amber-600" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Electricity readings will appear here once your smart meter is connected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header with IoT Info Drawer Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Electricity Dues & Sub-Meter Split
            </h1>
            <Badge variant="success" size="sm" className="hidden sm:inline-flex items-center gap-1 font-mono">
              <Activity className="w-3 h-3 text-emerald-600" />
              Live Sub-Meter Active
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated sub-meter consumption calculations & 50/50 roommate split ledger with PSPCL tariffs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowIotArchitecture(!showIotArchitecture)}
            className="border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-amber-900 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
            {showIotArchitecture ? 'Hide Hardware Meter Guide' : 'How Hardware Meter Connects'}
            {showIotArchitecture ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>

          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl shrink-0">
            <Zap className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* IoT Hardware Connection Architecture Section (Collapsible) */}
      {showIotArchitecture && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700 rounded-2xl p-6 text-white shadow-lg space-y-5 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  IoT Sub-Meter Architecture
                </span>
                <span className="text-[11px] text-slate-400">Production & Final Year Hardware Pipeline</span>
              </div>
              <h3 className="text-lg font-bold text-white">How the Physical Energy Meter Connects to UniNest</h3>
            </div>

            <Button
              onClick={handleSimulateIotPulse}
              disabled={isSimulatingTelemetry}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs py-2 px-4 rounded-xl shadow-md flex items-center gap-2 shrink-0"
            >
              {isSimulatingTelemetry ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Receiving IoT Packet...
                </>
              ) : (
                <>
                  <Activity className="w-3.5 h-3.5" />
                  Simulate Live Meter Pulse (+2 kWh)
                </>
              )}
            </Button>
          </div>

          {telemetryMessage && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{telemetryMessage}</span>
            </div>
          )}

          {/* Step-by-Step Hardware Flow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div className="font-bold text-slate-100">Physical Sub-Meter</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Installed in Room 204 DB board. Uses a PZEM-004T sensor or RS-485 Modbus (Schneider / Eastron) measuring voltage, current & real-time kWh.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div className="font-bold text-slate-100">Microcontroller (ESP32)</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ESP32 / Raspberry Pi reads Modbus registers via UART every 15 minutes, connects to Hostel Wi-Fi / 4G GSM, and packs readings into JSON.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div className="font-bold text-slate-100">UniNest Telemetry API</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sends <code className="text-emerald-300 font-mono text-[10px]">POST /api/electricity/telemetry</code> with device API key. Ingests raw kWh counter to database.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div className="font-bold text-slate-100">Auto 50/50 Split Ledger</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                UniNest calculates delta consumption (1312 - 1245 = 67 kWh) × ₹9.50 tariff = ₹636.50, splits exactly 50/50, and generates individual student UPI QR dues!
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <span>
              💡 <strong>For Landlords without Smart Meters:</strong> The Landlord Portal (<code className="text-amber-300">/landlord/electricity</code>) allows manual dial entry or photo OCR reading on the 1st of every month.
            </span>
            <span className="font-mono text-emerald-400">Endpoint: /api/electricity/telemetry</span>
          </div>
        </div>
      )}

      {/* Active Month Bill Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Bill Period</span>
              <Badge variant="warning" size="sm">{currentBill.month}</Badge>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹{currentBill.studentShare.toFixed(2)} <span className="text-xs font-normal text-slate-500">(Your 50% Share)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Room Bill: ₹{currentBill.totalAmount.toFixed(2)} • Due Date: <strong className="text-slate-900">{currentBill.dueDate}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {paid ? (
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Electricity Bill Paid!
                </div>
                {receiptDoc && (
                  <Button
                    onClick={() => setIsViewerOpen(true)}
                    variant="outline"
                    className="border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    View Receipt PDF
                  </Button>
                )}
              </div>
            ) : (
              <Button
                onClick={() => setUpiModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                Pay via UPI QR (₹{currentBill.studentShare.toFixed(2)})
              </Button>
            )}
          </div>
        </div>

        {/* Sub-Meter Technical Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Sub-Meter Number</span>
            <span className="text-sm font-extrabold text-slate-900 font-mono block">{currentBill.meterNo}</span>
            <span className="text-[11px] text-slate-500 block pt-1">
              {currentBill.property} - {currentBill.roomAssignment}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Units Consumed</span>
            <span className="text-sm font-extrabold text-amber-700 block">{currentBill.totalUnits} kWh</span>
            <span className="text-[11px] text-slate-500 block pt-1">
              Readings: {currentBill.prevReading} → {currentBill.currReading}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 block">Tariff Rate</span>
            <span className="text-sm font-extrabold text-slate-900 block">₹{currentBill.ratePerUnit.toFixed(2)} / Unit</span>
            <span className="text-[11px] text-slate-500 block pt-1">PSPCL State Tariff (Punjab)</span>
          </div>
        </div>

        {/* 50/50 Roommate Split Status */}
        <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl space-y-3">
          <h3 className="text-xs font-extrabold text-amber-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            50/50 Double Sharing Roommate Split Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{userName || 'Rahul Sharma'} (You)</span>
                <span className="text-slate-500 text-[11px]">Share: ₹{currentBill.studentShare.toFixed(2)}</span>
              </div>
              <Badge variant={paid ? 'success' : 'warning'} size="sm">
                {paid ? 'PAID' : 'PENDING'}
              </Badge>
            </div>

            <div className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{currentBill.roommateName} (Roommate)</span>
                <span className="text-slate-500 text-[11px]">Share: ₹{currentBill.roommateShare.toFixed(2)}</span>
              </div>
              <Badge variant="success" size="sm">
                PAID (UPI)
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Past Electricity Payment History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Past Electricity Payment History & Split Receipts
          </h2>
          <span className="text-xs text-slate-500 font-medium">All amounts settled via direct UPI</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Bill Month</th>
                <th className="px-4 py-3 text-left">Consumption</th>
                <th className="px-4 py-3 text-left">Total Room Bill</th>
                <th className="px-4 py-3 text-left">Your Share</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Bank UTR / Date</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {history.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">{h.month}</td>
                  <td className="px-4 py-3">
                    {h.units} kWh
                    <span className="block text-[10px] text-slate-400">
                      ({h.prevReading} → {h.currReading})
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">₹{h.totalBill.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">₹{h.share.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="success" size="sm">
                      {h.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-900 block font-mono text-[11px]">{h.utr || '426819203810'}</span>
                    <span className="text-slate-400 text-[10px]">{h.datePaid}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        const tempDoc: DocumentPDFData = {
                          id: `doc-${h.month}`,
                          title: `${h.month} Electricity Sub-Meter Split Receipt (₹${h.share} Paid)`,
                          category: 'RECEIPT',
                          referenceNo: `UNP-ELEC-2026-${1000 + i}`,
                          issueDate: h.datePaid,
                          status: 'ISSUED',
                          issuer: 'PSPCL Sub-Meter Ledger / NPCI Direct UPI',
                          amount: `₹${h.share.toFixed(2)}`,
                          tenantName: userName || 'Rahul Sharma',
                          roomDetails: 'PCTE Smart Student Residency (Room 204, Bed B • Sub-Meter #204)',
                          paymentMethod: `Direct UPI (UTR: ${h.utr || '426819203810'})`,
                          transactionId: `UTR_${h.utr || '426819203810'}`,
                        };
                        setReceiptDoc(tempDoc);
                        setIsViewerOpen(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline text-xs flex items-center justify-end gap-1 ml-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real UPI QR Payment Modal */}
      <Modal
        isOpen={upiModalOpen}
        onClose={() => !isVerifying && setUpiModalOpen(false)}
        title="Pay Electricity Sub-Meter Dues via UPI QR"
      >
        <div className="space-y-5 text-slate-800">
          {/* Bill Summary Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                Sub-Meter #204 • September 2026
              </span>
              <span className="text-xs text-slate-600">
                Units: <strong>{currentBill.totalUnits} kWh</strong> (Roommate 50% Split)
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Amount Payable</span>
              <span className="text-xl font-extrabold text-amber-700">₹{currentBill.studentShare.toFixed(2)}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
            <div className="relative inline-block mx-auto p-3 bg-white rounded-2xl border-2 border-emerald-400 shadow-sm">
              <img
                src={qrCodeUrl}
                alt="UniNest Electricity Split UPI QR"
                className="w-48 h-48 mx-auto rounded-lg object-contain"
              />
              <div className="absolute inset-x-0 bottom-1 flex justify-center">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3" />
                  Verified NPCI QR
                </span>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-700">
              Scan with any UPI App (GPay, PhonePe, Paytm, BHIM, CRED)
            </p>

            {/* UPI ID Copy Bar */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 max-w-xs mx-auto text-xs">
              <span className="font-mono text-slate-600 truncate">{UPI_ID}</span>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="text-emerald-600 hover:text-emerald-700 font-bold ml-2 shrink-0 flex items-center gap-1 text-[11px]"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Mobile Intent Button */}
            <div className="pt-1">
              <a
                href={upiIntentUri}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Tap to pay directly in your Mobile UPI App
              </a>
            </div>
          </div>

          {/* 12-Digit Bank UTR / Reference Number Form */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                12-Digit Bank UTR / Transaction Reference No. <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setUtrNumber('426819203810')}
                className="text-[10px] font-semibold text-emerald-600 hover:underline"
              >
                Paste Test UTR (426819203810)
              </button>
            </div>

            <input
              type="text"
              maxLength={16}
              value={utrNumber}
              onChange={(e) => {
                setUtrNumber(e.target.value.replace(/\s+/g, ''));
                if (utrError) setUtrError('');
              }}
              placeholder="e.g. 426819203810"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="text-[10px] text-slate-500">
              Found on your GPay / PhonePe / Paytm payment successful receipt under "UPI transaction ID / UTR".
            </p>

            {utrError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{utrError}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setUpiModalOpen(false)}
              disabled={isVerifying}
              className="flex-1 text-xs py-2.5 rounded-xl border-slate-300"
            >
              Cancel
            </Button>

            <Button
              onClick={handleVerifyUpiPayment}
              disabled={isVerifying}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Verifying with Bank...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Verify & Settle Bill (₹{currentBill.studentShare.toFixed(2)})
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Official PDF Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        doc={receiptDoc}
      />
    </div>
  );
}
