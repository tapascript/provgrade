import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { provisionEnvironmentFn } from '../../server/capabilities'

export const Route = createFileRoute('/new/step-3')({
  component: Step3,
  beforeLoad: ({ search }) => {
    const params = search as Partial<typeof search>
    if (!params.name || !params.dbType || !params.region) {
      throw redirect({ to: '/new/step-1' })
    }
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      name: search.name as string,
      dbType: search.dbType as 'PostgreSQL' | 'MongoDB' | 'Redis',
      region: search.region as 'ap-south-1' | 'us-east-1' | 'eu-central-1',
    }
  },
})

function Step3() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Calling the server capability directly from the client
      await provisionEnvironmentFn({
        data: {
          name: search.name,
          dbType: search.dbType,
          region: search.region,
        },
      })

      // Navigate back to dashboard upon completion
      navigate({ to: '/' })
    } catch (err: any) {
      setError(err.message || 'Failed to provision environment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <h3 className="text-lg font-semibold">Review & Provision</h3>

      <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Name:</span>
          <span className="font-mono font-medium">{search.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Database Engine:</span>
          <span className="font-medium">{search.dbType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">AWS Region:</span>
          <span className="font-medium">{search.region}</span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-between mt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-gray-600 hover:underline"
          disabled={isSubmitting}
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Provisioning...' : 'Provision Environment'}
        </button>
      </div>
    </div>
  )
}
