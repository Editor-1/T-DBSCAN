<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: "App",
  metaInfo() {
      return {
      }
  }
};
</script>
<style scoped>
#app .theme-picker {
  display: none;
}
</style>
