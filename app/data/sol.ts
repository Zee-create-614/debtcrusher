// Statute of Limitations by state (in years) for written contracts
// Sources: Various state statutes as of 2024
export interface StatuteOfLimitations {
  state: string;
  abbr: string;
  written: number;
  oral: number;
  promissory: number;
  openAccount: number;
}

export const statuteOfLimitations: StatuteOfLimitations[] = [
  { state: "Alabama", abbr: "AL", written: 6, oral: 6, promissory: 6, openAccount: 3 },
  { state: "Alaska", abbr: "AK", written: 3, oral: 3, promissory: 3, openAccount: 3 },
  { state: "Arizona", abbr: "AZ", written: 6, oral: 3, promissory: 6, openAccount: 3 },
  { state: "Arkansas", abbr: "AR", written: 5, oral: 3, promissory: 5, openAccount: 3 },
  { state: "California", abbr: "CA", written: 4, oral: 2, promissory: 4, openAccount: 4 },
  { state: "Colorado", abbr: "CO", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Connecticut", abbr: "CT", written: 6, oral: 3, promissory: 6, openAccount: 3 },
  { state: "Delaware", abbr: "DE", written: 3, oral: 3, promissory: 3, openAccount: 3 },
  { state: "Florida", abbr: "FL", written: 5, oral: 4, promissory: 5, openAccount: 4 },
  { state: "Georgia", abbr: "GA", written: 6, oral: 4, promissory: 6, openAccount: 4 },
  { state: "Hawaii", abbr: "HI", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Idaho", abbr: "ID", written: 5, oral: 4, promissory: 5, openAccount: 4 },
  { state: "Illinois", abbr: "IL", written: 10, oral: 5, promissory: 10, openAccount: 5 },
  { state: "Indiana", abbr: "IN", written: 10, oral: 6, promissory: 10, openAccount: 6 },
  { state: "Iowa", abbr: "IA", written: 10, oral: 5, promissory: 10, openAccount: 5 },
  { state: "Kansas", abbr: "KS", written: 5, oral: 3, promissory: 5, openAccount: 3 },
  { state: "Kentucky", abbr: "KY", written: 15, oral: 5, promissory: 15, openAccount: 5 },
  { state: "Louisiana", abbr: "LA", written: 10, oral: 3, promissory: 10, openAccount: 3 },
  { state: "Maine", abbr: "ME", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Maryland", abbr: "MD", written: 3, oral: 3, promissory: 3, openAccount: 3 },
  { state: "Massachusetts", abbr: "MA", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Michigan", abbr: "MI", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Minnesota", abbr: "MN", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Mississippi", abbr: "MS", written: 3, oral: 3, promissory: 3, openAccount: 3 },
  { state: "Missouri", abbr: "MO", written: 10, oral: 5, promissory: 10, openAccount: 5 },
  { state: "Montana", abbr: "MT", written: 8, oral: 5, promissory: 8, openAccount: 5 },
  { state: "Nebraska", abbr: "NE", written: 5, oral: 4, promissory: 5, openAccount: 4 },
  { state: "Nevada", abbr: "NV", written: 6, oral: 4, promissory: 6, openAccount: 4 },
  { state: "New Hampshire", abbr: "NH", written: 3, oral: 3, promissory: 3, openAccount: 3 },
  { state: "New Jersey", abbr: "NJ", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "New Mexico", abbr: "NM", written: 6, oral: 4, promissory: 6, openAccount: 4 },
  { state: "New York", abbr: "NY", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "North Carolina", abbr: "NC", written: 3, oral: 3, promissory: 3, openAccount: 3 },
  { state: "North Dakota", abbr: "ND", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Ohio", abbr: "OH", written: 6, oral: 4, promissory: 6, openAccount: 4 },
  { state: "Oklahoma", abbr: "OK", written: 5, oral: 3, promissory: 5, openAccount: 3 },
  { state: "Oregon", abbr: "OR", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Pennsylvania", abbr: "PA", written: 4, oral: 4, promissory: 4, openAccount: 4 },
  { state: "Rhode Island", abbr: "RI", written: 10, oral: 10, promissory: 10, openAccount: 10 },
  { state: "South Carolina", abbr: "SC", written: 3, oral: 3, promissory: 3, openAccount: 3 },
  { state: "South Dakota", abbr: "SD", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Tennessee", abbr: "TN", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Texas", abbr: "TX", written: 4, oral: 4, promissory: 4, openAccount: 4 },
  { state: "Utah", abbr: "UT", written: 6, oral: 4, promissory: 6, openAccount: 4 },
  { state: "Vermont", abbr: "VT", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Virginia", abbr: "VA", written: 5, oral: 3, promissory: 5, openAccount: 3 },
  { state: "Washington", abbr: "WA", written: 6, oral: 3, promissory: 6, openAccount: 3 },
  { state: "West Virginia", abbr: "WV", written: 10, oral: 5, promissory: 10, openAccount: 5 },
  { state: "Wisconsin", abbr: "WI", written: 6, oral: 6, promissory: 6, openAccount: 6 },
  { state: "Wyoming", abbr: "WY", written: 10, oral: 8, promissory: 10, openAccount: 8 },
];

export function getSOL(stateAbbr: string): StatuteOfLimitations | undefined {
  return statuteOfLimitations.find(s => s.abbr === stateAbbr);
}

export function isDebtExpired(stateAbbr: string, debtAgeYears: number, type: 'written' | 'oral' = 'written'): boolean {
  const sol = getSOL(stateAbbr);
  if (!sol) return false;
  return debtAgeYears >= sol[type];
}
