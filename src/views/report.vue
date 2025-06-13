<template>
  <div class="">
    <h1 class="text-center sticky top-0">
      BÁO CÁO GIỜ DẠY HÀNG THÁNG - GIÁO VIÊN
    </h1>
  </div>
</template>
<script lang="ts">
import { useStorage } from "@vueuse/core";
import { defineComponent } from "vue";
import type { Teacher } from "../interface/Teacher";
export default defineComponent({
  name: "ReportPage",
  components: {},
  setup() {
    const filteredData = useStorage<Teacher[]>("filteredData", []);
    return {
      filteredData,
    };
  },
  mounted() {
    // This is where you can fetch or process data if needed
    // For example, you might want to load the filtered data from local storage
    console.log("Filtered Data:", this.filteredData);
  },
});
</script>
<style scoped>
@import "tailwindcss";
</style>
