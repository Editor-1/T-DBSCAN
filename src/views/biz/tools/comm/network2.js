import axios from 'axios'
import L from 'leaflet'

let networkLayer
function parseXML(xmlString) {
  var parser = new DOMParser()
  var xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  console.log(xmlDoc)
  const routelatlon = xmlDoc.getElementsByTagName('routelatlon')
  const latLngs = []
  if (routelatlon) {
    const pointsStr = routelatlon[0].innerHTML
    console.log(pointsStr)
    const arr = pointsStr.split(';')
    arr.forEach(item => {
      const xy = item.split(',')
      if (xy.length === 2) {
        latLngs.push(L.latLng(xy[1], xy[0]))
      }
    })
  }

  return latLngs
}
function findRoute(options) {
  // {x: 121.4710021018982,31.68982744216919}
  // {x: 121.4823317527771,31.682188510894775}

  // {x: 121.47196769714355, 31.6805362701416}
  // {x: 121.48218154907227, 31.68532133102417}
  console.log('navigation2')
  axios.get('http://api.tianditu.gov.cn/drive?postStr={"orig":"121.47196769714355, 31.6805362701416","dest":"121.48218154907227, 31.68532133102417","style":"0"}&type=search&tk=89dea3eab561f0dfb9867e531415e015').then(res => {
    console.log('res', res)
    const data = res.data
    const latLngs = parseXML(data)
    if (options.callback) {
      options.callback(latLngs)
    }
  })
}
function findRoute2(options) {
  clear()
  const start = options.start
  const end = options.end
  const orig = '"' + start.x + ', ' + start.y + '"'
  const dest = '"' + end.x + ', ' + end.y + '"'

  console.log('orig', orig, dest)
  axios.get('http://api.tianditu.gov.cn/drive?postStr={"orig":' + orig + ',"dest":' + dest + ',"style":"0"}&type=search&tk=89dea3eab561f0dfb9867e531415e015').then(res => {
    console.log('res', res)
    const data = res.data
    parseXML(data)
  })
}

/**
 * @apiGroup 网络分析
 * @api clear 清除网络分析路径线
 * @apiParamExample 示例
   Network.clear()
 */
function clear() {
  if (networkLayer) {
    networkLayer.clearLayers()
  }
}

/**
 * @apiGroup 网络分析
 * @api import 模块引入
 * @apiDescription 需要腾琨路径分析后台服务，/na/findRouteVia, /na/findRoute
 * @apiParamExample 示例
    import { Network } from ‘tkletmap‘
 */
export default {
  findRoute,
  findRoute2,
  clear,
}

