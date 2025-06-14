<template>
  <n-button
    v-if="showButton"
    type="primary"
    @click="goToHome"
    class="back-home-btn"
  >
    <template #icon>
      <n-icon>
        <arrow-back />
      </n-icon>
    </template>
    Back to Home
  </n-button>
</template>
<script setup lang="ts">
import { NButton, NIcon } from "naive-ui";
import { ArrowBack } from "@vicons/ionicons5";
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();

const showButton = computed(() => route.path !== "/");

const goToHome = () => {
  router.push("/");
};
</script>
<style>
.back-home-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
