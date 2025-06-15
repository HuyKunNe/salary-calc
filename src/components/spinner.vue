<template>
  <div v-if="show" class="overlay-spinner">
    <div class="spinner-content">
      <n-spin :show="true" size="large">
        <template #description>
          {{ message }}
        </template>
      </n-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: "Loading...",
    required: false,
  },
});
</script>
<style scoped>
.overlay-spinner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
>
