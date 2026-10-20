import { createFileRoute } from '@tanstack/react-router'
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  tool,
} from 'ai'
import type { UIMessage } from 'ai'
import { openai } from '@ai-sdk/openai'
import { PlanUpgradeSchema, ProvisionEnvironmentSchema } from '../../lib/schemas'
import type { PlanUpgradeInput, ProvisionEnvironmentInput } from '../../lib/schemas'
import { provisionEnvironment, upgradePlan } from '../../server/capabilities'

const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-4o'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages }: { messages: UIMessage[] } = await request.json()

        const result = streamText({
          model: openai(CHAT_MODEL),
          messages: await convertToModelMessages(messages),
          system: `You are a SaaS infrastructure assistant. You help users provision databases and upgrade billing plans.
          If a user asks to provision a database, use the 'provision_environment' tool.
          If they ask to upgrade their plan, use the 'upgrade_plan' tool (Pro is $50/mo, Enterprise is $200/mo).`,
          tools: {
            provision_environment: tool({
              description: 'Provision a new database environment.',
              inputSchema: ProvisionEnvironmentSchema,
              execute: async (args: ProvisionEnvironmentInput) => {
                // Same shared capability the manual wizard uses.
                const record = await provisionEnvironment(args)
                return {
                  id: record.id,
                  name: record.name,
                  region: record.region,
                  db_type: record.db_type,
                  status: record.status,
                }
              },
            }),
            upgrade_plan: tool({
              description: 'Upgrade the user billing plan.',
              inputSchema: PlanUpgradeSchema,
              execute: async (args: PlanUpgradeInput) => {
                // Same shared capability the manual flow uses.
                return upgradePlan(args)
              },
            }),
          },
          toolApproval: {
            // Provisioning is safe to run, but spending money needs a human.
            upgrade_plan: {
              type: 'user-approval',
              reason:
                'Upgrading your plan changes your monthly billing. Please confirm the cost.',
            },
          },
        })

        return createUIMessageStreamResponse({
          stream: toUIMessageStream({ stream: result.stream }),
        })
      },
    },
  },
})
