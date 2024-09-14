<template>
  <div style="overflow: auto;width: 260px;background: white;">
    <div v-show="page == 'list'" class="poiPage" style="margin-top: 10px;">
      <section style="margin: 0 20px;color:black;">
        <div style="width: 100%;line-height:30px;color: #606266;">
          <el-checkbox style="line-height: 30px;" @change="poiSwitch">
            全部
          </el-checkbox>
          <div v-show="dataList.length>0" style="float: right;">
            <el-button v-if="!drawing" type="link" @click="startDraw">
              <i class="iconfont icon-jia-line" /> 标绘
            </el-button>
            <el-button v-if="drawing" type="link" @click="cancelDraw">
              取消
            </el-button>
          </div>
        </div>
        <div style="clear: right;">
          <el-input
            v-model="keyWord"
            placeholder="搜索"
            style="width:220px;margin-top: 10px;"
            allow-clear
            enter-button
            @pressEnter="loadData"
            @search="loadData"
          />
        </div>
      </section>
      <section style="margin: 20px;color:black;">
        <el-empty v-show="dataList.length<1" style="color: #606266;margin-top: 20px;padding-top: 120px;height:calc(100vh - 100px)">
          <span slot="description"> 无数据 </span>
          <el-button v-if="!drawing" type="link" @click="startDraw">
            <i class="iconfont icon-jia-line" /> 标绘
          </el-button>
          <el-button v-if="drawing" type="primary" @click="cancelDraw">
            取消
          </el-button>
        </el-empty>
        <div v-show="dataList.length > 0" item-layout="horizontal" :data-source="dataList" :style="{ height: 'calc(100vh - 240px)',overflow: 'auto' }">
          <div v-for="item in dataList">
            <div style="line-height: 32px;border-bottom: 1px solid #d3e1f5;">
              <div style="display: inline-block;" @click="showPath(item)">{{ item.name }}</div>
              <div style="float: right;">

                <el-button slot="actions" type="text" class="btn-link" ghost @click="edit(item)">编辑</el-button>
                <el-button slot="actions" type="text" class="btn-link hover-red" ghost @click="deleteClick(item)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
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
          <el-form-item
            label="图片"
            style="margin-top: 10px;"
          >
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
  </div>
</template>

<script>
import DrawPoi from './DrawPoi'
import * as PathLayer from '../comm/PathLayer'
const pointerImg = require('@/assets/images/location64.png')
import * as FileSave from './FileSave'
import { getUuid } from '../biz/common'

let drawPoi
export default {
  name: 'PoiPanel',
  data() {
    return {
      dataList: [],
      page: 'list',
      currentPoint: {
        name: '',
        time: ''
      },
      fileList: [],
      pointerImg: pointerImg,
      drawing: false,
      keyWord: ''
    }
  },
  mounted() {
    this.$nextTick(() => {
      drawPoi = new DrawPoi(this)
      PathLayer.init()
    })
    this.loadData()
  },
  beforeDestroy() {
    drawPoi.clear()
    drawPoi.drawCancel()
  },
  methods: {
    loadData() {
      FileSave.getList().then(res => {
        console.log('res', res)
        if (res) {
          const list = res
          // set photo 0
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
      })
    },
    startDraw() {
      this.drawing = true
      this.fileList = []
      drawPoi.draw()
    },
    cancelDraw() {
      drawPoi.drawCancel()
      this.drawing = false
    },
    backToList() {
      this.page = 'list'
      drawPoi.clear()
      this.$refs.poiForm.resetFields()
    },
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
        console.log('this.fileList', this.fileList)
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
            item.altitude = currentPoint.altitude || 0,
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
      })
    },
    flyTo(item) {
      drawPoi.flyTo(item)
    },
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
      drawPoi.edit(item)
    },
    deleteClick(item) {
      const idx = this.dataList.findIndex(d => d.id === item.id)
      this.dataList.splice(idx, 1)
      FileSave.create(this.dataList).then(res => {
        this.$messageSuccess()
        this.loadData()
        drawPoi.clearById(item.id)
      })
    },
    listChange(list) {
      this.fileList = list
    },
    latLngChange(v) {
      if (this.currentPoint.lat && this.currentPoint.lng) {
        drawPoi.setLatLng(this.currentPoint.lat, this.currentPoint.lng)
      }
    },
    poiSwitch(e) {
      if (e.target.checked) {
        saveRecord('地图中查看所有兴趣点分布', '11', '1')
        PoiContext.getLayer().show()
      } else {
        PoiContext.getLayer().hide()
      }
    },
    showPath(item) {
      PathLayer.path()
    }
  }
}
</script>

<style scoped>

.poiImg {
  width: 40px;
  height: 40px;
  border-radius: 5px;
}
</style>
