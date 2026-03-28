export type TradeType =
  | 'plumber'
  | 'electrician'
  | 'roofer'
  | 'hvac'
  | 'carpenter'
  | 'general_contractor'
  | 'painter'
  | 'landscaper'
  | 'lawn_service'
  | 'decking'
  | 'fencing'
  | 'concrete'

export const TRADE_LABELS: Record<TradeType, string> = {
  plumber: 'Plumber',
  electrician: 'Electrician',
  roofer: 'Roofer',
  hvac: 'HVAC',
  carpenter: 'Carpenter',
  general_contractor: 'General Contractor',
  painter: 'Painter',
  landscaper: 'Landscaper',
  lawn_service: 'Lawn Service',
  decking: 'Decking',
  fencing: 'Fencing',
  concrete: 'Concrete',
}

export const ONTARIO_POSTAL_PREFIXES = ['K', 'L', 'M', 'N', 'P']

export type PlanType = 'starter' | 'pro' | 'pay_per_lead'

export interface HomeownerLead {
  id: string
  name: string
  phone: string
  email: string | null
  trade_type: TradeType
  job_description: string
  location: string | null
  postal_code: string
  budget_range: string | null
  timeline: string | null
  status: string
  created_at: string
}

export interface Contractor {
  id: string
  name: string
  phone: string
  email: string
  trade_type: TradeType
  service_area: string
  plan_type: PlanType
  lead_credits_used: number
  lead_credits_limit: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  is_active: boolean
  created_at: string
}

export interface LeadDelivery {
  id: string
  lead_id: string
  contractor_id: string
  delivered_at: string | null
  delivery_status: 'pending' | 'sent' | 'failed'
  plan_type: PlanType
  created_at: string
}
