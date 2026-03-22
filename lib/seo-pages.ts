export const TRADES = [
  { slug: 'plumber', label: 'Plumber', plural: 'Plumbers', trade_type: 'plumber', verb: 'plumbing' },
  { slug: 'electrician', label: 'Electrician', plural: 'Electricians', trade_type: 'electrician', verb: 'electrical work' },
  { slug: 'roofer', label: 'Roofer', plural: 'Roofers', trade_type: 'roofer', verb: 'roofing' },
  { slug: 'hvac', label: 'HVAC Technician', plural: 'HVAC Technicians', trade_type: 'hvac', verb: 'HVAC service' },
  { slug: 'carpenter', label: 'Carpenter', plural: 'Carpenters', trade_type: 'carpenter', verb: 'carpentry' },
  { slug: 'painter', label: 'Painter', plural: 'Painters', trade_type: 'painter', verb: 'painting' },
  { slug: 'landscaper', label: 'Landscaper', plural: 'Landscapers', trade_type: 'landscaper', verb: 'landscaping' },
  { slug: 'general-contractor', label: 'General Contractor', plural: 'General Contractors', trade_type: 'general_contractor', verb: 'home renovation' },
]

export const CITIES = [
  { slug: 'toronto', label: 'Toronto', region: 'GTA' },
  { slug: 'hamilton', label: 'Hamilton', region: 'Hamilton' },
  { slug: 'mississauga', label: 'Mississauga', region: 'GTA' },
  { slug: 'brampton', label: 'Brampton', region: 'GTA' },
  { slug: 'ottawa', label: 'Ottawa', region: 'Ottawa' },
  { slug: 'kitchener', label: 'Kitchener', region: 'Waterloo Region' },
  { slug: 'london', label: 'London', region: 'London' },
  { slug: 'windsor', label: 'Windsor', region: 'Windsor' },
  { slug: 'barrie', label: 'Barrie', region: 'Barrie' },
  { slug: 'markham', label: 'Markham', region: 'GTA' },
  { slug: 'vaughan', label: 'Vaughan', region: 'GTA' },
  { slug: 'burlington', label: 'Burlington', region: 'Hamilton' },
  { slug: 'oakville', label: 'Oakville', region: 'GTA' },
  { slug: 'oshawa', label: 'Oshawa', region: 'Durham' },
  { slug: 'ajax', label: 'Ajax', region: 'Durham' },
  { slug: 'pickering', label: 'Pickering', region: 'Durham' },
  { slug: 'newmarket', label: 'Newmarket', region: 'York Region' },
  { slug: 'whitby', label: 'Whitby', region: 'Durham' },
  { slug: 'scarborough', label: 'Scarborough', region: 'GTA' },
  { slug: 'north-york', label: 'North York', region: 'GTA' },
]

export function getTrade(slug: string) {
  return TRADES.find(t => t.slug === slug)
}

export function getCity(slug: string) {
  return CITIES.find(c => c.slug === slug)
}

export function generateParams() {
  const params = []
  for (const trade of TRADES) {
    for (const city of CITIES) {
      params.push({ trade: trade.slug, city: city.slug })
    }
  }
  return params
}
