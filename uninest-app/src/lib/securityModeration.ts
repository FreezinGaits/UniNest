/**
 * UniNest Anti-Disintermediation & Escrow Safety Engine
 * Protects students and landlords by blocking off-platform contact leakage (phone, email, WhatsApp)
 * and preventing premature release of Move-In Handshake PINs / OTPs via chat.
 */

function normalizeText(text: string): string {
  return text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

/**
 * Checks for direct, broken, spaced, or obfuscated phone numbers
 */
export function detectPhoneNumber(text: string): { detected: boolean; match?: string } {
  const clean = normalizeText(text);

  // 1. Direct standard regex (e.g. +91 98989 89801, 9898989801)
  const standardPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/;
  if (standardPhone.test(clean)) {
    return { detected: true, match: 'standard phone format' };
  }

  // 2. Broken digits with spaces, dots, dashes, commas (e.g. "97809 25649", "9 7 8 0 9 2 5 6 4 9")
  const brokenIndianPhone = /(?:\+?91[\s,.-]*)?(?:[6-9][\s,.-]*\d[\s,.-]*\d[\s,.-]*\d[\s,.-]*\d[\s,.-]*\d[\s,.-]*\d[\s,.-]*\d[\s,.-]*\d[\s,.-]*\d)/;
  if (brokenIndianPhone.test(clean)) {
    return { detected: true, match: 'broken digit sequence' };
  }

  // 3. Inspect digit clusters from text if digit count in a substring >= 10
  const digitClusters = clean.match(/(?:(?:\d[\s,.-]*){9,12}\d)/g);
  if (digitClusters) {
    for (const cluster of digitClusters) {
      const onlyDigits = cluster.replace(/\D/g, '');
      if (onlyDigits.length === 10 && /^[6-9]/.test(onlyDigits)) {
        return { detected: true, match: 'extracted 10-digit number' };
      }
      if (onlyDigits.length === 12 && onlyDigits.startsWith('91')) {
        return { detected: true, match: 'extracted +91 number' };
      }
    }
  }

  // 4. Word-form numbers (e.g. "nine seven eight zero nine two five six four nine")
  const wordDigits: Record<string, string> = {
    zero: '0', one: '1', two: '2', three: '3', four: '4',
    five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  };
  const words = clean.toLowerCase().split(/[\s,.-]+/);
  let consecutiveWordCount = 0;
  for (const w of words) {
    if (wordDigits[w] !== undefined || /^\d$/.test(w)) {
      consecutiveWordCount++;
      if (consecutiveWordCount >= 7) {
        return { detected: true, match: 'word-form digits' };
      }
    } else {
      consecutiveWordCount = 0;
    }
  }

  return { detected: false };
}

/**
 * Checks for direct or obfuscated email addresses
 */
export function detectEmail(text: string): { detected: boolean; match?: string } {
  const clean = normalizeText(text);

  // Standard email format
  const standardEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  if (standardEmail.test(clean)) {
    return { detected: true, match: 'standard email' };
  }

  // Obfuscated email (e.g., "user at gmail dot com", "user[at]gmail.com", "user(at)gmail(dot)com")
  const obfuscatedEmail = /[a-zA-Z0-9._%+-]+\s*(?:@|\[at\]|\(at\)|\bat\b)\s*[a-zA-Z0-9.-]+\s*(?:\.|\(dot\)|\[dot\]|\bdot\b)\s*(?:com|in|org|net|edu|co)/i;
  if (obfuscatedEmail.test(clean)) {
    return { detected: true, match: 'obfuscated email format' };
  }

  return { detected: false };
}

/**
 * Checks for external social/payment handles or direct links
 */
export function detectExternalLinks(text: string): { detected: boolean; match?: string } {
  const clean = normalizeText(text);
  const linkRegex = /\b(whatsapp|telegram|instagram|direct payment|pay me directly|upi id|gpay|phonepe)\b|wa\.me|t\.me|http:\/\/|https:\/\/|\.com\b|\.in\b/i;
  if (linkRegex.test(clean)) {
    return { detected: true, match: 'external link or platform' };
  }
  return { detected: false };
}

/**
 * Checks for premature sharing of 6-digit Move-In PIN or 4-digit Visit OTP in chat
 */
export function detectOtpOrPinLeakage(text: string): { detected: boolean; match?: string } {
  const clean = normalizeText(text);
  const lower = clean.toLowerCase();

  // If message contains OTP/PIN keywords + numbers
  const hasKeyword = /\b(otp|pin|handshake|key|secret|code|move-in pin|move in pin)\b/i.test(lower);
  const hasDigits = /\b\d{3}[\s-]?\d{3}\b|\b\d{4}\b/.test(clean);
  if (hasKeyword && hasDigits) {
    return { detected: true, match: 'Handshake PIN / OTP sharing keyword' };
  }

  // Standalone 6-digit format (e.g. "792-410" or "792410" or "792 410")
  if (/^\s*\d{3}[\s-]?\d{3}\s*$/.test(clean)) {
    return { detected: true, match: 'Standalone 6-digit PIN' };
  }

  return { detected: false };
}

export function validateChatMessage(text: string): {
  isValid: boolean;
  error?: string;
  warning?: string;
  type?: 'PHONE' | 'EMAIL' | 'LINK' | 'OTP';
} {
  const phone = detectPhoneNumber(text);
  if (phone.detected) {
    return {
      isValid: false,
      type: 'PHONE',
      error: '🔒 UniNest Safety Guard: Direct phone number detected. Contact sharing is restricted before confirmed move-in to safeguard your ₹399/₹6,000 escrow hold.',
      warning: 'Contact information blocked by UniNest Safety Guard.',
    };
  }

  const email = detectEmail(text);
  if (email.detected) {
    return {
      isValid: false,
      type: 'EMAIL',
      error: '🔒 UniNest Safety Guard: Email sharing detected. Please keep all inquiries within in-app moderated chat to preserve dispute evidence.',
      warning: 'Email address blocked by UniNest Safety Guard.',
    };
  }

  const link = detectExternalLinks(text);
  if (link.detected) {
    return {
      isValid: false,
      type: 'LINK',
      error: '🔒 UniNest Safety Guard: External messaging or direct payment links are blocked to protect you from advance payment fraud.',
      warning: 'External link blocked by UniNest Safety Guard.',
    };
  }

  const otp = detectOtpOrPinLeakage(text);
  if (otp.detected) {
    return {
      isValid: false,
      type: 'OTP',
      error: '⚠️ Security Alert: Never share your Move-In Handshake PIN or OTP in chat! Only provide this PIN in person to the landlord after physically inspecting your room.',
      warning: 'Handshake PIN sharing blocked for escrow safety.',
    };
  }

  return { isValid: true };
}
