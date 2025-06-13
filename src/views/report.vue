<template>
  <div class="">
    <h1 class="text-center sticky top-0">
      BÁO CÁO GIỜ DẠY THÁNG {{ monthFilter }} - GIÁO VIÊN
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
    const monthFilter = useStorage<string>("monthFilter", "");
    return {
      filteredData,
      monthFilter,
    };
  },
  mounted() {
    console.log("Filtered Data:", this.filteredData);
  },
});
</script>
<style scoped>
@import "tailwindcss";
</style>
