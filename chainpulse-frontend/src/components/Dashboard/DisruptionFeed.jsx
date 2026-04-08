import React, { useMemo } from 'react'
import { AlertTriangle, CloudRain, TrendingDown, ArrowRight } from 'lucide-react'

const DisruptionFeed = ({ disruptions = [], shipments = [], selectedShipment = null }) => {
  const tickerItems = useMemo(() => {
    const disruptionItems = disruptions.slice(0, 8).map((item) => ({
      id: `disruption-${item.id}`,
      type: item.type,
      severity: item.severity || 'medium',
      headline: `${item.location || item.type}: ${item.description || item.message || 'Disruption active'}`,
      meta: item.type === 'news' ? 'Route intelligence' : 'Active disruption',
    }))

    const routeItems = shipments.slice(0, 6).map((shipment) => ({
      id: `route-${shipment.id}`,
      type: shipment.status === 'delayed' ? 'port' : 'news',
      severity: shipment.risk_score >= 0.75 ? 'high' : shipment.risk_score >= 0.5 ? 'medium' : 'low',
      headline: `${shipment.tracking_id} ${shipment.origin} → ${shipment.destination} risk ${(shipment.risk_score * 100).toFixed(0)}%`,
      meta: selectedShipment?.id === shipment.id ? 'Selected route' : 'Active route',
    }))

    const combined = [...disruptionItems, ...routeItems]
    return combined.length > 0 ? combined : [{
      id: 'fallback',
      type: 'news',
      severity: 'low',
      headline: 'ChainPulse ticker is waiting for live disruptions and route updates.',
      meta: 'Standby',
    }]
  }, [disruptions, shipments, selectedShipment])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-accent-red'
      case 'high': return 'text-accent-red'
      case 'medium': return 'text-accent-amber'
      case 'low': return 'text-accent-green'
      default: return 'text-dark-muted'
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'weather': return <CloudRain size={16} />
      case 'news': return <TrendingDown size={16} />
      default: return <AlertTriangle size={16} />
    }
  }

  const tickerLoop = [...tickerItems, ...tickerItems]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-700/50 bg-dark-card">
      <div className="flex items-center justify-between border-b border-gray-700/50 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-dark-text">Live Disruption Ticker</h3>
          <p className="text-xs text-dark-muted">Recent disruptions and route headlines</p>
        </div>
        <ArrowRight size={16} className="text-dark-muted" />
      </div>

      <div className="relative flex-1 overflow-hidden bg-dark-bg/50">
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-dark-bg to-transparent" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-dark-bg to-transparent" />
        <div className="flex h-full items-center whitespace-nowrap">
          <div className="flex animate-ticker gap-4 px-4">
            {tickerLoop.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className={`flex min-w-[280px] items-center gap-3 rounded-full border border-gray-700/50 bg-white/5 px-4 py-2 text-sm ${getSeverityColor(item.severity)}`}
              >
                <div className="mt-0.5">{getIcon(item.type)}</div>
                <div className="min-w-0">
                  <div className="truncate text-dark-text">{item.headline}</div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-dark-muted">{item.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisruptionFeed
