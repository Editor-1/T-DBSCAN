
import network2 from './network2'

import L from 'leaflet'
import 'leaflet-polylinedecorator'



let layer
export function init() {
  const map = window.map
  console.log('map', map)
  var scale = L.control.scale({  // 比例尺
    maxWidth: 100,
    metric: true,
    imperial: false,
    position: 'bottomright'
  }).addTo(map);
  layer = L.layerGroup().addTo(map)
}
export function clear(){
  layer.clearLayers()
}
export function path(start,end,style) {
  clear() //清除图层
  network2.findRoute2(start,end,style,{
    callback: d => {
      console.log('d', d)
      drawPolylineArrow(d)
    }
  })
}
export function drawPolylineArrow(positions) {
  const opts = {
    color: 'red',
    weight: 3
  }
  const polyline = L.polyline(positions, opts)
  layer.addLayer(polyline)

  L.polylineDecorator(polyline, {
    patterns: [
      {
        offset: '0%', //模式符号的偏移位置
        repeat: '20%', //模式符号的重复间隔
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
  }).addTo(layer)
  return polyline
}
