import L from 'leaflet' // 引入 Leaflet 库
import startPng from '@/assets/images/start.png' // 引入起点图标
import endPng from '@/assets/images/end.png' // 引入终点图标
import NavPointEntity from './NavPointEntity' // 引入 PointEntity 模块
import { getLng } from './Longitude180' // 引入经度处理模块
import { toFixed } from '../biz/common' // 引入工具函数
import axios from 'axios'

const Fly_Level = 10 // 定义飞行缩放等级
let drawPoiObj // 全局变量，用于保存 DrawPoi 实例


function clickEvent(evt) {
  if(!drawPoiObj.vm.navdrawing)return
  const latlng = evt.latlng // 获取点击位置的经纬度
  drawPoiObj.map._container.style.cursor = '' // 恢复鼠标样式
  // 创建可编辑的起点和终点标记
  drawPoiObj.createMarkers({
    startLatlng: latlng,
    endLatlng: latlng
  })

  const startPointEntity = drawPoiObj.createEntity({}) // 创建一个点实体对象
  const endPointEntity = drawPoiObj.createEntity({}) // 创建一个点实体对象
  drawPoiObj.vm.startPlace = startPointEntity // 更新当前点信息
  drawPoiObj.vm.endPlace = endPointEntity // 更新当前点信息

  // 取消地图点击事件监听
  drawPoiObj.map.off('click', clickEvent, drawPoiObj.clickContext)
  drawPoiObj.setMouseStatus(true) // 恢复鼠标状态
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

    this.startMarker = null // 起点标记
    this.endMarker = null // 终点标记
    this.clickContext = 'DrawPoiContext' // 事件上下文标识
    drawPoiObj = this // 保存当前实例到全局变量
  }

  // 创建起点和终点标记
  createMarkers(param) {
    const startIcon = L.icon({
      iconUrl: startPng, // 起点图标 URL
      iconSize: [32, 36], // 图标大小
      iconAnchor: [16, 32] // 图标锚点
    })
    const endIcon = L.icon({
      iconUrl: endPng, // 终点图标 URL
      iconSize: [30, 32], // 图标大小
      iconAnchor: [16, 32] // 图标锚点
    })

    const startMarker = L.marker(param.startLatlng, {
      icon: startIcon,
      draggable: true // 起点可拖动
    })
    const endMarker = L.marker(param.endLatlng, {
      icon: endIcon,
      draggable: true // 终点可拖动
    })

    startMarker.on('drag', evt => {
      this.updateLatlng(evt, 'start') // 拖动时更新起点经纬度
    })
    startMarker.on('dragend',evt=>{
      this.getNameByevt(evt.target._latlng,'start')
    })

    endMarker.on('drag', evt => {
      this.updateLatlng(evt, 'end') // 拖动时更新终点经纬度
    })
    endMarker.on('dragend',evt=>{
      this.getNameByevt(evt.target._latlng,'end')
    })


    this.layerGroup.addLayer(startMarker) // 添加起点标记到图层组
    this.layerGroup.addLayer(endMarker) // 添加终点标记到图层组

    this.startMarker = startMarker // 保存起点标记
    this.endMarker = endMarker // 保存终点标记
  }

  // 创建点实体对象
  createEntity(options) {
    const navPointEntity = new NavPointEntity(options)
    return navPointEntity
  }
  // 更新经纬度
  updateLatlng(evt, type) {
    const lat = toFixed(evt.latlng.lat) // 格式化纬度
    const lng = getLng(evt.latlng.lng) // 获取经度

    if (type === 'start') {
      this.vm.startPlace = { lat, lng } // 更新当前起点信息
    } else if (type === 'end') {
      this.vm.endPlace = { lat, lng } // 更新当前终点信息
    }
  }

  // 设置标记位置
  setLatLng(lat, lng) {
    if (lat < -90 || lat > 90 || lng > 180 || lng < -180) {
      return // 检查经纬度范围
    }
    const latlng = L.latLng(lat, lng)
    this.map.flyTo(latlng, Fly_Level, { animate: false }) // 飞到指定位置
    if (this.startMarker) {
      this.startMarker.setLatLng(latlng) // 更新起点标记位置
    }
    if (this.endMarker) {
      this.endMarker.setLatLng(latlng) // 更新终点标记位置
    }
  }
  // 更新位置名字
  getNameByevt(latln,type){
    const lat = toFixed(latln.lat) // 格式化纬度
    const style = 1
    var placeName = ''
    axios.get(' http://api.tianditu.gov.cn/geocoder?postStr={"lon":'+getLng(latln.lng)+',"lat":'+lat+',"var":'+style+
    '}&type=geocode&tk=89dea3eab561f0dfb9867e531415e015').then(res => {
      placeName = res.data.result.formatted_address
      if(res.data.result.addressComponent.province!==''){
        var str = res.data.result.addressComponent.province
        placeName = insertCharacter(placeName,"-",str.length) 
      }
      if (type === 'start') {
        this.vm.$set(this.vm.startPlace, 'name', placeName) // 更新当前起点信息
      } else if (type === 'end') {
        this.vm.$set(this.vm.endPlace, 'name', placeName) // 更新当前终点信息
      }
    }).catch(err => {
      console.error('Error fetching route:', err)
    }) 
    
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

  // 清除所有标记
  clear() {
    this.layerGroup.eachLayer(layer => {
      layer.removeFrom(this.layerGroup)
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
