import axios from 'axios'
import L from 'leaflet'
let networkLayer
function parseXML(xmlString) {
  var parser = new DOMParser()
  var xmlDoc = parser.parseFromString(xmlString, 'text/xml')
  const routelatlon = xmlDoc.getElementsByTagName('routelatlon')
  const latLngs = []
  if (routelatlon) {
    const pointsStr = routelatlon[0].innerHTML
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

function findRoute2(start,end,style,options) {
  clear()
  const orig = '"' + start.lng + ', ' + start.lat + '"'
  const dest = '"' + end.lng + ', ' + end.lat + '"'
  const navstyle = style
  console.log('orig', orig, dest)
  axios.get('http://api.tianditu.gov.cn/drive?postStr={"orig":' + orig + ',"dest":' + dest + ',"style":' + navstyle + '}&type=search&tk=89dea3eab561f0dfb9867e531415e015').then(res => {
    console.log('res', res)
    const data = res.data
    const latLngs = parseXML(data)
    if (options.callback) {
      options.callback(latLngs)
    }
  }).catch(err => {
    console.error('Error fetching route:', err)
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
  findRoute2,
  clear
}

