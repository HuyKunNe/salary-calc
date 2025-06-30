<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();

const switchToAssistant = () => {
  router.push("/teaching-assistant");
};

const route = useRoute();

const showButton = computed(() => route.path !== "/teaching-assistant");
</script>

<template>
  <n-button
    v-if="showButton"
    type="primary"
    @click="switchToAssistant"
    class="assistant-btn"
  >
    Switch to assistant
  </n-button>
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
