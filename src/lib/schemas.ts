import { z } from 'zod';

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
});

// TypeScript type inference from the schema
export type ProvisionEnvironmentInput = z.infer<typeof ProvisionEnvironmentSchema>;

// Schema 2: Upgrading a Plan
export const PlanUpgradeSchema = z.object({
  targetTier: z
    .enum(['Pro', 'Enterprise'])
    .describe('The subscription tier to upgrade to'),

  acceptedMonthlyCost: z
    .number()
    .describe('The monthly cost in USD for confirmation display'),
});

export type PlanUpgradeInput = z.infer<typeof PlanUpgradeSchema>;