import { z } from 'zod'

// Schema 1: Provisioning a Database
export const ProvisionEnvironmentSchema = z.object({
  name: z
    .string()
    .min(3, 'Environment name must be at least 3 characters')
    .max(30)
    .describe('The name of the database environment, e.g., staging-db, prod-replica'),

  region: z
    .enum(['ap-south-1', 'us-east-1', 'eu-central-1'])
    .describe('The deployment AWS region. Choose ap-south-1 for India/Asia users.'),

  dbType: z
    .enum(['PostgreSQL', 'MongoDB', 'Redis'])
    .describe('The database technology required for this workload'),
})

export type ProvisionEnvironmentInput = z.infer<typeof ProvisionEnvironmentSchema>

// Schema 2: Changing a Plan (up or down, one tier at a time)
export const PlanUpgradeSchema = z.object({
  targetTier: z
    .enum(['Free', 'Pro', 'Enterprise'])
    .describe(
      'The subscription tier to move to. Tiers change one step at a time: Free -> Pro -> Enterprise.',
    ),

  acceptedMonthlyCost: z
    .number()
    .describe('The monthly cost in USD for confirmation display (Free is $0).'),
})

export type PlanUpgradeInput = z.infer<typeof PlanUpgradeSchema>

// Schema 3: Deleting an Environment (by name, used by the AI agent)
export const DeleteEnvironmentSchema = z.object({
  name: z
    .string()
    .min(3)
    .describe('The name of the environment to delete, e.g., staging-db'),
})

export type DeleteEnvironmentInput = z.infer<typeof DeleteEnvironmentSchema>

// Schema 4: Deleting an Environment (by id, used by the dashboard button)
export const DeleteEnvironmentByIdSchema = z.object({
  id: z.union([z.string(), z.number()]),
})

export type DeleteEnvironmentByIdInput = z.infer<typeof DeleteEnvironmentByIdSchema>
