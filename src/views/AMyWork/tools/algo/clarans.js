import {calculateDistance} from './pubMethods'
export function clarans(data, k, numLocal, maxNeighbor) {
    // 计算聚类结果的总成本
    function calculateTotalCost(data, medoids) {
        let totalCost = 0;
        data.forEach(point => {
            let minDist = Infinity;
            medoids.forEach(medoid => {
                const dist = calculateDistance(point, medoid);
                if (dist < minDist) {
                    minDist = dist;
                }
            });
            totalCost += minDist;
        });
        return totalCost;
    }

    // 初始化medoids
    function initializeMedoids(data, k) {
        const medoids = [];
        const usedIndices = new Set();
        while (medoids.length < k) {
            const index = Math.floor(Math.random() * data.length);
            if (!usedIndices.has(index)) {
                medoids.push(data[index]);
                usedIndices.add(index);
            }
        }
        return medoids;
    }

    // CLARANS算法主函数
    let bestMedoids = initializeMedoids(data, k);
    let bestCost = calculateTotalCost(data, bestMedoids);

    for (let i = 0; i < numLocal; i++) {
        let currentMedoids = initializeMedoids(data, k);
        let currentCost = calculateTotalCost(data, currentMedoids);
        let neighborCounter = 0;

        while (neighborCounter < maxNeighbor) {
            // 随机选择一个medoid并尝试替换
            const randomMedoidIndex = Math.floor(Math.random() * k);
            const randomNonMedoidIndex = Math.floor(Math.random() * data.length);

            const newMedoids = currentMedoids.slice();
            newMedoids[randomMedoidIndex] = data[randomNonMedoidIndex];

            const newCost = calculateTotalCost(data, newMedoids);

            if (newCost < currentCost) {
                currentMedoids = newMedoids;
                currentCost = newCost;
                neighborCounter = 0; // 重置neighbor计数器
            } else {
                neighborCounter++;
            }
        }

        if (currentCost < bestCost) {
            bestMedoids = currentMedoids;
            bestCost = currentCost;
        }
    }

    return bestMedoids;
}
