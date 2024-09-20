<template>
  <div style="overflow: auto;width: 260px;background: white;">
    <!-- 列表页面 -->
    <div v-show="page == 'list'" class="poiPage" style="margin-top: 10px;">
      <section style="margin: 0 20px;color:black;">
        <!-- 全选按钮和标绘按钮 -->
        <div style="width: 100%;line-height:30px;color: #606266;">
          <div v-show="dataList.length>0" style="float: left;">
            <el-button v-if="!drawing" type="link" @click="startDraw" icon="el-icon-map-location">
              <i class="iconfont icon-jia-line" /> 新增地点
            </el-button>
            <el-button v-if="drawing" type="link" @click="cancelDraw">
              取消
            </el-button>
          </div>
        </div>
        
        <div style="width: 100%;line-height:30px;color: #606266;">
          <div v-show="dataList.length>0" style="float: left;">
            <el-button type="link" @click="clusterAnalysis" icon="el-icon-wind-power">聚合分析</el-button>
          </div>
        </div>
        <!-- 搜索框 -->
        <div style="clear: right;">
          <el-input
            v-model="keyWord"
            placeholder="请输入你要查找的地名"
            style="width:220px;margin-top: 10px;"
            allow-clear
            enter-button
            @pressEnter="loadData"
            @search="loadData"
          />
          <el-button type="primary" icon="el-icon-search" @click="searchByName(keyWord)">搜索</el-button>
          <el-button type="primary" icon="el-icon-position" @click="navigation()">
            导航
          </el-button>
        </div>
      <!-- 没有数据时候的展示 -->
      </section>
        <section style="margin: 20px;color:black;">
        <!-- 无数据时的占位符 -->
        <el-empty v-show="dataList.length<1" style="color: #606266;margin-top: 20px;padding-top: 120px;height:calc(100vh - 100px)">
          <span slot="description"> 无数据 </span>
          <el-button v-if="!drawing" type="link" @click="startDraw">
            <i class="iconfont icon-jia-line" /> 标绘
          </el-button>
          <el-button v-if="drawing" type="primary" @click="cancelDraw">
            取消
          </el-button>
        </el-empty>
        <!-- 数据列表 -->
        <div v-show="dataList.length > 0" item-layout="horizontal" :data-source="dataList" :style="{ height: 'calc(100vh - 240px)',overflow: 'auto' }">
          <!-- 分组 -->
          <el-tree :data="nameList" :props="defaultProps" @node-click="handleNodeClick"></el-tree>
          <!--  -->
          <div v-for="item in dataList" :key="item.id">
            <div style="line-height: 36px;border-bottom: 1px solid #d3e1f5;" @dblclick="edit(item)"> 
              <div style="display: inline-block;">{{ item.name }}</div>
              <div style="float: right;">
                <el-button slot="actions" type="text" class="btn-link" ghost @click="edit(item)">编辑</el-button>
                <el-button slot="actions" type="text" class="btn-link hover-red" ghost @click="deleteClick(item)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <!-- 编辑页面 -->
    <div v-show="page == 'edit'">
      <div style="padding: 20px;max-height: calc(100vh - 130px);overflow: auto;">
        <el-form ref="poiForm" :model="currentPoint" size="small">
          <el-form-item prop="name" label="名称">
            <el-input v-model="currentPoint.name" allow-clear />
          </el-form-item>
          <el-form-item prop="name" label="时间">
            <el-input v-model="currentPoint.time" allow-clear />
          </el-form-item>
          <el-form-item label="x">
            <el-input v-model="currentPoint.lng" :min="-180" :max="180" @change="latLngChange" />
          </el-form-item>
          <el-form-item label="y">
            <el-input v-model="currentPoint.lat" :min="-90" :max="90" @change="latLngChange" />
          </el-form-item>
          <el-form-item label="描述" style="margin-bottom: 0;">
            <el-input v-model="currentPoint.desc" type="textarea" />
          </el-form-item>
          <el-form-item label="图片" style="margin-top: 10px;">
            <image-upload :fileList="fileList" type="poi" @listChange="listChange" />
          </el-form-item>
        </el-form>
        <div style="width: 100%;">
          <el-button @click="backToList">
            返回
          </el-button>
          <div style="float: right;">
            <el-button style="margin-left: 10px;" type="primary" @click="save">确定</el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 导航页面  -->
    <div v-show="page == 'navigation'">
      <div style="padding: 20px;max-height: calc(200vh - 130px);overflow: auto;">
        <el-form size="small" >
          <el-form-item prop="startPlace" label="输入起点">
            <el-input v-model="startPlace.name" allow-clear/>
            <el-button type="primary" icon="el-icon-search" @click="searchLngByName(startPlace)">搜索</el-button>
          </el-form-item>
          <el-form-item prop="startPlaceLng" label="起点经度">
            <el-input v-model="startPlace.lng"/>
          </el-form-item>
          <el-form-item prop="startPlaceLat" label="起点维度">
            <el-input v-model="startPlace.lat"/>
          </el-form-item>
          <el-form-item prop="endPlace" label="输入终点">
            <el-input v-model="endPlace.name" allow-clear/>
            <el-button type="primary" icon="el-icon-search" @click="searchLngByName(endPlace)">搜索</el-button>
          </el-form-item>
          <el-form-item prop="endPlaceLng" label="终点经度">
            <el-input v-model="endPlace.lng"/>
          </el-form-item>
          <el-form-item prop="endPlaceLat" label="终点维度">
            <el-input v-model="endPlace.lat"/>
          </el-form-item>
          <el-form-item  label="请选择导航路线类型">
            <el-select v-model="navstyle" clearable placeholder="请选择">
              <el-option
                v-for="item in navOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div style="width: 100%;">
          <el-button @click="backToList">
            返回
          </el-button>
          <div style="float: right;">
            <el-button style="margin-left: 10px;" type="primary" @click="searchRoute()">确定</el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 聚合分析页面 -->
    <div v-show="page =='cluster'">
      <div style="padding: 20px;max-height: calc(200vh - 130px);overflow: auto;">
        
        <el-form size="small">
          <el-form-item label="聚合方法">
            <el-select v-model="clusterStyle" placeholder="请选择" clearable>
              <el-option
                v-for="item in clusterStyleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item> 
          <el-form-item label="聚合数据">
            <el-select v-model="selectcludata" placeholder="请选择">
              <el-option
                v-for="item in clusterDataOptions"
                :key="item.value"
                :label="item.label"
                :value="item.label">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="最小停留天数" v-if="clusterStyle==5">
            <el-input v-model="minstayTime" placeholder="3.0"></el-input>
          </el-form-item> 
          <el-form-item label="最大停留天数" v-if="clusterStyle==5">
            <el-input v-model="maxstayTime" placeholder="130.0"></el-input>
          </el-form-item>
          <el-form-item label="模式">
            <el-radio-group v-model="pattern">
              <el-radio :label="1">简化</el-radio>
              <el-radio :label="2">初始</el-radio>
              <el-radio :label="3">聚合</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="几何类型">
            <el-radio-group v-model="geometricType">
              <el-radio :label="1">点</el-radio>
              <el-radio :label="2">点+线</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        
        <div style="width: 100%;">
          <el-button @click="backToList">
            返回
          </el-button>
          <div style="float: right;">
            <el-button style="margin-left: 10px;" type="primary" @click="clusave">确定</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'  // 引入Leaflet库
