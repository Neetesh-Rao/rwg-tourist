import React, { useState } from 'react';
import { useCreateSupportQueryMutation, useGetMySupportQueriesQuery } from '@/app/store/slices/supportApi';
import { MessageCircle, X, ChevronDown, ChevronUp, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('other');

  const { data: historyData, isLoading } = useGetMySupportQueriesQuery(undefined, {
    skip: !isOpen || activeTab !== 'history'
  });
  const [createSupportQuery, { isLoading: isSubmitting }] = useCreateSupportQueryMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message) return toast.error("Subject and message are required.");
    
    try {
      await createSupportQuery({ subject, message, category }).unwrap();
      toast.success("Support query sent!");
      setSubject('');
      setMessage('');
      setActiveTab('history');
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send query");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[var(--brand)] text-[var(--brand-dark)] rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Widget Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden flex flex-col h-[500px] animate-scale-in">
          
          <div className="p-4 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-bold text-lg">Support & Help</h3>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('new')} className={`text-sm font-semibold px-3 py-1 rounded-full ${activeTab === 'new' ? 'bg-[var(--brand)] text-[var(--brand-dark)]' : 'bg-[var(--surface-3)]'}`}>New</button>
              <button onClick={() => setActiveTab('history')} className={`text-sm font-semibold px-3 py-1 rounded-full ${activeTab === 'history' ? 'bg-[var(--brand)] text-[var(--brand-dark)]' : 'bg-[var(--surface-3)]'}`}>History</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-[var(--surface)]">
            {activeTab === 'new' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-[var(--border)] rounded-xl p-2.5 bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--brand)] transition-colors">
                    <option value="booking">Booking Issue</option>
                    <option value="payment">Payment Issue</option>
                    <option value="ride">Ride Issue</option>
                    <option value="account">Account Settings</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full border border-[var(--border)] rounded-xl p-2.5 bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--brand)] transition-colors" placeholder="Brief summary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full border border-[var(--border)] rounded-xl p-2.5 bg-[var(--surface-2)] text-[var(--text)] outline-none focus:border-[var(--brand)] transition-colors h-32 resize-none" placeholder="Describe your issue..." required></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full btn-brand flex items-center justify-center gap-2">
                  {isSubmitting ? 'Sending...' : <><Send size={18} /> Send Query</>}
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-10 text-[var(--text-2)]">Loading queries...</div>
                ) : historyData?.data?.length > 0 ? (
                  historyData.data.map(q => (
                    <div key={q._id} className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm line-clamp-1 flex-1">{q.subject}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(q.status)}`}>{q.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs text-[var(--text-2)] mb-2 line-clamp-2">{q.message}</p>
                      
                      {q.adminReply && (
                        <div className="mt-2 p-2 bg-[var(--brand)]/10 border border-[var(--brand)]/20 rounded-lg">
                          <p className="text-[10px] font-bold text-[var(--brand-dark)] mb-0.5">Admin Reply:</p>
                          <p className="text-xs text-[var(--text)]">{q.adminReply}</p>
                        </div>
                      )}
                      <div className="text-[10px] text-right mt-2 text-[var(--text-3)]">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-[var(--text-2)]">No past queries found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
