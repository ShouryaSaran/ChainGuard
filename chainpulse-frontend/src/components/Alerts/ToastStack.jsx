import React, { useEffect, useState } from 'react'
import { AlertTriangle, Bell, CloudLightning, X } from 'lucide-react'

const severityStyles = {
  critical: {
    border: 'border-red-500/60',
    bg: 'bg-red-950/90',
    icon: 'text-red-300',
  },
  high: {
    border: 'border-amber-500/60',
    bg: 'bg-amber-950/90',
    icon: 'text-amber-300',
  },
  medium: {
    border: 'border-blue-500/60',
    bg: 'bg-blue-950/90',
    icon: 'text-blue-300',
  },
  low: {
    border: 'border-green-500/60',
    bg: 'bg-green-950/90',
    icon: 'text-green-300',
  },
}

const typeIcons = {
  high_risk: AlertTriangle,
  disruption: CloudLightning,
  alert: Bell,
  default: Bell,
}

const ToastItem = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false)
  const [canDismiss, setCanDismiss] = useState(false)

  useEffect(() => {
    const showTimer = window.setTimeout(() => setVisible(true), 20)
    const dismissTimer = window.setTimeout(() => {
      setCanDismiss(true)
      setVisible(false)
    }, 5000)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(dismissTimer)
    }
  }, [])

  useEffect(() => {
    if (!visible && canDismiss) {
      const exitTimer = window.setTimeout(() => onDismiss(toast.id), 220)
      return () => window.clearTimeout(exitTimer)
    }
    return undefined
  }, [visible, canDismiss, onDismiss, toast.id])

  const severity = severityStyles[toast.severity] || severityStyles.medium
  const Icon = typeIcons[toast.type] || typeIcons.default

  return (
    <div
      className={`pointer-events-auto w-full overflow-hidden rounded-xl border ${severity.border} ${severity.bg} shadow-2xl transition-all duration-300 ease-out ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-3 p-4">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 ${severity.icon}`}>
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-dark-text">{toast.tracking_id || 'Live Alert'}</p>
              <p className="mt-1 text-sm text-dark-muted leading-snug">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCanDismiss(true)
                setVisible(false)
              }}
              className="rounded-full p-1 text-dark-muted hover:bg-white/5 hover:text-dark-text transition-colors"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ToastStack = ({ toasts = [], onDismiss }) => {
  const visibleToasts = toasts.slice(0, 3)

  if (visibleToasts.length === 0) {
    return null
  }

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-50 w-[22rem] max-w-[calc(100vw-2rem)] space-y-3">
      {visibleToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export default ToastStack