import 'leaflet-markers-canvas'
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import "leaflet-canvas-marker"
import Papa from 'papaparse'
import axios from 'axios'
import DrawPoi from './DrawPoi'
import DrawNewPoi from './DrawNewPoi'
import * as FileSave from './FileSave'
import { getUuid } from '../biz/common'
import IconsDialog from '../../../tool/build/IconsDialog.vue'
import 'leaflet/dist/leaflet.css'
import { douglasPeucker } from '../algo/DouglasPeuker'
import { kMeans } from '../algo/kmeans' 
import { clarans } from '../algo/clarans' 
import { dbscan } from '../algo/dbscan' 
import { optics } from '../algo/optics' 
import {ElePoint, Region, QuadTreeNode} from '../algo/pubMethods'
import {convertDateStringToUnix,insertEle,queryEle,
      convertUnixToDateString,getCenterPoint,isValidLatLng} from '../algo/pubMethods'
import { tdbscan } from '../algo/tdbscan' 
import * as PathLayer from '../comm/PathLayer'
const pointerImg = require('@/assets/images/location64.png')
const cluPointImg = require('@/assets/images/point.png')
const cluCenterPointImg = require('@/assets/images/centerPoint.png')
// 定义 drawPoi 变量
let drawNewPoi
let drawPoi
let previousLayers = []
let markersList = []
let markersCanvas
export default {
  components: { IconsDialog },
  name: 'PoiPanel',
  data() {
    return {
      selectcludata: '',
      //灰鹤
      greyCrane:[],
      //小天鹅
      cygne:[],
      // 鸟类1
      birdOne:[],
      // 鸟类2
      birdTwo:[],
      // 数据模式
      pattern:2,
      // 几何类型
      geometricType:1,
      // 聚合算法
      clusterStyle:'',
      //最大停留时长
      maxstayTime:'',
      //最短停留时长
      minstayTime:'',
      //聚合方式
      clusterStyleOptions:[{
        value:1,
        label:'CLARANS'
      },{
        value:2,
        label:'K-Means'
      },{
        value:3,
        label:'DBSCAN'
      },{
        value:4,
        label:'OPTICS'
      },{
        value:5,
        label:'T-DBSCAN'
      }],
      // 聚合数据
      clusterDataOptions:[{
        value:0,
        label:'灰鹤'
      },{
        value:1,
        label:'小天鹅'
      },{
        value:2,
        label:'鸟类1'
      },{
        value:3,
        label:'鸟类2'
      }],
      showpoint: '0',
      dataList: [], // 数据列表
      page: 'list', // 当前页面（list 或 edit）
      currentPoint: {
        name: '',
        time: ''
      }, // 当前编辑的点信息
      fileList: [], // 上传的文件列表
      pointerImg: pointerImg, // 指针图片
      drawing: false, // 是否正在绘制
      navdrawing: false,
      keyWord: '', // 搜索关键字
      nameList:[],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      startPlace:{ //出发点
        name:'',
        lng: '',
        lat: ''
      },
      endPlace:{ //终点
        name:'',
        lng: '',
        lat: ''
      },
      //导航样式
      navstyle: 0,
      navOptions:[{
        value:0,
        label:'最快路线'
      },{
        value:1,
        label:'最短路线'
      },{
        value:2,
        label:'避开高速'
      },{
        value:3,
        label:'步行'
      }]
    }
  },
  watch: {  
    clusterStyle(newVal) {  
      if (newVal) { // 确保有值被选中  
        this.pattern = 3 // 设置为聚合  
      }else{
        this.pattern = 2
      }  
    },
    pattern(newVal){
      if(newVal !== 3){
        this.clusterStyle = ''
      }
    }  
  },
  mounted() {
    // 初始化 drawPoi 和 PathLayer
    this.$nextTick(() => {
      drawNewPoi = new DrawNewPoi(this)
      drawPoi = new DrawPoi(this)
      PathLayer.init()
    })
    // 加载数据
    this.loadData()
    this.greyCrane = this.loadCSV('灰鹤8.1-11.30轨迹点')
    this.cygne = this.loadCSV('小天鹅')
    this.birdOne = this.loadCSV('鸟类1')
    this.birdTwo = this.loadCSV('鸟类2')
  },
  beforeDestroy() {
    // 清除绘制
    drawNewPoi.clear()
    drawNewPoi.drawCancel()
  },
  methods: {
    clusave() {
      if(markersCanvas){
        markersCanvas.removeMarkers(markersList)
        markersCanvas.clear()
        markersList = [];
      }
      // 清理先前图层
      previousLayers.forEach(layer => {
        map.removeLayer(layer);
      });
      previousLayers = [];
      // 添加新的MarkersCanvas
      markersCanvas = new L.MarkersCanvas();
      markersCanvas.addTo(map);
      previousLayers.push(markersCanvas)
      
      // 定义通用图标
      const icon = L.icon({
        iconUrl: cluPointImg,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      // 定义栖息地图标
      const iconCenter = L.icon({
        iconUrl: cluCenterPointImg,
        iconSize: [15, 15],
        iconAnchor: [6, 6]
      });

      // 根据鸟类选择数据
      let temp_bird_data = this.getSelectedBirdData();

      // 没有选择聚类方式时
      if (this.clusterStyle.length === 0) {
        this.displayWithoutClustering(temp_bird_data, markersCanvas, icon,this.pattern);
      } else {
        this.displayWithClustering(temp_bird_data, markersCanvas, iconCenter);
      }

      // 弹窗提示已经聚类结束
      this.$message({
        message:'聚类完成',
        type:'success'
      })

    },

    // 根据选择的鸟类返回对应数据
    getSelectedBirdData() {
      switch(this.selectcludata) {
        case '灰鹤':
          return this.greyCrane;
        case '小天鹅':
          return this.cygne;
        case '鸟类1':
          return this.birdOne;
        case '鸟类2':
          return this.birdTwo;
        default:
          return [];
      }
    },

    // 不聚类时的展示逻辑
    displayWithoutClustering(temp_bird_data, markersCanvas, icon,pattern) {
      if(pattern == '1'){ //简化版本，调用了滤波算法
        temp_bird_data.then(birdArr => {
          let latlngs = [];
          birdArr = douglasPeucker(birdArr,25000)
          birdArr.forEach(item => {
            if (isValidLatLng(item)) {
              const marker = this.createMarker(item, icon);
              markersCanvas.addMarker(marker);
              markersList.push(marker);
              latlngs.push([item.lat, item.lng]);
            }
          });
          this.handleGeometricType(latlngs, markersCanvas);
        });
      }else{
        //最原始的点
        temp_bird_data.then(birdArr => {
          let latlngs = [];
          birdArr.forEach(item => {
            if (isValidLatLng(item)) {
              const marker = this.createMarker(item, icon);
              markersList.push(marker);
              markersCanvas.addMarker(marker);
              latlngs.push([item.lat, item.lng]);
            }
          });
          this.handleGeometricType(latlngs, markersCanvas);
        });
      }
    },

    // 聚类后的展示逻辑
    displayWithClustering(temp_bird_data, markersCanvas, icon) {
      temp_bird_data.then(birdArr => {
        let clusterCenters = [];
        let latlngs = [];
        // 建立四叉树索引方便后续的查询操作
        const rootRegion = new Region(-90, 90, -180, 180);
        const root = new QuadTreeNode(1, rootRegion);
        var points = birdArr
        points.forEach((p, index) => {
            p.index = index;
            insertEle(root, p);
        });
        switch(this.clusterStyle) {
          case 1:
            clusterCenters = clarans(points, 20, 5, 100);
            break;
          case 2:
            clusterCenters = kMeans(points, 20);
            break;
          case 3:
            clusterCenters = dbscan(points, 25, 70);
            break;
          case 4:
            clusterCenters =  optics(points,25,70);
            break;
          case 5:
            if(this.maxstayTime == ''){
              this.maxstayTime = 130
            }
            if(this.minstayTime == ''){
              this.minstayTime = 3
            }
            const gpsPoints = []
            birdArr.forEach(item=>{
              const temp = new ElePoint(parseFloat(item.lat), parseFloat(item.lng), convertDateStringToUnix(item.time), gpsPoints.length);
              gpsPoints.push(temp);
            })
            
            const {clusters,CorePoints} = tdbscan(gpsPoints,25000,60 * 60 * 24 * this.minstayTime,60 * 60 * 24 * this.maxstayTime)
            for(const p of CorePoints){
                var num = 0
                for(const v of clusters){
                  if(clusters[p.index]===v){
                    num++
                  }
                }
                // if(num>=30){
                const item = birdArr[p.index]
                clusterCenters.push(item)
                // }
            }
            break;
        }
        // 计算停歇时间 做分级渲染
        // clusterCenters = douglasPeucker(clusterCenters,5000)
        clusterCenters.forEach(item =>{
          const point  = new ElePoint(item.lat,item.lng,convertDateStringToUnix(item.time),item.index)
          const EpsResults = []
          queryEle(root,point,EpsResults,25000)
          const centerPoint = getCenterPoint(EpsResults)
          const times = EpsResults.map(point => convertDateStringToUnix(point.time))
          const startTime = new Date(Math.min(...times))
          const endTime = new Date(Math.max(...times))
          const startTimeStr = convertUnixToDateString(startTime)
          const endTimeStr = convertUnixToDateString(endTime)
          const maxstayTime = (Math.max(...times) - Math.min(...times))/(60*60*24)
          if(isValidLatLng(centerPoint)){
            const marker = this.createCenterMarker({centerPoint,maxstayTime,startTimeStr,endTimeStr}, icon);
            markersCanvas.addMarker(marker);
            previousLayers.push(marker)
            markersList.push(marker)
            latlngs.push([centerPoint.lat, centerPoint.lng]);
          }
        })
        this.handleGeometricType(latlngs, markersCanvas);
      });
    },
    // 创建栖息地点位，时间越长，icon的size将会随着调整
    createCenterMarker(item,icon){
       return L.marker([item.centerPoint.lat, item.centerPoint.lng], { icon })
        .bindPopup(`停留时间:${item.maxstayTime.toFixed(2)}天<p>
          开始时间:${item.startTimeStr}<p>
          结束时间:${item.endTimeStr}<p>
          经度:${parseFloat(item.centerPoint.lng).toFixed(5)}<p>纬度:${parseFloat(item.centerPoint.lat).toFixed(5)}`)
        .on({
          mouseover(e) { this.openPopup(); },
          mouseout(e) { this.closePopup(); }
        });
    },
    // 创建普通点标记
    createMarker(item, icon) {
      return L.marker([item.lat, item.lng], { icon })
        .bindPopup(`时间:${item.time}<p>经度:${parseFloat(item.lng).toFixed(5)}<p>纬度:${parseFloat(item.lat).toFixed(5)}`)
        .on({
          mouseover(e) { this.openPopup(); },
          mouseout(e) { this.closePopup(); }
        });
    },

    // 根据几何类型绘制
    handleGeometricType(latlngs, markersCanvas) {
      if (this.geometricType != '1') {
        const polyline = L.polyline(latlngs, { color: 'red', weight: 3 }).addTo(map);
        const decorator = L.polylineDecorator(polyline, {
          patterns: [
            { offset: 0, repeat: 35, symbol: L.Symbol.arrowHead({
              pixelSize: 5,
              headAngle: 75,
              polygon: false,
              pathOptions: { stroke: true, weight: 2, color: 'blue' }
            })}
          ]
        }).addTo(map);
        previousLayers.push(decorator);
        previousLayers.push(polyline);
      }
    },
    // 读取csv文件
    async loadCSV(data) {    
      const csvUrl = `../resource/${data}.csv`;    
      try {    
        const response = await fetch(csvUrl);    
        if (!response.ok) throw new Error('Network response was not ok');    
        const csv = await response.text();    
        const results = Papa.parse(csv, {  
          header: true,  
          transform: function(value, field) {  
            if (field === 'lng' || field === 'lat') {  
              const num = parseFloat(value);  
              return isNaN(num) ? value : num;  
            }  
            return value;  
          }  
        });   
        
        // 按照第一列时间字符串排序
        const sortedData = results.data.sort((a, b) => {
          const timeA = convertDateStringToUnix(a[Object.keys(a)[0]]); // 第一列的时间值
          const timeB = convertDateStringToUnix(b[Object.keys(b)[0]]);
          return timeA - timeB; // 升序排列
        });
        
        return sortedData;    
      } catch (error) {    
        console.error('Error loading CSV:', error);    
        throw error; 
      }    
    },
    //根据地名查找经纬度
    searchLngByName(options){
      //湖南省环球信士公司
      //请求： http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"北京市延庆区延庆镇莲花池村前街50夕阳红养老院"}&tk=您的密钥
      axios.get('http://api.tianditu.gov.cn/geocoder?ds={"keyWord":"' + options.name + '"}&tk=89dea3eab561f0dfb9867e531415e015').then(res => {
        options.lng=res.data.location.lon
        options.lat=res.data.location.lat
      }).catch(err => {
        console.error('Error fetching route:', err)
      }) 
    },
    //点击节点
    handleNodeClick(data){
      console.log('节点数据',data)
      console.log('节点ID',data.$treeNodeId)
    },
    //导航
    navigation(){
      this.page='navigation' //跳转到导航界面
      this.navdrawing = true
      drawPoi.draw()
    },
    //绘制导航路线
    searchRoute(){
      this.showPath(this.startPlace,this.endPlace,this.navstyle)
    },
    //查询地名
    searchByName(keyWord){
      const list = []
      FileSave.getList().then(res => {
        const temp = res
        if(temp){
          temp.forEach(item =>{
            if(item.name.includes(keyWord)){
              list.push(item)
            }
          })
        }
      })
      this.dataList = list
    },
    // 加载数据
    loadData() {
      FileSave.getList().then(res => {
        console.log('res', res)
        const list = res
        if (res) {
          // 处理图片
          list.forEach(item => {
            if (item.photos) {
              const arr = item.photos.split('#')
              if (arr.length > 0) {
                item['photo0'] = arr[0]
                item['photoArr'] = arr
              }
            }
          })
          this.dataList = list
        } else {
          this.dataList = []
        }
        const nameList = []
        list.forEach(item =>{
          if(item.name){
              const [province,place] = item.name.split('-')
              const provinces = nameList // 省份层级是树的根
              const provinceNode = findOrCreateParent(provinces, province)
              const places = provinceNode.children
              findOrCreateParent(places, place) // 城市作为省份的子节点
            }
          }
        )
        this.nameList=nameList
      })
    },
    // 聚合分析
    clusterAnalysis(){
      this.page = 'cluster'
      drawNewPoi.clear()
      drawPoi.clear()
      PathLayer.clear()
    },
    // 开始绘制
    startDraw() {
      this.drawing = true
      this.fileList = []
      drawNewPoi.draw()
    },
    // 取消绘制
    cancelDraw() {
      drawNewPoi.drawCancel()
      this.drawing = false
    },
    // 返回列表页面
    backToList() {
      this.page = 'list'
      drawNewPoi.clear()
      drawPoi.clear()
      PathLayer.clear()
      this.navdrawing = false
      if(this.startPlace!=''){
        this.startPlace.name=''
        this.startPlace.lng=''
        this.startPlace.lat=''
        this.endPlace.name=''
        this.endPlace.lng=''
        this.endPlace.lat=''

      }
      this.$refs.poiForm.resetFields()
    },
    // 保存数据
    save() {
      this.$refs.poiForm.validate(valid => {
        if (!valid) {
          return
        }
        const currentPoint = this.currentPoint

        const param = {
          name: currentPoint.name,
          time: currentPoint.time,
          longitude: currentPoint.lng,
          latitude: currentPoint.lat,
          altitude: currentPoint.altitude || 0,
          photos: '',
          address: '',
          desc: currentPoint.desc || ''
        }
        const photos = []
        if (this.fileList.length > 0) {
          this.fileList.forEach(f => {
            photos.push(f.name)
          })
        }
        if (photos.length > 0) {
          param.photos = photos.join('#')
        }

        if (currentPoint.id) {
          const item = this.dataList.find(d => d.id === currentPoint.id)
          if (item) {
            item.name = currentPoint.name || ''
            item.time = currentPoint.time || ''
            item.longitude = currentPoint.lng
            item.latitude = currentPoint.lat
            item.altitude = currentPoint.altitude || 0
            item.photos = param.photos
            item.address = param.address
            item.desc = currentPoint.desc || ''
            FileSave.create(this.dataList).then(res => {
              this.$messageSuccess()
              this.backToList()
            })
          }
        } else {
          param['id'] = getUuid()
          this.dataList.push(param)
          FileSave.create(this.dataList).then(res => {
            this.$messageSuccess()
            this.backToList()
          })
        }
        this.loadData()
      })
    },
    // 飞到指定点
    flyTo(item) {
      drawNewPoi.flyTo(item)
    },
    // 编辑指定点
    edit(item) {
      this.fileList = []
      const photos = item.photos
      if (photos) {
        const arr = photos.split('#')
        arr.forEach(url => {
          this.fileList.push({
            status: 'done',
            url: url,
            name: url,
            uid: getUuid()
          })
        })
      }
      drawNewPoi.edit(item)
    },
    // 删除指定点
    deleteClick(item) {
      const idx = this.dataList.findIndex(d => d.id === item.id)
      this.dataList.splice(idx, 1)
      FileSave.create(this.dataList).then(res => {
        this.$messageSuccess()
        this.loadData()
        drawNewPoi.clearById(item.id)
      })
    },
    // 文件列表变化
    listChange(list) {
      this.fileList = list
    },
    // 经纬度变化
    latLngChange(v) {
      if (this.currentPoint.lat && this.currentPoint.lng) {
        drawNewPoi.setLatLng(this.currentPoint.lat, this.currentPoint.lng)
      }
    },
    // 显示路径
    showPath(start,end,style) {
      PathLayer.path(start,end,style)
    }
  }
}
// 辅助函数：在树中查找或添加父节点
function findOrCreateParent(parents, parentName) {
  let parent = parents.find(p => p.label === parentName);
  if (!parent) {
    parent = { label: parentName, children: [] };
    parents.push(parent);
  }
  return parent;
}

</script>

<style scoped>
.poiImg {
  width: 40px;
  height: 40px;
  border-radius: 5px;
}
</style>
