import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'debtcrusher.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS credit_repair_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT NOT NULL,
    payment_id TEXT,
    disputed_items TEXT NOT NULL, -- JSON string of disputed items
    dispute_type TEXT NOT NULL, -- 'bureau_disputes', 'goodwill', 'pay_for_delete'
    letters_generated INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    refund_eligible_until DATETIME NOT NULL -- 60 days from created_at
  );
  
  CREATE INDEX IF NOT EXISTS idx_credit_repair_logs_user_email 
  ON credit_repair_logs (user_email);
  
  CREATE INDEX IF NOT EXISTS idx_credit_repair_logs_payment_id 
  ON credit_repair_logs (payment_id);
  
  CREATE INDEX IF NOT EXISTS idx_credit_repair_logs_created_at 
  ON credit_repair_logs (created_at);
`);

// Prepared statements for better performance
const statements = {
  insertCreditRepairLog: db.prepare(`
    INSERT INTO credit_repair_logs (
      user_email, payment_id, disputed_items, dispute_type, 
      letters_generated, refund_eligible_until
    ) VALUES (?, ?, ?, ?, ?, datetime('now', '+60 days'))
  `),
  
  getCreditRepairLogsByUser: db.prepare(`
    SELECT * FROM credit_repair_logs 
    WHERE user_email = ?
    ORDER BY created_at DESC
  `),
  
  getCreditRepairLogByPaymentId: db.prepare(`
    SELECT * FROM credit_repair_logs 
    WHERE payment_id = ?
  `),
  
  getEligibleRefunds: db.prepare(`
    SELECT * FROM credit_repair_logs 
    WHERE refund_eligible_until > datetime('now')
    ORDER BY created_at DESC
  `),
};

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

export const creditRepairDb = {
  /**
   * Log a credit repair dispute session
   */
  logCreditRepairDispute: (
    userEmail: string,
    paymentId: string | null,
    disputedItems: DisputedItem[],
    disputeType: 'bureau_disputes' | 'goodwill' | 'pay_for_delete',
    lettersGenerated: number
  ): void => {
    const disputedItemsJson = JSON.stringify(disputedItems);
    statements.insertCreditRepairLog.run(
      userEmail,
      paymentId,
      disputedItemsJson,
      disputeType,
      lettersGenerated
    );
  },

  /**
   * Get all credit repair logs for a user
   */
  getCreditRepairLogsByUser: (userEmail: string): CreditRepairLog[] => {
    return statements.getCreditRepairLogsByUser.all(userEmail) as CreditRepairLog[];
  },

  /**
   * Get credit repair log by payment ID
   */
  getCreditRepairLogByPaymentId: (paymentId: string): CreditRepairLog | undefined => {
    return statements.getCreditRepairLogByPaymentId.get(paymentId) as CreditRepairLog | undefined;
  },

  /**
   * Get all logs eligible for refunds (within 60 days)
   */
  getEligibleRefunds: (): CreditRepairLog[] => {
    return statements.getEligibleRefunds.all() as CreditRepairLog[];
  },

  /**
   * Parse disputed items JSON
   */
  parseDisputedItems: (log: CreditRepairLog): DisputedItem[] => {
    try {
      return JSON.parse(log.disputed_items);
    } catch {
      return [];
    }
  },
};

export { db };
export default db;