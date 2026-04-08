import React from 'react'

const RiskGauge = ({ score = 0.5, label = 'Risk Score' }) => {
  // Ensure score is between 0 and 1
  const normalizedScore = Math.max(0, Math.min(1, score))
  const percentage = normalizedScore * 100

  // Determine color zones
  const getColor = (val) => {
    if (val < 33) return '#10b981' // green
    if (val < 66) return '#f59e0b' // amber
    return '#ef4444' // red
  }

  const color = getColor(percentage)

  // Needle rotation: 0-180 degrees (semicircle)
  const needleRotation = (percentage / 100) * 180

  const svgSize = 240
  const centerX = svgSize / 2
  const centerY = svgSize / 2
  const radius = 80
  const strokeWidth = 12

  return (
    <div className="bg-dark-card p-6 rounded-lg w-full flex flex-col items-center">
      <h3 className="text-dark-text font-semibold mb-6">{label}</h3>

      <div className="relative" style={{ width: `${svgSize}px`, height: `${svgSize / 2 + 40}px` }}>
        <svg width={svgSize} height={svgSize / 2 + 60} viewBox={`0 0 ${svgSize} ${svgSize / 2 + 60}`}>
          {/* Background semicircle */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled track to score */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 ${percentage > 50 ? 1 : 0} 1 ${
              centerX - radius * Math.cos((percentage / 100) * Math.PI)
            } ${centerY - radius * Math.sin((percentage / 100) * Math.PI)}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-500"
          />

          {/* Needle */}
          <g transform={`translate(${centerX}, ${centerY}) rotate(${needleRotation})`}>
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={-radius + 15}
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            {/* Needle circle */}
            <circle cx="0" cy="0" r="6" fill={color} />
          </g>

          {/* Zone labels */}
          <text x={centerX - radius + 15} y={centerY + 25} fontSize="12" fill="#10b981" className="font-semibold">
            LOW
          </text>
          <text x={centerX - 12} y={centerY + 28} fontSize="12" fill="#f59e0b" className="font-semibold" textAnchor="middle">
            MEDIUM
          </text>
          <text x={centerX + radius - 15} y={centerY + 25} fontSize="12" fill="#ef4444" className="font-semibold" textAnchor="end">
            HIGH
          </text>
        </svg>

        {/* Center score display */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-3xl font-bold text-dark-text">{percentage.toFixed(0)}%</p>
        </div>
      </div>
    </div>
  )
}

export default RiskGauge
