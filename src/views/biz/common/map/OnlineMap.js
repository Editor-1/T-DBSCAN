import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

class OnlineMap {
  constructor(options) {
    const el = options.el || 'MapContainerDiv'
    const center = options.center || [0, 0]
    const zoom = options.zoom || 1
    let crs = L.CRS.EPSG3857
    let defaultLayer
    const baseMaps = {}
    if (options.layers && options.layers.length > 0) {
      const layers = options.layers
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        const name = layer.name
        if (layer.list) {
          const layerGroup = L.layerGroup([])
          layer.list.forEach(sub => {
            const tileLayer = L.tileLayer(sub.url, Object.assign({}, layer.options, sub))
            layerGroup.addLayer(tileLayer)
          })
          baseMaps[name] = layerGroup
          if (layer.show) {
            defaultLayer = layerGroup
          }
        } else if (layer.url) {
          const tileLayer = L.tileLayer(layer.url, layer.options)
          baseMaps[name] = tileLayer
          if (layer.show) {
            defaultLayer = tileLayer
          }
        }
      }
    }
    if (options.crs === '4326') {
      crs = L.CRS.EPSG4326
    }

    const map = L.map(el, {
      crs: crs,
      // center: options.center || [0, 0],
      maxZoom: options.maxZoom || 18,
      minZoom: options.minZoom || 1,
      zoom: options.zoom || 1,
      zoomControl: false,
      layers: [defaultLayer],
      worldCopyJump: true,
      editable: true
    })
    // 控制范围
    if (options.maxBounds) {
      const maxBounds = options.maxBounds
      const corner1 = L.latLng(maxBounds[0], maxBounds[1])
      const corner2 = L.latLng(maxBounds[2], maxBounds[3])
      const bounds = L.latLngBounds(corner1, corner2)
      map.setMaxBounds(bounds)
    }
    map.setView(center, zoom)
    map['baseMaps'] = baseMaps
    return map
  }
}

export default OnlineMap
