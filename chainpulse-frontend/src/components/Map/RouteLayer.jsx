import React from 'react'
import { Polyline, Popup } from 'react-leaflet'

const RouteLayer = ({ routes }) => {
  if (!routes || routes.length === 0) return null

  const colors = ['#3b82f6', '#10b981', '#f59e0b']

  return (
    <>
      {routes.map((route, idx) => (
        <Polyline
          key={idx}
          positions={route.waypoints.map(wp => [wp[0], wp[1]])}
          color={colors[idx % colors.length]}
          weight={idx === 0 ? 3 : 2}
          opacity={idx === 0 ? 1 : 0.6}
          dashArray={idx === 0 ? '' : '5, 5'}
        />
      ))}
    </>
  )
}

export default RouteLayer
