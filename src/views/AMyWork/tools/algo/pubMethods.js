/**
 * 计算两个点的距离，使用Haversine球面模型计算方法
 * @param {} point1 
 * @param {*} point2 
 * @returns 
 */
export  function calculateDistance(point1, point2) {
    const lat1 = parseFloat(point1.lat);
    const lng1 = parseFloat(point1.lng);
    const lat2 = parseFloat(point2.lat);
    const lng2 = parseFloat(point2.lng);

    const radLat1 = lat1 * Math.PI / 180.0;
    const radLat2 = lat2 * Math.PI / 180.0;
    const a = radLat1 - radLat2;
    const b = (lng1 * Math.PI / 180.0) - (lng2 * Math.PI / 180.0);
    const s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    return s * 6371000.00;
}

/**
 * 这里是四叉树的数据结构及算法
 */
const MAX_ELE_NUM = 1000;
const EARTH_RADIUS = 6370.99681;
export class Region {
    constructor(up, bottom, left, right) {
        this.up = up;
        this.bottom = bottom;
        this.left = left;
        this.right = right;
    }
}

export class ElePoint {
    constructor(lat, lng, timestamp, index) {
        this.lat = lat;
        this.lng = lng;
        this.timestamp = timestamp;
        this.index = index;
    }
}

export class QuadTreeNode {
    constructor(depth, region) {
        this.depth = depth;
        this.is_leaf = true;
        this.region = region;
        this.LU = null;
        this.LB = null;
        this.RU = null;
        this.RB = null;
        this.ele_num = 0;
        this.ele_list = [];
    }
}

export function insertEle(node, ele) {
    if (node.is_leaf) {
        if (node.ele_num >= MAX_ELE_NUM) {
            splitNode(node);
            insertEle(node, ele);
        } else {
            node.ele_list.push(ele);
            node.ele_num++;
        }
    } else {
        const midVertical = (node.region.up + node.region.bottom) / 2;
        const midHorizontal = (node.region.left + node.region.right) / 2;
        if (ele.lat > midVertical) {
            if (ele.lng > midHorizontal) {
                insertEle(node.RU, ele);
            } else {
                insertEle(node.LU, ele);
            }
        } else {
            if (ele.lng > midHorizontal) {
                insertEle(node.RB, ele);
            } else {
                insertEle(node.LB, ele);
            }
        }
    }
}

export function splitNode(node) {
    const midVertical = (node.region.up + node.region.bottom) / 2;
    const midHorizontal = (node.region.left + node.region.right) / 2;

    node.is_leaf = false;
    node.RU = createChildNode(node.depth + 1, new Region(midVertical, node.region.up, midHorizontal, node.region.right));
    node.LU = createChildNode(node.depth + 1, new Region(midVertical, node.region.up, node.region.left, midHorizontal));
    node.RB = createChildNode(node.depth + 1, new Region(node.region.bottom, midVertical, midHorizontal, node.region.right));
    node.LB = createChildNode(node.depth + 1, new Region(node.region.bottom, midVertical, node.region.left, midHorizontal));

    const elementsToRedistribute = node.ele_list;
    node.ele_list = [];
    node.ele_num = 0;

    for (const ele of elementsToRedistribute) {
        insertEle(node, ele);
    }
}

export function createChildNode(depth, region) {
    return new QuadTreeNode(depth, region);
}

export function queryEle(node, ele, results, eps) {
    if (node.is_leaf) {
        for (const pt of node.ele_list) {
            if (haversine(pt.lat, pt.lng, ele.lat, ele.lng) <= eps) {
                results.push(pt);
            }
        }
    } else {
        const midVertical = (node.region.up + node.region.bottom) / 2;
        const midHorizontal = (node.region.left + node.region.right) / 2;
        if (ele.lat > midVertical) {
            if (ele.lng > midHorizontal) {
                queryEle(node.RU, ele, results, eps);
            } else {
                queryEle(node.LU, ele, results, eps);
            }
        } else {
            if (ele.lng > midHorizontal) {
                queryEle(node.RB, ele, results, eps);
            } else {
                queryEle(node.LB, ele, results, eps);
            }
        }
    }
}

export function haversine(lat1, lng1, lat2, lng2) {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c * 1000; // 转换为米
}

/**
 * 用来转换为时间戳
 * @param {日期字符串} dateString 
 * @returns 
 */
export function convertDateStringToUnix(dateString) {  
    // 尝试使用 Date 构造函数解析日期字符串  
    const date = new Date(dateString)
    // 返回 Unix 时间戳（毫秒）  
    return date.getTime()/1000
}  
/**
 * 时间戳转换为时间字符串
 * @param {时间戳} timestamp 
 * @returns 
 */

export function convertUnixToDateString(timestamp) {
    const date = new Date(timestamp * 1000); // 将 Unix 时间戳转换为毫秒
  
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，所以需要 +1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } 
/**
 * 球面平均中心
 * @param {坐标点数组} points 
 * @returns 
 */
  export function getCenterPoint(points){
    var point_num = points.length; //坐标点个数
    var X = 0, Y = 0, Z = 0;
    for(let i = 0; i< points.length; i++) {
      if (points[i] == '') {
        continue;
      }
      let point = points[i];
      var lat, lng, x, y, z;
      lat = parseFloat(point.lat) * Math.PI / 180;
      lng = parseFloat(point.lng) * Math.PI / 180;
      x = Math.cos(lat) * Math.cos(lng);
      y = Math.cos(lat) * Math.sin(lng);
      z = Math.sin(lat);
      X += x;
      Y += y;
      Z += z;
    }
    X = X / point_num;
    Y = Y / point_num;
    Z = Z / point_num;
    var tmp_lng = Math.atan2(Y, X);
    var tmp_lat = Math.atan2(Z, Math.sqrt(X * X + Y * Y));
    return {lat:tmp_lat * 180 / Math.PI, lng:tmp_lng * 180 / Math.PI};
}

/**
 * 判断纬度和经度是否合法
 * @param {经纬度点} item 
 * @returns 
 */
export function isValidLatLng(item) {  
    // 检查纬度和经度是否存在且不为null  
    if (item.lat == null || item.lng == null) {  
      return false;  
    }  
    // 检查纬度和经度是否在有效范围内  
    // 将字符串转化为浮点数
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lng)
    
    const isValidLat = Number.isFinite(lat) && lat >= -90 &&  lat <= 90;  
    const isValidLng = Number.isFinite(lng) && lng >= -180 && lng <= 180;  
    // 返回纬度和经度是否都有效的结果  
    return isValidLat && isValidLng;  
  }

