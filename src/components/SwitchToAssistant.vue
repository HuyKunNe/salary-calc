<template>
  <n-button type="primary" @click="switchToAssistant" class="assistant-btn">
    Switch to assistant
  </n-button>
</template>
<script setup lang="ts">
import { NButton } from "naive-ui";
import { useRouter } from "vue-router";

const router = useRouter();

const switchToAssistant = () => {
  router.push("/teaching-assistant");
};
</script>
<style>

</style>
