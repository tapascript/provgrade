import { useChat } from '@ai-sdk/react'
import {
  DefaultChatTransport,
  getToolName,
  isStaticToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from 'ai'
import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'DashFlow Infrastructure' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  const [chatInput, setChatInput] = useState('')

  const { messages, sendMessage, status, addToolApprovalResponse } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    // After the user approves/denies a tool, automatically send the response
    // back to the server so the agent can continue (or skip) the tool.
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    sendMessage({ text: chatInput })
    setChatInput('')
  }

  const isBusy = status === 'submitted' || status === 'streaming'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1 p-8 mr-96">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-xl font-bold">DashFlow Infrastructure</h1>
        </header>
        <Outlet />
      </main>

      <aside className="w-96 bg-white border-l shadow-xl flex flex-col h-screen fixed right-0 top-0">
        <div className="p-4 bg-gray-900 text-white font-semibold">
          AI Site Reliability Engineer
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg text-sm ${
                message.role === 'user'
                  ? 'bg-blue-100 ml-8'
                  : 'bg-gray-100 mr-8'
              }`}
            >
              {message.parts.map((part, index) => {
                if (part.type === 'text') {
                  return <p key={index}>{part.text}</p>
                }

                if (isStaticToolUIPart(part)) {
                  const toolName = getToolName(part)
                  const toolCallId = part.toolCallId
                  const args = (part.input ?? {}) as {
                    name?: string
                    dbType?: string
                    region?: string
                    targetTier?: string
                    acceptedMonthlyCost?: number
                  }

                  if (part.state === 'approval-requested') {
                    return (
                      <div
                        key={toolCallId}
                        className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-xs"
                      >
                        <strong className="text-amber-800 block mb-1">
                          ⚠️ Approval required: {toolName}
                        </strong>
                        {toolName === 'upgrade_plan' && (
                          <div className="space-y-0.5">
                            <div>Tier: {args.targetTier}</div>
                            <div>Cost: ${args.acceptedMonthlyCost}/mo</div>
                          </div>
                        )}
                        {part.approval.requestReason && (
                          <div className="mt-1 text-gray-600">
                            {part.approval.requestReason}
                          </div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              void addToolApprovalResponse({
                                id: part.approval.id,
                                approved: true,
                              })
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void addToolApprovalResponse({
                                id: part.approval.id,
                                approved: false,
                                reason: 'Denied by user',
                              })
                            }}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    )
                  }

                  if (part.state === 'approval-responded') {
                    return (
                      <div
                        key={toolCallId}
                        className="mt-2 text-xs text-gray-500 animate-pulse"
                      >
                        {part.approval.approved
                          ? `Approved ${toolName}. Processing...`
                          : `Denied ${toolName}.`}
                      </div>
                    )
                  }

                  if (part.state === 'output-available') {
                    if (toolName === 'provision_environment') {
                      return (
                        <div
                          key={toolCallId}
                          className="mt-2 p-3 bg-white border rounded shadow-sm text-xs border-green-200"
                        >
                          <strong className="text-green-700 block mb-1">
                            ✅ Environment Provisioned
                          </strong>
                          <div className="font-mono">Name: {args.name}</div>
                          <div className="font-mono">
                            DB: {args.dbType} ({args.region})
                          </div>
                        </div>
                      )
                    }

                    if (toolName === 'upgrade_plan') {
                      return (
                        <div
                          key={toolCallId}
                          className="mt-2 p-3 bg-white border rounded shadow-sm text-xs border-blue-200"
                        >
                          <strong className="text-blue-700 block mb-1">
                            ⚡ Billing Upgraded
                          </strong>
                          <div>Tier: {args.targetTier}</div>
                          <div>Cost: ${args.acceptedMonthlyCost}/mo</div>
                        </div>
                      )
                    }
                  }

                  if (part.state === 'output-denied') {
                    return (
                      <div
                        key={toolCallId}
                        className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-500"
                      >
                        <strong className="block mb-1">🚫 {toolName} denied</strong>
                        {part.approval.reason && (
                          <div>{part.approval.reason}</div>
                        )}
                      </div>
                    )
                  }

                  if (part.state === 'output-error') {
                    return (
                      <div
                        key={toolCallId}
                        className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700"
                      >
                        <strong className="block mb-1">❌ {toolName} failed</strong>
                        <div>{part.errorText}</div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={toolCallId}
                      className="mt-2 text-xs text-gray-500 animate-pulse"
                    >
                      Executing {toolName}...
                    </div>
                  )
                }

                return null
              })}
            </div>
          ))}
          {isBusy && (
            <div className="text-xs text-gray-400">Agent is thinking...</div>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="p-4 border-t bg-gray-50 flex gap-2"
        >
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="e.g. Spin up a MongoDB cluster..."
            className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isBusy}
          />
          <button
            type="submit"
            disabled={isBusy || !chatInput.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </aside>
    </div>
  )
}