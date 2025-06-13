<template>
  <div class="">
    <h1 class="text-center sticky top-0">
      BÁO CÁO GIỜ DẠY HÀNG NGÀY - GIÁO VIÊN
    </h1>
  </div>
  <div>
    <ExcelReader v-model:isLoading="show"></ExcelReader>
  </div>
  <SpinnerComponent v-model:show="show"></SpinnerComponent>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SpinnerComponent from "../components/spinner.vue";
import ExcelReader from "../components/ExcelReader.vue";
export default defineComponent({
  name: "HomePage",
  components: {
    SpinnerComponent,
    ExcelReader,
  },
  setup() {
    return {
      show: ref(false),
    };
  },
});
</script>
<style scoped>
@import "tailwindcss";
</style>
