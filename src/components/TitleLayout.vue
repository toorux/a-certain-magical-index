<script lang="ts" setup>

</script>

<template>
  <div class="container">
    <div class="title">
      <div>
        <h1>
          <slot name="title"/>
        </h1>
      </div>
    </div>
    <div class="content">
      <div>
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>

.container {
  height: 100%;
  flex-direction: column;
  width: 100%;
  position: relative;
  display: flex;
}

.title, .content {
  width: 100%;
  position: relative;
}

.title {
  height: 60px;
}

.content {
  flex: 1;
}

.title > div, .content > div {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20px 30px;
}

.title h1 {
  text-align: left;
  margin: 0;
  padding: 0;
}

</style>
