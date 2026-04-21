// ---------------------------------------------------------------------------
// HI Quotation demo data generators (UAE-centric health insurance scenarios).
// Local to the HI Quotation page. Not shared — any module wanting synthetic
// demo rows must either import its own local generators.ts or use the
// generic DemoDataGenerator + a module-owned generator function.
// ---------------------------------------------------------------------------

export const UAE_NAMES = [
  'Mohammed Al Maktoum', 'Fatima Al Nahyan', 'Ahmed Al Qasimi',
  'Noura Al Ketbi', 'Khalid Al Mansouri', 'Mariam Al Shamsi',
  'Rajesh Kumar', 'Priya Sharma', 'Vikram Patel', 'Deepika Nair',
  'James Wilson', 'Sarah Thompson', 'Michael Roberts', 'Emma Davis',
  'Omar Hassan', 'Layla Ibrahim', 'Yousuf Al Falasi', 'Hessa Al Mheiri',
  'Arjun Mehta', 'Sneha Reddy', 'David Chen', 'Lisa Anderson',
  'Tariq Al Muhairi', 'Aisha Bin Zayed', 'Sanjay Gupta', 'Meera Krishnan',
  'Abdullah Al Dhaheri', 'Reem Al Suwaidi', 'Rahul Desai', 'Anita Menon',
  'John Mitchell', 'Catherine White', 'Hassan Al Ali', 'Maryam Al Hashmi',
  'Suresh Nambiar', 'Kavita Rao', 'Robert Taylor', 'Jennifer Clark',
  'Saeed Al Mazrouei', 'Shamma Al Kaabi', 'Amit Joshi', 'Pooja Iyer',
  'William Brown', 'Charlotte Harris', 'Rashid Al Nuaimi', 'Latifa Al Shamsi',
  'Dinesh Chopra', 'Neha Verma', 'Thomas Moore', 'Sophia Martinez',
];

export const PRODUCTS = [
  'AWNIC NAS Dubai',
  'AWNIC NAS Abu Dhabi',
  'AWNIC Enhanced',
  'AWNIC Basic',
  'AWNIC Platinum',
  'AWNIC Gold',
];

export const REGIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah'];

// ---------------------------------------------------------------------------
// Utility helpers (internal)
// ---------------------------------------------------------------------------

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateHashId(prefix: string): string {
  const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
  return `${prefix}-${hex}`;
}

function randomDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - randBetween(0, daysBack));
  return d.toISOString().split('T')[0];
}

function allocateCohorts(count: number, cohort: Record<string, number>): string[] {
  const result: string[] = [];
  const keys = Object.keys(cohort);

  keys.forEach((key) => {
    const n = Math.round((cohort[key] / 100) * count);
    for (let i = 0; i < n; i++) result.push(key);
  });

  while (result.length < count) result.push(keys[0] || 'clean');
  while (result.length > count) result.pop();

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// ---------------------------------------------------------------------------
// HI Quotation generator
// ---------------------------------------------------------------------------

export function generateHIQuotationPreview(
  count: number,
  cohort: Record<string, number>,
): Array<Record<string, any>> {
  const cohorts = allocateCohorts(count, cohort);
  const quotationStatuses = ['draft', 'submitted', 'approved', 'declined'];

  return cohorts.map((c) => {
    const age = c === 'senior' ? randBetween(60, 78) : randBetween(25, 55);
    const members = randBetween(1, 6);
    const basePremium = randBetween(3000, 25000) * members;

    return {
      refId: generateHashId('QT'),
      applicantName: pick(UAE_NAMES),
      product: pick(PRODUCTS),
      region: pick(REGIONS),
      members,
      annualPremium: basePremium,
      status: c === 'clean' ? pick(['draft', 'submitted', 'approved']) : pick(quotationStatuses),
      cohort: c,
      age,
      createdDate: randomDate(60),
    };
  });
}
