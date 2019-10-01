<template>
  <div id="app">
    <router-view></router-view>
    <router-view name="title"></router-view>
    <router-view name="picture"></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
