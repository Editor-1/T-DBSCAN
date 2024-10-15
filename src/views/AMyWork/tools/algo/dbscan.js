import {calculateDistance} from './pubMethods'

export function dbscan(data, eps, minPts) {
    // 查找邻域的辅助函数
    function regionQuery(data, point, eps) {
        const neighbors = [];
        data.forEach((p, index) => {
            if (calculateDistance(point, p) <= eps * 1000) { // 将 eps 转换为米
                neighbors.push(index);
            }
        });
        return neighbors;
    }

    const num = data.length;
    const unvisited = Array.from({ length: num }, (_, i) => i);
    const visited = [];
    const C = Array(num).fill(-1);
    const corePoints = [];
    let k = -1;

    while (unvisited.length > 0) {
        // 默认取未访问的第一个点
        const p = unvisited.shift();
        visited.push(p);

        const N = regionQuery(data, data[p], eps);

        if (N.length >= minPts) {
            k += 1;
            C[p] = k;
            corePoints.push(data[p]);

            for (let i = 0; i < N.length; i++) {
                const pi = N[i];
                if (unvisited.includes(pi)) {
                    unvisited.splice(unvisited.indexOf(pi), 1);
                    visited.push(pi);

                    const M = regionQuery(data, data[pi], eps);
                    if (M.length >= minPts) {
                        for (let j = 0; j < M.length; j++) {
                            const t = M[j];
                            if (!N.includes(t)) {
                                N.push(t);
                            }
                        }
                    }
                }
                if (C[pi] === -1) {
                    C[pi] = k;
                }
            }
        } else {
            C[p] = -1;
        }
    }
    console.log(C)
    return corePoints;
}
