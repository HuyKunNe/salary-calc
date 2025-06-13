<template>
  <div>
    <label for="fileInput" class="file-button-click">{{ fileName }}</label>
    <input
      class="custom-file-input"
      type="file"
      accept=".xlsx, .xls, .csv"
      @change="handleFileUpload"
      ref="fileInput"
      id="fileInput"
    />
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="data.length > 0">
      <n-select
        v-if="sortedMonths.length > 0"
        :style="{ width: '33%' }"
        :options="seletedOptions"
        v-model:value="monthFilter"
      />
      <n-button class="mb-4" type="primary" @click="redirectToReport">
        Go
      </n-button>
      <h3>
        Excel Data: <span class="italic">{{ fileName }}</span>
      </h3>
      <n-data-table :columns="columns" :data="data" :max-height="600" />
    </div>
  </div>
</template>

<script lang="ts">
import { useStorage } from "@vueuse/core";
import { computed, defineComponent, ref, watch } from "vue";
import { useRouter } from "vue-router";
import * as XLSX from "xlsx";
import type { Teacher } from "../interface/Teacher";

interface ExcelRow {
  [key: string]: any;
}

const columns = [
  {
    title: "Dấu thời gian",
    key: "created_at",
  },
  {
    title: "NGÀY DẠY",
    key: "date",
  },
  {
    title: "TÊN GIÁO VIÊN",
    key: "teacherName",
  },
  {
    title: "MÃ LỚP",
    key: "classCode",
  },
  {
    title: "SỐ GIỜ DẠY (H)",
    key: "teachingHours",
  },
  {
    title: "Địa chỉ email",
    key: "email",
  },
  {
    title: "Tháng",
    key: "month",
  },
];

export default defineComponent({
  name: "ExcelReader",
  props: {
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:isLoading"], // For v-model support
  setup(props, { emit }) {
    const fileInput = ref<HTMLInputElement | null>(null);
    const error = ref<string | null>(null);
    const dataTable = ref<ExcelRow[]>([]);
    const data = ref<Teacher[]>([]);
    const fileName = ref<string>("Upload Excel File");
    const listEmails = ref<string[]>([]);
    const listMonths = ref<string[]>([]);
    const filteredData = useStorage<Teacher[]>("filteredData", []);
    const monthFilter = ref<string | null>(null);
    const seletedOptions = computed(() => {
      return sortedMonths.value.map((month) => ({
        label: month,
        value: month,
      }));
    });
    const handleFileUpload = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;
      fileName.value = file.name;
      emit("update:isLoading", true);
      error.value = null;

      try {
        const fileData = await readExcelFile(file);
        dataTable.value = fileData;
        dataTable.value.forEach((row) => {
          const object = convertExcelTeacher(row);
          data.value = [...data.value, object];
          if (
            object?.email?.trim() &&
            !listEmails.value.includes(object.email.trim()) &&
            object.email.trim() !== ""
          ) {
            listEmails.value.push(object.email.trim());
          }
          if (
            object?.month?.trim() &&
            !listMonths.value.includes(object.month.trim()) &&
            object.month.trim() !== ""
          ) {
            listMonths.value.push(object.month.trim());
          }
        });
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to read Excel file";
      }
    };

    const handleFilter = () => {
      emit("update:isLoading", true);
      if (monthFilter.value) {
        filteredData.value = data.value.filter(
          (item) => item.month === monthFilter.value
        );
      } else {
        filteredData.value = [];
      }
      emit("update:isLoading", false);
    };

    const sortedMonths = computed<string[]>(() => {
      return [...listMonths.value].sort((a: string, b: string) => {
        const [monthA, yearA] = a.split("/").map(Number);
        const [monthB, yearB] = b.split("/").map(Number);
        return yearA - yearB || monthA - monthB;
      });
    });
    const readExcelFile = (file: File): Promise<ExcelRow[]> => {
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
              dateNF: "dd/mm/yyyy", // Match your date format
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
        emit("update:isLoading", false);
      });
    };

    const resetFile = () => {
      data.value = [];
      error.value = null;
      if (fileInput.value) {
        fileInput.value.value = "";
      }
    };

    const convertExcelTeacher = (excelData: any): Teacher => {
      return {
        created_at: excelData["Dấu thời gian"],
        date: excelData["NGÀY DẠY"],
        teacherName: excelData["TÊN GIÁO VIÊN"],
        classCode: excelData["MÃ LỚP"],
        teachingHours: excelData["SỐ GIỜ DẠY (H)"],
        email: excelData["Địa chỉ email"],
        month: excelData["Tháng"],
      };
    };

    const router = useRouter();

    const redirectToReport = () => {
      router.push("/report");
    };

    watch(monthFilter, () => {
      handleFilter();
    });

    return {
      fileInput,
      error,
      data,
      fileName,
      dataTable,
      handleFileUpload,
      resetFile,
      listEmails,
      listMonths,
      redirectToReport,
      sortedMonths,
      columns,
      monthFilter,
      handleFilter,
      seletedOptions,
    };
  },
});
</script>

<style scoped>
.custom-file-input {
  display: none;
}

.file-button-click {
  display: inline-block;
  cursor: pointer;
  text-align: center;
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1rem;
  border: 1px solid #cccccc;
  background-color: #70c0e8;
  border-radius: 10px;
  white-space: nowrap;
}

.thead {
  background-color: var(--primary-color);
  font-weight: bold;
}
</style>
