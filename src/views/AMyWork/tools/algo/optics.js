import calculateDistance from './pubMethods'
export function optics(data, eps, minPts) {
    
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

    // 计算核心距离的辅助函数
    function coreDistance(point, neighbors, minPts) {
        if (neighbors.length >= minPts) {
            const sortedDistances = neighbors
                .map(index => calculateDistance(point, data[index]))
                .sort((a, b) => a - b);
            return sortedDistances[minPts - 1];
        }
        return null;
    }

    const num = data.length;
    const corePoints = [];
    const visited = Array(num).fill(false);

    // 扩展簇的辅助函数
    function processPoint(pointIndex) {
        const neighbors = regionQuery(data, data[pointIndex], eps);

        if (neighbors.length >= minPts) {
            const coreDist = coreDistance(data[pointIndex], neighbors, minPts);
            if (coreDist !== null) {
                corePoints.push(data[pointIndex]);
            }

            const seeds = new Set(neighbors);
            seeds.delete(pointIndex);

            while (seeds.size > 0) {
                const current = seeds.values().next().value;
                seeds.delete(current);

                if (!visited[current]) {
                    visited[current] = true;
                    const currentNeighbors = regionQuery(data, data[current], eps);

                    if (currentNeighbors.length >= minPts) {
                        const currentCoreDist = coreDistance(data[current], currentNeighbors, minPts);
                        if (currentCoreDist !== null) {
                            corePoints.push(data[current]);
                            currentNeighbors.forEach(neighbor => {
                                if (!visited[neighbor]) {
                                    if (calculateDistance(data[current], data[neighbor]) <= eps * 1000) {
                                        seeds.add(neighbor);
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
    }

    for (let i = 0; i < num; i++) {
        if (!visited[i]) {
            visited[i] = true;
            processPoint(i);
        }
    }

    return corePoints;
}
