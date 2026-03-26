'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Ontario city centroids
const CITY_COORDS: Record<string, [number, number]> = {
  Toronto:          [43.6532, -79.3832],
  Mississauga:      [43.5890, -79.6441],
  Brampton:         [43.7315, -79.7624],
  Burlington:       [43.3255, -79.7990],
  Hamilton:         [43.2557, -79.8711],
  Oakville:         [43.4675, -79.6877],
  Pickering:        [43.8354, -79.0893],
  Markham:          [43.8561, -79.3370],
  'St. Catharines': [43.1594, -79.2469],
  Sudbury:          [46.4917, -80.9930],
}

type CityCount = { city: string; count: number }

export default function PermitMap({ cityCounts }: { cityCounts: CityCount[] }) {
  // Fix Leaflet default icon path issue with Next.js
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const L = require('leaflet')
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  const maxCount = Math.max(...cityCounts.map(c => c.count), 1)

  return (
    <MapContainer
      center={[43.9, -79.5]}
      zoom={7}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cityCounts.map(({ city, count }) => {
        const coords = CITY_COORDS[city]
        if (!coords) return null
        // Radius scales from 12px (smallest) to 48px (largest city)
        const radius = 12 + Math.round((count / maxCount) * 36)
        return (
          <CircleMarker
            key={city}
            center={coords}
            radius={radius}
            pathOptions={{
              fillColor: '#143A75',
              fillOpacity: 0.55 + (count / maxCount) * 0.3,
              color: '#0A1A3C',
              weight: 1.5,
            }}
          >
            <Tooltip permanent={count === maxCount} direction="top" offset={[0, -radius]}>
              <span className="text-xs font-semibold">
                {city} — {count} permit{count !== 1 ? 's' : ''}
              </span>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
