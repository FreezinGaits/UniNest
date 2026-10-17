export interface DocumentPDFData {
  id: string;
  title: string;
  category: 'AGREEMENT' | 'RECEIPT' | 'KYC' | 'COLLEGE' | 'AUDIT' | 'POLICE' | 'PROPERTY';
  referenceNo: string;
  issueDate: string;
  fileSize?: string;
  status: string;
  issuer: string;
  tenantName?: string;
  amount?: string;
  roomDetails?: string;
  paymentMethod?: string;
  transactionId?: string;
}

function escapeHtml(str: unknown): string {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateDocumentHTML(doc: DocumentPDFData): string {
  const tenant = escapeHtml(doc.tenantName || 'Rahul Sharma');
  const room = escapeHtml(doc.roomDetails || 'PCTE Smart Residency (Room 204, Bed A)');
  const amount = escapeHtml(doc.amount || '₹6,000.00');
  const paymentMethod = escapeHtml(doc.paymentMethod || 'Razorpay UPI (HDFC Bank XXXX-8921)');
  const txnId = escapeHtml(doc.transactionId || `PAY-${Math.floor(100000000 + Math.random() * 900000000)}`);
  const referenceNo = escapeHtml(doc.referenceNo);
  const title = escapeHtml(doc.title);
  const issuer = escapeHtml(doc.issuer);
  const issueDate = escapeHtml(doc.issueDate);

  let bodyContent = '';

  const isElectricity =
    doc.category === 'RECEIPT' &&
    (doc.title.toLowerCase().includes('electricity') ||
      doc.id.toLowerCase().includes('elec') ||
      doc.referenceNo.toLowerCase().includes('elec'));

  const isDeposit =
    doc.category === 'RECEIPT' &&
    (doc.title.toLowerCase().includes('deposit') ||
      doc.referenceNo.toLowerCase().includes('dep'));

  const isToken =
    doc.category === 'RECEIPT' &&
    (doc.title.toLowerCase().includes('token') ||
      doc.referenceNo.toLowerCase().includes('000001'));

  if (doc.category === 'RECEIPT') {
    let receiptSubtitle = 'TAX INVOICE & RENT RECEIPT';
    let receiptMainTitle = 'Monthly Accommodation Services';
    let itemRows = `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: 700;">Monthly Base Room Rent (Air Conditioned Room)</td>
        <td style="padding: 10px 12px; text-align: center;">Current Cycle</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 700;">₹5,400.00</td>
      </tr>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: 700;">High-Speed Fiber WiFi & Water Maintenance</td>
        <td style="padding: 10px 12px; text-align: center;">Included</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 700;">₹600.00</td>
      </tr>
    `;

    if (isElectricity) {
      receiptSubtitle = 'SMART SUB-METER UTILITY BILL & SPLIT RECEIPT';
      receiptMainTitle = 'Room 204 Electricity Split Settlement';
      itemRows = `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-weight: 700;">Sub-Meter Smart Telemetry Consumption (50/50 Share)</td>
          <td style="padding: 10px 12px; text-align: center;">Meter #204</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 700;">${amount}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-weight: 700;">PSPCL Grid Fixed Infrastructure & Common Area Line</td>
          <td style="padding: 10px 12px; text-align: center;">Included</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 700;">₹0.00</td>
        </tr>
      `;
    } else if (isDeposit) {
      receiptSubtitle = 'ESCROW DEPOSIT RECEIPT';
      receiptMainTitle = 'Refundable Security Deposit Locked';
      itemRows = `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-weight: 700;">100% Refundable Security Deposit (Held in UniNest Tri-Party Escrow)</td>
          <td style="padding: 10px 12px; text-align: center;">Tenancy Term</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 700;">${amount}</td>
        </tr>
      `;
    } else if (isToken) {
      receiptSubtitle = 'ROOM COMMITMENT TOKEN RECEIPT';
      receiptMainTitle = 'Bed Commitment Hold Fee';
      itemRows = `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-weight: 700;">Commitment Hold Token (Adjusted Against 1st Month Rent)</td>
          <td style="padding: 10px 12px; text-align: center;">Instant Hold</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 700;">${amount}</td>
        </tr>
      `;
    }

    bodyContent = `
      <div class="doc-card receipt-card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <div class="receipt-summary-row" style="border-bottom: 2px dashed #cbd5e1; padding-bottom: 14px; margin-bottom: 14px;">
          <div>
            <span class="badge-sub" style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.05em;">${receiptSubtitle}</span>
            <h2 class="doc-subheading" style="margin: 4px 0 0 0; font-size: 18px; color: #0f172a; font-weight: 800;">${receiptMainTitle}</h2>
          </div>
          <div style="text-align: right;">
            <span class="status-pill" style="display: inline-block; background-color: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bbf7d0;">
              STATUS: PAID
            </span>
          </div>
        </div>

        <table class="kv-table" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 40%;">Tenant Name:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right; width: 60%;">${tenant}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Assigned Property:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${room}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Issuer / Billing Partner:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${doc.issuer}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Payment Gateway Txn ID:</td>
            <td style="padding: 6px 0; color: #2563eb; font-family: monospace; font-weight: 700; text-align: right; word-break: break-all;">${txnId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Payment Method:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${paymentMethod}</td>
          </tr>
        </table>

        <!-- Itemized Table -->
        <table class="items-table" style="width: 100%; border-collapse: collapse; margin-top: 14px; table-layout: fixed;">
          <thead>
            <tr style="background-color: #0f172a; color: #ffffff; font-size: 11px; text-transform: uppercase;">
              <th style="padding: 9px 10px; text-align: left; width: 55%; border-top-left-radius: 6px;">Description</th>
              <th style="padding: 9px 6px; text-align: center; width: 22%;">Period</th>
              <th style="padding: 9px 10px; text-align: right; width: 23%; border-top-right-radius: 6px;">Amount</th>
            </tr>
          </thead>
          <tbody style="font-size: 12px; color: #334155;">
            ${itemRows}
            <tr style="background-color: #f1f5f9;">
              <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: 800; font-size: 13px; color: #0f172a;">GRAND TOTAL PAID:</td>
              <td style="padding: 12px 10px; text-align: right; font-weight: 900; font-size: 16px; color: #166534;">${amount}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (doc.category === 'AGREEMENT') {
    bodyContent = `
      <div class="doc-card" style="border: 2px solid #0f172a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 16px;">
          <span style="background-color: #0f172a; color: #fff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.08em; text-transform: uppercase; display: inline-block;">GOVERNMENT OF PUNJAB e-STAMP CERTIFICATE</span>
          <h2 class="doc-subheading" style="margin: 8px 0 4px 0; font-size: 19px; font-weight: 900; color: #0f172a;">DIGITAL LEASE & RESIDENTIAL AGREEMENT</h2>
          <p style="margin: 0; font-size: 11px; color: #64748b;">Enforceable under Indian Contract Act, 1872 & Rent Control Authority</p>
        </div>

        <div style="font-size: 12px; line-height: 1.6; color: #334155;">
          <p>This <strong>Residential Premises Lease Deed</strong> is executed on <strong>${doc.issueDate}</strong> between:</p>
          
          <div style="background-color: #f8fafc; padding: 10px 14px; border-left: 4px solid #059669; margin: 10px 0; font-size: 12px;">
            <strong>LESSOR (Property Owner):</strong> ${doc.issuer}<br/>
            <strong>LESSEE (Student Tenant):</strong> ${tenant} (Roll ID: STD-2026-992)<br/>
            <strong>PREMISES:</strong> ${room}
          </div>

          <p><strong>TERMS & CONDITIONS:</strong></p>
          <ol style="padding-left: 18px; margin: 8px 0;">
            <li style="margin-bottom: 5px;">The Lessee shall pay a fixed monthly rent of <strong>${amount}</strong> on or before the 5th of every calendar month.</li>
            <li style="margin-bottom: 5px;">The tenancy period is fixed for 11 months commencing from ${doc.issueDate}.</li>
            <li style="margin-bottom: 5px;">A refundable security deposit of <strong>₹12,000.00</strong> has been received by the Lessor via UniNest Escrow.</li>
            <li style="margin-bottom: 5px;">Zero subletting or alteration of premise structure is permitted without written consent.</li>
          </ol>
        </div>
      </div>
    `;
  } else if (doc.category === 'KYC') {
    bodyContent = `
      <div class="doc-card" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="font-size: 10px; font-weight: 800; color: #166534; text-transform: uppercase;">GOVERNMENT IDENTITY AUDIT</span>
            <h2 class="doc-subheading" style="margin: 4px 0 0 0; font-size: 18px; color: #14532d; font-weight: 900;">Aadhaar KYC Verification Certificate</h2>
          </div>
          <span style="background-color: #166534; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px;">
            VERIFIED & AUTHENTICATED
          </span>
        </div>

        <table class="kv-table" style="width: 100%; font-size: 12px; color: #166534; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #dcfce7;"><td style="padding: 7px 0; font-weight: 600; width: 45%;">Student Full Name:</td><td style="padding: 7px 0; font-weight: 800; text-align: right; width: 55%;">${tenant}</td></tr>
          <tr style="border-bottom: 1px solid #dcfce7;"><td style="padding: 7px 0; font-weight: 600;">Aadhaar Virtual ID Hash:</td><td style="padding: 7px 0; font-family: monospace; font-weight: 800; text-align: right;">XXXX-XXXX-4402</td></tr>
          <tr style="border-bottom: 1px solid #dcfce7;"><td style="padding: 7px 0; font-weight: 600;">Verification Agency:</td><td style="padding: 7px 0; font-weight: 800; text-align: right;">${doc.issuer}</td></tr>
          <tr style="border-bottom: 1px solid #dcfce7;"><td style="padding: 7px 0; font-weight: 600;">Biometric OTP Audit Date:</td><td style="padding: 7px 0; font-weight: 800; text-align: right;">${doc.issueDate}</td></tr>
        </table>
      </div>
    `;
  } else if (doc.category === 'COLLEGE') {
    bodyContent = `
      <div class="doc-card" style="border: 2px solid #2563eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; background-color: #eff6ff;">
        <div style="text-align: center; margin-bottom: 16px; border-bottom: 2px solid #93c5fd; padding-bottom: 14px;">
          <h2 class="doc-subheading" style="margin: 0; font-size: 18px; color: #1e40af; font-weight: 900;">PCTE INSTITUTE OF HIGHER EDUCATION</h2>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #3b82f6; font-weight: 700;">Office of Student Welfare & Off-Campus Accommodation Desk</p>
        </div>
        <div style="font-size: 12px; color: #1e3a8a; line-height: 1.7;">
          <p><strong>TO WHOM IT MAY CONCERN:</strong></p>
          <p>This is to certify that <strong>${tenant}</strong> is a bonafide student residing at off-campus verified housing: <strong>${room}</strong> under reference number <strong>${doc.referenceNo}</strong>.</p>
          <p>The institute has verified the local guardian and residential premises compliance on <strong>${doc.issueDate}</strong>.</p>
        </div>
      </div>
    `;
  } else if (doc.category === 'POLICE') {
    bodyContent = `
      <div class="doc-card" style="border: 2px solid #1e3a8a; border-radius: 12px; padding: 20px; margin-bottom: 20px; background-color: #f8fafc;">
        <div style="text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 14px; margin-bottom: 16px;">
          <div style="font-size: 10px; font-weight: 800; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em;">PUNJAB POLICE HEADQUARTERS • LUDHIANA COMMISSIONERATE</div>
          <h2 class="doc-subheading" style="margin: 6px 0 2px 0; font-size: 18px; color: #0f172a; font-weight: 900;">TENANT VERIFICATION REGISTRATION FORM (FORM-11)</h2>
          <p style="margin: 0; font-size: 11px; color: #475569;">Mandatory filing under Section 144 of CrPC & Punjab Security of Premises Act</p>
        </div>

        <table class="kv-table" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 7px 0; color: #475569; font-weight: 600; width: 42%;">Police Jurisdiction:</td>
            <td style="padding: 7px 0; color: #0f172a; font-weight: 800; width: 58%;">PS Sarabha Nagar / BRS Nagar</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 7px 0; color: #475569; font-weight: 600;">Tenant Full Name:</td>
            <td style="padding: 7px 0; color: #0f172a; font-weight: 800;">${tenant}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 7px 0; color: #475569; font-weight: 600;">College / Institute:</td>
            <td style="padding: 7px 0; color: #0f172a; font-weight: 800;">PCTE Institute of Management</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 7px 0; color: #475569; font-weight: 600;">Rented Premises:</td>
            <td style="padding: 7px 0; color: #0f172a; font-weight: 800;">${room}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 7px 0; color: #475569; font-weight: 600;">Property Owner:</td>
            <td style="padding: 7px 0; color: #0f172a; font-weight: 800;">${doc.issuer}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 7px 0; color: #475569; font-weight: 600;">Aadhaar Ref:</td>
            <td style="padding: 7px 0; color: #0f172a; font-family: monospace; font-weight: 800;">VERIFIED (UIDAI Virtual ID #8892)</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 7px 0; color: #475569; font-weight: 600;">Filing Reference:</td>
            <td style="padding: 7px 0; color: #2563eb; font-family: monospace; font-weight: 800;">${doc.referenceNo}</td>
          </tr>
        </table>

        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #065f46; line-height: 1.5;">
          <strong>VERIFICATION ACKNOWLEDGMENT:</strong> This document certifies that tenant particulars and landlord declarations have been digitally submitted to the jurisdictional Police Authority via UniNest Compliance Portal.
        </div>
      </div>
    `;
  } else if (doc.category === 'PROPERTY') {
    bodyContent = `
      <div class="doc-card" style="border: 2px solid #7c3aed; border-radius: 12px; padding: 20px; margin-bottom: 20px; background-color: #faf5ff;">
        <div style="text-align: center; border-bottom: 2px solid #ddd6fe; padding-bottom: 14px; margin-bottom: 16px;">
          <span style="background-color: #7c3aed; color: #fff; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.08em; text-transform: uppercase;">PROPERTY MANAGEMENT COMPLIANCE & RULES</span>
          <h2 class="doc-subheading" style="margin: 8px 0 4px 0; font-size: 18px; font-weight: 900; color: #581c87;">${title}</h2>
          <p style="margin: 0; font-size: 11px; color: #6b21a8;">Official Property Notice & Resident Guidelines</p>
        </div>

        <table class="kv-table" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px;">
          <tr style="border-bottom: 1px solid #e9d5ff;">
            <td style="padding: 7px 0; color: #6b21a8; font-weight: 600; width: 40%;">Property Premises:</td>
            <td style="padding: 7px 0; color: #0f172a; font-weight: 800; width: 60%;">${room}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e9d5ff;">
            <td style="padding: 7px 0; color: #6b21a8; font-weight: 600;">Issuing Landlord:</td>
            <td style="padding: 7px 0; color: #0f172a; font-weight: 800;">${issuer}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e9d5ff;">
            <td style="padding: 7px 0; color: #6b21a8; font-weight: 600;">Document Ref:</td>
            <td style="padding: 7px 0; color: #7c3aed; font-family: monospace; font-weight: 800;">${referenceNo}</td>
          </tr>
        </table>

        <div style="background-color: #ffffff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #374151; line-height: 1.6;">
          <p style="margin-top: 0; font-weight: 700; color: #581c87;">Summary of Regulations & Standing Instructions:</p>
          <ul style="padding-left: 18px; margin: 6px 0;">
            <li style="margin-bottom: 4px;">Compliance with sub-meter electricity readings, smart tariff calculation, and billing cycles.</li>
            <li style="margin-bottom: 4px;">Adherence to quiet hours (10:30 PM - 6:00 AM) and student residency safety protocols.</li>
            <li style="margin-bottom: 4px;">Zero unauthorized subletting; biometric entry log records maintained with UniNest.</li>
            <li style="margin-bottom: 4px;">Prompt reporting of maintenance tickets through the UniNest Mobile/Web portal.</li>
          </ul>
        </div>
      </div>
    `;
  } else {
    bodyContent = `
      <div class="doc-card" style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 20px; background-color: #ffffff;">
        <h2 class="doc-subheading" style="margin: 0 0 10px 0; font-size: 17px; color: #0f172a; font-weight: 800;">Move-In Amenities & Condition Handover Inspection</h2>
        <p style="font-size: 12px; color: #475569; margin-bottom: 14px;">Detailed 18-point inspection completed for <strong>${room}</strong> by ${doc.issuer}.</p>
        <table class="items-table" style="width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed;">
          <tr style="background-color: #f1f5f9;"><th style="padding: 8px; text-align: left; width: 50%;">Amenity Item</th><th style="padding: 8px; text-align: center; width: 25%;">Condition</th><th style="padding: 8px; text-align: right; width: 25%;">Status</th></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px;">Split AC & Remote Control</td><td style="padding: 8px; text-align: center;">Excellent</td><td style="padding: 8px; text-align: right; color: #166534; font-weight: 800;">✓ PASSED</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px;">Study Table & Ergonomic Chair</td><td style="padding: 8px; text-align: center;">Good Condition</td><td style="padding: 8px; text-align: right; color: #166534; font-weight: 800;">✓ PASSED</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px;">Sub-Meter Initial Reading</td><td style="padding: 8px; text-align: center;">1,420 kWh</td><td style="padding: 8px; text-align: right; color: #166534; font-weight: 800;">✓ RECORDED</td></tr>
        </table>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
      <title>${doc.referenceNo} - ${doc.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after {
          box-sizing: border-box !important;
          max-width: 100% !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
          -webkit-text-size-adjust: 100%;
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
        }
        body {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          padding: 10px 8px !important;
          color: #0f172a !important;
          background-color: #ffffff !important;
          line-height: 1.4 !important;
        }
        .header {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          border-bottom: 2px solid #0f172a !important;
          padding-bottom: 10px !important;
          margin-bottom: 12px !important;
          gap: 6px !important;
          width: 100% !important;
        }
        .brand-title {
          font-size: 18px !important;
          font-weight: 900 !important;
          color: #0f172a !important;
          letter-spacing: -0.03em !important;
          line-height: 1.1 !important;
        }
        .brand-sub {
          font-size: 10px !important;
          color: #059669 !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          margin-top: 2px !important;
        }
        .doc-meta {
          text-align: left !important;
          width: 100% !important;
        }
        .ref-badge {
          font-family: monospace !important;
          background-color: #0f172a !important;
          color: #ffffff !important;
          padding: 4px 8px !important;
          border-radius: 6px !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          display: inline-block !important;
          word-break: break-all !important;
        }
        .doc-title-main {
          font-size: 15px !important;
          font-weight: 900 !important;
          margin-bottom: 12px !important;
          color: #0f172a !important;
          line-height: 1.3 !important;
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
        }
        .doc-card {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
          padding: 10px 8px !important;
          margin-bottom: 14px !important;
        }
        .receipt-summary-row {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 6px !important;
          width: 100% !important;
        }
        table {
          width: 100% !important;
          max-width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          box-sizing: border-box !important;
          font-size: 11px !important;
        }
        th, td {
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
          white-space: normal !important;
          padding: 5px 3px !important;
        }
        .stamp-box-wrapper {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 10px !important;
          margin-top: 16px !important;
          width: 100% !important;
        }
        .stamp-box {
          border: 2px dashed #059669 !important;
          background-color: #ecfdf5 !important;
          padding: 6px 10px !important;
          border-radius: 8px !important;
          width: 100% !important;
          min-width: 0 !important;
        }
        .signatory-box {
          text-align: left !important;
          font-size: 10px !important;
          color: #475569 !important;
          width: 100% !important;
        }
        .footer {
          margin-top: 20px !important;
          border-top: 1px solid #e2e8f0 !important;
          padding-top: 10px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          font-size: 10px !important;
          color: #64748b !important;
          gap: 4px !important;
          width: 100% !important;
        }

        /* Tablet & Desktop Enhancements */
        @media (min-width: 641px) {
          body {
            padding: 24px 20px !important;
          }
          .header {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            padding-bottom: 14px !important;
            margin-bottom: 18px !important;
          }
          .brand-title {
            font-size: 24px !important;
          }
          .doc-meta {
            text-align: right !important;
            width: auto !important;
          }
          .doc-title-main {
            font-size: 20px !important;
            margin-bottom: 16px !important;
          }
          .doc-card {
            padding: 18px !important;
            margin-bottom: 20px !important;
          }
          .receipt-summary-row {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          table {
            font-size: 12px !important;
          }
          th, td {
            padding: 8px 6px !important;
          }
          .stamp-box-wrapper {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            margin-top: 24px !important;
          }
          .stamp-box {
            width: auto !important;
            min-width: 200px !important;
          }
          .signatory-box {
            text-align: right !important;
            font-size: 11px !important;
            width: auto !important;
          }
          .footer {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-top: 28px !important;
            padding-top: 14px !important;
          }
        }
        @media print {
          body { padding: 20px !important; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand-title">UniNest</div>
          <div class="brand-sub">Smart Student Housing & Trust Engine</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Verified Digital Document Vault</div>
        </div>
        <div class="doc-meta">
          <div class="ref-badge">${doc.referenceNo}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 600;">Issue Date: ${doc.issueDate}</div>
        </div>
      </div>

      <h1 class="doc-title-main">${doc.title}</h1>

      ${bodyContent}

      <!-- Official Digital Seal & Stamp -->
      <div class="stamp-box-wrapper">
        <div class="stamp-box">
          <div style="font-size: 9px; text-transform: uppercase; font-weight: 900; color: #047857;">DIGITALLY SIGNED & VERIFIED</div>
          <div style="font-size: 11px; font-weight: 800; color: #065f46; margin-top: 2px;">UniNest Automated Escrow Trust Engine</div>
          <div style="font-size: 9px; color: #047857; margin-top: 2px; font-family: monospace;">Sha-256: e8f90a...37b12</div>
        </div>
        <div class="signatory-box">
          <div style="font-weight: 800; color: #0f172a;">Authorized Signatory</div>
          <div style="margin-top: 14px; border-bottom: 1px solid #94a3b8; width: 160px; display: inline-block;"></div>
          <div style="font-size: 10px; color: #64748b; margin-top: 3px;">Passi Residency Management Desk</div>
        </div>
      </div>

      <div class="footer">
        <div>UniNest Technologies Pvt. Ltd. • ISO 27001 Secure Document Systems</div>
        <div>Page 1 of 1 • System Generated Original</div>
      </div>
    </body>
    </html>
  `;
}

export function downloadDocumentPDF(doc: DocumentPDFData) {
  if (typeof window === 'undefined') return;

  const htmlContent = generateDocumentHTML(doc);

  // Trigger Direct File Download (as styled .html / printable PDF document blob)
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${doc.referenceNo}_${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

