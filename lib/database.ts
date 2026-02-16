import path from 'path';
import fs from 'fs';

// Use /tmp on Vercel (serverless), or local data dir in dev
const dataDir = process.env.VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'credit_repair_logs.json');

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

function readLogs(): CreditRepairLog[] {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }
  } catch {}
  return [];
}

function writeLogs(logs: CreditRepairLog[]): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbPath, JSON.stringify(logs, null, 2));
}

export const creditRepairDb = {
  logCreditRepairDispute: (
    userEmail: string,
    paymentId: string | null,
    disputedItems: DisputedItem[],
    disputeType: 'bureau_disputes' | 'goodwill' | 'pay_for_delete',
    lettersGenerated: number
  ): void => {
    const logs = readLogs();
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
    writeLogs(logs);
  },

  getCreditRepairLogsByUser: (userEmail: string): CreditRepairLog[] => {
    return readLogs().filter(l => l.user_email === userEmail);
  },

  getCreditRepairLogByPaymentId: (paymentId: string): CreditRepairLog | undefined => {
    return readLogs().find(l => l.payment_id === paymentId);
  },

  getEligibleRefunds: (): CreditRepairLog[] => {
    const now = new Date().toISOString();
    return readLogs().filter(l => l.refund_eligible_until > now);
  },

  parseDisputedItems: (log: CreditRepairLog): DisputedItem[] => {
    try { return JSON.parse(log.disputed_items); } catch { return []; }
  },
};
