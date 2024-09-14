<template>
  <div ref="map2dRef" style="width: calc(100vw);height: calc(100vh);" />
</template>

<script>
import * as MapInit from './map/MapInit'
let map
export default {
  name: 'Map2d',
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      this.$nextTick(() => {
        map = MapInit.init(this.$refs.map2dRef)
      })
    }
  }
}
</script>

<style scoped>

</style>
