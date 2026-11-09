/** Tiny deterministic fake-data helpers so seeds are identical on every machine. */

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createFaker(seed: number) {
  const rand = mulberry32(seed)
  const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)]
  const chance = (p: number) => rand() < p
  const some = <T,>(items: readonly T[], min = 0, max = 3): T[] => {
    const count = Math.min(items.length, int(min, max))
    return [...items].sort(() => rand() - 0.5).slice(0, count)
  }
  /** ISO date `daysAgo` days in the past (fractional allowed), with a random time of day. */
  const pastDate = (maxDaysAgo: number, minDaysAgo = 0) => {
    const ms = (minDaysAgo + rand() * (maxDaysAgo - minDaysAgo)) * 86_400_000
    return new Date(Date.now() - ms).toISOString()
  }
  const futureDate = (maxDays: number, minDays = 0) => {
    const ms = (minDays + rand() * (maxDays - minDays)) * 86_400_000
    return new Date(Date.now() + ms).toISOString()
  }
  return { rand, int, pick, chance, some, pastDate, futureDate }
}

export const FIRST_NAMES = [
  'Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Elijah', 'Sophia', 'Lucas', 'Mia', 'Mateo', 'Amelia', 'Ethan',
  'Harper', 'Aarav', 'Fatima', 'Yuki', 'Chen', 'Zara', 'Omar', 'Priya', 'Leila', 'Diego', 'Ingrid', 'Kwame',
  'Sara', 'Hiro', 'Nadia', 'Tariq', 'Elena', 'Marco', 'Aisha', 'Jonas', 'Chloe', 'Ravi', 'Lina', 'Felix',
] as const

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Garcia', 'Müller', 'Khan', 'Nguyen', 'Silva', 'Rossi', 'Kowalski', 'Tanaka', 'Okafor',
  'Ahmed', 'Patel', 'Larsen', 'Dubois', 'Novak', 'Haddad', 'Moreno', 'Schmidt', 'Kim', 'Ivanova', 'Mensah',
  'Lopez', 'Fischer', 'Ali', 'Costa', 'Jensen', 'Wang', 'Hussain', 'Bianchi',
] as const

export const COMPANIES = [
  ['Northwind Traders', 'northwind.io', 'Retail'],
  ['Acme Logistics', 'acmelogistics.com', 'Logistics'],
  ['Bluefin Health', 'bluefinhealth.com', 'Healthcare'],
  ['Copperleaf Studio', 'copperleaf.design', 'Agency'],
  ['Evergreen Foods', 'evergreenfoods.co', 'Food & beverage'],
  ['Helios Energy', 'helios-energy.com', 'Energy'],
  ['Juniper Finance', 'juniperfinance.com', 'Financial services'],
  ['Kestrel Travel', 'kestreltravel.com', 'Travel'],
  ['Lumen Education', 'lumen.edu', 'Education'],
  ['Mosaic Fashion', 'mosaicfashion.com', 'E-commerce'],
  ['Nimbus Cloud', 'nimbuscloud.dev', 'Software'],
  ['Orbit Motors', 'orbitmotors.com', 'Automotive'],
  ['Pioneer Realty', 'pioneerrealty.com', 'Real estate'],
  ['Quartz Telecom', 'quartztel.com', 'Telecom'],
  ['Riverstone Bank', 'riverstonebank.com', 'Financial services'],
  ['Saffron Kitchens', 'saffronkitchens.com', 'Restaurants'],
  ['Tidal Fitness', 'tidalfitness.com', 'Fitness'],
  ['Umbra Security', 'umbrasec.com', 'Software'],
  ['Vertex Pharma', 'vertexpharma.co', 'Healthcare'],
  ['Willow Home', 'willowhome.com', 'E-commerce'],
  ['Xenon Games', 'xenongames.gg', 'Gaming'],
  ['Yellowtail Media', 'yellowtail.media', 'Media'],
  ['Zephyr Airlines', 'zephyrair.com', 'Travel'],
  ['Atlas Insurance', 'atlasinsure.com', 'Insurance'],
] as const

export const COUNTRIES = [
  ['United States', 'New York', '+1'],
  ['United States', 'San Francisco', '+1'],
  ['United Kingdom', 'London', '+44'],
  ['Germany', 'Berlin', '+49'],
  ['France', 'Paris', '+33'],
  ['Netherlands', 'Amsterdam', '+31'],
  ['Spain', 'Madrid', '+34'],
  ['Brazil', 'São Paulo', '+55'],
  ['India', 'Bengaluru', '+91'],
  ['United Arab Emirates', 'Dubai', '+971'],
  ['Pakistan', 'Karachi', '+92'],
  ['Singapore', 'Singapore', '+65'],
  ['Australia', 'Sydney', '+61'],
  ['Nigeria', 'Lagos', '+234'],
] as const

export const JOB_TITLES = [
  'Marketing Manager', 'Head of Growth', 'CEO', 'Founder', 'Product Manager', 'Customer Success Lead',
  'Operations Director', 'CRM Specialist', 'Sales Executive', 'CTO', 'E-commerce Manager', 'Support Agent',
] as const

export const TEAM = ['Ayesha Raza', 'Daniel Brooks', 'Mei Lin', 'Carlos Vega', 'Hannah Becker'] as const

export const TAGS = ['vip', 'newsletter', 'trial', 'webinar-2026', 'black-friday', 'enterprise', 'churn-risk', 'beta'] as const
