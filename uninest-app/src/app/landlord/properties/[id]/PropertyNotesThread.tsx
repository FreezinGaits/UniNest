'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Send, ShieldCheck, Clock, History } from 'lucide-react';
import { AdminMessage, PropertyAuditEvent } from '@/lib/adminMessagesStore';
import {
  getLocalMessages,
  saveLocalMessage,
  saveLocalMessagesBatch,
  getLocalAuditEvents,
  saveLocalAuditEventsBatch,
} from '@/lib/messagesStorage';

interface PropertyNotesThreadProps {
  propertyId: string;
  propertyName: string;
  initialMessages: AdminMessage[];
}

export function PropertyNotesThread({
  propertyId,
  propertyName,
  initialMessages,
}: PropertyNotesThreadProps) {
  const [messages, setMessages] = useState<AdminMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const local = getLocalMessages(propertyId);
      if (local.length > 0) return local;
    }
    return initialMessages || [];
  });
  const [auditEvents, setAuditEvents] = useState<PropertyAuditEvent[]>(() => {
    if (typeof window !== 'undefined') {
      return getLocalAuditEvents(propertyId);
    }
    return [];
  });
  const [tab, setTab] = useState<'MESSAGES' | 'AUDIT'>('MESSAGES');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Sync with backend API
    fetch(`/api/admin/messages?propertyId=${propertyId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.messages) {
            saveLocalMessagesBatch(data.messages);
            setMessages(getLocalMessages(propertyId));
          }
          if (data.auditEvents) {
            saveLocalAuditEventsBatch(data.auditEvents);
            setAuditEvents(getLocalAuditEvents(propertyId));
          }
        }
      })
      .catch(() => {});
  }, [propertyId]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);

    const optimisticMsg: AdminMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fromRole: 'LANDLORD',
      fromName: 'Vikram Singh (Landlord)',
      toPropertyId: propertyId,
      propertyName,
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    saveLocalMessage(optimisticMsg);
    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyText('');

    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPropertyId: propertyId,
          propertyName,
          message: optimisticMsg.message,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          saveLocalMessage(data.message);
        }
      } else {
        alert('Failed to send reply to server.');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Network error sending reply.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Admin Communication & Audit History</h3>
            <p className="text-[11px] text-slate-500">
              Permanent correspondence & compliance audit logs with UniNest Admin
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('MESSAGES')}
            className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
              tab === 'MESSAGES' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Messages ({messages.length})
          </button>
          <button
            onClick={() => setTab('AUDIT')}
            className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
              tab === 'AUDIT' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Audit Trail ({auditEvents.length})
          </button>
        </div>
      </div>

      {tab === 'MESSAGES' && (
        <>
          {/* Message log */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {messages.length > 0 ? (
              messages.map((msg) => {
                const isAdmin = msg.fromRole === 'ADMIN';
                return (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      isAdmin
                        ? 'bg-amber-50/70 border-amber-200/80 mr-6'
                        : 'bg-emerald-50/70 border-emerald-200/80 ml-6'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${
                            isAdmin
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-200 text-emerald-900'
                          }`}
                        >
                          {isAdmin ? '🛡️ UNINEST ADMIN' : '🏠 LANDLORD (YOU)'}
                        </span>
                        <span className="font-bold text-slate-800 text-[11px]">{msg.fromName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.timestamp).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-800 whitespace-pre-wrap">{msg.message}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No official audit notes on record for this property. Send a message below to request assistance.
              </div>
            )}
          </div>

          {/* Reply input */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to UniNest Admin regarding listing status, fire safety compliance, or room updates..."
              rows={2}
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none shadow-2xs"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400">
                Saved permanently in browser storage & synced to admin audit logs.
              </span>
              <Button
                size="sm"
                onClick={handleSendReply}
                disabled={isSending || !replyText.trim()}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {isSending ? 'Sending...' : 'Send Reply to Admin'}
              </Button>
            </div>
          </div>
        </>
      )}

      {tab === 'AUDIT' && (
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {auditEvents.length > 0 ? (
            auditEvents.map((evt) => (
              <div key={evt.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        evt.action === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : evt.action === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {evt.action}
                    </span>
                    <span className="font-extrabold text-slate-900">{evt.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(evt.timestamp).toLocaleString()}
                  </span>
                </div>
                {evt.details && <p className="text-slate-600 pl-1 border-l-2 border-slate-300">{evt.details}</p>}
                <div className="text-[10px] text-slate-400">
                  Logged by: <strong className="text-slate-700">{evt.actorName} ({evt.actorRole})</strong>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              <History className="w-6 h-6 text-slate-300 mx-auto mb-1" />
              No audit events logged yet.
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
