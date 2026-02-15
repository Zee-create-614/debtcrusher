import { NextResponse } from "next/server";
import { getSOL } from "../../data/sol";
import { getRandomOvercharges } from "../../data/common-overcharges";

function getDebtAgeYears(debtAge: string): number {
  switch (debtAge) {
    case "<1 year": return 0.5;
    case "1-3 years": return 2;
    case "3-5 years": return 4;
    case "5-7 years": return 6;
    case "7+ years": return 8;
    default: return 1;
  }
}

function generateDisputeLetter(creditor: string, amount: number, type: string): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `${date}

${creditor || "[Creditor Name]"}
[Creditor Address]
[City, State ZIP]

Re: Dispute of Charges — Account Balance: $${amount.toLocaleString()}

To Whom It May Concern:

I am writing to formally dispute charges on my account. After careful review, I have identified the following issues with my bill:

1. OVERCHARGES: Several line items exceed fair market rates for the services described. I have identified specific CPT codes that are billed significantly above the Medicare reimbursement rate and regional fair market value.

2. POTENTIAL DUPLICATE CHARGES: My review suggests possible duplicate billing for services rendered on the same date.

3. ITEMIZED BILL REQUEST: Pursuant to my rights under the Fair Debt Collection Practices Act and applicable state law, I request a fully itemized statement showing:
   - Each service provided with corresponding CPT/HCPCS codes
   - The date each service was rendered
   - The provider who performed each service
   - The individual charge for each line item

I request that you review and correct these charges within 30 days. If I do not receive a satisfactory response, I will file complaints with the Consumer Financial Protection Bureau (CFPB) and my state Attorney General's office.

I reserve all rights under applicable federal and state consumer protection laws.

Sincerely,
[Your Name]
[Your Address]
[City, State ZIP]`;
}

function generateValidationLetter(creditor: string, amount: number): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `${date}

${creditor || "[Collection Agency Name]"}
[Agency Address]
[City, State ZIP]

Re: Debt Validation Request — Alleged Balance: $${amount.toLocaleString()}

To Whom It May Concern:

I am writing in response to your communication regarding an alleged debt. Pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g, I am requesting validation of this debt.

Please provide the following within 30 days:

1. The amount of the debt and how it was calculated
2. The name of the original creditor
3. Proof that you are licensed to collect debts in my state
4. A copy of the original signed agreement or contract
5. A complete payment history from the original creditor
6. Proof that the statute of limitations has not expired
7. Your license number for debt collection in my state

NOTICE: Until you provide proper validation, you must:
- Cease all collection activities
- Not report this debt to any credit reporting agency
- Not contact me by phone regarding this debt

Any continued collection activity prior to validation constitutes a violation of the FDCPA, which may entitle me to statutory damages of up to $1,000 per violation, plus attorney's fees.

This letter is not an acknowledgment of the debt and should not be construed as such.

Sincerely,
[Your Name]
[Your Address]
[City, State ZIP]

Sent via Certified Mail, Return Receipt Requested`;
}

function generateSettlementLetter(creditor: string, amount: number, offerPercent: number): string {
  const offerAmount = Math.round(amount * offerPercent);
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return `${date}

${creditor || "[Creditor/Collection Agency]"}
[Address]
[City, State ZIP]

Re: Settlement Offer — Alleged Balance: $${amount.toLocaleString()}

To Whom It May Concern:

I am writing to propose a settlement of the above-referenced account. While I dispute the validity and accuracy of the full amount claimed, I am prepared to resolve this matter with a one-time payment.

SETTLEMENT OFFER: $${offerAmount.toLocaleString()} (${Math.round(offerPercent * 100)}% of claimed balance)

This offer is contingent on the following conditions:
1. This payment constitutes full and final settlement of this account
2. You will report this account as "Paid in Full" or "Settled" to all three credit bureaus within 30 days of payment
3. You will provide written confirmation of this settlement agreement before I remit payment
4. No further collection activity will be pursued on this account

This offer is valid for 30 days from the date of this letter. If you are unable to accept these terms, please contact me in writing with a counter-proposal.

This letter is not an acknowledgment of the debt and does not restart any applicable statute of limitations.

Sincerely,
[Your Name]
[Your Address]
[City, State ZIP]`;
}

