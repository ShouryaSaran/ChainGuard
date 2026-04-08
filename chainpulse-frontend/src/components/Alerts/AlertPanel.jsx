import React, { useMemo } from 'react'
import { Bell, AlertTriangle, ShieldAlert, CloudLightning, MapPin, Package, X } from 'lucide-react'

const severityClasses = {
  critical: 'border-red-500 bg-red-950/35',
  high: 'border-amber-500 bg-amber-950/25',
  medium: 'border-blue-500 bg-blue-950/25',
  low: 'border-green-500 bg-green-950/25',
}

const alertIcons = {
  high_risk: AlertTriangle,
  disruption: CloudLightning,
  route_change: MapPin,
  shipment_update: Package,
  alert: Bell,
  default: ShieldAlert,
}

const getTimeAgo = (timestamp) => {
  if (!timestamp) return 'just now'
  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000))
  if (diffSeconds < 60) return `${diffSeconds || 1} sec ago`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

const normalizeAlert = (alert) => ({
  ...alert,
  severity: alert.severity || 'medium',
  is_read: Boolean(alert.is_read),
})

const AlertPanel = ({ alerts = [], onClearAll, onMarkRead, onSelectShipment }) => {
  const sortedAlerts = useMemo(
    () => [...alerts].map(normalizeAlert).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)),
    [alerts],
  )

  const unreadCount = sortedAlerts.filter((alert) => !alert.is_read).length

  const handleSelectShipment = (trackingId) => {
    if (trackingId && typeof onSelectShipment === 'function') {
      onSelectShipment(trackingId)
    }
  }

  const handleMarkRead = (alert) => {
    if (!alert.is_read && typeof onMarkRead === 'function') {
      onMarkRead(alert.id)
    }
  }

  return (
    <div className="flex flex-col h-full bg-dark-card rounded-lg border border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-dark-text font-semibold">Live Alerts</h3>
          <span className="px-2 py-0.5 rounded-full bg-red-900/40 text-red-300 text-xs font-bold">
            {unreadCount}
          </span>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-dark-muted hover:text-dark-text transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sortedAlerts.length === 0 ? (
          <div className="text-center text-dark-muted py-8 text-sm">No live alerts</div>
        ) : (
          sortedAlerts.map((alert) => {
            const Icon = alertIcons[alert.type] || alertIcons.default
            const severityKey = alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'high' : alert.severity === 'medium' ? 'medium' : 'low'

            return (
              <div
                key={alert.id}
                onClick={() => handleMarkRead(alert)}
                className={`group rounded-lg border-l-4 p-3 cursor-pointer transition-all ${severityClasses[severityKey]} ${
                  alert.is_read ? 'opacity-60' : 'opacity-100'
                } hover:brightness-110`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-dark-text">
                    <Icon size={18} className={severityKey === 'critical' ? 'text-red-400' : severityKey === 'high' ? 'text-amber-400' : severityKey === 'medium' ? 'text-blue-400' : 'text-green-400'} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-dark-text leading-snug">
                      {alert.message || alert.disruption || 'Alert received'}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      {alert.tracking_id ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectShipment(alert.tracking_id)
                            handleMarkRead(alert)
                          }}
                          className="font-mono text-accent-blue hover:text-blue-300 transition-colors underline underline-offset-2"
                        >
                          {alert.tracking_id}
                        </button>
                      ) : null}
                      <span className="text-dark-muted">{getTimeAgo(alert.timestamp)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMarkRead(alert)
                    }}
                    className="text-dark-muted hover:text-dark-text transition-colors"
                    aria-label="Mark alert as read"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default AlertPanel
