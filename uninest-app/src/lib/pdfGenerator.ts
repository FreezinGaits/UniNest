export interface DocumentPDFData {
  id: string;
  title: string;
  category: 'AGREEMENT' | 'RECEIPT' | 'KYC' | 'COLLEGE' | 'AUDIT';
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

export function generateDocumentHTML(doc: DocumentPDFData): string {
  const tenant = doc.tenantName || 'Rahul Sharma';
  const room = doc.roomDetails || 'PCTE Smart Residency (Room 204, Bed A)';
  const amount = doc.amount || '₹6,000.00';
  const paymentMethod = doc.paymentMethod || 'Razorpay UPI (HDFC Bank XXXX-8921)';
  const txnId = doc.transactionId || `PAY-${Math.floor(100000000 + Math.random() * 900000000)}`;

  let bodyContent = '';

  if (doc.category === 'RECEIPT') {
    bodyContent = `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px border-dashed #cbd5e1; padding-bottom: 16px; margin-bottom: 16px;">
          <div>
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.05em;">TAX INVOICE & RENT RECEIPT</span>
            <h2 style="margin: 4px 0 0 0; font-size: 20px; color: #0f172a; font-weight: 800;">Monthly Accommodation Services</h2>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; background-color: #dcfce7; color: #166534; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; border: 1px solid #bbf7d0;">
              STATUS: PAID
            </span>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Tenant Name:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${tenant}</td>
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
            <td style="padding: 6px 0; color: #2563eb; font-family: monospace; font-weight: 700; text-align: right;">${txnId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Payment Method:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right;">${paymentMethod}</td>
          </tr>
        </table>

        <!-- Itemized Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr style="background-color: #0f172a; color: #ffffff; font-size: 12px; text-transform: uppercase;">
              <th style="padding: 10px 14px; text-align: left; border-top-left-radius: 8px;">Description</th>
              <th style="padding: 10px 14px; text-align: center;">Period</th>
              <th style="padding: 10px 14px; text-align: right; border-top-right-radius: 8px;">Amount</th>
            </tr>
          </thead>
          <tbody style="font-size: 13px; color: #334155;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 14px; font-weight: 700;">Monthly Base Room Rent (Air Conditioned Room)</td>
              <td style="padding: 12px 14px; text-align: center;">Current Billing Cycle</td>
              <td style="padding: 12px 14px; text-align: right; font-weight: 700;">₹5,400.00</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 14px; font-weight: 700;">High-Speed Fiber WiFi & Water Maintenance</td>
              <td style="padding: 12px 14px; text-align: center;">Included</td>
              <td style="padding: 12px 14px; text-align: right; font-weight: 700;">₹600.00</td>
            </tr>
            <tr style="background-color: #f1f5f9;">
              <td colspan="2" style="padding: 14px; text-align: right; font-weight: 800; font-size: 14px; color: #0f172a;">GRAND TOTAL PAID:</td>
              <td style="padding: 14px; text-align: right; font-weight: 900; font-size: 18px; color: #166534;">${amount}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (doc.category === 'AGREEMENT') {
    bodyContent = `
      <div style="border: 2px solid #0f172a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;">
          <span style="background-color: #0f172a; color: #fff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 4px; letter-spacing: 0.1em; text-transform: uppercase;">GOVERNMENT OF PUNJAB e-STAMP CERTIFICATE</span>
          <h2 style="margin: 8px 0 4px 0; font-size: 22px; font-weight: 900; color: #0f172a;">DIGITAL LEASE & RESIDENTIAL AGREEMENT</h2>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Enforceable under Indian Contract Act, 1872 & Rent Control Authority</p>
        </div>

        <div style="font-size: 13px; line-height: 1.7; color: #334155; space-y-4;">
          <p>This <strong>Residential Premises Lease Deed</strong> is executed on <strong>${doc.issueDate}</strong> between:</p>
          
          <div style="background-color: #f8fafc; padding: 12px 16px; border-left: 4px solid #059669; margin: 12px 0;">
            <strong>LESSOR (Property Owner):</strong> ${doc.issuer}<br/>
            <strong>LESSEE (Student Tenant):</strong> ${tenant} (Roll ID: STD-2026-992)<br/>
            <strong>PREMISES:</strong> ${room}
          </div>

          <p><strong>TERMS & CONDITIONS:</strong></p>
          <ol style="padding-left: 20px; margin: 8px 0;">
            <li style="margin-bottom: 6px;">The Lessee shall pay a fixed monthly rent of <strong>${amount}</strong> on or before the 5th of every calendar month.</li>
            <li style="margin-bottom: 6px;">The tenancy period is fixed for 11 months commencing from ${doc.issueDate}.</li>
            <li style="margin-bottom: 6px;">A refundable security deposit of <strong>₹12,000.00</strong> has been received by the Lessor via UniNest Escrow.</li>
            <li style="margin-bottom: 6px;">Zero subletting or alteration of premise structure is permitted without written consent.</li>
          </ol>
        </div>
      </div>
    `;
  } else if (doc.category === 'KYC') {
    bodyContent = `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-object: space-between; align-items: center; margin-bottom: 16px;">
          <div>
            <span style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase;">GOVERNMENT IDENTITY AUDIT</span>
            <h2 style="margin: 4px 0 0 0; font-size: 20px; color: #14532d; font-weight: 900;">Aadhaar KYC Verification Certificate</h2>
          </div>
          <span style="background-color: #166534; color: #ffffff; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 8px;">
            VERIFIED & AUTHENTICATED
          </span>
        </div>

        <table style="width: 100%; font-size: 13px; color: #166534; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #dcfce7;"><td style="padding: 8px 0; font-weight: 600;">Student Full Name:</td><td style="padding: 8px 0; font-weight: 800; text-align: right;">${tenant}</td></tr>
          <tr style="border-bottom: 1px solid #dcfce7;"><td style="padding: 8px 0; font-weight: 600;">Aadhaar Virtual ID Hash:</td><td style="padding: 8px 0; font-family: monospace; font-weight: 800; text-align: right;">XXXX-XXXX-4402</td></tr>
          <tr style="border-bottom: 1px solid #dcfce7;"><td style="padding: 8px 0; font-weight: 600;">Verification Agency:</td><td style="padding: 8px 0; font-weight: 800; text-align: right;">${doc.issuer}</td></tr>
          <tr style="border-bottom: 1px solid #dcfce7;"><td style="padding: 8px 0; font-weight: 600;">Biometric OTP Audit Date:</td><td style="padding: 8px 0; font-weight: 800; text-align: right;">${doc.issueDate}</td></tr>
        </table>
      </div>
    `;
  } else if (doc.category === 'COLLEGE') {
    bodyContent = `
      <div style="border: 2px solid #2563eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; background-color: #eff6ff;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #93c5fd; padding-bottom: 16px;">
          <h2 style="margin: 0; font-size: 20px; color: #1e40af; font-weight: 900;">PCTE INSTITUTE OF HIGHER EDUCATION</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #3b82f6; font-weight: 700;">Office of Student Welfare & Off-Campus Accommodation Desk</p>
        </div>
        <div style="font-size: 13px; color: #1e3a8a; line-height: 1.8;">
          <p><strong>TO WHOM IT MAY CONCERN:</strong></p>
          <p>This is to certify that <strong>${tenant}</strong> is a bonafide student residing at off-campus verified housing: <strong>${room}</strong> under reference number <strong>${doc.referenceNo}</strong>.</p>
          <p>The institute has verified the local guardian and residential premises compliance on <strong>${doc.issueDate}</strong>.</p>
        </div>
      </div>
    `;
  } else {
    bodyContent = `
      <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; margin-bottom: 24px; background-color: #ffffff;">
        <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #0f172a; font-weight: 800;">Move-In Amenities & Condition Handover Inspection</h2>
        <p style="font-size: 13px; color: #475569; margin-bottom: 16px;">Detailed 18-point inspection completed for <strong>${room}</strong> by ${doc.issuer}.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr style="background-color: #f1f5f9;"><th style="padding: 8px; text-align: left;">Amenity Item</th><th style="padding: 8px; text-align: center;">Condition</th><th style="padding: 8px; text-align: right;">Status</th></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px;">Split AC & Remote Control</td><td style="padding: 8px; text-align: center;">Excellent</td><td style="padding: 8px; text-align: right; color: #166534; font-weight: 800;">✓ PASSED</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px;">Study Table & Ergonomic Chair</td><td style="padding: 8px; text-align: center;">Good Condition</td><td style="padding: 8px; text-align: right; color: #166534; font-weight: 800;">✓ PASSED</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px;">Sub-Meter Electricity Initial Reading</td><td style="padding: 8px; text-align: center;">1,420 kWh</td><td style="padding: 8px; text-align: right; color: #166534; font-weight: 800;">✓ RECORDED</td></tr>
        </table>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${doc.referenceNo} - ${doc.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
        body {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          margin: 0;
          padding: 40px;
          color: #0f172a;
          background-color: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #0f172a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .brand-title {
          font-size: 26px;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.03em;
        }
        .brand-sub {
          font-size: 12px;
          color: #059669;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .doc-meta {
          text-align: right;
        }
        .ref-badge {
          font-family: monospace;
          background-color: #0f172a;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #64748b;
        }
        .stamp-box {
          border: 2px dashed #059669;
          background-color: #ecfdf5;
          padding: 10px 16px;
          border-radius: 10px;
          display: inline-block;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand-title">UniNest</div>
          <div class="brand-sub">Smart Student Housing & Trust Engine</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Verified Digital Document Vault</div>
        </div>
        <div class="doc-meta">
          <div class="ref-badge">${doc.referenceNo}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 6px; font-weight: 600;">Issue Date: ${doc.issueDate}</div>
        </div>
      </div>

      <h1 style="font-size: 22px; font-weight: 900; margin-bottom: 20px; color: #0f172a;">${doc.title}</h1>

      ${bodyContent}

      <!-- Official Digital Seal & Stamp -->
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px;">
        <div class="stamp-box">
          <div style="font-size: 10px; text-transform: uppercase; font-weight: 900; color: #047857;">DIGITALLY SIGNED & VERIFIED</div>
          <div style="font-size: 12px; font-weight: 800; color: #065f46; margin-top: 2px;">UniNest Automated Escrow Trust Engine</div>
          <div style="font-size: 10px; color: #047857; margin-top: 2px;">Sha-256 Hash: e8f90a...37b12</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #475569;">
          <div style="font-weight: 800; color: #0f172a;">Authorized Signatory</div>
          <div style="margin-top: 20px; border-bottom: 1px solid #94a3b8; width: 180px; display: inline-block;"></div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Passi Residency Management Desk</div>
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

