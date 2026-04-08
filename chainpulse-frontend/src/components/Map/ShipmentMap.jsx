import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import './ShipmentMap.css'

// Risk color mapping
const RISK_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444'
}

const DISRUPTION_COLORS = {
  weather: '#3b82f6',
  news: '#ef4444',
  traffic: '#f59e0b',
  port_closure: '#ef4444',
  strike: '#ef4444',
  flood: '#3b82f6',
  storm: '#3b82f6'
}

// Get risk level from score
const getRiskLevel = (score) => {
  if (score < 0.25) return 'low'
  if (score < 0.5) return 'medium'
  if (score < 0.75) return 'high'
  return 'critical'
}

// Create custom circle marker for shipments
const createRiskMarker = (riskLevel, shouldPulse = false) => {
  const color = RISK_COLORS[riskLevel]
  const isCritical = riskLevel === 'critical'
  
  return L.divIcon({
    html: `
      <div class="shipment-marker ${isCritical ? 'pulse' : ''} ${shouldPulse ? 'animate-pulse-marker' : ''}" style="background-color: ${color}">
        <div class="shipment-marker-inner"></div>
      </div>
    `,
    className: 'leaflet-marker-custom',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Map controls component
const MapControls = ({ selectedShipment, shipments, onShipmentSelect }) => {
  const map = useMap()

  useEffect(() => {
    if (selectedShipment) {
      // Fly to selected shipment
      map.flyTo(
        [selectedShipment.current_lat, selectedShipment.current_lon],
        4,
        { duration: 2 }
      )
    }
  }, [selectedShipment, map])

  return null
}

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (event) => {
      if (onMapClick) {
        onMapClick({
          lat: event.latlng.lat,
          lon: event.latlng.lng,
        })
      }
    },
  })

  return null
}

// Route display component
const RouteDisplay = ({ routes }) => {
  if (!routes || routes.length === 0) return null

  return (
    <>
      {/* Current route (solid blue) */}
      {routes[0]?.waypoints && (
        <Polyline
          positions={routes[0].waypoints.map(wp => [wp[0], wp[1]])}
          color="#3b82f6"
          weight={3}
          opacity={1}
          dashArray=""
          className="route-primary"
        />
      )}

      {/* Alternate routes (dashed gray) */}
      {routes.slice(1).map((route, idx) => (
        route.waypoints && (
          <Polyline
            key={`route-alt-${idx}`}
            positions={route.waypoints.map(wp => [wp[0], wp[1]])}
            color="#9ca3af"
            weight={2}
            opacity={0.5}
            dashArray="6, 3"
            className="route-alternate"
          />
        )
      ))}
    </>
  )
}

