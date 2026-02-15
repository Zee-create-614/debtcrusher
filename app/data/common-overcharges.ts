export interface CPTCode {
  code: string;
  description: string;
  fairPrice: number;
  typicalBilled: number;
  overchargePercent: number;
  category: string;
}

export const commonOvercharges: CPTCode[] = [
  { code: "99213", description: "Office visit, established patient (15 min)", fairPrice: 120, typicalBilled: 350, overchargePercent: 192, category: "Office Visit" },
  { code: "99214", description: "Office visit, established patient (25 min)", fairPrice: 175, typicalBilled: 520, overchargePercent: 197, category: "Office Visit" },
  { code: "99215", description: "Office visit, established patient (40 min)", fairPrice: 235, typicalBilled: 680, overchargePercent: 189, category: "Office Visit" },
  { code: "99283", description: "Emergency dept visit, moderate severity", fairPrice: 340, typicalBilled: 1800, overchargePercent: 429, category: "Emergency" },
  { code: "99284", description: "Emergency dept visit, high severity", fairPrice: 560, typicalBilled: 3200, overchargePercent: 471, category: "Emergency" },
  { code: "99285", description: "Emergency dept visit, life-threatening", fairPrice: 780, typicalBilled: 4500, overchargePercent: 477, category: "Emergency" },
  { code: "36415", description: "Blood draw (venipuncture)", fairPrice: 12, typicalBilled: 85, overchargePercent: 608, category: "Lab" },
  { code: "80053", description: "Comprehensive metabolic panel", fairPrice: 15, typicalBilled: 180, overchargePercent: 1100, category: "Lab" },
  { code: "85025", description: "Complete blood count (CBC)", fairPrice: 11, typicalBilled: 150, overchargePercent: 1264, category: "Lab" },
  { code: "81001", description: "Urinalysis with microscopy", fairPrice: 8, typicalBilled: 95, overchargePercent: 1088, category: "Lab" },
  { code: "71046", description: "Chest X-ray, 2 views", fairPrice: 45, typicalBilled: 420, overchargePercent: 833, category: "Imaging" },
  { code: "70553", description: "Brain MRI with & without contrast", fairPrice: 400, typicalBilled: 3500, overchargePercent: 775, category: "Imaging" },
  { code: "74177", description: "CT abdomen & pelvis with contrast", fairPrice: 350, typicalBilled: 4200, overchargePercent: 1100, category: "Imaging" },
  { code: "73721", description: "MRI of knee without contrast", fairPrice: 350, typicalBilled: 2800, overchargePercent: 700, category: "Imaging" },
  { code: "29881", description: "Knee arthroscopy with meniscectomy", fairPrice: 3500, typicalBilled: 18000, overchargePercent: 414, category: "Surgery" },
  { code: "27447", description: "Total knee replacement", fairPrice: 15000, typicalBilled: 65000, overchargePercent: 333, category: "Surgery" },
  { code: "59400", description: "Routine obstetric care (vaginal delivery)", fairPrice: 5000, typicalBilled: 18000, overchargePercent: 260, category: "Obstetric" },
  { code: "59510", description: "Cesarean delivery", fairPrice: 7500, typicalBilled: 28000, overchargePercent: 273, category: "Obstetric" },
  { code: "99232", description: "Subsequent hospital care (25 min)", fairPrice: 80, typicalBilled: 350, overchargePercent: 338, category: "Hospital" },
  { code: "96372", description: "Therapeutic injection (e.g., IV meds)", fairPrice: 25, typicalBilled: 400, overchargePercent: 1500, category: "Procedures" },
];

export function findOvercharge(code: string): CPTCode | undefined {
  return commonOvercharges.find(c => c.code === code);
}

export function getRandomOvercharges(count: number = 5): CPTCode[] {
  const shuffled = [...commonOvercharges].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
