import {calculateDistance,convertDateStringToUnix} from './pubMethods'
export function kMeans(data, k) {
    // 随机初始化中心点的辅助函数
    function initializeCentroids(data, k) {
        const centroids = [];
        const usedIndices = new Set();
        while (centroids.length < k) {
            const index = Math.floor(Math.random() * data.length);
            if (!usedIndices.has(index)) {
                centroids.push(data[index]);
                usedIndices.add(index);
            }
        }
        console.log("Initialized Centroids:", centroids);
        return centroids;
    }

    // 将点分配到最近中心点的辅助函数
    function assignPointsToCentroids(data, centroids) {
        const clusters = Array.from({ length: centroids.length }, () => []);
        data.forEach(point => {
            let minDist = Infinity;
            let closestCentroid = -1;
            centroids.forEach((centroid, index) => {
                const dist = calculateDistance(point, centroid);
                if (dist < minDist) {
                    minDist = dist;
                    closestCentroid = index;
                }
            });
            if (closestCentroid === -1) {
                // 无效数据处理
                // console.error("No closest centroid found for point:", point);
            } else {
                clusters[closestCentroid].push(point);
            }
        });
        return clusters;
    }

    // 更新中心点的辅助函数
    function updateCentroids(clusters) {
        return clusters.map(cluster => {
            if (cluster.length === 0) return null;
            const sumLat = cluster.reduce((sum, point) => sum + parseFloat(point.lat), 0);
            const sumLng = cluster.reduce((sum, point) => sum + parseFloat(point.lng), 0);
            const times = cluster.map(point => convertDateStringToUnix(point.time));  
            const minTime = Math.min(...times)*1000;
            const date = new Date(minTime)
            const dateStr = date.toISOString()
            return { lat: sumLat / cluster.length, lng: sumLng / cluster.length, time: dateStr};
        }).filter(centroid => centroid !== null);
    }

    // K-means 主函数
    let centroids = initializeCentroids(data, k);
    let clusters = [];
    let iterations = 0;
    const maxIterations = 100; // 设置最大迭代次数防止无限循环

    while (iterations < maxIterations) {
        clusters = assignPointsToCentroids(data, centroids);
        const newCentroids = updateCentroids(clusters);
        if (JSON.stringify(newCentroids) === JSON.stringify(centroids)) break;
        centroids = newCentroids;
        iterations++;
    }
    return centroids;
}
