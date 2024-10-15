import { calculateDistance,convertDateStringToUnix,convertUnixToDateString,getCenterPoint } from './pubMethods';

export function optics(data, eps, minPts) {
    // 判断某个点是否是核心点
    function judge_core(point, data, data_num, index, core_dist) {
        const dist = [];
        for (let i = 0; i < data_num; i++) {
            const dis = calculateDistance(point, data[i]);
            if (dis <= eps * 1000) { // 距离单位转换为米
                dist.push(dis);
            }
        }

        if (dist.length >= minPts) {
            dist.sort((a, b) => a - b); // 排序
            core_dist[index] = dist[minPts - 1]; // 记录核心距离
            return true;
        }
        return false;
    }

    // 初始化
    const data_num = data.length;
    const core_point = new Array(data_num).fill(0); // 记录是否是核心点
    const visit = new Array(data_num).fill(0); // 记录是否被访问过
    const core_dist = new Array(data_num).fill(0); // 核心距离
    const reach_dist = new Array(data_num).fill(Infinity); // 可达距离
    const seeds = []; // 用于存储生成的种子

    // 判断每个点是否是核心点
    for (let i = 0; i < data_num; i++) {
        if (judge_core(data[i], data, data_num, i, core_dist) == true) {
            core_point[i] = 1; // 该点为核心点
        }
    }
    
    let idx = 0; // 辅助生成数组种子
    // 生成数组种子
    for (let i = 0; i < data_num; i++) {
        if (!visit[i]) {
            visit[i] = 1; // 标记该点已访问
            seeds.push({ reachDist: Infinity, index: i }); // 放入种子数组
            // 处理 seeds 数组里的未访问点
            while (idx < seeds.length) {
                const currentIdx = seeds[idx].index;

                // 判断是否是核心点
                if (core_point[currentIdx]) {
                    const vis_reach_dist = [];

                    // 更新未访问点的可达距离
                    for (let j = 0; j < data_num; j++) {
                        if (!visit[j]) {
                            reach_dist[j] = Math.min(core_dist[currentIdx], calculateDistance(data[j], data[currentIdx]));
                            vis_reach_dist.push({ reachDist: reach_dist[j], index: j });
                        }
                    }

                    // 排序可达距离
                    vis_reach_dist.sort((a, b) => a.reachDist - b.reachDist);

                    // 如果有可达距离最小的点，将其加入 seeds 数组，并标记为已访问
                    if (vis_reach_dist.length > 0) {
                        seeds.push(vis_reach_dist[0]);
                        visit[vis_reach_dist[0].index] = 1;
                    }
                }
                
                idx++; // 处理下一个点
            }
        }
    }
    const C = []; //用于存储归属簇
    var cnt = 0,flag = 0;
    for(let i = 0; i < data_num - 1; i++){
        if(seeds[i + 1].reachDist > eps * 1000){
            if(i){
                if(seeds[i].reachDist <= eps * 1000){
                    C.push({ cluster_index: cnt, index: i })
                    flag = 1
                }else{
                    C.push({ cluster_index: -1, index: i })
                }
            }else{
                C.push({ cluster_index: -1, index: i })
            }

            if(flag == 1){
                flag = 0
                cnt ++ 
            }
        }else {
            C.push({ cluster_index: cnt, index: i })
        }
    }
    C.sort((a,b)=> a.cnt - b.cnt)
    const clusterCenters = [];
    var index = 0;
    for(var i=0;i<C.length;i++){
        if(C[i].cluster_index !== -1){
            index = i
            break
        }
    }
    for(var i=0;i<=cnt;i++){
        const Cluster_arr = [];
        for(var j = index;j<C.length;j++){
            if(C[j].cluster_index == i){
                const point = data[C[j].index]
                Cluster_arr.push({lng:point.lng,lat:point.lat,time:point.time})
            }else if(C[j].cluster_index !== -1){
                index = j + 1
                break
            }
        }
        if(Cluster_arr.length>=2){
            Cluster_arr.sort((a,b)=>{convertDateStringToUnix(a.time)-convertDateStringToUnix(b.time)})
            const startTimeStr = Cluster_arr[0].time;
            const endTimeStr = Cluster_arr[Cluster_arr.length-1].time;
            const maxstayTime = ((convertDateStringToUnix(endTimeStr)-convertDateStringToUnix(startTimeStr))/(60*60*24));
            const centerPoint = getCenterPoint(Cluster_arr);
            clusterCenters.push({maxstayTime:maxstayTime,startTimeStr:startTimeStr,
                endTimeStr:endTimeStr,centerPoint:centerPoint
            })
        }
        Cluster_arr.length = 0
    }
    // 返回处理后的数据
    console.log(clusterCenters)
    return clusterCenters;
}
