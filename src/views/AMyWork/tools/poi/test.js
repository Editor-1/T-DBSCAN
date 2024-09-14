    clusave(){
      // const clusterLayer = L.markerClusterGroup({
      // showCoverageOnHover: false,
      // // zoomToBoundsOnClick: false,
      // // spiderfyOnMaxZoom: false,
      // // removeOutsideVisibleBounds: false,
      // // spiderLegPolylineOptions: {}
      // // 自定义聚合样式
      // // iconCreateFunction: function (cluster) {
      // // return L.divIcon({html: '<b class="bg-#[f40]">' + cluster.getChildCount() + '</b>'});
      // // }
      // });
      // this.cludata.forEach(item =>{
      //   if (item.lat != null && item.lng != null) {
      //     const marker = L.marker([item.lng, item.lat], {  // 去掉多余的方括号
      //       title: `点 ${item.time}`,
      //       icon: L.icon({
      //         iconUrl: cluPointImg,
      //         iconSize: [12, 12],
      //         iconAnchor: [0, 0]
      //       })
      //     });

      //     marker.on('click', function (event) {
      //       console.log('marker ====', event.latlng);
      //     });

      //     marker.on('clusterclick', function (a) {
      //       console.log('cluster ' + a.layer.getAllChildMarkers().length);
      //     });

      //     clusterLayer.addLayer(marker);
      //   } else {
      //     console.warn(`Invalid lat/lng for item:`, item);
      //   }
      // })
      // map.addLayer(clusterLayer);
      // 清除先前的图层
      previousLayers.forEach(layer => {
        map.removeLayer(layer)
      });
      
      previousLayers = []
      const markersCanvas = new L.MarkersCanvas()
      markersCanvas.addTo(map)
      
      var icon = L.icon({
        iconUrl:cluPointImg,
        iconSize:[12,12],
        iconAnchor:[6,6]
      })
      const markers = []
      var temp_bird_data = []
      // 数据
      if(this.selectcludata == '灰鹤'){
        temp_bird_data = this.greyCrane
      }else if(this.selectcludata == '小天鹅'){
        temp_bird_data = this.cygne
      }else if(this.selectcludata == '鸟类1'){
        temp_bird_data = this.birdOne
      }else if(this.selectcludata == '鸟类2'){
        temp_bird_data = this.birdTwo
      }
      
      //没有选择聚类方式
      if(this.clusterStyle.length == 0){
        if(this.pattern == '2'){
          //初始
          //点
          if(this.geometricType == '1'){
            temp_bird_data.then(birdArr =>{
              var latlngs = []
              birdArr.forEach(item=>{
                if(item.lat != null && item.lng != null){
                  const marker = L.marker([item.lng,item.lat],{icon}).bindPopup(`时间:${item.time}<p>
                  经度:${item.lat}<p>纬度:${item.lng}`).on({
                    mouseover(e){
                      this.openPopup()
                    },
                    mouseout(e){
                      this.closePopup()
                    }
                  })
                  markers.push(marker)
                  latlngs.push([item.lng,item.lat])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
            })
          }//点+线
          else{
            temp_bird_data.then(birdArr =>{
              var latlngs = []
              birdArr.forEach(item=>{
                if(item.lat != null && item.lng != null){
                  const marker = L.marker([item.lng,item.lat],{icon}).bindPopup(`时间:${item.time}<p>
                  经度:${item.lat}<p>纬度:${item.lng}`).on({
                    mouseover(e){
                      this.openPopup()
                    },
                    mouseout(e){
                      this.closePopup()
                    }
                  })
                  markers.push(marker)
                  latlngs.push([item.lng,item.lat])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
              //画线
              var polyline = L.polyline(latlngs,{color:'red',weight:3}).addTo(map)
              var decorator = L.polylineDecorator(polyline, {
                    patterns: [
                        // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                        {offset: 0, repeat: 100, symbol: L.Symbol.arrowHead({
                         pixelSize: 6,  // 箭头大小
                         headAngle : 75,  // 角度
                         polygon: false,
                         pathOptions: {stroke: true, weight: 5, color: 'blue'}
                     })}
                    ]
                }).addTo(map);
                previousLayers.push(decorator)
                previousLayers.push(polyline)
            })
          }
        }else if(this.pattern == '1'){
          //简化 点
          if(this.geometricType == '1'){
            temp_bird_data.then(birdArr=>{
              birdArr = douglasPeucker(birdArr,25000)
              var latlngs = []
              birdArr.forEach(item=>{
                if(item[0] && item[1]){
                  const marker = L.marker([item[1],item[0]],{icon}).bindPopup(`时间:${item[2]}<p>经度:${item[1]}<p>纬度:${item[0]}`).on({
                      mouseover(e) {
                          this.openPopup();
                      },
                      mouseout(e) {
                          this.closePopup();
                      }
                  })
                  markers.push(marker)
                  latlngs.push([item[1], item[0]])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers.concat(markers)
            })
          }else{
            //点+线
            temp_bird_data.then(birdArr=>{
              var latlngs = []
              birdArr = douglasPeucker(birdArr,25000)
              birdArr.forEach(item=>{
                if(item[0]!=null &&item[1]!=null&&item[0]!=0&&item[1]!=0){
                  const marker = L.marker([item[1],item[0]],{icon}).bindPopup(`时间:${item[2]}<p>经度:${item[1]}<p>纬度:${item[0]}`).on({
                      mouseover(e) {
                          this.openPopup();
                      },
                      mouseout(e) {
                          this.closePopup();
                      }
                  })
                  markers.push(marker)
                  latlngs.push([item[1], item[0]])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers.concat(markers)
              var polyline = L.polyline(latlngs,{color: 'red',weight: 3}).addTo(map);
              var decorator = L.polylineDecorator(polyline, {
                  patterns: [
                      // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                      {offset: 0, repeat: 35, symbol: L.Symbol.arrowHead({
                        pixelSize: 5,  // 箭头大小
                        headAngle : 75,  // 角度
                        polygon: false,
                        pathOptions: {stroke: true, weight: 2, color: 'blue'}
                    })}
                  ]
                }).addTo(map);
                previousLayers.push(decorator)
                previousLayers.push(polyline)
            })
          }
        }
      }else{
        //聚合
        if(this.clusterStyle == 1){//CLARANS
          if(this.geometricType == '1'){ //只有点
            temp_bird_data.then(birdArr=>{
              const clusterCenters = clarans(birdArr,20,5,100)
              console.log('clarans',clusterCenters)
              var latlngs = []
              clusterCenters.forEach(item=>{
                if (item.lat != null && item.lng != null) {
                  const marker = L.marker([item.lng, item.lat],{icon}).bindPopup(`时间:${item.time}<p>经度:${item.lat}<p>纬度:${item.lng}`).on({
                    mouseover(e){
                      this.openPopup()
                    },
                    mouseout(e){
                      this.closePopup()
                    }
                  })
                  markers.push(marker)
                  latlngs.push([item.lng,item.lat])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
            })  
          }else{ //点+线
            temp_bird_data.then(birdArr=>{
              const clusterCenters = clarans(birdArr,20,5,100)
              console.log('clarans',clusterCenters)
              var latlngs = []
              clusterCenters.forEach(item=>{
                if (item.lat != null && item.lng != null) {
                  const marker = L.marker([item.lng, item.lat],{icon}).bindPopup(`时间:${item.time}<p>经度:${item.lat}<p>纬度:${item.lng}`).on({
                    mouseover(e){
                      this.openPopup()
                    },
                    mouseout(e){
                      this.closePopup()
                    }
                  })
                  markers.push(marker)
                  latlngs.push([item.lng,item.lat])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
              var polyline = L.polyline(latlngs,{color: 'red',weight: 3}).addTo(map);
              var decorator = L.polylineDecorator(polyline, {
                  patterns: [
                      // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                      {offset: 0, repeat: 35, symbol: L.Symbol.arrowHead({
                        pixelSize: 5,  // 箭头大小
                        headAngle : 75,  // 角度
                        polygon: false,
                        pathOptions: {stroke: true, weight: 2, color: 'blue'}
                    })}
                  ]
              }).addTo(map);
              previousLayers.push(decorator)
              previousLayers.push(polyline)
            })  
          }
        }else if(this.clusterStyle == 2){ //K-Means
          if(this.geometricType == '1'){ //只有点
            temp_bird_data.then(birdArr=>{
              const clusterCenters = kMeans(birdArr,20)
              console.log('kMeans',clusterCenters)
              var latlngs = []
              clusterCenters.forEach(item=>{
                if (item.lat != null && item.lng != null) {
                  const marker = L.marker([item.lng, item.lat],{icon}).bindPopup(`时间:${item.time}<p>经度:${item.lat}<p>纬度:${item.lng}`).on({
                    mouseover(e){
                      this.openPopup()
                    },
                    mouseout(e){
                      this.closePopup()
                    }
                  })
                  markers.push(marker)
                  latlngs.push([item.lng,item.lat])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
            })  
          }else{ //点+线
            temp_bird_data.then(birdArr=>{
              const clusterCenters = kMeans(birdArr,20)
              console.log('kMeans',clusterCenters)
              var latlngs = []
              clusterCenters.forEach(item=>{
                if (item.lat != null && item.lng != null) {
                  const marker = L.marker([item.lng, item.lat],{icon}).bindPopup(`时间:${item.time}<p>经度:${item.lat}<p>纬度:${item.lng}`).on({
                    mouseover(e){
                      this.openPopup()
                    },
                    mouseout(e){
                      this.closePopup()
                    }
                  })
                  markers.push(marker)
                  latlngs.push([item.lng,item.lat])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
              var polyline = L.polyline(latlngs,{color: 'red',weight: 3}).addTo(map);
              var decorator = L.polylineDecorator(polyline, {
                  patterns: [
                      // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                      {offset: 0, repeat: 35, symbol: L.Symbol.arrowHead({
                        pixelSize: 5,  // 箭头大小
                        headAngle : 75,  // 角度
                        polygon: false,
                        pathOptions: {stroke: true, weight: 2, color: 'blue'}
                    })}
                  ]
              }).addTo(map);
              previousLayers.push(decorator)
              previousLayers.push(polyline)
            })  
          }
        }else if(this.clusterStyle == 3){ //DBSCAN
          if(this.geometricType == '1'){ //只有点
            temp_bird_data.then(birdArr=>{
              const clusterCenters = dbscan(birdArr,25,70)
              console.log('dbscan',clusterCenters)
              var latlngs = []
              clusterCenters.forEach(item=>{
                if (item.lat != null && item.lng != null) {
                  const marker = L.marker([item.lng, item.lat],{icon}).bindPopup(`时间:${item.time}<p>经度:${item.lat}<p>纬度:${item.lng}`).on({
                    mouseover(e){
                      this.openPopup()
                    },
                    mouseout(e){
                      this.closePopup()
                    }
                  })
                  markers.push(marker)
                  latlngs.push([item.lng,item.lat])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
            })  
          }else{ //点+线
            temp_bird_data.then(birdArr=>{
              const clusterCenters = dbscan(birdArr,25,70)
              console.log('dbscan',clusterCenters)
              var latlngs = []
              clusterCenters.forEach(item=>{
                if (item.lat != null && item.lng != null) {
                  const marker = L.marker([item.lng, item.lat],{icon}).bindPopup(`时间:${item.time}<p>经度:${item.lat}<p>纬度:${item.lng}`).on({
                    mouseover(e){
                      this.openPopup()
                    },
                    mouseout(e){
                      this.closePopup()
                    }
                  })
                  markers.push(marker)
                  latlngs.push([item.lng,item.lat])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
              var polyline = L.polyline(latlngs,{color: 'red',weight: 3}).addTo(map);
              var decorator = L.polylineDecorator(polyline, {
                  patterns: [
                      // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                      {offset: 0, repeat: 35, symbol: L.Symbol.arrowHead({
                        pixelSize: 5,  // 箭头大小
                        headAngle : 75,  // 角度
                        polygon: false,
                        pathOptions: {stroke: true, weight: 2, color: 'blue'}
                    })}
                  ]
              }).addTo(map);
              previousLayers.push(decorator)
              previousLayers.push(polyline)
            })  
          }
        }else if(this.clusterStyle == 4){ //OPTICS
          if(this.geometricType == '1'){ //只有点
            temp_bird_data.then(birdArr=>{
              const clusterCenters = optics(birdArr,25,70)
              console.log('optics',clusterCenters)
              var latlngs = []
              clusterCenters.forEach(item=>{
                if (item.lat != null && item.lng != null) {
                  const marker = L.marker([item.lng, item.lat],{icon}).bindPopup(`时间:${item.time}<p>经度:${item.lat}<p>纬度:${item.lng}`).on({
                    mouseover(e){
                      this.openPopup()
                    },
                    mouseout(e){
                      this.closePopup()
                    }
                  })
                  markers.push(marker)
                  latlngs.push([item.lng,item.lat])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
            })  
          }else{ //点+线
            temp_bird_data.then(birdArr=>{
              const clusterCenters = optics(birdArr,25,70)
              console.log('optics',clusterCenters)
              var latlngs = []
              clusterCenters.forEach(item=>{
                if (item.lat != null && item.lng != null) {
                  const marker = L.marker([item.lng, item.lat],{icon}).bindPopup(`时间:${item.time}<p>经度:${item.lat}<p>纬度:${item.lng}`).on({
                    mouseover(e){
                      this.openPopup()
                    },
                    mouseout(e){
                      this.closePopup()
                    }
                  })
                  markers.push(marker)
                  latlngs.push([item.lng,item.lat])
                }
              })
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
              var polyline = L.polyline(latlngs,{color: 'red',weight: 3}).addTo(map);
              var decorator = L.polylineDecorator(polyline, {
                  patterns: [
                      // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                      {offset: 0, repeat: 35, symbol: L.Symbol.arrowHead({
                        pixelSize: 5,  // 箭头大小
                        headAngle : 75,  // 角度
                        polygon: false,
                        pathOptions: {stroke: true, weight: 2, color: 'blue'}
                    })}
                  ]
              }).addTo(map);
              previousLayers.push(decorator)
              previousLayers.push(polyline)
            })  
          }
        }else{ //T-DBSCAN
          if(this.geometricType == '1'){ //只有点
            temp_bird_data.then(birdArr=>{
              const gpsPoints = []
              var latlngs = []
              birdArr.forEach(item=>{
                const temp = new ElePoint(parseFloat(item.lat), parseFloat(item.lng), convertDateStringToUnix(item.time), gpsPoints.length);
                gpsPoints.push(temp);
              })
              console.log('原始数据',gpsPoints)
              if(this.maxstayTime == ''){
                this.maxstayTime = 130
              }
              const {clusters,CorePoints} = tdbscan(gpsPoints,25000,60 * 60 * 24 * 3,60 * 60 * 24 * this.maxstayTime)
              console.log('here',CorePoints)
              console.log('hereee',clusters)
              
              for(const p of CorePoints){
                var num = 0
                for(const v of clusters){
                  if(clusters[p.index]===v){
                    num++
                  }
                }
                if(num>=30){
                  const item = birdArr[p.index]
                  if (item.lat != null && item.lng != null) {
                    const marker = L.marker([item.lng, item.lat],{icon}).bindPopup(`停留时间:${parseFloat(p.time/(60 * 60 * 24)).toFixed(2)}天<p>经度:${item.lat}<p>纬度:${item.lng}`).on({
                      mouseover(e){
                        this.openPopup()
                      },
                      mouseout(e){
                        this.closePopup()
                      }
                    })
                    markers.push(marker)
                    latlngs.push([item.lng,item.lat])
                  }
                  
                }
              }
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
            })  
          }else{ //点+线
            temp_bird_data.then(birdArr=>{
              const gpsPoints = []
              var latlngs = []
              birdArr.forEach(item=>{
                const temp = new ElePoint(parseFloat(item.lat), parseFloat(item.lng), convertDateStringToUnix(item.time), gpsPoints.length);
                gpsPoints.push(temp);
              })
              console.log('原始数据',gpsPoints)
              if(this.maxstayTime == ''){
                this.maxstayTime = 130
              }
              const {clusters,CorePoints} = tdbscan(gpsPoints,25000,60 * 60 * 24 * 3,60 * 60 * 24 * this.maxstayTime)
              console.log('CorePoints',CorePoints)
              console.log('clusters',clusters)
              
              for(const p of CorePoints){
                var num = 0
                for(const v of clusters){
                  if(clusters[p.index]===v){
                    num++
                  }
                }
                if(num>=30){
                  const item = birdArr[p.index]
                  if (item.lat != null && item.lng != null) {
                    const marker = L.marker([item.lng, item.lat],{icon}).bindPopup(
                      `时间:${item.time}<p>
                      经度:${item.lat}<p>
                      纬度:${item.lng}`).on({
                      mouseover(e){
                        this.openPopup()
                      },
                      mouseout(e){
                        this.closePopup()
                      }
                    })
                    markers.push(marker)
                    latlngs.push([item.lng,item.lat])
                  }
                  
                }
              }
              markersCanvas.addMarkers(markers)
              previousLayers = previousLayers.concat(markers)
              var polyline = L.polyline(latlngs,{color: 'red',weight: 3}).addTo(map);
              var decorator = L.polylineDecorator(polyline, {
                  patterns: [
                      // defines a pattern of 10px-wide dashes, repeated every 20px on the line
                      {offset: 0, repeat: 35, symbol: L.Symbol.arrowHead({
                        pixelSize: 5,  // 箭头大小
                        headAngle : 75,  // 角度
                        polygon: false,
                        pathOptions: {stroke: true, weight: 2, color: 'blue'}
                    })}
                  ]
              }).addTo(map);
              previousLayers.push(decorator)
              previousLayers.push(polyline)
            })  
          }
        }
       }
      previousLayers.push(markersCanvas)
}