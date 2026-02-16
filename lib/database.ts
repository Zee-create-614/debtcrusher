import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface CreditRepairLog {
  id: number;
  user_email: string;
  payment_id: string | null;
  disputed_items: string; // JSON string
  dispute_type: 'bureau_disputes' | 'goodwill' | 'pay_for_delete';
  letters_generated: number;
  created_at: string;
  refund_eligible_until: string;
}

export interface DisputedItem {
  account: string;
  type: string;
  balance: number;
  dispute_reason: string;
  dispute_type: string;
  confidence: string;
  estimated_score_impact: number;
}

const LOGS_KEY = 'credit_repair_logs'

async function readLogs(): Promise<CreditRepairLog[]> {
  try {
    const logs = await redis.get<CreditRepairLog[]>(LOGS_KEY)
    return logs || []
  } catch {
    return []
  }
}

async function writeLogs(logs: CreditRepairLog[]): Promise<void> {
  await redis.set(LOGS_KEY, logs)
}

export const creditRepairDb = {
  logCreditRepairDispute: async (
    userEmail: string,
    paymentId: string | null,
    disputedItems: DisputedItem[],
    disputeType: 'bureau_disputes' | 'goodwill' | 'pay_for_delete',
    lettersGenerated: number
  ): Promise<void> => {
    const logs = await readLogs();
    const now = new Date();
    const refundDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    logs.push({
      id: logs.length + 1,
      user_email: userEmail,
      payment_id: paymentId,
      disputed_items: JSON.stringify(disputedItems),
      dispute_type: disputeType,
      letters_generated: lettersGenerated,
      created_at: now.toISOString(),
      refund_eligible_until: refundDate.toISOString(),
    });
    await writeLogs(logs);
  },

  getCreditRepairLogsByUser: async (userEmail: string): Promise<CreditRepairLog[]> => {
    const logs = await readLogs();
    return logs.filter(l => l.user_email === userEmail);
  },

  getCreditRepairLogByPaymentId: async (paymentId: string): Promise<CreditRepairLog | undefined> => {
    const logs = await readLogs();
    return logs.find(l => l.payment_id === paymentId);
  },

  getEligibleRefunds: async (): Promise<CreditRepairLog[]> => {
    const now = new Date().toISOString();
    const logs = await readLogs();
    return logs.filter(l => l.refund_eligible_until > now);
  },

  parseDisputedItems: (log: CreditRepairLog): DisputedItem[] => {
    try { return JSON.parse(log.disputed_items); } catch { return []; }
  },
};
