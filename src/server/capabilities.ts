import { createServerFn } from '@tanstack/react-start';
import { supabaseAdmin } from './supabase';
import { ProvisionEnvironmentSchema, PlanUpgradeSchema } from '../lib/schemas';

/**
 * Capability 1: Provision Environment
 * This function can be called directly by a React Component OR by an AI Tool.
 */
export const provisionEnvironmentFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => ProvisionEnvironmentSchema.parse(data))
  .handler(async ({ data }) => {
    // Data is 100% validated by Zod before this handler executes
    const { data: insertedRecord, error } = await supabaseAdmin
      .from('environments')
      .insert({
        name: data.name,
        region: data.region,
        db_type: data.dbType,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      success: true,
      environment: insertedRecord,
    };
  });

/**
 * Capability 2: Upgrade Plan
 */
export const upgradePlanFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => PlanUpgradeSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: updatedSub, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ current_tier: data.targetTier })
      .eq('user_id', '00000000-0000-0000-0000-000000000000') // Hardcoded demo account
      .select()
      .single();

    if (error) {
      throw new Error(`Billing error: ${error.message}`);
    }

    return {
      success: true,
      tier: updatedSub?.current_tier ?? data.targetTier,
      cost: data.acceptedMonthlyCost,
    };
  });