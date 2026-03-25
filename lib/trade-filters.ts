export type TradeFilter = {
  include: string[]
  exclude: string[]
  minValue: number
  dbTrades?: string[] // DB trade values to query (defaults to [trade])
}

// Per-spec: INCLUDE = must match at least one, EXCLUDE = must match none, minValue = est_cost floor
export const TRADE_FILTERS: Record<string, TradeFilter> = {
  Roofer: {
    include: ['roofing', 're-roof', 'shingle', 'flat roof', 'metal roof', 'roof structure', 'eavestrough', 'gutter', 'soffit', 'fascia', 'skylight'],
    exclude: ['plumbing', 'hvac', 'mechanical', 'basement', 'interior alteration', 'sign', 'antenna'],
    minValue: 2000,
  },
  Plumber: {
    include: ['plumbing', 'drain', 'backwater valve', 'sewer', 'water service', 'rough-in', 'water heater', 'hot water'],
    exclude: ['roofing', 'deck', 'fence', 'hvac', 'mechanical', 'furnace'],
    minValue: 2000,
  },
  Electrician: {
    include: ['electrical', 'service upgrade', 'ev charger', 'tesla wall', 'panel upgrade', '200 amp', 'sub-panel', 'solar', 'panel', 'wiring', 'generator', 'new building', 'second unit', 'basement apartment', 'addition'],
    exclude: ['roofing', 'siding', 'deck', 'hvac', 'mechanical'],
    minValue: 2000,
    dbTrades: ['Electrician', 'Electrical / EV Charging'],
  },
  HVAC: {
    include: ['hvac', 'mechanical', 'furnace', 'air conditioning', 'heat pump', 'ductwork', 'gas piping', 'heating', 'cooling', 'boiler', 'ventilation', 'fireplace'],
    exclude: ['plumbing', 'shingle', 'deck', 'fence'],
    minValue: 2000,
  },
  Carpenter: {
    include: ['interior alteration', 'basement', 'addition', 'secondary suite', 'kitchen', 'bathroom', 'window', 'door', 'drywall', 'flooring', 'framing', 'renovation'],
    exclude: ['hvac', 'mechanical', 'plumbing', 'electrical', 'sewer', 'roofing', 'demolition', 'overhead door', 'garage door'],
    minValue: 2000,
  },
  'General Contractor': {
    include: ['addition', 'second unit', 'new building', 'secondary suite', 'structural alteration', 'new construction', 'renovation', 'reno', 'detached', 'semi-detached', 'small residential'],
    exclude: ['demolition'],
    minValue: 40000,
  },
  // Painter: scraper now tags high-value interior permits directly as 'Painter' in DB.
  // We also pull Carpenter + GC as a fallback for permits the scraper classified before this rule.
  Painter: {
    include: ['interior alteration', 'basement finishing', 'basement finish', 'basement', 'secondary suite', 'renovation', 'alteration', 'kitchen', 'bathroom'],
    exclude: ['sewer', 'roofing', 'demolition', 'industrial', 'commercial', 'restaurant', 'retail', 'fire alarm', 'overhead door', 'garage door'],
    minValue: 15000,
    dbTrades: ['Painter', 'Carpenter', 'General Contractor'],
  },
}

// Returns which DB `trade` column values to query for a given trade selection
export function getDbTrades(trade: string): string[] | null {
  if (!trade || trade === 'all') return null
  const filter = TRADE_FILTERS[trade]
  if (!filter) return [trade]
  return filter.dbTrades ?? [trade]
}

type PermitLike = {
  permit_type?: string | null
  description?: string | null
  est_cost?: string | number | null
  [key: string]: unknown
}

export function applyTradeFilter<T extends PermitLike>(permits: T[], trade: string): T[] {
  if (!trade || trade === 'all') return permits
  const filter = TRADE_FILTERS[trade]
  if (!filter) return permits

  return permits.filter(p => {
    const text = `${p.permit_type ?? ''} ${p.description ?? ''}`.toLowerCase()

    // Must match at least one INCLUDE keyword
    if (filter.include.length > 0 && !filter.include.some(k => text.includes(k))) return false

    // Must not match any EXCLUDE keyword
    if (filter.exclude.some(k => text.includes(k))) return false

    // Check minimum project value (skip check if no cost data — unknown ≠ below threshold)
    if (p.est_cost) {
      const cost = parseFloat(String(p.est_cost).replace(/[^0-9.]/g, ''))
      if (!isNaN(cost) && cost < filter.minValue) return false
    }

    return true
  })
}
