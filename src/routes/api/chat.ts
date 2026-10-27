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
import {
  DeleteEnvironmentSchema,
  PlanUpgradeSchema,
  ProvisionEnvironmentSchema,
} from '../../lib/schemas'
import type {
  DeleteEnvironmentInput,
  PlanUpgradeInput,
  ProvisionEnvironmentInput,
} from '../../lib/schemas'
import {
  deleteEnvironment,
  getEnvironmentIdByName,
  getSubscription,
  provisionEnvironment,
  upgradePlan,
} from '../../server/capabilities'

const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-4o'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages }: { messages: UIMessage[] } = await request.json()

        const currentTier = (await getSubscription())?.current_tier ?? 'Free'

        const result = streamText({
          model: openai(CHAT_MODEL),
          messages: await convertToModelMessages(messages),
          system: `You are a SaaS infrastructure assistant. You help users provision databases, delete them, and change billing plans.
          The user's current plan is ${currentTier}.
          - To provision a database, use the 'provision_environment' tool.
          - To delete an environment, use the 'delete_environment' tool.
          - To change the plan (upgrade OR downgrade), use the 'change_plan' tool with the target tier. Tiers are Free ($0/mo), Pro ($50/mo), Enterprise ($200/mo). Plans change ONE step at a time (Free -> Pro -> Enterprise), so Enterprise -> Free is not allowed.`,
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
            change_plan: tool({
              description:
                'Change the user billing plan by one tier (upgrade or downgrade).',
              inputSchema: PlanUpgradeSchema,
              execute: async (args: PlanUpgradeInput) => {
                // Same shared capability the manual flow uses.
                return upgradePlan(args)
              },
            }),
            delete_environment: tool({
              description: 'Delete a database environment by name.',
              inputSchema: DeleteEnvironmentSchema,
              execute: async (args: DeleteEnvironmentInput) => {
                const id = await getEnvironmentIdByName(args.name)
                if (!id) {
                  throw new Error(
                    `No environment named "${args.name}" was found.`,
                  )
                }
                return deleteEnvironment(id)
              },
            }),
          },
          toolApproval: {
            // Provisioning is safe to run, but spending money or deleting data
            // needs a human in the loop.
            change_plan: {
              type: 'user-approval',
              reason:
                'Changing your plan affects your monthly billing. Please confirm.',
            },
            delete_environment: {
              type: 'user-approval',
              reason: 'Deleting an environment is irreversible. Please confirm.',
            },
          },
        })

        return createUIMessageStreamResponse({
          stream: toUIMessageStream({
            stream: result.stream,
            // Surface the real tool/stream error message instead of the SDK's
            // generic "An error occurred." so failures are debuggable.
            onError: (error) =>
              error instanceof Error ? error.message : String(error),
          }),
        })
      },
    },
  },
})
