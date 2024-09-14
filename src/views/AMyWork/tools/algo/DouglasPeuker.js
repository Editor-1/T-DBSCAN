import calculateDistance from './pubMethods'

// 计算垂距
function distToSegment(start, end, center) {
    // 用海伦公式计算面积
    let a = Math.abs(calculateDistance(start, end));
    let b = Math.abs(calculateDistance(start, center));
    let c = Math.abs(calculateDistance(end, center));
    let p = (a + b + c) / 2.0;
    let s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)));
    return s * 2.0 / a;
}

// 递归方式压缩轨迹
function compressLine(coordinate, result, start, end, dMax) {
    if (start < end) {
        let maxDist = 0;
        let currentIndex = 0;
        let startPoint = coordinate[start]
        let endPoint = coordinate[end-1]
        for (let i = start + 1; i < end; i++) {
            let currentDist = distToSegment(startPoint, endPoint, coordinate[i]);
            if (currentDist > maxDist) {
                maxDist = currentDist;
                currentIndex = i;
            }
        }

        if (maxDist >= dMax) {
            // 将当前点加入到过滤数组中
            result.push(coordinate[currentIndex]);
            // 将原来的线段以当前点为中心拆成两段，分别进行递归处理
            compressLine(coordinate, result, start, currentIndex, dMax);
            compressLine(coordinate, result, currentIndex, end, dMax);
        }
    }
    return result;
}

/**
 * @param coordinates 原始轨迹 Array<{lat, lng, time}>
 * @param dMax 允许最大距离误差
 * @return 抽稀后的轨迹 Array<[lat, lng, time]>
 */
export function douglasPeucker(coordinates, dMax) {
    if (!coordinates || !(coordinates.length > 2)) {
        return null;
    }

    // 将输入数据转换为包含 lat 和 lng 的对象
    let coordinate = coordinates.map((item, index) => ({
        lat: item.lat,
        lng: item.lng,
        time: item.time,
        key: index
    }));

    let result = compressLine(coordinate, [], 0, coordinate.length - 1, dMax);
    result.push(coordinate[0]);
    result.push(coordinate[coordinate.length - 1]);

    let resultLatLng = result.sort((a, b) => {
        if (a.key < b.key) {
            return -1;
        } else if (a.key > b.key)
            return 1;
        return 0;
    });
    const transformed = resultLatLng.map(item => ({  
        lat: item.lat,  
        lng: item.lng,  
        time: item.time  
      }));
    // 转换回原始数组格式
    return transformed
}