import network2 from './network2'

import L from 'leaflet'
import 'leaflet-polylinedecorator'

let layer
export function init() {
  const map = window.map
  console.log('map', map)
  if (!map) {
    console.error('Map object is not initialized.')
    return
  }
  layer = L.layerGroup().addTo(map)
}

export function path() {
  network2.findRoute({
    callback: d => {
      console.log('d', d)
      drawPolylineArrow(d)
    }
  })
}

function drawPolylineArrow(positions) {
  if (!positions || positions.length === 0) {
    console.error('No positions provided for drawing polyline.')
    return
  }

  const opts = {
    color: 'red',
    weight: 5
  }
  const polyline = L.polyline(positions, opts)
  layer.addLayer(polyline)

  const decorator = L.polylineDecorator(polyline, {
    patterns: [
      {
        offset: 25,
        repeat: 100,
        symbol: L.Symbol.arrowHead({
          pixelSize: 15,
          headAngle: 30,
          pathOptions: {
            fillOpacity: 1,
            weight: 0,
            color: 'red'
          }
        })
      }
    ]
  })

  layer.addLayer(decorator)
  console.log('Decorator added to layer:', decorator)
  return polyline
}
