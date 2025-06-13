<template>
  <div>
    <div class="flex items-center my-2 justify-around">
      <label for="fileInput" class="file-button-click">{{ fileName }}</label>
      <input
        class="custom-file-input"
        type="file"
        accept=".xlsx, .xls, .csv"
        @change="handleFileUpload"
        ref="fileInput"
        id="fileInput"
      />
      <div class="flex w-2/3" v-if="sortedMonths.length > 0">
        <div class="w-[70%] flex items-center">
          <div class="w-fit">Select month to preview reports:</div>
          <n-select
            :style="{ width: '40%', marginLeft: '2rem' }"
            :options="seletedOptions"
            placeholder="Select month"
            v-model:value="monthFilter"
          />
        </div>
        <n-button
          :style="{ width: '30%' }"
          v-if="monthFilter"
          type="primary"
          @click="redirectToReport"
        >
          Preview Report
        </n-button>
      </div>
    </div>
    <h3 class="mb-2">
      Excel Data: <span class="italic">{{ fileName }}</span>
    </h3>
    <div class="flex justify-between mb-2">
      <div class="w-[15%] flex items-center">
        <div class="w-1/4">
          <label for="monthSearch" class="block">Tháng:</label>
        </div>
        <n-select
          id="monthSearch"
          size="medium"
          placeholder="Select month"
          :options="monthSeletedOptions"
          v-model:value="searchData.month"
          :style="{ width: '80%' }"
        />
      </div>
      <div class="w-[20%] flex items-center">
        <div class="w-1/4">
          <label for="emailSearch" class="block">Email:</label>
        </div>
        <n-select
          id="emailSearch"
          size="medium"
          v-model:value="searchData.email"
          placeholder="Select email"
          :options="emailSeletedOptions"
          :style="{ width: '80%' }"
        />
      </div>
      <div class="w-[18%] flex items-center">
        <div class="w-1/4">
          <label for="classCodeSearch" class="block">Mã lớp:</label>
        </div>
        <n-select
          id="classCodeSearch"
          size="medium"
          v-model:value="searchData.classCode"
          placeholder="Select class code"
          :options="classSeletedOptions"
          :style="{ width: '80%' }"
        />
      </div>
      <div class="w-[15%] flex items-center">
        <div class="w-1/3">
          <label for="dateSearch" class="block">Ngày dạy:</label>
        </div>
        <n-date-picker
          id="dateSearch"
          v-model:formatted-value="searchData.date"
          size="medium"
          :format="'dd/MM/yyyy'"
          :date-format="'dd/MM/yyyy'"
          value-format="dd/MM/yyyy"
          :style="{ width: '65%' }"
        />
      </div>
      <div class="w-[10%] flex items-center">
        <n-config-provider>
          <n-button
            type="primary"
            style="width: 100%; margin-left: 10px"
            @click="handleSearch"
          >
            <template #icon>
              <n-icon :component="SearchOutline" />
            </template>
            Search
          </n-button>
        </n-config-provider>
      </div>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="data.length > 0" class="mt-2">
      <n-data-table
        :columns="columns"
        :data="data"
        :max-height="450"
        :style="{ fontSize: '1rem' }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { useStorage } from "@vueuse/core";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import { SearchOutline } from "@vicons/ionicons5";
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
    width: 170,
  },
  {
    title: "NGÀY DẠY",
    key: "date",
    width: 150,
  },
  {
    title: "TÊN GIÁO VIÊN",
    key: "teacherName",
    width: 270,
  },
  {
    title: "MÃ LỚP",
    key: "classCode",
    width: 250,
  },
  {
    title: "SỐ GIỜ DẠY (H)",
    key: "teachingHours",
    width: 150,
  },
  {
    title: "Địa chỉ email",
    key: "email",
  },
  {
    title: "GHI CHÚ (NẾU CÓ)",
    key: "note",
  },
  {
    title: "Tháng",
    key: "month",
    width: 150,
    sorter: (row1: Teacher, row2: Teacher) => {
      const [monthA, yearA] = row1.month.split("/").map(Number);
      const [monthB, yearB] = row2.month.split("/").map(Number);
      return yearA - yearB || monthA - monthB;
    },
  },
];

