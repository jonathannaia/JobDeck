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
  // GTA
  { slug: 'toronto', label: 'Toronto', region: 'GTA' },
  { slug: 'mississauga', label: 'Mississauga', region: 'GTA' },
  { slug: 'brampton', label: 'Brampton', region: 'GTA' },
  { slug: 'markham', label: 'Markham', region: 'GTA' },
  { slug: 'vaughan', label: 'Vaughan', region: 'GTA' },
  { slug: 'oakville', label: 'Oakville', region: 'GTA' },
  { slug: 'scarborough', label: 'Scarborough', region: 'GTA' },
  { slug: 'north-york', label: 'North York', region: 'GTA' },
  { slug: 'etobicoke', label: 'Etobicoke', region: 'GTA' },
  { slug: 'richmond-hill', label: 'Richmond Hill', region: 'GTA' },
  { slug: 'thornhill', label: 'Thornhill', region: 'GTA' },
  { slug: 'woodbridge', label: 'Woodbridge', region: 'GTA' },
  { slug: 'maple', label: 'Maple', region: 'GTA' },
  { slug: 'concord', label: 'Concord', region: 'GTA' },
  { slug: 'king-city', label: 'King City', region: 'GTA' },
  // Durham
  { slug: 'oshawa', label: 'Oshawa', region: 'Durham' },
  { slug: 'ajax', label: 'Ajax', region: 'Durham' },
  { slug: 'pickering', label: 'Pickering', region: 'Durham' },
  { slug: 'whitby', label: 'Whitby', region: 'Durham' },
  { slug: 'clarington', label: 'Clarington', region: 'Durham' },
  { slug: 'bowmanville', label: 'Bowmanville', region: 'Durham' },
  // York Region
  { slug: 'newmarket', label: 'Newmarket', region: 'York Region' },
  { slug: 'aurora', label: 'Aurora', region: 'York Region' },
  { slug: 'stouffville', label: 'Stouffville', region: 'York Region' },
  { slug: 'georgina', label: 'Georgina', region: 'York Region' },
  // Hamilton / Halton
  { slug: 'hamilton', label: 'Hamilton', region: 'Hamilton' },
  { slug: 'burlington', label: 'Burlington', region: 'Halton' },
  { slug: 'milton', label: 'Milton', region: 'Halton' },
  { slug: 'halton-hills', label: 'Halton Hills', region: 'Halton' },
  { slug: 'ancaster', label: 'Ancaster', region: 'Hamilton' },
  { slug: 'stoney-creek', label: 'Stoney Creek', region: 'Hamilton' },
  { slug: 'dundas', label: 'Dundas', region: 'Hamilton' },
  // Niagara
  { slug: 'st-catharines', label: 'St. Catharines', region: 'Niagara' },
  { slug: 'niagara-falls', label: 'Niagara Falls', region: 'Niagara' },
  { slug: 'welland', label: 'Welland', region: 'Niagara' },
  { slug: 'thorold', label: 'Thorold', region: 'Niagara' },
  { slug: 'fort-erie', label: 'Fort Erie', region: 'Niagara' },
  // Ottawa / Eastern Ontario
  { slug: 'ottawa', label: 'Ottawa', region: 'Ottawa' },
  { slug: 'kanata', label: 'Kanata', region: 'Ottawa' },
  { slug: 'nepean', label: 'Nepean', region: 'Ottawa' },
  { slug: 'orleans', label: 'Orléans', region: 'Ottawa' },
  { slug: 'kingston', label: 'Kingston', region: 'Eastern Ontario' },
  { slug: 'belleville', label: 'Belleville', region: 'Eastern Ontario' },
  { slug: 'brockville', label: 'Brockville', region: 'Eastern Ontario' },
  { slug: 'cornwall', label: 'Cornwall', region: 'Eastern Ontario' },
  { slug: 'trenton', label: 'Trenton', region: 'Eastern Ontario' },
  // Waterloo Region
  { slug: 'kitchener', label: 'Kitchener', region: 'Waterloo Region' },
  { slug: 'waterloo', label: 'Waterloo', region: 'Waterloo Region' },
  { slug: 'cambridge', label: 'Cambridge', region: 'Waterloo Region' },
  { slug: 'guelph', label: 'Guelph', region: 'Wellington' },
  { slug: 'fergus', label: 'Fergus', region: 'Wellington' },
  // London / Southwestern
  { slug: 'london', label: 'London', region: 'London' },
  { slug: 'windsor', label: 'Windsor', region: 'Windsor' },
  { slug: 'sarnia', label: 'Sarnia', region: 'Sarnia' },
  { slug: 'chatham', label: 'Chatham', region: 'Chatham-Kent' },
  { slug: 'leamington', label: 'Leamington', region: 'Essex' },
  { slug: 'stratford', label: 'Stratford', region: 'Perth' },
  { slug: 'woodstock', label: 'Woodstock', region: 'Oxford' },
  { slug: 'ingersoll', label: 'Ingersoll', region: 'Oxford' },
  { slug: 'tillsonburg', label: 'Tillsonburg', region: 'Oxford' },
  { slug: 'st-thomas', label: 'St. Thomas', region: 'Elgin' },
  // Barrie / Simcoe
  { slug: 'barrie', label: 'Barrie', region: 'Simcoe' },
  { slug: 'innisfil', label: 'Innisfil', region: 'Simcoe' },
  { slug: 'collingwood', label: 'Collingwood', region: 'Simcoe' },
  { slug: 'orillia', label: 'Orillia', region: 'Simcoe' },
  { slug: 'midland', label: 'Midland', region: 'Simcoe' },
  { slug: 'penetanguishene', label: 'Penetanguishene', region: 'Simcoe' },
  // Peel / Dufferin
  { slug: 'caledon', label: 'Caledon', region: 'Peel' },
  { slug: 'orangeville', label: 'Orangeville', region: 'Dufferin' },
  // Peterborough / Kawartha
  { slug: 'peterborough', label: 'Peterborough', region: 'Peterborough' },
  { slug: 'lindsay', label: 'Lindsay', region: 'Kawartha Lakes' },
  { slug: 'cobourg', label: 'Cobourg', region: 'Northumberland' },
  // Northern Ontario
  { slug: 'sudbury', label: 'Sudbury', region: 'Northern Ontario' },
  { slug: 'thunder-bay', label: 'Thunder Bay', region: 'Northern Ontario' },
  { slug: 'sault-ste-marie', label: 'Sault Ste. Marie', region: 'Northern Ontario' },
  { slug: 'north-bay', label: 'North Bay', region: 'Northern Ontario' },
  { slug: 'timmins', label: 'Timmins', region: 'Northern Ontario' },
  { slug: 'kenora', label: 'Kenora', region: 'Northern Ontario' },
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
