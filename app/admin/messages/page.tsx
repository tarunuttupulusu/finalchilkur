"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, MessageSquare, Send, Check, CheckCheck, Inbox, 
  Loader2, AlertCircle, Phone, Mail, Clock, ShieldAlert, RefreshCw
} from 'lucide-react';

export default function MessagesCMS() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Local chat reply history store: { [messageId]: Array of reply messages }
  const [repliesStore, setRepliesStore] = useState<{ [key: string]: any[] }>({});
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat when a message or reply is added
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessageId, repliesStore]);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/messages?limit=50');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        if (data.messages && data.messages.length > 0 && !selectedMessageId) {
          setSelectedMessageId(data.messages[0].id);
          markAsRead(data.messages[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load inbox messages:', e);
    } finally {
      setLoading(false);
    }
  }

  const markAsRead = async (id: string) => {
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    try {
      await fetch('/api/cms/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true })
      });
    } catch (e) {
      console.error('Failed to update message status:', e);
    }
  };

  const handleSelectMessage = (msg: any) => {
    setSelectedMessageId(msg.id);
    if (!msg.isRead) {
      markAsRead(msg.id);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessageId) return;

    const activeMsg = messages.find(m => m.id === selectedMessageId);
    if (!activeMsg) return;

    setSendingReply(true);
    const trimmedReply = replyText.trim();
    
    try {
      const res = await fetch('/api/cms/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Balaji Dhaba Admin',
          email: 'admin@balajidhaba.com',
          phone: activeMsg.phone,
          subject: `Re: ${activeMsg.subject || 'Inquiry'}`,
          message: `[REPLY TO ${activeMsg.name}]: ${trimmedReply}`
        })
      });

      const newReply = {
        id: `reply-${Date.now()}`,
        message: trimmedReply,
        createdAt: new Date().toISOString(),
        isAdmin: true
      };

      setRepliesStore(prev => ({
        ...prev,
        [selectedMessageId]: [...(prev[selectedMessageId] || []), newReply]
      }));

      setMessages(prev => prev.map(m => m.id === selectedMessageId ? { ...m, isReplied: true } : m));
      setReplyText('');
    } catch (err) {
      console.error('Failed to dispatch reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  // Filter messages based on search query
  const filteredMessages = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return messages.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.phone.includes(query) || 
      (m.email && m.email.toLowerCase().includes(query)) ||
      m.message.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  const activeMessage = useMemo(() => {
    return messages.find(m => m.id === selectedMessageId) || null;
  }, [messages, selectedMessageId]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-brand-dark/10 shadow-sm">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-accent flex items-center gap-2">
            <MessageSquare size={12} className="text-brand-accent" />
            Customer Relations Hub
          </span>
          <h1 className="font-display text-2xl font-black text-brand-dark mt-2">
            Unified Customer Inbox
          </h1>
          <p className="text-xs text-brand-dark/65 mt-1">
            Manage inquiries, view contact form submissions, and respond to guests in real-time.
          </p>
        </div>

        <button 
          onClick={loadMessages}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-brand-dark/15 hover:border-brand-accent text-brand-dark hover:text-brand-accent text-[10px] font-bold uppercase transition-all shadow-sm"
        >
          <RefreshCw size={12} />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-brand-dark/10 shadow-sm">
          <Loader2 className="animate-spin text-brand-accent mb-4" size={48} />
          <p className="font-display text-base font-bold text-brand-dark">Loading inbox message streams...</p>
        </div>
      ) : (
        /* Split Pane Container */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[72vh] items-stretch">
          
          {/* Left Panel: Preview List */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-brand-dark/10 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-brand-dark/5 bg-brand-bg/40 flex items-center gap-2">
              <Search size={14} className="text-brand-dark/40" />
              <input
                type="text"
                placeholder="Search by name, phone or text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-brand-dark/85 focus:outline-none placeholder-brand-dark/40"
              />
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto divide-y divide-brand-dark/5 pr-1 no-scrollbar">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-brand-dark/40">
                  <Inbox size={32} className="mb-2 text-brand-dark/30" />
                  <span className="text-xs font-semibold">No messages found</span>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = msg.id === selectedMessageId;
                  const isWebForm = !!msg.email;
                  const replies = repliesStore[msg.id] || [];
                  const isReplied = msg.isReplied || replies.length > 0;
                  
                  return (
                    <button
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg)}
                      className={`w-full p-4 text-left flex flex-col gap-2 transition-all cursor-pointer border-b border-brand-dark/5 last:border-b-0 ${
                        isSelected 
                          ? 'bg-brand-accent text-[#F6EFE3]' 
                          : 'hover:bg-brand-bg/30 text-brand-dark'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="font-bold text-xs truncate max-w-[150px]">
                          {msg.name}
                        </div>
                        <span className={`text-[8px] font-mono shrink-0 ${isSelected ? 'text-[#F6EFE3]/80' : 'text-brand-dark/45'}`}>
                          {new Date(msg.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-[#F6EFE3]/90' : 'text-brand-dark/65'}`}>
                        {msg.message}
                      </p>

                      <div className="flex items-center justify-between w-full mt-1">
                        {/* Source Tag */}
                        <span className={`text-[8px] px-2 py-0.5 rounded font-extrabold uppercase border ${
                          isSelected 
                            ? 'bg-brand-dark/20 border-brand-dark/30 text-[#F6EFE3]' 
                            : 'bg-brand-bg border-brand-dark/10 text-brand-dark/60'
                        }`}>
                          {isWebForm ? 'Web Form' : 'WhatsApp'}
                        </span>

                        {/* Status Label */}
                        <div className="flex items-center gap-1">
                          {isReplied ? (
                            <span className={`text-[8px] font-extrabold uppercase flex items-center gap-0.5 ${
                              isSelected ? 'text-[#F6EFE3]' : 'text-emerald-700'
                            }`}>
                              <CheckCheck size={10} />
                              Replied
                            </span>
                          ) : !msg.isRead ? (
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#F6EFE3]' : 'bg-brand-accent'}`} title="Unread" />
                          ) : (
                            <span className={`text-[8px] uppercase font-bold ${isSelected ? 'text-[#F6EFE3]/80' : 'text-brand-dark/45'}`}>Read</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat Window (warm brand-bg) */}
          <div className="lg:col-span-8 bg-[#FAF6EE] rounded-2xl border border-brand-dark/10 shadow-sm flex flex-col h-full overflow-hidden">
            {activeMessage ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 bg-white border-b border-brand-dark/10 flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-sm text-brand-dark">{activeMessage.name}</h3>
                    <div className="flex items-center gap-4 text-[10px] text-brand-dark/60">
                      <span className="flex items-center gap-1">
                        <Phone size={10} className="text-brand-accent" />
                        {activeMessage.phone}
                      </span>
                      {activeMessage.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={10} className="text-brand-accent" />
                          {activeMessage.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[8px] font-extrabold bg-brand-bg text-brand-accent border border-brand-dark/10 px-2 py-0.5 rounded uppercase">
                    {activeMessage.email ? 'Source: Web Site Form' : 'Source: WhatsApp Chat'}
                  </span>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Incoming Client Query Bubble */}
                  <div className="flex justify-start max-w-[85%]">
                    <div className="bg-white border border-brand-dark/10 rounded-2xl rounded-tl-none p-4 shadow-sm space-y-1.5 text-brand-dark">
                      {activeMessage.subject && (
                        <div className="font-bold text-[10px] uppercase tracking-wider text-brand-accent/60">
                          Subject: {activeMessage.subject}
                        </div>
                      )}
                      <p className="text-xs font-sans leading-relaxed">{activeMessage.message}</p>
                      <span className="block text-[8px] text-brand-dark/45 text-right mt-1 font-mono">
                        Received: {new Date(activeMessage.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Outgoing Reply History */}
                  {(repliesStore[activeMessage.id] || []).map((reply: any) => (
                    <div key={reply.id} className="flex justify-end max-w-[85%] ml-auto">
                      <div className="bg-brand-accent text-[#F6EFE3] rounded-2xl rounded-tr-none p-4 shadow-sm space-y-1 text-right">
                        <p className="text-xs font-sans leading-relaxed text-left">{reply.message}</p>
                        <span className="block text-[8px] text-[#F6EFE3]/80 mt-1 font-mono">
                          Replied: {new Date(reply.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div ref={chatEndRef} />
                </div>

                {/* Bottom Reply Bar */}
                <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-brand-dark/10 flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder={`Write a reply direct to ${activeMessage.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-brand-bg/30 border border-brand-dark/10 rounded-xl px-4 py-2.5 text-xs text-brand-dark focus:outline-none focus:border-brand-accent placeholder-brand-dark/40"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="bg-brand-accent hover:bg-brand-accent/90 text-[#F6EFE3] p-2.5 rounded-xl transition-all shadow-sm border border-brand-accent/30 disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
                    title="Send Reply"
                  >
                    {sendingReply ? (
                      <Loader2 size={14} className="animate-spin text-[#F6EFE3]/80" />
                    ) : (
                      <Send size={14} />
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-brand-dark/40">
                <MessageSquare size={48} className="text-brand-dark/20 mb-2" />
                <span className="text-sm font-semibold">Select a conversation thread to start</span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
