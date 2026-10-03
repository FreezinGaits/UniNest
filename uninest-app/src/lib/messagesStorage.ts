import { AdminMessage, PropertyAuditEvent } from './adminMessagesStore';

export const UNINEST_MESSAGES_KEY = 'uninest_admin_messages_v3';
export const UNINEST_AUDIT_KEY = 'uninest_property_audit_events_v3';
export const UNINEST_OVERRIDES_KEY = 'uninest_property_overrides_v3';

export function getLocalMessages(propertyId?: string): AdminMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(UNINEST_MESSAGES_KEY);
    if (!raw) return [];
    const list: AdminMessage[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (!propertyId) return list;
    return list.filter((m) => m.toPropertyId === propertyId);
  } catch {
    return [];
  }
}

export function saveLocalMessage(msg: AdminMessage): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalMessages();
    const existingIdx = current.findIndex((m) => m.id === msg.id);
    let updated: AdminMessage[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = msg;
    } else {
      updated = [...current, msg];
    }
    localStorage.setItem(UNINEST_MESSAGES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error saving local message:', err);
  }
}

export function saveLocalMessagesBatch(msgs: AdminMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalMessages();
    const map = new Map<string, AdminMessage>();
    current.forEach((m) => map.set(m.id, m));
    msgs.forEach((m) => map.set(m.id, m));
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    localStorage.setItem(UNINEST_MESSAGES_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('Error saving local messages batch:', err);
  }
}

export function getLocalOverrides(): Record<string, { verificationStatus: string; rejectionReason?: string; updatedAt: string }> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(UNINEST_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export function saveLocalOverride(propertyId: string, status: string, reason?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalOverrides();
    current[propertyId] = {
      verificationStatus: status,
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(UNINEST_OVERRIDES_KEY, JSON.stringify(current));
  } catch (err) {
    console.warn('Error saving local override:', err);
  }
}

export function getLocalAuditEvents(propertyId?: string): PropertyAuditEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(UNINEST_AUDIT_KEY);
    if (!raw) return [];
    const list: PropertyAuditEvent[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    if (!propertyId) return list;
    return list.filter((e) => e.propertyId === propertyId);
  } catch {
    return [];
  }
}

export function saveLocalAuditEvent(evt: PropertyAuditEvent): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalAuditEvents();
    const existingIdx = current.findIndex((e) => e.id === evt.id);
    let updated: PropertyAuditEvent[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = evt;
    } else {
      updated = [evt, ...current];
    }
    localStorage.setItem(UNINEST_AUDIT_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Error saving local audit event:', err);
  }
}

export function saveLocalAuditEventsBatch(evts: PropertyAuditEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalAuditEvents();
    const map = new Map<string, PropertyAuditEvent>();
    current.forEach((e) => map.set(e.id, e));
    evts.forEach((e) => map.set(e.id, e));
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    localStorage.setItem(UNINEST_AUDIT_KEY, JSON.stringify(merged));
  } catch (err) {
    console.warn('Error saving local audit events batch:', err);
  }
}
