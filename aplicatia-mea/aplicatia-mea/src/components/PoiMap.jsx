import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function popupContent(marker) {
  const box = document.createElement('div')
  const title = document.createElement('b')
  title.textContent = marker.name
  box.append(title, document.createElement('br'), document.createTextNode(marker.label))
  return box
}

// Harta Leaflet. `center` = {lat, lon} (țara), `markers` = [{ name, label, lat, lon }]
export default function PoiMap({ center, markers }) {
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  // creăm harta o singură dată și o distrugem la demontare
  useEffect(() => {
    const map = L.map(elRef.current, { scrollWheelZoom: false }).setView([48, 12], 4)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '© OpenStreetMap, © CARTO',
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // fără marcaje încă: centrăm pe reperul țării
  useEffect(() => {
    if (center && !markers.length) mapRef.current?.setView([center.lat, center.lon], 5)
  }, [center, markers.length])

  // desenăm marcajele atracțiilor
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    layerRef.current.clearLayers()
    markers.forEach((m) => {
      L.circleMarker([m.lat, m.lon], { radius: 9, color: '#fff', weight: 2, fillColor: '#E4572E', fillOpacity: 1 })
        .bindPopup(popupContent(m))
        .addTo(layerRef.current)
    })
    if (markers.length) map.fitBounds(markers.map((m) => [m.lat, m.lon]), { padding: [40, 40], maxZoom: 13 })
  }, [markers])

  return <div ref={elRef} className="map" role="region" aria-label="Harta punctelor de interes" />
}
