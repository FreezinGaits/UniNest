'use me';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, ShieldAlert, Lock, X, CheckCircle2, AlertTriangle, Loader2, Sparkles, Building2, User } from 'lucide-react';

interface UniNestMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  landlordName: string;
  bookingId?: string;
  visitId?: string;
}

interface MessageItem {
  id: string;
  sender: { id: string; name: string; role: string };
  content: string;
  createdAt: string;
  isMasked?: boolean;
}

const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const LINK_REGEX = /whatsapp|telegram|wa\.me|t\.me|instagram|http:\/\/|https:\/\/|\.com|\.in/i;

export function UniNestMessagesModal({
  isOpen,
  onClose,
  propertyName,
  landlordName,
  bookingId,
  visitId,
}: UniNestMessagesModalProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg-1',
      sender: { id: 'landlord-1', name: landlordName || 'Vikram Singh (Landlord)', role: 'LANDLORD' },
      content: `Hello Rahul! Welcome to ${propertyName}. Thank you for placing your ₹399 bed reservation. Feel free to ask any questions about room facilities or visit timing.`,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);
  const [inputContent, setInputContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const url = `/api/messages?${bookingId ? `bookingId=${bookingId}` : ''}${visitId ? `&visitId=${visitId}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.log('Failed to fetch chat messages', e);
    }
  };

  if (!isOpen) return null;

  // Real-time client side moderation check
  const handleInputChange = (val: string) => {
    setInputContent(val);
    if (PHONE_REGEX.test(val) || EMAIL_REGEX.test(val) || LINK_REGEX.test(val)) {
      setWarningMsg('🔒 Security Alert: Personal contact details (phone, email, WhatsApp, URLs) cannot be shared before booking confirmation.');
    } else {
      setWarningMsg('');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    if (PHONE_REGEX.test(inputContent) || EMAIL_REGEX.test(inputContent) || LINK_REGEX.test(inputContent)) {
      setWarningMsg('🔒 Blocked: Message contains restricted contact info or external link. Please keep communication on UniNest.');
      return;
    }

    setIsSubmitting(true);
    setWarningMsg('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          visitId,
          content: inputContent,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.status === 422 || data.isMasked) {
        setWarningMsg(data.error || '🔒 Message blocked by UniNest Anti-Leakage Guard.');
      } else if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputContent('');
      }
    } catch (err) {
      setIsSubmitting(false);
      alert('Failed to send message');
    }
  };

  const handleQuickQuestion = (q: string) => {
    setInputContent(q);
    setWarningMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full h-[600px] max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-sm text-white">
              {landlordName ? landlordName[0] : 'V'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm">{landlordName || 'Vikram Singh'}</h3>
                <span className="bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Verified Landlord
                </span>
              </div>
              <p className="text-xs text-slate-300">{propertyName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
              <Lock className="w-3 h-3" />
              Protected Chat
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-4 flex items-center gap-2 text-xs text-amber-900 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>UniNest Safety Guard:</strong> Off-platform contact sharing (phone, email, WhatsApp) is masked to protect both parties and secure your ₹399 booking hold.
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.map((m) => {
            const isMe = m.sender.role === 'STUDENT' || m.sender.name.includes('Rahul');
            return (
              <div
                key={m.id}
                className={`flex gap-2 max-w-[82%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isMe ? 'bg-indigo-600 text-white' : 'bg-emerald-700 text-white'
                  }`}
                >
                  {isMe ? 'R' : 'V'}
                </div>
                <div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className={`text-[10px] text-slate-500 block mt-1 px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-200/80 flex gap-2 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => handleQuickQuestion('Is Wi-Fi included in the rent?')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
          >
            📶 Is Wi-Fi included?
          </button>
          <button
            onClick={() => handleQuickQuestion('What are the mess and food timings?')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
          >
            🍛 Mess timings?
          </button>
          <button
            onClick={() => handleQuickQuestion('Can I visit on Saturday afternoon?')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
          >
            📅 Visit on Saturday?
          </button>
        </div>

        {/* Warning Alert if Triggered */}
        {warningMsg && (
          <div className="bg-rose-50 border-t border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 flex items-center gap-1.5 shrink-0 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{warningMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputContent}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type your message to landlord..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSubmitting || !inputContent.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
