import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '../lib/supabase-browser'
import { getSubscriptionFn, listEnvironmentsFn } from '../server/capabilities'
import type { EnvironmentRow, SubscriptionRow } from '../server/capabilities'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [environments, setEnvironments] = useState<EnvironmentRow[]>([])
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    let channel: { unsubscribe: () => void } | undefined

    const refresh = async () => {
      try {
        const [envs, sub] = await Promise.all([
          listEnvironmentsFn(),
          getSubscriptionFn(),
        ])
        if (!cancelled) {
          setEnvironments(envs)
          setSubscription(sub)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to load dashboard', err)
        if (!cancelled) setLoading(false)
      }
    }

    void refresh()

    if (supabaseBrowser) {
      channel = supabaseBrowser
        .channel('dashboard-live')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'environments' },
          () => {
            setLive(true)
            void refresh()
          },
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'subscriptions' },
          () => {
            setLive(true)
            void refresh()
          },
        )
        .subscribe()
    }

    return () => {
      cancelled = true
      channel?.unsubscribe()
    }
  }, [])

  const sorted = [...environments].sort((a, b) => {
    const at = a.created_at ? new Date(a.created_at).getTime() : 0
    const bt = b.created_at ? new Date(b.created_at).getTime() : 0
    return bt - at
  })

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Environments</h1>
          <Link
            to="/new/step-1"
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            + Provision manually
          </Link>
        </div>
        <p className="text-gray-500 mt-2 text-sm">
          Provisioned by a human or by the AI agent in the sidebar.
          {live && (
            <span className="ml-2 inline-flex items-center gap-1 text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-gray-400">Loading...</p>
        ) : sorted.length === 0 ? (
          <div className="mt-4 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400 text-sm">
            No environments yet. Use the wizard, or ask the agent to "spin up a
            MongoDB cluster in us-east-1".
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {sorted.map((env) => (
              <div
                key={env.id}
                className="border border-gray-200 rounded-lg p-4 bg-white flex items-center justify-between"
              >
                <div>
                  <div className="font-mono font-medium">{env.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {env.db_type} / {env.region}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {env.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border border-gray-200 rounded-lg p-4 bg-white max-w-md">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Current plan
        </h2>
        <div className="mt-2">
          <span className="text-2xl font-bold">
            {subscription?.current_tier ?? 'Free'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Ask the agent to "upgrade me to Pro" and watch this change live.
        </p>
      </section>
    </div>
  )
}
