<script setup lang="ts"></script>

<template>
  <BackButton />
  <router-view></router-view>
</template>

<style scoped>
@import "tailwindcss";
.assistant-btn {
  position: fixed;
  top: 50px;
  left: 50px;
  z-index: 1000;
}
</style>
