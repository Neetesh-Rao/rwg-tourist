import React, { useState } from 'react';
import { CheckCircle2, Calendar, MapPin, CreditCard, Clock, ChevronRight, Receipt } from 'lucide-react';
import { useGetPaymentHistoryQuery } from '@/app/store/slices/transactionApi';
import PageWrapper from '@/shared/layout/PageWrapper/PageWrapper';
import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';
import Modal from '@/shared/ui/Modal/Modal';
import { formatINR, formatDate } from '@/shared/lib/helpers';

export default function TransactionsPage() {
  const { data: historyResponse, isLoading } = useGetPaymentHistoryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [selectedBooking, setSelectedBooking] = useState(null);

  const bookings = historyResponse?.data || [];

  const handleCloseModal = () => setSelectedBooking(null);

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">Transaction History</div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Payments & Bookings</h1>
          <p className="text-ink-400 mt-1">Manage your booking payments and view transaction details.</p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-ink-400 text-sm">Loading your transactions...</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="py-16 text-center">
            <div className="w-16 h-16 bg-surface-2 dark:bg-surface-3 rounded-full flex items-center justify-center mx-auto mb-4 text-ink-300">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-ink-900 dark:text-ink-100">No transactions found</h3>
            <p className="text-ink-400 text-sm mt-1">You haven't made any booking payments yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const totalAmount = booking.pricing?.totalAmount || 0;
              const amountPaid = booking.payment?.amountPaid || 0;
              const progress = totalAmount > 0 ? Math.min((amountPaid / totalAmount) * 100, 100) : 0;

              return (
                <div 
                  key={booking._id} 
                  onClick={() => setSelectedBooking(booking)}
                  className="group relative flex items-center justify-between p-4 bg-surface/50 dark:bg-surface-2/30 backdrop-blur-sm border border-[var(--border)] rounded-2xl cursor-pointer hover:border-brand-500/50 hover:bg-surface-2 dark:hover:bg-surface-3 transition-all animate-fade-in"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-ink-900 dark:text-ink-100 truncate">{booking.city}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-ink-400 truncate">{formatDate(booking.createdAt)}</span>
                        <span className="w-1 h-1 bg-ink-300 rounded-full" />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${booking.bookingStatus === 'completed' ? 'text-green-500' : 'text-brand-500'}`}>
                          {booking.bookingStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pl-4">
                    <div className="hidden sm:flex flex-col items-end">
                      <div className="w-24 h-1.5 bg-surface-2 dark:bg-surface-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-gradient rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-ink-400 mt-1 uppercase tracking-tight">{Math.round(progress)}% PAID</span>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-ink-900 dark:text-ink-100">{formatINR(totalAmount)}</p>
                      <p className="text-[10px] text-ink-400 font-medium uppercase">Total</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <Modal 
        open={!!selectedBooking} 
        onClose={handleCloseModal} 
        title="Transaction Details"
        size="lg"
      >
        {selectedBooking && (
          <div className="flex flex-col h-full">
            {/* Modal Header/Hero */}
            <div className="px-5 py-4 bg-surface-2/30 dark:bg-surface-3/20 border rounded-2xl border-[var(--border)] mb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={selectedBooking.bookingStatus === 'completed' ? 'green' : 'brand'}>
                      {selectedBooking.bookingStatus}
                    </Badge>
                    <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest opacity-60">
                      ID: {selectedBooking._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-ink-900 dark:text-ink-100">
                    {selectedBooking.city} Tour
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" /> {formatDate(selectedBooking.createdAt)}
                    </span>
                    <span className="w-1 h-1 bg-ink-300 rounded-full" />
                    <span>{selectedBooking.vehicleType || 'Bike'}</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500 shrink-0">
                  <Receipt className="w-7 h-7" />
                </div>
              </div>
            </div>

            <div className="space-y-6 pb-2">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-surface-2/40 border border-[var(--border)] shadow-sm">
                  <p className="text-[9px] font-bold text-ink-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-lg font-bold text-ink-900 dark:text-ink-100">{formatINR(selectedBooking.pricing?.totalAmount || 0)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-green-500/[0.03] border border-green-500/10 shadow-sm">
                  <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest mb-1">Paid</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatINR(selectedBooking.payment?.amountPaid || 0)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 shadow-sm">
                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-1">Due</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatINR(selectedBooking.remainingAmount || 0)}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">Progress</p>
                  <span className="text-xs font-bold text-brand-500">{Math.round((selectedBooking.payment?.amountPaid / selectedBooking.pricing?.totalAmount) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-surface-2 dark:bg-surface-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-gradient rounded-full transition-all duration-1000"
                    style={{ width: `${(selectedBooking.payment?.amountPaid / selectedBooking.pricing?.totalAmount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Transactions */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-ink-900 dark:text-ink-100 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  Transactions
                </h4>
                <div className="space-y-2 pb-2">
                  {selectedBooking.transactions && selectedBooking.transactions.length > 0 ? (
                    selectedBooking.transactions.map((tx, idx) => (
                      <div key={tx.transactionId || idx} className="flex items-center justify-between p-3.5 rounded-xl bg-surface/50 dark:bg-surface-2/40 border border-[var(--border)]">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tx.paymentType === 'advance' ? 'bg-brand-500/5 text-brand-500' : 'bg-green-500/5 text-green-500'}`}>
                            {tx.paymentType === 'advance' ? <Clock className="w-4.5 h-4.5" /> : <CheckCircle2 className="w-4.5 h-4.5" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-ink-900 dark:text-ink-100 capitalize leading-tight">{tx.paymentType}</p>
                            <p className="text-[10px] text-ink-400 font-medium">{tx.method} · <span className="font-mono">{tx.transactionId?.slice(-12)}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-ink-900 dark:text-ink-100">{formatINR(tx.amount)}</p>
                          <p className="text-[9px] text-ink-400 font-medium uppercase">{formatDate(tx.paidAt, { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-surface-2/30 rounded-xl border border-dashed border-[var(--border)]">
                      <p className="text-xs text-ink-400 italic">No transactions.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>


            {/* Footer */}
            <div className="p-4 bg-surface-2/30 border-t border-[var(--border)]">
              <button 
                onClick={handleCloseModal}
                className="w-full py-3.5 bg-brand-500 text-white rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

    </PageWrapper>
  );
}


