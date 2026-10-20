import { createFileRoute } from '@tanstack/react-router';
import {
  streamText,
  tool,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { ProvisionEnvironmentSchema, PlanUpgradeSchema } from '../../lib/schemas';
import type { ProvisionEnvironmentInput, PlanUpgradeInput } from '../../lib/schemas';
import { supabaseAdmin } from '../../server/supabase';

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages }: { messages: UIMessage[] } = await request.json();

        const result = streamText({
          model: openai('gpt-4o'),
          messages: await convertToModelMessages(messages),
          system: `You are a SaaS infrastructure assistant. You help users provision databases and upgrade billing plans.
          If a user asks to provision a database, use the 'provision_environment' tool.
          If they ask to upgrade their plan, use the 'upgrade_plan' tool (Pro is $50/mo, Enterprise is $200/mo).`,
          tools: {
            provision_environment: tool({
              description: 'Provision a new database environment.',
              inputSchema: ProvisionEnvironmentSchema,
              execute: async (args: ProvisionEnvironmentInput) => {
                const { data, error } = await supabaseAdmin
                  .from('environments')
                  .insert({
                    name: args.name,
                    region: args.region,
                    db_type: args.dbType,
                    status: 'active',
                  })
                  .select()
                  .single();

                if (error) throw new Error(error.message);
                return data;
              },
            }),
            upgrade_plan: tool({
              description: 'Upgrade the user billing plan.',
              inputSchema: PlanUpgradeSchema,
              execute: async (args: PlanUpgradeInput) => {
                const mockUserId = '00000000-0000-0000-0000-000000000000';
                const { data: existing } = await supabaseAdmin
                  .from('subscriptions')
                  .select('*')
                  .eq('user_id', mockUserId);

                let data;
                let error;
                if (existing && existing.length > 0) {
                  const res = await supabaseAdmin
                    .from('subscriptions')
                    .update({ current_tier: args.targetTier })
                    .eq('user_id', mockUserId)
                    .select()
                    .single();
                  data = res.data;
                  error = res.error;
                } else {
                  const res = await supabaseAdmin
                    .from('subscriptions')
                    .insert({
                      user_id: mockUserId,
                      current_tier: args.targetTier,
                    })
                    .select()
                    .single();
                  data = res.data;
                  error = res.error;
                }

                if (error) throw new Error(error.message);
                return { tier: data?.current_tier ?? args.targetTier, cost: args.acceptedMonthlyCost };
              },
            }),
          },
        });

        return createUIMessageStreamResponse({
          stream: toUIMessageStream({ stream: result.stream }),
        });
      },
    },
  },
});