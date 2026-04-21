// ---------------------------------------------------------------------------
// HI UW Decisioning demo data generator.
// Local to the HI Decisioning page.
// ---------------------------------------------------------------------------

const UAE_NAMES = [
  'Mohammed Al Maktoum', 'Fatima Al Nahyan', 'Ahmed Al Qasimi',
  'Noura Al Ketbi', 'Khalid Al Mansouri', 'Mariam Al Shamsi',
  'Rajesh Kumar', 'Priya Sharma', 'Vikram Patel', 'Deepika Nair',
  'James Wilson', 'Sarah Thompson', 'Michael Roberts', 'Emma Davis',
  'Omar Hassan', 'Layla Ibrahim', 'Yousuf Al Falasi', 'Hessa Al Mheiri',
];

const PRODUCTS = [
  'AWNIC NAS Dubai', 'AWNIC NAS Abu Dhabi', 'AWNIC Enhanced',
  'AWNIC Basic', 'AWNIC Platinum', 'AWNIC Gold',
];

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

export function generateHIDecisioningPreview(
  count: number,
  cohort: Record<string, number>,
): Array<Record<string, any>> {
  const cohorts = allocateCohorts(count, cohort);

  return cohorts.map((c) => {
    const age = c === 'senior' ? randBetween(60, 78) : randBetween(25, 55);
    const riskScore = c === 'clean' ? randBetween(10, 30) : randBetween(40, 95);
    let decision: string;
    if (c === 'clean') decision = 'auto_accept';
    else if (riskScore > 80) decision = 'decline';
    else if (riskScore > 60) decision = 'refer';
    else decision = 'load';

    return {
      refId: generateHashId('EV'),
      applicantName: pick(UAE_NAMES),
      product: pick(PRODUCTS),
      riskScore,
      decision,
      rulesTriggered: c === 'clean' ? 0 : randBetween(1, 5),
      loadingPct: decision === 'load' ? randBetween(10, 50) : 0,
      cohort: c,
      age,
      createdDate: randomDate(60),
    };
  });
}
