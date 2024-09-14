<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :action="uploadImgUrl"
      list-type="picture-card"
      name="image"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      ref="imageUpload"
      :show-file-list="true"
      :file-list="fileList"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
  </div>
</template>

<script>
function validateImage(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
  if (!isJpgOrPng) {
    return
  }
  const isLt2M = file.size / 1024 / 1024 < 20 // 20M
  if (!isLt2M) {
    return
  }
  return isJpgOrPng && isLt2M
}
export default {
  name: 'ImageUpload',
  props: {
    // 默认列表
    fileList: {
      required: true,
      type: Array
    },
    // 用户头像 = 》user，设备照片 =》 device，兴趣点照片 =》poi ，意见反馈照片 =》 advice
    type: {
      required: true,
      type: String,
      default: ''
    },
    // 限制数量
    num: {
      type: Number,
      default: 6
    },
    listType: {
      type: String,
      default: 'picture-card'
    },
    readyOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      headers: null,
      baseUrl: process.env.VUE_APP_BASE_API + '/images/',
      uploadImgUrl: process.env.VUE_APP_BASE_API + "/upload-image", // 上传的图片服务器地址
      previewVisible: false,
      previewImage: '',
      list: []
    }
  },
  watch: {
    fileList() {
      console.log('this.fileList', this.fileList)
      this.fileList.forEach(item => {
        item['url'] = this.baseUrl + item.name
      })
      this.list = this.fileList
    }
  },
  methods: {
    handlePreview(file) {
      this.previewImage = file.url
      // this.previewVisible = true
      const urls = []
      this.list.forEach(item => {
        urls.push(item.url)
      })
      /* const vViewer = this.$viewerApi({
        images: urls,
        url: file.url
      }) */
      this.$nextTick(() => {
        const idx = this.list.findIndex(d => d.url === file.url)
        // vViewer.update().view(idx)
      })
    },
    handleUploadSuccess(res, file, fileList) {
      console.log('res, file', res, file, fileList)
      fileList.forEach(item => {
        if (item.response) {
          item['url'] = this.baseUrl + item.response.fileName
          item['name'] = item.response.fileName
        }
      })
      this.list = fileList
      if (res.code === 200) {
      } else if (file.status === 'removed') {
      } else {
        // 如何失败，删除最后一个
        if (!file.bb) {
          fileList.splice(fileList.length - 1, 1)
        }
      }
      this.$emit('listChange', fileList)
    },
    handleBeforeUpload(file) {
      const bb = validateImage(file)
      file['bb'] = bb
      return bb
    }
  }
};
</script>
<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
::v-deep.hide .el-upload--picture-card {
  display: none;
}
// 去掉动画效果
::v-deep .el-list-enter-active,
::v-deep .el-list-leave-active {
  transition: all 0s;
}

::v-deep .el-list-enter, .el-list-leave-active {
  opacity: 0;
  transform: translateY(0);
}
</style>

