import OnlineMap from './OnlineMap'
import L from 'leaflet'
import Vue from 'vue'

let map
let layerList
export function init(el) {
  layerList = getLayerList()
  map = new OnlineMap({
    el: el, //地图容器的元素ID或DOM元素
    center: [40.044324, 116.4550499], //地图中心的经纬度
    zoom: 5, //地图初始缩放级别
    maxZoom: 18, //地图最大缩放级别
    minZoom: 1, //地图最小缩放级别
    crs: '3857', //坐标参考系，默认为 EPSG3857
    layers: layerList //图层列表
  })
  L.control.layers(map.baseMaps).addTo(map)
  window.map = map
  return map
}
Vue.prototype.getMap = function() {
  return map
}
function getLayerList() {
  const defaultTDTKey = '51d96270d898419fc64bbb89e26f199a'

  const subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
  const tdtBaseUrl = 'style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk='
  const tdt = {
    url_vec_w: 'http://t{s}.tianditu.gov.cn/vec_w/wmts?layer=vec&' + tdtBaseUrl,
    url_cva_w: 'http://t{s}.tianditu.gov.cn/cva_w/wmts?layer=cva&' + tdtBaseUrl,
    url_img_w: 'http://t{s}.tianditu.gov.cn/img_w/wmts?layer=img&' + tdtBaseUrl,
    url_cia_w: 'http://t{s}.tianditu.gov.cn/cia_w/wmts?layer=cia&' + tdtBaseUrl,
    url_ter_w: 'http://t{s}.tianditu.gov.cn/ter_w/wmts?layer=ter&' + tdtBaseUrl,
    url_cta_w: 'http://t{s}.tianditu.gov.cn/cta_w/wmts?layer=cta&' + tdtBaseUrl
  }
  const layerList = [
    {
      name: '街道',
      options: {
        zoomOffset: 0,
        subdomains,
        name: 'TdtVec'
      },
      list: [
        { url: tdt.url_vec_w + defaultTDTKey, bUrl: tdt.url_vec_w },
        { url: tdt.url_cva_w + defaultTDTKey, bUrl: tdt.url_cva_w }
      ],
      show: true
    },
    {
      name: '卫星',
      options: {
        zoomOffset: 0,
        subdomains,
        name: 'TdtImg'
      },
      list: [
        { url: tdt.url_img_w + defaultTDTKey, bUrl: tdt.url_img_w },
        { url: tdt.url_cia_w + defaultTDTKey, bUrl: tdt.url_cia_w }
      ],
      show: false
    },
    {
      name: '地形',
      options: {
        zoomOffset: 0,
        subdomains,
        name: 'TdtTer'
      },
      list: [
        { url: tdt.url_ter_w + defaultTDTKey, bUrl: tdt.url_ter_w },
        { url: tdt.url_cta_w + defaultTDTKey, bUrl: tdt.url_cta_w }
      ],
      show: false
    }
  ]
  return layerList
}
