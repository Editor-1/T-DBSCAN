import {Region}  from './pubMethods'
import {ElePoint}  from './pubMethods'
import {QuadTreeNode}  from './pubMethods'
import {insertEle,queryEle} from './pubMethods'


function calTimeDis(p1, p2) {
    return Math.abs(p1.timestamp - p2.timestamp)/(60*60*24); // 时间差，单位为秒
}

function convexHull(points) {
    points.sort((a, b) => a.lng - b.lng || a.lat - b.lat);
    const n = points.length;
    if (n < 3) return points.map(p => p.index);

    const hull = [];
    for (let i = 0; i < n; i++) {
        while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], points[i]) <= 0) {
            hull.pop();
        }
        hull.push(points[i]);
    }
    for (let i = n - 2, t = hull.length + 1; i >= 0; i--) {
        while (hull.length >= t && cross(hull[hull.length - 2], hull[hull.length - 1], points[i]) <= 0) {
            hull.pop();
        }
        hull.push(points[i]);
    }
    hull.pop();
    return hull.map(p => p.index);
}

function cross(o, a, b) {
    return (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng);
}

export function tdbscan(points, eps, minTime, maxTime) {
    
    // 一些初始化工作、建立四叉树索引，访问数组全部置为false、聚类簇设置为-1
    const rootRegion = new Region(-90, 90, -180, 180)
    const root = new QuadTreeNode(1, rootRegion)
    var points = points
    points.forEach((p, index) => {
        p.index = index
        insertEle(root, p)
    });
    let visited = Array(points.length).fill(false)
    let clusters = Array(points.length).fill(-1)
    let CorePoints = []

    let clusterId = -1
    let unvisited = [...Array(points.length).keys()]
    
    
    while (unvisited.length > 0) {
        const pIndex = unvisited.shift()
        const p = points[pIndex]
        visited[pIndex] = true

        let maxStayTime = 0;
        const point = new ElePoint(p.lat, p.lng, p.timestamp, p.index)
        let EpsResults = []
        queryEle(root, point, EpsResults, eps)
        EpsResults.sort((a,b)=> a.timestamp - b.timestamp)
        let index = 0
        let pointTemp = EpsResults[index]
		let EpsResultsTemp = []
        for(let i = index + 1;i < EpsResults.length; i++){
            const elementA = EpsResults[i]
            if(!visited[elementA.index]){
                const disTime = calTimeDis(elementA,pointTemp)
                if(disTime <= maxTime){
                    EpsResultsTemp.push(elementA)
                    maxStayTime = Math.max(maxStayTime,calTimeDis(elementA,point))
                    pointTemp = elementA
                }else{
                    break
                }
            }
        }
        // 将需要扩展点代入
        EpsResults = EpsResultsTemp
       
        // 满足时间阈值
        if (maxStayTime >= minTime) {
            // 创建一个新簇 将点point添加到
            clusterId++;
            clusters[pIndex] = clusterId;
            let conPoints = [];
            let neighborhoodVertex = [];
            let peakmp = {};
            let mmp = {};
            for (const v of EpsResults) {
                if (!visited[v.index]) conPoints.push(v);
            }
            // 只向凸包顶点拓展
            const peaks = convexHull(conPoints);
            for (const v of peaks) peakmp[v] = true;

            for (const v of EpsResults) {
                if (!peakmp[v.index]) {
                    clusters[v.index] = clusterId;
                    visited[v.index] = true;
                } else {
                    neighborhoodVertex.push(v);
                    mmp[v.index] = 1;
                }
            }
            conPoints.length = 0;
            Object.keys(peakmp).forEach(key => delete peakmp[key]);  
            // 继续拓展领域点 标记为核心点簇
            for (let i = 0; i < neighborhoodVertex.length; i++) {
                const q = neighborhoodVertex[i];
                if (!visited[q.index]) {
                    if (clusters[q.index] === -1) clusters[q.index] = clusterId;
                    visited[q.index] = true;
            
                    let maxStayTempTime = 0
                    let Results = []
                    let TempResults = []
                    queryEle(root,q,Results,eps)
                    Results.sort((a,b) => a.timestamp - b.timestamp)
                    index = 0
                    pointTemp = Results[index]
                    for(let j = index + 1;j < Results.length;j++){
                        const elementA = Results[j]
                        if(!visited[elementA.index]){
                            const disTime = calTimeDis(elementA,pointTemp)
                            if(disTime <= maxTime){
                                TempResults.push(elementA)
                                // 计算最大停歇时长
                                maxStayTempTime = Math.max(maxStayTempTime,calTimeDis(q,elementA))
                                pointTemp = elementA
                            }else{
                                break
                            }
                        }
                    }
                    Results = TempResults
                    // 符合
                    if (maxStayTempTime >= minTime) {
                        const tempPoints = [];
                        for (const v of Results) {
                            if (mmp[v.index]!==1 || !visited[v.index]) {
                                tempPoints.push(v);
                            }
                        }
            
                        const tempPeaks = convexHull(tempPoints);
                        for (const v of tempPeaks) peakmp[v] = true;
            
                        for (const v of Results) {
                            if (mmp[v.index]===1 || !peakmp[v.index]) {
                                visited[v.index] = true;
                                if (clusters[v.index] === -1) clusters[v.index] = clusterId;
                            } else { 
                                // 添加判断条件，确保不重复添加元素到neighborhoodVertex
                                neighborhoodVertex.push(v);
                                mmp[v.index] = 1;
                            }
                        }
                    }
                    Object.keys(peakmp).forEach(key => delete peakmp[key]); 
                }
            }

            unvisited.length = 0;
            for (let i = 0; i < points.length; i++) {
                if (!visited[i]) unvisited.push(i);
            }
            CorePoints.push({ index: p.index});
        } else {
            clusters[p.index] = -1;
        }
    }
    return { clusters, CorePoints };
}
  
  
