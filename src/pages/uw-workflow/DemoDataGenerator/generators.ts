// ---------------------------------------------------------------------------
// UW Workflow demo data generator.
// Local to the UW Workflow page.
// ---------------------------------------------------------------------------

const UAE_NAMES = [
  'Mohammed Al Maktoum', 'Fatima Al Nahyan', 'Ahmed Al Qasimi',
  'Noura Al Ketbi', 'Khalid Al Mansouri', 'Mariam Al Shamsi',
  'Rajesh Kumar', 'Priya Sharma', 'Vikram Patel', 'Deepika Nair',
  'James Wilson', 'Sarah Thompson', 'Michael Roberts', 'Emma Davis',
  'Omar Hassan', 'Layla Ibrahim', 'Yousuf Al Falasi', 'Hessa Al Mheiri',
  'Arjun Mehta', 'Sneha Reddy', 'David Chen', 'Lisa Anderson',
  'Tariq Al Muhairi', 'Aisha Bin Zayed', 'Sanjay Gupta', 'Meera Krishnan',
];

const PRODUCTS = [
  'AWNIC NAS Dubai', 'AWNIC NAS Abu Dhabi', 'AWNIC Enhanced',
  'AWNIC Basic', 'AWNIC Platinum', 'AWNIC Gold',
];

const REGIONS = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah'];

const UW_STATUSES: Record<string, string> = {
  clean: 'new',
  diabetic: 'nstp_review',
  hypertension: 'nstp_review',
  high_bmi: 'nstp_review',
  senior: 'nstp_review',
  high_sum: 'nstp_review',
};

const CASE_TYPES: Record<string, string> = {
  clean: 'STP',
  diabetic: 'NSTP',
  hypertension: 'NSTP',
  high_bmi: 'NSTP',
  senior: 'NSTP',
  high_sum: 'NSTP',
};

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

export function generateUWWorkflowPreview(
  count: number,
  cohort: Record<string, number>,
): Array<Record<string, any>> {
  const cohorts = allocateCohorts(count, cohort);

  return cohorts.map((c) => {
    const age = c === 'senior' ? randBetween(60, 78) : randBetween(25, 55);
    const bmi = c === 'high_bmi' ? randBetween(35, 45) : randBetween(19, 29);
    const sumInsured = c === 'high_sum' ? randBetween(500000, 2000000) : randBetween(50000, 300000);
    const basePremium = Math.round(sumInsured * (age > 50 ? 0.012 : 0.008));
    const loading = c === 'clean' ? 0 : randBetween(5, 40);
    const premium = Math.round(basePremium * (1 + loading / 100));

    return {
      refId: generateHashId('DEMO'),
      proposerName: pick(UAE_NAMES),
      product: pick(PRODUCTS),
      region: pick(REGIONS),
      premium,
      status: UW_STATUSES[c] || 'new',
      type: CASE_TYPES[c] || 'STP',
      cohort: c,
      age,
      bmi,
      sumInsured,
      loading,
      createdDate: randomDate(90),
    };
  });
}
