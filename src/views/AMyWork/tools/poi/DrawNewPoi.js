import L from 'leaflet' // 引入 Leaflet 库
import locationPng from '@/assets/images/location.png' // 引入位置图标
import PointEntity from './PointEntity' // 引入 PointEntity 模块
import { getLng } from './Longitude180' // 引入经度处理模块
import { toFixed } from '../biz/common' // 引入工具函数
import axios from 'axios'

const Fly_Level = 10 // 定义飞行缩放等级
let drawNewPoiObj // 全局变量，用于保存 DrawPoi 实例

// 地图点击事件处理函数
function clickEvent(evt) {
  const latlng = evt.latlng // 获取点击位置的经纬度
  drawNewPoiObj.map._container.style.cursor = '' // 恢复鼠标样式
  // 创建可编辑的标记
  drawNewPoiObj.createMarkerEdit({
    latlng: latlng,
    name: ''
  })

  drawNewPoiObj.vm.page = 'edit' // 切换到编辑页面
  const pointEntity = drawNewPoiObj.createEntity({}) // 创建一个点实体对象
  drawNewPoiObj.vm.currentPoint = pointEntity // 更新当前点信息

  drawNewPoiObj.updateLatlng(evt) // 更新标记位置
  drawNewPoiObj.updateNameByLn(latlng)
  
  // 取消地图点击事件监听
  drawNewPoiObj.map.off('click', clickEvent, drawNewPoiObj.clickContext)
  drawNewPoiObj.vm.drawing = false // 结束绘制状态
  drawNewPoiObj.setMouseStatus(true) // 恢复鼠标状态
}

// 在指定位置插入字符
function insertCharacter(str, char, index) {
  return str.slice(0, index) + char + str.slice(index);
}

// DrawPoi 类定义
export default class DrawPoi {
  constructor(parent) {
    this.map = window.map // 获取全局地图实例
    this.vm = parent // 保存 Vue 组件实例
    this.layerGroup = L.layerGroup().addTo(this.map) // 创建图层组并添加到地图

    this.marker = null // 当前标记
    this.markerEdit = null // 当前可编辑标记
    this.clickContext = 'DrawPoiContext' // 事件上下文标识
    drawNewPoiObj = this // 保存当前实例到全局变量
  }

  // 创建标记
  createMarker(param) {
    const icon = L.icon({
      iconUrl: locationPng, // 图标 URL
      iconSize: [32, 32], // 图标大小
      iconAnchor: [16, 32] // 图标锚点
    })
    const marker = L.marker(param.latlng, {
      icon: icon,
      item: param.item // 保存额外信息
    })
    this.layerGroup.addLayer(marker) // 添加标记到图层组

    // 如果有名称，则绑定弹出框
    if (param.name) {
      const offset = {
        offset: new L.Point(0, -20) // 设置偏移量
      }
      marker.bindPopup(param.name + '<br>' + param.desc, offset).openPopup()
    }
    this.marker = marker // 保存当前标记
    return marker
  }

  // 创建可编辑标记
  createMarkerEdit(param) {
    const latlng = param.latlng
    const icon = L.divIcon({
      className: 'leaflet-icon-poi-edit', // 自定义图标样式
      iconSize: [12, 12],
      iconAnchor: [6, 0]
    })
    const markerEdit = L.marker(latlng, {
      icon: icon,
      draggable: true // 可拖动
    })
    markerEdit.on('drag', evt => {
      this.updateLatlng(evt) // 拖动时更新经纬度
    })
    markerEdit.on('dragend', evt => {
      var position = markerEdit.getLatLng()
      this.updateNameByLn(position)
    })
    this.layerGroup.addLayer(markerEdit) // 添加可编辑标记到图层组
    this.markerEdit = markerEdit
    // 创建实际标记
    this.createMarker({
      latlng: latlng,
      name: param.name,
      desc: param.desc
    })
  }

  // 创建点实体对象
  createEntity(options) {
    const pointEntity = new PointEntity(options)
    return pointEntity
  }

  // 更新经纬度
  updateLatlng(evt) {
    const lat = toFixed(evt.latlng.lat) // 格式化纬度
    this.vm.currentPoint.lat = lat // 更新当前点纬度
    this.vm.currentPoint.lng = getLng(evt.latlng.lng) // 更新当前点经度

    this.marker.setLatLng(evt.latlng) // 更新标记位置
  }
  // 更新位置名字
  updateNameByLn(latln){
    const lat = toFixed(latln.lat) // 格式化纬度
    const style = 1
    var name = ''
    axios.get(' http://api.tianditu.gov.cn/geocoder?postStr={"lon":'+getLng(latln.lng)+',"lat":'+lat+',"var":'+style+
    '}&type=geocode&tk=89dea3eab561f0dfb9867e531415e015').then(res => {
      name = res.data.result.formatted_address
      if(res.data.result.addressComponent.province!==''){
        var str = res.data.result.addressComponent.province
        name = insertCharacter(name,"-",str.length) 
      }
      this.vm.currentPoint.name = name
    }).catch(err => {
      console.error('Error fetching route:', err)
    }) 
    
  }

  // 设置标记位置
  setLatLng(lat, lng) {
    if (lat < -90 || lat > 90 || lng > 180 || lng < -180) {
      return // 检查经纬度范围
    }
    const latlng = L.latLng(lat, lng)
    this.map.flyTo(latlng, Fly_Level, { animate: false }) // 飞到指定位置
    if (this.marker) {
      this.marker.setLatLng(latlng) // 更新标记位置
    }
    if (this.markerEdit) {
      this.markerEdit.setLatLng(latlng) // 更新可编辑标记位置
    }
  }

  // 启动绘制模式
  draw() {
    this.clear() // 清除现有标记
    this.setMouseStatus(false) // 设置鼠标状态
    this.map.on('click', clickEvent, this.clickContext) // 监听地图点击事件
  }

  // 取消绘制模式
  drawCancel() {
    this.map.off('click', clickEvent, this.clickContext) // 取消地图点击事件监听
    this.setMouseStatus(true) // 恢复鼠标状态
  }

  // 飞到指定点
  flyTo(item) {
    this.clear() // 清除现有标记
    const latlng = [item.Latitude, item.Longitude]
    this.createMarker({
      latlng: latlng,
      name: item.name,
      desc: item.description,
      item: item
    })
    this.map.flyTo(latlng, Fly_Level, { animate: false }) // 飞到指定位置
  }

  // 编辑点
  flyToEdit(item) {
    const latlng = [item.Latitude, item.Longitude]
    this.map.flyTo(latlng, Fly_Level, { animate: false }) // 飞到指定位置
  }

  // 编辑点
  edit(item) {
    this.clear() // 清除现有标记

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
    this.vm.currentPoint = pointEntity // 更新当前点信息
    this.vm.page = 'edit' // 切换到编辑页面
    this.createMarkerEdit({
      latlng: pointEntity.getLatlng(),
      name: item.name,
      time: item.time,
      desc: item.description
    })
  }

  // 清除所有标记
  clear() {
    this.layerGroup.eachLayer(layer => {
      layer.removeFrom(this.layerGroup)
    })
  }

  // 根据ID清除特定标记
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

  // 设置鼠标状态
  setMouseStatus(df = true) {
    if (df) {
      L.DomUtil.removeClass(this.map._container, 'leaflet-cursor-crosshair') // 恢复鼠标样式
    } else {
      L.DomUtil.addClass(this.map._container, 'leaflet-cursor-crosshair') // 设置鼠标为十字样式
    }
  }
}