// Disruption zones component
const DisruptionZones = ({ disruptions }) => {
  if (!disruptions || disruptions.length === 0) return null

  return (
    <>
      {disruptions.map((disruption) => (
        <Circle
          key={disruption.id}
          center={[disruption.lat, disruption.lon]}
          radius={disruption.affected_radius_km * 1000}
          color={DISRUPTION_COLORS[disruption.type] || '#ef4444'}
          weight={1}
          opacity={0.3}
          fill={true}
          fillColor={DISRUPTION_COLORS[disruption.type] || '#ef4444'}
          fillOpacity={0.15}
        >
          <Popup>
            <div className="bg-dark-card text-dark-text p-2 rounded">
              <p className="font-semibold text-sm capitalize">{disruption.type}</p>
              <p className="text-xs text-dark-muted capitalize">{disruption.severity}</p>
              <p className="text-xs mt-1">{disruption.description}</p>
              <p className="text-xs text-dark-muted mt-1">
                Radius: {disruption.affected_radius_km}km
              </p>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  )
}

// Legend component
const Legend = () => {
  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="legend bg-dark-card border border-gray-700 rounded-lg p-3 m-4 text-dark-text text-sm">
        <h4 className="font-semibold mb-2">Risk Levels</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RISK_COLORS.low }}></div>
            <span className="text-xs">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RISK_COLORS.medium }}></div>
            <span className="text-xs">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RISK_COLORS.high }}></div>
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full pulse-small" style={{ backgroundColor: RISK_COLORS.critical }}></div>
            <span className="text-xs">Critical</span>
          </div>
        </div>

        <h4 className="font-semibold mt-3 mb-2">Disruptions</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DISRUPTION_COLORS.weather, opacity: 0.6 }}></div>
            <span className="text-xs">Weather</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DISRUPTION_COLORS.strike, opacity: 0.6 }}></div>
            <span className="text-xs">Strike/News</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const ShipmentMap = ({ shipments, selectedShipment, onShipmentSelect, routes, disruptions, onMapClick }) => {
  const center = [20, 0]
  const zoom = 2
  const previousRiskScoresRef = useRef({})
  const [updatedShipmentIds, setUpdatedShipmentIds] = useState([])

  useEffect(() => {
    const previousRiskScores = previousRiskScoresRef.current
    const changedIds = shipments
      .filter((shipment) => previousRiskScores[shipment.id] !== undefined && previousRiskScores[shipment.id] !== shipment.risk_score)
      .map((shipment) => shipment.id)

    previousRiskScoresRef.current = shipments.reduce((accumulator, shipment) => {
      accumulator[shipment.id] = shipment.risk_score
      return accumulator
    }, {})

    if (changedIds.length > 0) {
      setUpdatedShipmentIds(changedIds)
      const clearTimer = window.setTimeout(() => setUpdatedShipmentIds([]), 1200)
      return () => window.clearTimeout(clearTimer)
    }

    return undefined
  }, [shipments])

  return (
    <div className="w-full h-full bg-dark-card rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={zoom} className="w-full h-full">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          maxZoom={19}
        />

        <MapControls 
          selectedShipment={selectedShipment} 
          shipments={shipments}
          onShipmentSelect={onShipmentSelect}
        />

        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

        {/* Disruption zones */}
        <DisruptionZones disruptions={disruptions} />

        {/* Routes for selected shipment */}
        {selectedShipment && <RouteDisplay routes={routes} />}

        {/* Shipment markers */}
        {shipments.map((shipment) => {
          const riskLevel = getRiskLevel(shipment.risk_score)
          const isSelected = selectedShipment?.id === shipment.id
          const shouldPulse = updatedShipmentIds.includes(shipment.id)

          return (
            <Marker
              key={shipment.id}
              position={[shipment.current_lat, shipment.current_lon]}
              icon={createRiskMarker(riskLevel, shouldPulse)}
              eventHandlers={{
                click: () => onShipmentSelect(shipment)
              }}
              className={isSelected ? 'selected' : ''}
            >
              <Popup className="shipment-popup">
                <div className="bg-dark-card text-dark-text p-3 rounded min-w-48">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{shipment.tracking_id}</p>
                      <p className="text-xs text-dark-muted capitalize">{shipment.cargo_type}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-dark-muted text-xs">Route</p>
                      <p className="text-dark-text">{shipment.origin} → {shipment.destination}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-dark-muted text-xs">Risk Score</p>
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold text-dark-text"
                        style={{
                          backgroundColor: RISK_COLORS[riskLevel] + '30',
                          color: RISK_COLORS[riskLevel]
                        }}
                      >
                        {(shipment.risk_score * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-dark-muted text-xs">Status</p>
                      <span className="text-xs font-semibold capitalize">{shipment.status}</span>
                    </div>

                    <div>
                      <p className="text-dark-muted text-xs">Distance</p>
                      <p className="text-dark-text">{shipment.route_distance_km.toFixed(0)} km</p>
                    </div>

                    <div>
                      <p className="text-dark-muted text-xs">ETA</p>
                      <p className="text-dark-text">
                        {new Date(shipment.eta).toLocaleDateString()} {new Date(shipment.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onShipmentSelect(shipment)}
                    className="w-full mt-3 bg-accent-blue text-dark-text py-1 rounded text-xs font-semibold hover:bg-blue-600"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}

        <Legend />
      </MapContainer>
    </div>
  )
}

export default ShipmentMap
