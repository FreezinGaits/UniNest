'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Send, ShieldCheck, Clock } from 'lucide-react';
import { AdminMessage } from '@/lib/adminMessagesStore';

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
  const [messages, setMessages] = useState<AdminMessage[]>(initialMessages || []);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPropertyId: propertyId,
          propertyName,
          message: replyText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setReplyText('');
      } else {
        alert('Failed to send reply. Please try again.');
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
            <h3 className="font-bold text-slate-900 text-sm">Admin Communication & Audit Notes</h3>
            <p className="text-[11px] text-slate-500">
              Direct correspondence channel with UniNest Compliance & Verification team
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
          {messages.length} Note{messages.length === 1 ? '' : 's'}
        </span>
      </div>

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
          className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400">
            Messages are recorded in official audit logs.
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
    </Card>
  );
}
