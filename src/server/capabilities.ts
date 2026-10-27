import { createServerFn } from '@tanstack/react-start'
import { supabaseAdmin } from './supabase'
import {
  DeleteEnvironmentByIdSchema,
  PlanUpgradeSchema,
  ProvisionEnvironmentSchema,
} from '../lib/schemas'
import type { PlanUpgradeInput, ProvisionEnvironmentInput } from '../lib/schemas'

/** The single demo account both the human UI and the AI agent act on. */
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000'

export interface EnvironmentRow {
  id: string | number
  name: string
  region: string
  db_type: string
  status: string
  created_at?: string | null
}

export interface SubscriptionRow {
  id?: string | number
  user_id: string
  current_tier: string
  created_at?: string | null
}

/**
 * Shared capability: provision a database environment.
 *
 * This is the single source of truth. It is called by the manual wizard (via
 * `provisionEnvironmentFn`) AND by the AI agent's `provision_environment` tool -
 * same code, two different "users".
 */
export async function provisionEnvironment(data: ProvisionEnvironmentInput) {
  const { data: inserted, error } = await supabaseAdmin
    .from('environments')
    .insert({
      name: data.name,
      region: data.region,
      db_type: data.dbType,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Database error: ${error.message}`)
  }

  return inserted as EnvironmentRow
}

const TIER_ORDER = ['Free', 'Pro', 'Enterprise'] as const
type Tier = (typeof TIER_ORDER)[number]

function canTransition(from: Tier, to: Tier): boolean {
  return Math.abs(TIER_ORDER.indexOf(from) - TIER_ORDER.indexOf(to)) === 1
}

/**
 * Shared capability: change the billing plan (up or down).
 *
 * Plans move one tier at a time (Free -> Pro -> Enterprise), so jumping from
 * Enterprise straight to Free is rejected here — a rule both the human UI and
 * the AI agent get for free by sharing this one function.
 */
export async function upgradePlan(data: PlanUpgradeInput) {
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', DEMO_USER_ID)

  const currentTier = (existing?.[0]?.current_tier ?? 'Free') as Tier

  if (!canTransition(currentTier, data.targetTier)) {
    throw new Error(
      `Cannot change from ${currentTier} directly to ${data.targetTier}. Plans change one step at a time: Free -> Pro -> Enterprise.`,
    )
  }

  let row: SubscriptionRow

  if (existing && existing.length > 0) {
    const { data: updated, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ current_tier: data.targetTier })
      .eq('user_id', DEMO_USER_ID)
      .select()
      .single()

    if (error) throw new Error(`Billing error: ${error.message}`)
    row = updated as SubscriptionRow
  } else {
    const { data: created, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({ user_id: DEMO_USER_ID, current_tier: data.targetTier })
      .select()
      .single()

    if (error) throw new Error(`Billing error: ${error.message}`)
    row = created as SubscriptionRow
  }

  return {
    tier: row.current_tier,
    cost: data.acceptedMonthlyCost,
  }
}

/** Shared capability: list all environments (used by the live dashboard). */
export async function listEnvironments(): Promise<EnvironmentRow[]> {
  const { data, error } = await supabaseAdmin.from('environments').select('*')
  if (error) throw new Error(`Database error: ${error.message}`)
  return (data ?? []) as EnvironmentRow[]
}

/** Shared capability: read the demo account's current subscription. */
export async function getSubscription(): Promise<SubscriptionRow | null> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .maybeSingle()

  if (error) throw new Error(`Database error: ${error.message}`)
  return (data ?? null) as SubscriptionRow | null
}

/** Shared capability: delete an environment by id. */
export async function deleteEnvironment(id: string | number) {
  const { error } = await supabaseAdmin.from('environments').delete().eq('id', id)
  if (error) throw new Error(`Database error: ${error.message}`)
  return { success: true, id }
}

/** Helper used by the AI agent to resolve a human-friendly name to an id. */
export async function getEnvironmentIdByName(
  name: string,
): Promise<string | number | null> {
  const { data, error } = await supabaseAdmin
    .from('environments')
    .select('id')
    .eq('name', name)
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Database error: ${error.message}`)
  return (data?.id ?? null) as string | number | null
}

/* -------------------------------------------------------------------------- */
/* Server functions - the human/UI entry points (also callable via RPC).      */
/* -------------------------------------------------------------------------- */

export const provisionEnvironmentFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => ProvisionEnvironmentSchema.parse(data))
  .handler(async ({ data }) => {
    const environment = await provisionEnvironment(data)
    return { success: true, environment }
  })

export const upgradePlanFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => PlanUpgradeSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await upgradePlan(data)
    return { success: true, ...result }
  })

export const listEnvironmentsFn = createServerFn({ method: 'GET' }).handler(
  () => listEnvironments(),
)

export const getSubscriptionFn = createServerFn({ method: 'GET' }).handler(
  () => getSubscription(),
)

export const deleteEnvironmentFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => DeleteEnvironmentByIdSchema.parse(data))
  .handler(async ({ data }) => deleteEnvironment(data.id))
