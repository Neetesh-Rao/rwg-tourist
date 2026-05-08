import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useGetPaymentHistoryQuery } from '@/app/store/slices/paymentApi';
import PageWrapper from '@/shared/layout/PageWrapper/PageWrapper';
import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';
import { formatINR, formatDate } from '@/shared/lib/helpers';

export default function WalletPage() {
  const { data: historyResponse, isLoading } = useGetPaymentHistoryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const paymentsRaw = historyResponse?.data || historyResponse?.payments || historyResponse || [];
  const payments = Array.isArray(paymentsRaw)
    ? paymentsRaw.map((item) => ({
        ...item,
        id: item?._id || item?.id,
        amountPaid: item?.payment?.amountPaid || 0,
        paymentMethod: item?.payment?.method || 'None',
        paymentStatus: item?.payment?.status || 'pending',
        transactionId: item?.payment?.transactionId || '-',
        paidAt: item?.payment?.paidAt || item?.updatedAt || item?.createdAt,
      }))
    : [];

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="text-xs tracking-[0.3em] text-brand-500 uppercase font-semibold mb-2">Payments</div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">Payment history</h1>
          <p className="text-ink-400 mt-1">Your booking payments and transaction details.</p>
        </div>

        <Card className="!p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-display font-bold text-ink-900 dark:text-ink-100">Transactions</h3>
            <span className="text-xs text-ink-400">{payments.length} total</span>
          </div>
          {isLoading ? (
            <div className="py-12 text-center text-ink-400 text-sm">Loading transactions...</div>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center text-ink-400 text-sm">No transactions yet</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {payments.map((payment) => (
                <div key={payment.id} className="px-5 py-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${payment.paymentStatus === 'paid' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                      {payment.paymentStatus === 'paid' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">{payment.city}</p>
                          <p className="text-xs text-ink-400 mt-0.5">{formatDate(payment.date)} · {payment.startTime}</p>
                        </div>
                        <Badge variant={payment.paymentStatus === 'paid' ? 'green' : 'amber'}>
                          {payment.paymentStatus}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                        <div>
                          <p className="text-ink-400">Payment method</p>
                          <p className="font-medium text-ink-900 dark:text-ink-100">{payment.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-ink-400">Amount paid</p>
                          <p className="font-mono font-bold text-ink-900 dark:text-ink-100">{formatINR(payment.amountPaid)}</p>
                        </div>
                        <div>
                          <p className="text-ink-400">Transaction ID</p>
                          <p className="font-mono text-ink-900 dark:text-ink-100 break-all">{payment.transactionId}</p>
                        </div>
                        <div>
                          <p className="text-ink-400">Paid at</p>
                          <p className="text-ink-900 dark:text-ink-100">{formatDate(payment.paidAt, { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
}