interface DataSearchModel {
  month?: string;
  email?: string;
  classCode?: string;
  date?: Date | null;
}

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
    const originalData = useStorage<Teacher[]>("originalData", []);
    const data = ref<Teacher[]>([]);
    const fileName = ref<string>("Upload Excel File");
    const listEmails = ref<string[]>([]);
    const listMonths = ref<string[]>([]);
    const listClassCodes = ref<string[]>([]);
    const filteredData = useStorage<Teacher[]>("filteredData", []);
    const monthFilter = useStorage<string>("monthFilter", "");
    const searchData = ref<DataSearchModel>({
      month: "",
      email: "",
      classCode: "",
      date: null,
    });
    const seletedOptions = computed(() => {
      return sortedMonths.value.map((month) => ({
        label: month,
        value: month,
      }));
    });
    const monthSeletedOptions = computed(() => {
      return sortedMonths.value.map((month) => ({
        label: month,
        value: month,
      }));
    });
    const classSeletedOptions = computed(() => {
      return listClassCodes.value.map((classCode) => ({
        label: classCode,
        value: classCode,
      }));
    });
    const emailSeletedOptions = computed(() => {
      return listEmails.value.map((email) => ({
        label: email,
        value: email,
      }));
    });

    const handleFileUpload = async (event: Event) => {
      data.value = [];
      originalData.value = [];
      searchData.value = {
        month: "",
        email: "",
        classCode: "",
        date: null,
      };
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;
      fileName.value = file.name;
      emit("update:isLoading", true);
      error.value = null;

      try {
        const fileData = await readExcelFile(file);
        fileData.forEach((row) => {
          const object = convertExcelTeacher(row);
          originalData.value = [...originalData.value, object];
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
          if (
            object?.classCode?.trim() &&
            !listClassCodes.value.includes(object.classCode.trim()) &&
            object.classCode.trim() !== ""
          ) {
            listClassCodes.value.push(object.classCode.trim());
          }
          data.value = originalData.value;
        });
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to read Excel file";
      }
    };

    onMounted(() => {
      filteredData.value = [];
      originalData.value = [];
      data.value = [];
      searchData.value = {
        month: "",
        email: "",
        classCode: "",
        date: null,
      };
      monthFilter.value = "";
    });

    const handleFilter = () => {
      emit("update:isLoading", true);
      if (monthFilter.value) {
        filteredData.value = originalData.value.filter(
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
        setTimeout(() => {
          emit("update:isLoading", false);
        }, 2000);
      });
    };

    const resetFile = () => {
      data.value = [];
      originalData.value = [];
      searchData.value = {
        month: "",
        email: "",
        classCode: "",
        date: null,
      };
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
        note: excelData["GHI CHÚ (NẾU CÓ)"],
      };
    };

    const router = useRouter();

    const redirectToReport = () => {
      router.push("/report");
    };

    watch(monthFilter, () => {
      handleFilter();
    });
    const handleSearch = () => {
      emit("update:isLoading", true);
      data.value = originalData.value.filter((teacher) => {
        if (searchData.value.month && teacher.month !== searchData.value.month)
          return false;
        if (searchData.value.email && teacher.email !== searchData.value.email)
          return false;
        if (
          searchData.value.classCode &&
          teacher.classCode !== searchData.value.classCode
        )
          return false;
        if (
          searchData.value.date &&
          teacher.date !== searchData.value.date.toString()
        ) {
          return false;
        }
        return true;
      });
      if (data.value.length === 0) {
        error.value = "No data found for the selected filters.";
      } else {
        error.value = null;
      }
      emit("update:isLoading", false);
    };
    return {
      handleSearch,
      fileInput,
      error,
      data,
      fileName,
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
      listClassCodes,
      monthSeletedOptions,
      classSeletedOptions,
      emailSeletedOptions,
      searchData,
      originalData,
      SearchOutline,
    };
  },
  mounted() {
    if (this.isLoading) {
      this.resetFile();
    }
  },
});
</script>

<style scoped>
@import "tailwindcss";

.custom-file-input {
  display: none;
}

.file-button-click {
  display: inline-block;
  cursor: pointer;
  text-align: center;
  max-width: 16rem;
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