function generateCreditDisputeLetter(bureau: string, creditor: string, amount: number): string {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const addresses: Record<string, string> = {
    "Equifax": "Equifax Information Services LLC\nP.O. Box 740256\nAtlanta, GA 30374",
    "Experian": "Experian\nP.O. Box 4500\nAllen, TX 75013",
    "TransUnion": "TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016",
  };
  return `${date}

${addresses[bureau] || bureau}

Re: Dispute of Inaccurate Information — ${creditor || "[Creditor]"} Account

To Whom It May Concern:

I am writing pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681, to dispute the following inaccurate information on my credit report:

DISPUTED ITEM:
- Creditor: ${creditor || "[Creditor Name]"}
- Amount Reported: $${amount.toLocaleString()}
- Reason for Dispute: The reported information is inaccurate and/or unverifiable

I request that you:
1. Investigate this disputed item within 30 days as required by law
2. Contact the furnisher of this information to verify its accuracy
3. Remove or correct the item if it cannot be verified
4. Send me an updated copy of my credit report after the investigation

Under the FCRA, you must complete your investigation within 30 days and notify me of the results. If the information is found to be inaccurate or unverifiable, it must be promptly deleted or corrected.

Enclosed: Copy of government-issued ID and proof of address.

Sincerely,
[Your Name]
[Your Address]
[City, State ZIP]
[SSN: XXX-XX-XXXX]
[DOB: XX/XX/XXXX]`;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, amount, creditor, state, debt_age } = body;

  const debtAmount = amount || 3400;
  const debtAgeYears = getDebtAgeYears(debt_age || "<1 year");
  const sol = getSOL(state || "OH");
  const isExpired = sol ? debtAgeYears >= sol.written : false;

  // Generate mock line items for medical bills
  const overcharges = type === "Medical" ? getRandomOvercharges(5) : [];
  const lineItems = overcharges.map(oc => ({
    code: oc.code,
    description: oc.description,
    billed: oc.typicalBilled,
    fair: oc.fairPrice,
    status: oc.typicalBilled > oc.fairPrice * 2 ? "overcharged" as const : "fair" as const,
    savings: oc.typicalBilled - oc.fairPrice,
  }));

  // Calculate savings
  const totalBilled = lineItems.reduce((sum, li) => sum + li.billed, 0) || debtAmount;
  const totalFair = lineItems.reduce((sum, li) => sum + li.fair, 0) || Math.round(debtAmount * 0.45);
  const totalSavings = totalBilled - totalFair;

  // Settlement calculation
  const settlementPercent = debtAgeYears > 5 ? 0.2 : debtAgeYears > 3 ? 0.3 : debtAgeYears > 1 ? 0.4 : 0.5;
  const settlementAmount = Math.round(debtAmount * settlementPercent);

  // FDCPA violations (mock based on collections type)
  const fdcpaViolations = type === "Collections" ? [
    { violation: "Failure to provide written validation notice within 5 days of initial contact", statute: "15 U.S.C. § 1692g(a)", severity: "high" },
    { violation: "Contacting consumer at inconvenient times", statute: "15 U.S.C. § 1692c(a)(1)", severity: "medium" },
  ] : [];

  const result = {
    summary: {
      totalBilled,
      totalFair,
      totalSavings,
      savingsPercent: Math.round((totalSavings / totalBilled) * 100),
      settlementAmount,
      settlementPercent: Math.round(settlementPercent * 100),
    },
    lineItems,
    statuteOfLimitations: {
      state: sol?.state || "Unknown",
      yearsWritten: sol?.written || 0,
      yearsOral: sol?.oral || 0,
      debtAge: debt_age || "<1 year",
      debtAgeYears,
      isExpired,
      message: isExpired
        ? `🎉 This debt may be past the statute of limitations in ${sol?.state}! The ${sol?.written}-year limit for written contracts has likely expired. Collectors may not be able to sue you for this debt.`
        : `The statute of limitations for written contracts in ${sol?.state || "your state"} is ${sol?.written || "N/A"} years. This debt appears to be within the collection window.`,
    },
    fdcpaViolations,
    letters: {
      dispute: generateDisputeLetter(creditor, debtAmount, type),
      validation: generateValidationLetter(creditor, debtAmount),
      settlement: generateSettlementLetter(creditor, debtAmount, settlementPercent),
      creditDispute: {
        equifax: generateCreditDisputeLetter("Equifax", creditor, debtAmount),
        experian: generateCreditDisputeLetter("Experian", creditor, debtAmount),
        transunion: generateCreditDisputeLetter("TransUnion", creditor, debtAmount),
      },
    },
    negotiationScript: [
      `📞 STEP 1: Call ${creditor || "the creditor"} and ask to speak with someone authorized to negotiate settlements.`,
      `📋 STEP 2: State clearly: "I'm calling to discuss a resolution for account [your account number]. I'd like to explore a settlement."`,
      `💰 STEP 3: Start low. Offer $${Math.round(debtAmount * 0.15).toLocaleString()} (${15}% of the balance). They will counter.`,
      `🎯 STEP 4: Your target is $${settlementAmount.toLocaleString()} (${Math.round(settlementPercent * 100)}% of balance). Don't go above this unless absolutely necessary.`,
      `📝 STEP 5: CRITICAL — Get everything in writing BEFORE making any payment. Ask them to email or mail the settlement terms.`,
      `🔒 STEP 6: Pay by money order or cashier's check — never give them direct access to your bank account.`,
      `📬 STEP 7: After payment, send a follow-up letter confirming the settlement and requesting credit bureau updates within 30 days.`,
      isExpired ? `⚠️ BONUS: This debt may be past the statute of limitations. You may not even need to negotiate — consider sending a debt validation letter first.` : "",
    ].filter(Boolean),
    debtType: type,
    creditor,
    amount: debtAmount,
  };

  return NextResponse.json(result);
}
