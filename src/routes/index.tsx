import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { supabaseBrowser } from '../lib/supabase-browser'
import {
  deleteEnvironmentFn,
  getSubscriptionFn,
  listEnvironmentsFn,
} from '../server/capabilities'
import type { EnvironmentRow, SubscriptionRow } from '../server/capabilities'

/** Number of environments shown per page. Tweak this constant to change it. */
const PAGE_SIZE = 5

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [environments, setEnvironments] = useState<EnvironmentRow[]>([])
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState(false)
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | number | null>(null)

  const load = useCallback(async () => {
    try {
      const [envs, sub] = await Promise.all([
        listEnvironmentsFn(),
        getSubscriptionFn(),
      ])
      setEnvironments(envs)
      setSubscription(sub)
    } catch (err) {
      console.error('Failed to load dashboard', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()

    let channel: { unsubscribe: () => void } | undefined
    if (supabaseBrowser) {
      channel = supabaseBrowser
        .channel('dashboard-live')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'environments' },
          () => {
            setLive(true)
            void load()
          },
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'subscriptions' },
          () => {
            setLive(true)
            void load()
          },
        )
        .subscribe()
    }

    return () => {
      channel?.unsubscribe()
    }
  }, [load])

  const sorted = [...environments].sort((a, b) => {
    const at = a.created_at ? new Date(a.created_at).getTime() : 0
    const bt = b.created_at ? new Date(b.created_at).getTime() : 0
    return bt - at
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handleDelete = async (env: EnvironmentRow) => {
    if (!window.confirm(`Delete "${env.name}"? This cannot be undone.`)) return
    setDeletingId(env.id)
    try {
      await deleteEnvironmentFn({ data: { id: env.id } })
    } catch (err) {
      console.error('Failed to delete environment', err)
    } finally {
      setDeletingId(null)
      void load()
    }
  }

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
            {pageItems.map((env) => (
              <div
                key={env.id}
                className="border border-gray-200 rounded-lg p-4 bg-white flex items-center justify-between"
              >
                <div>
                  <div className="font-mono font-medium">{env.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {env.db_type} / {env.region}
                  </div>
                  {env.created_at && (
                    <div className="text-xs text-gray-400 mt-1">
                      Created {new Date(env.created_at).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {env.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDelete(env)}
                    disabled={deletingId === env.id}
                    className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                  >
                    {deletingId === env.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && sorted.length > 0 && totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-sm text-gray-600 border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 disabled:opacity-40"
            >
              Next
            </button>
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
          Ask the agent to "upgrade me to Pro" or "downgrade me to Free".
        </p>
      </section>
    </div>
  )
}
