import L from 'leaflet'
import locationPng from '@/assets/images/location.png'
import PointEntity from './PointEntity'
import { getLng } from './Longitude180'
import { toFixed } from '../biz/common'

const Fly_Level = 10
let drawPoiObj

function clickEvent(evt) {
  const latlng = evt.latlng
  drawPoiObj.map._container.style.cursor = ''

  drawPoiObj.createMarkerEdit({
    latlng: latlng,
    name: ''
  })

  drawPoiObj.vm.page = 'edit'
  const pointEntity = drawPoiObj.createEntity({})
  drawPoiObj.vm.currentPoint = pointEntity

  drawPoiObj.updateLatlng(evt)

  drawPoiObj.map.off('click', clickEvent, drawPoiObj.clickContext)
  drawPoiObj.vm.drawing = false
  drawPoiObj.setMouseStatus(true)
}

export default class DrawPoi {
  constructor(parent) {
    this.map = window.map
    this.vm = parent
    this.layerGroup = L.layerGroup().addTo(this.map)

    this.marker = null
    this.markerEdit = null
    this.clickContext = 'DrawPoiContext'
    drawPoiObj = this
  }
  createMarker(param) {
    const icon = L.icon({
      iconUrl: locationPng,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    })
    const marker = L.marker(param.latlng, {
      icon: icon,
      item: param.item
    })
    this.layerGroup.addLayer(marker)

    if (param.name) {
      const offset = {
        offset: new L.Point(0, -20)
      }
      marker.bindPopup(param.name + '<br>' + param.desc, offset).openPopup()
    }
    this.marker = marker
    return marker
  }
  createMarkerEdit(param) {
    const latlng = param.latlng
    const icon = L.divIcon({
      className: 'leaflet-icon-poi-edit',
      iconSize: [12, 12],
      iconAnchor: [6, 0]
    })
    // 移动体
    const markerEdit = L.marker(latlng, {
      icon: icon,
      draggable: true
    })
    markerEdit.on('drag', evt => {
      this.updateLatlng(evt)
    })
    this.layerGroup.addLayer(markerEdit)
    this.markerEdit = markerEdit

    // 本体
    this.createMarker({
      latlng: latlng,
      name: param.name,
      desc: param.desc
    })
  }
  createEntity(options) {
    const pointEntity = new PointEntity(options)
    return pointEntity
  }
  updateLatlng(evt) {
    const lat = toFixed(evt.latlng.lat)
    this.vm.currentPoint.lat = lat
    this.vm.currentPoint.lng = getLng(evt.latlng.lng)

    this.marker.setLatLng(evt.latlng)
  }
  setLatLng(lat, lng) {
    if (lat < -90 || lat > 90 || lng > 180 || lng < -180) {
      return
    }
    const latlng = L.latLng(lat, lng)
    this.map.flyTo(latlng, Fly_Level, { animate: false })
    if (this.marker) {
      this.marker.setLatLng(latlng)
    }
    if (this.markerEdit) {
      this.markerEdit.setLatLng(latlng)
    }
  }
  draw() {
    this.clear()
    this.setMouseStatus(false)
    this.map.on('click', clickEvent, this.clickContext)
  }
  drawCancel() {
    this.map.off('click', clickEvent, this.clickContext)
    this.setMouseStatus(true)
  }
  flyTo(item) {
    this.clear()
    const latlng = [item.Latitude, item.Longitude]
    this.createMarker({
      latlng: latlng,
      name: item.name,
      desc: item.description,
      item: item
    })
    this.map.flyTo(latlng, Fly_Level, { animate: false })
  }
  flyToEdit(item) {
    const latlng = [item.Latitude, item.Longitude]
    this.map.flyTo(latlng, Fly_Level, { animate: false })
  }
  edit(item) {
    this.clear()

    // this.flyToEdit(item)
    const pointEntity = this.createEntity({
      id: item.id,
      name: item.name,
      altitude: item.altitude,
      desc: item.description,
      lat: item.latitude,
      lng: item.longitude,
      photos: item.photos,
      time: item.time
    })
    this.vm.currentPoint = pointEntity
    this.vm.page = 'edit'
    this.createMarkerEdit({
      latlng: pointEntity.getLatlng(),
      name: item.name,
      time: item.time,
      desc: item.description
    })
  }
  clear() {
    this.layerGroup.eachLayer(layer => {
      layer.removeFrom(this.layerGroup)
    })
  }
  clearById(id) {
    if (!id) {
      return
    }
    this.layerGroup.eachLayer(layer => {
      if (layer.options && layer.options.item && layer.options.item.Id === id) {
        layer.removeFrom(this.layerGroup)
      }
    })
  }
  setMouseStatus(df = true) {
    if (df) {
      L.DomUtil.removeClass(this.map._container, 'leaflet-cursor-crosshair')
    } else {
      L.DomUtil.addClass(this.map._container, 'leaflet-cursor-crosshair')
    }
  }
}
