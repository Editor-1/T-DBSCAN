const EPS = 25000;
const MIN_TIME = 60 * 60 * 24 * 3; // 3天，秒为单位
const MAX_TIME = 60 * 60 * 24 * 130; // 130天，秒为单位
import {Region}  from './pubMethods'
import {ElePoint}  from './pubMethods'
import {QuadTreeNode}  from './pubMethods'
import {insertEle,queryEle} from './pubMethods'


function calTimeDis(p1, p2) {
    return Math.abs(p1.timestamp - p2.timestamp); // 时间差，单位为秒
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
    const rootRegion = new Region(-90, 90, -180, 180);
    const root = new QuadTreeNode(1, rootRegion);
    var points = points
    points.forEach((p, index) => {
        p.index = index;
        insertEle(root, p);
    });

    const visited = Array(points.length).fill(false);
    const clusters = Array(points.length).fill(-1);
    const CorePoints = [];

    let clusterId = -1;
    const unvisited = [...Array(points.length).keys()];
    

    while (unvisited.length > 0) {
        const pIndex = unvisited.shift();
        const p = points[pIndex];
        visited[pIndex] = true;

        let maxStayTime = 0;
        const point = new ElePoint(p.lat, p.lng, p.timestamp, p.index);
        const EpsResults = [];
        queryEle(root, point, EpsResults, eps);

        const visTemp = [];
        for (const v of EpsResults) {
            if (!visited[v.index]) {
                const disTime = calTimeDis(v, p);
                if (disTime < maxTime) {
                    maxStayTime = Math.max(maxStayTime, disTime);
                } else {
                    visTemp.push(v.index);
                }
            }
        }

        if (maxStayTime >= minTime) {
            for (const v of visTemp) visited[v] = true;

            clusterId++;
            clusters[pIndex] = clusterId;
            const conPoints = [];
            const neighborhoodVertex = [];
            const peakmp = {};
            const mmp = {};
            for (const v of EpsResults) {
                if (!visited[v.index]) conPoints.push(v);
            }
            
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
            let cmpTime = maxStayTime;

            
            for (let i = 0; i < neighborhoodVertex.length; i++) {
                const q = neighborhoodVertex[i];
                if (!visited[q.index]) {
                    if (clusters[q.index] === -1) clusters[q.index] = clusterId;
                    visited[q.index] = true;
            
                    let cmpTempTime = cmpTime;
                    let maxStayTime = 0;
                    const TempResults = [];
                    queryEle(root, q, TempResults, eps);
            
                    for (const v of TempResults) {
                        if (!visited[v.index]) {
                            const tempDisTime = calTimeDis(q, v);
                            const tempCmpTime = calTimeDis(p, v);
                            if (tempCmpTime < maxTime && tempDisTime < maxTime) {
                                maxStayTime = Math.max(tempDisTime, maxStayTime);
                                cmpTempTime = Math.max(cmpTempTime, tempCmpTime);
                            }
                        }
                    }
            
                    if (maxStayTime >= minTime) {
                        cmpTime = Math.max(cmpTempTime, cmpTime);
                        const tempPoints = [];
                        for (const v of TempResults) {
                            if (mmp[v.index]!==1 || !visited[v.index]) {
                                tempPoints.push(v);
                            }
                        }
            
                        const tempPeaks = convexHull(tempPoints);
                        for (const v of tempPeaks) peakmp[v] = true;
            
                        for (const v of TempResults) {
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
            CorePoints.push({ index: p.index, time: cmpTime });
        } else {
            clusters[p.index] = -1;
        }
    }

    return { clusters, CorePoints };
}
  
