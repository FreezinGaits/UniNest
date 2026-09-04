/**
 * UniNest Student-to-Student Chat Safety & Moderation Helper
 * Detects and blocks phone numbers, emails, external links, social media handles,
 * and off-platform payment attempts to keep interactions safe within UniNest.
 */

export interface ModerateMessageResult {
  isBlocked: boolean;
  reason?: string;
  cleanedContent: string;
  warningMessage?: string;
}

const PHONE_REGEX = /(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}|\b\d{10}\b/i;
const WORD_DIGITS_REGEX = /(nine|eight|seven|six|five|four|three|two|one|zero){4,}/i;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
const LINK_REGEX = /(https?:\/\/|www\.)\S+|[a-zA-Z0-9-]+\.(com|in|org|net|io|me|app)\b/i;
const SOCIAL_REGEX = /(whatsapp|telegram|insta|instagram|snapchat|gpay|paytm|phonepe|call me at|text me at)/i;

export function moderateChatMessage(content: string): ModerateMessageResult {
  if (!content) {
    return { isBlocked: false, cleanedContent: content };
  }

  const matchesPhone = PHONE_REGEX.test(content) || WORD_DIGITS_REGEX.test(content);
  const matchesEmail = EMAIL_REGEX.test(content);
  const matchesLink = LINK_REGEX.test(content);
  const matchesSocial = SOCIAL_REGEX.test(content);

  if (matchesPhone || matchesEmail || matchesLink || matchesSocial) {
    let reason = 'External contact info detected';
    if (matchesPhone) reason = 'Phone number sharing detected';
    if (matchesEmail) reason = 'Email address sharing detected';
    if (matchesLink) reason = 'External website link detected';
    if (matchesSocial) reason = 'Off-platform contact/payment attempt detected';

    return {
      isBlocked: true,
      reason,
      cleanedContent: '[Message Hidden - External Contact Detected]',
      warningMessage: '⚠️ For your safety, please keep communication within UniNest.',
    };
  }

  return {
    isBlocked: false,
    cleanedContent: content,
  };
}
