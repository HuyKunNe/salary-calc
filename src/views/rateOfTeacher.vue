<template lang="">
  <h1 class="text-center sticky top-0">BÁO CÁO GIỜ DẠY THÁNG - GIÁO VIÊN</h1>
  <div class="flex items-center my-2 justify-around">
    <label for="fileInput" class="file-button-click">Upload rate file</label>
    <input
      class="custom-file-input"
      type="file"
      accept=".xlsx, .xls, .csv"
      @change="handleFileUpload"
      ref="fileInput"
      id="fileInput"
    />
  </div>
  <div v-if="error" class="error">{{ error }}</div>
  <div v-if="teacherRate.length > 0" class="mt-2">
    <n-config-provider>
      <n-data-table
        :columns="columns"
        :bordered="false"
        :single-line="false"
        :data="teacherRate"
        :max-height="600"
        :style="{ fontSize: '1rem' }"
      />
    </n-config-provider>
  </div>
  <Spinner v-model:show="loading"></Spinner>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import * as XLSX from "xlsx";
import Spinner from "../components/spinner.vue";
import type { RateHour } from "../interface/RateHour";
import { useStorage } from "@vueuse/core";

interface ExcelRow {
  [key: string]: any;
}

const columns = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Since", key: "since", width: 150, align: "center" },
  { title: "Hệ số", key: "rate", width: 100, align: "center" },
  { title: "MTC", key: "mtc", width: 100, align: "center" },
  { title: "TESOL", key: "tesol", width: 100, align: "center" },
  { title: "YA", key: "ya", width: 100, align: "center" },
  { title: "TN", key: "tn", width: 100, align: "center" },
  { title: "TL", key: "tl", width: 100, align: "center" },
  { title: "PTL", key: "ptl", width: 100, align: "center" },
  { title: "NB", key: "nb", width: 100, align: "center" },
  { title: "1-1", key: "oto", width: 100, align: "center" },
  { title: "CM", key: "cm", width: 100, align: "center" },
  {
    title: "Giải đề Speaking = TL",
    key: "speakingTest",
    width: 100,
    align: "center",
  },
];

export default defineComponent({
  name: "rateOfTeacher",
  components: {
    Spinner,
  },
  setup() {
    const loading = ref(false);
    const fileInput = ref<HTMLInputElement | null>(null);
    const error = ref<string | null>(null);
    const teacherRate = useStorage<RateHour[]>("teacherRate", []);
    const readExcelFile = (file: File): Promise<ExcelRow[]> => {
      loading.value = true; // Start loading when the file reading begins
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
              raw: false, // Get formatted strings (not raw numbers)
              dateNF: "dd/MM/yyyy", // Match your date format
            });
            resolve(jsonData);
          } catch (err) {
            reject(err);
          }
        };

        reader.onerror = () => {
          reject(new Error("File reading failed"));
        };
        reader.readAsArrayBuffer(file);
        setTimeout(() => {
          loading.value = false;
        }, 2000);
      });
    };

    const handleFileUpload = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;
      loading.value = true;
      teacherRate.value = [];
      error.value = null;

      try {
        const fileData = await readExcelFile(file);
        fileData.forEach((row) => {
          const rate = convertExcelToRate(row);
          teacherRate.value.push(rate);
        });
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to read Excel file";
      }
    };

    const convertExcelToRate = (excelData: any): RateHour => {
      return {
        name: excelData["Name"] || "",
        email: excelData["Email"] || "",
        since: excelData["Since"] || "",
        rate: excelData["Hệ số"] || 0,
        mtc: excelData["MTC"] || 0,
        tesol: excelData["TESOL"] || 0,
        ya: excelData["YA"] || 0,
        tn: excelData["TN"] || 0,
        tl: excelData["TL"] || 0,
        ptl: excelData["PTL"] || 0,
        nb: excelData["NB"] || 0,
        oto: excelData["1-Jan"] || 0,
        cm: excelData["CM"] || 0,
        speakingTest: excelData["Giải đề Speaking = TL"] || 0,
      };
    };
    return {
      loading,
      readExcelFile,
      handleFileUpload,
      error,
      fileInput,
      teacherRate,
      columns,
    };
  },
});
</script>
<style lang="css" scoped>
@import "tailwindcss";
</style>
