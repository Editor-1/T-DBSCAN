import L from 'leaflet'  // 引入Leaflet库
import 'leaflet/dist/leaflet.css'  // 引入Leaflet的CSS样式

// 定义一个OnlineMap类，用于创建和配置地图
class OnlineMap {
  constructor(options) {
    // 获取地图容器的ID，默认为 'MapContainerDiv'
    const el = options.el || 'MapContainerDiv'
    // 设置地图的中心点，默认为 [0, 0]
    const center = options.center || [0, 0]
    // 设置地图的初始缩放级别，默认为 1
    const zoom = options.zoom || 1
    // 设置坐标参考系统，默认为 EPSG3857
    let crs = L.CRS.EPSG3857
    let defaultLayer  // 定义默认图层
    const baseMaps = {}  // 用于存储地图图层的对象

    // 如果配置了图层，则遍历图层数组
    if (options.layers && options.layers.length > 0) {
      const layers = options.layers
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i]
        const name = layer.name  // 获取图层的名称
        // 如果图层包含子图层列表，则创建一个图层组
        if (layer.list) {
          const layerGroup = L.layerGroup([])
          layer.list.forEach(sub => {
            // 创建每个子图层，并添加到图层组中
            const tileLayer = L.tileLayer(sub.url, Object.assign({}, layer.options, sub))
            layerGroup.addLayer(tileLayer)
          })
          baseMaps[name] = layerGroup  // 将图层组添加到baseMaps对象中
          if (layer.show) {
            defaultLayer = layerGroup  // 设置默认图层
          }
        } else if (layer.url) {
          // 如果图层没有子图层列表，则创建一个图层
          const tileLayer = L.tileLayer(layer.url, layer.options)
          baseMaps[name] = tileLayer  // 将图层添加到baseMaps对象中
          if (layer.show) {
            defaultLayer = tileLayer  // 设置默认图层
          }
        }
      }
    }

    // 如果配置的坐标参考系统为 '4326'，则使用 EPSG4326
    // 三个等号是严格运算符 也就是说必须是同类型同值，两个等号不同类型同值也会被判断为true
    if (options.crs === '4326') {
      crs = L.CRS.EPSG4326
    }

    // 创建地图实例
    const map = L.map(el, {
      crs: crs,  // 设置坐标参考系统
      maxZoom: options.maxZoom || 18,  // 设置最大缩放级别，默认为18
      minZoom: options.minZoom || 1,  // 设置最小缩放级别，默认为1
      zoom: options.zoom || 1,  // 设置初始缩放级别
      zoomControl: false,  // 关闭默认的缩放控制
      layers: [defaultLayer],  // 设置默认图层
      worldCopyJump: true,  // 启用世界复制跳转
      editable: true,  // 允许地图编辑
      attributionControl: false //去除右下角图标
    })

    // 如果配置了最大边界，则设置地图的最大边界
    if (options.maxBounds) {
      const maxBounds = options.maxBounds
      const corner1 = L.latLng(maxBounds[0], maxBounds[1])
      const corner2 = L.latLng(maxBounds[2], maxBounds[3])
      const bounds = L.latLngBounds(corner1, corner2)
      map.setMaxBounds(bounds)
    }

    // 设置地图的视图中心和缩放级别
    map.setView(center, zoom)
    map['baseMaps'] = baseMaps  // 将baseMaps对象添加到地图实例中

    return map  // 返回地图实例
  }
}

export default OnlineMap  // 导出OnlineMap类
