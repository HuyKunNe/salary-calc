<template lang="">
  <h1 class="text-center sticky top-0">Báo cáo trợ giảng</h1>
  <div class="flex items-center my-2 justify-around">
    <label for="fileInput" class="file-button-click">Upload file</label>
    <input
      class="custom-file-input"
      type="file"
      accept=".xlsx, .xls, .csv"
      @change="handleFileUpload"
      ref="fileInput"
      id="fileInput"
    />
  </div>
  <n-config-provider>
    <n-data-table
      :columns="columns"
      :bordered="false"
      :single-line="false"
      :data="processedData"
      :max-height="600"
      :style="{ fontSize: '1rem' }"
      :scroll-x="1800"
      :min-row-height="48"
      virtual-scroll
      virtual-scroll-x
    />
  </n-config-provider>
  <SpinnerComponent v-model:show="loading"></SpinnerComponent>
</template>
<script lang="ts">
import { useStorage } from "@vueuse/core";
import type { DataTableColumn } from "naive-ui";
import { defineComponent, ref } from "vue";
import * as XLSX from "xlsx";
import SpinnerComponent from "../components/spinner.vue";
import type { WorkRecord } from "../interface/WorkRecord";
import { normalizeDate } from "../utils/dateFormatter";

interface ExcelRow {
  [key: string]: any;
}
export default defineComponent({
  name: "TeachingAssistant",
  components: {
    SpinnerComponent,
  },
  setup() {
    const loading = ref<boolean>(false);
    const error = ref<String | null>(null);
    const fileInput = ref<HTMLInputElement | null>(null);
    const processedData = useStorage<WorkRecord[]>("processedData", []);

    const columns = ref<DataTableColumn<WorkRecord>[]>([
      {
        title: "Tên trợ giảng",
        key: "assistantName",
        width: 300,
        fixed: "left",
      },
      {
        title: "Ngày làm việc",
        key: "workDate",
        width: 120,
        fixed: "left",
      },
      {
        title: "Công việc",
        key: "workDetails",
        width: 200,
        ellipsis: {
          tooltip: true,
        },
        fixed: "left",
      },
      {
        title: "Tháng",
        key: "month",
        width: 140,
      },
      {
        title: "Giờ gác thi",
        key: "invigilateHours",
        width: 100,
        render: (row: any) => row.invigilateHours?.toFixed(1) || "0",
      },
      {
        title: "Số bài chấm",
        key: "gradedPapers",
        width: 100,
      },
      {
        title: "Giờ chấm bài",
        key: "gradingHours",
        width: 100,
        render: (row: any) => row.gradingHours?.toFixed(1) || "0",
      },
      {
        title: "Tổng giờ",
        key: "totalHours",
        width: 100,
        render: (row: any) => row.totalHours?.toFixed(1) || "0",
      },
      {
        title: "Slot Speaking",
        key: "speakingSlots",
        width: 100,
      },
      {
        title: "Giờ Speaking",
        key: "speakingHours",
        width: 100,
        render: (row: any) => row.speakingHours?.toFixed(1) || "0",
      },
      {
        title: "Mã lớp gác thi",
        key: "examClassCode",
        width: 120,
      },
      {
        title: "Ghi chú",
        key: "notes",
        width: 150,
        ellipsis: {
          tooltip: true,
        },
      },
      {
        title: "Giờ trợ giảng",
        key: "tutoringHours",
        width: 100,
        render: (row: any) => row.tutoringHours?.toFixed(1) || "0",
      },
      {
        title: "Mã lớp",
        key: "classCode",
        width: 120,
      },
      {
        title: "Ghi chú lớp",
        key: "classNotes",
        width: 150,
        ellipsis: {
          tooltip: true,
        },
      },
      {
        title: "Mã lớp HW",
        key: "homeworkClassCode",
        width: 120,
      },
      {
        title: "Tên HW",
        key: "homeworkName",
        width: 150,
        ellipsis: {
          tooltip: true,
        },
      },
      {
        title: "Bài HW đã chấm",
        key: "homeworkGraded",
        width: 100,
      },
      {
        title: "Link HW",
        key: "homeworkFolderLink",
        width: 150,
        ellipsis: {
          tooltip: true,
        },
      },
      {
        title: "Giờ chấm HW",
        key: "homeworkGradingHours",
        width: 100,
        render: (row: any) => row.homeworkGradingHours?.toFixed(1) || "0",
      },
      {
        title: "Ghi chú HW",
        key: "homeworkNotes",
        width: 150,
        ellipsis: {
          tooltip: true,
        },
      },
      {
        title: "Thời gian Tutor",
        key: "tutorTime",
        width: 120,
      },
      {
        title: "Ghi chú Tutor",
        key: "tutorNotes",
        width: 150,
        ellipsis: {
          tooltip: true,
        },
      },
    ]);
    const readExcelFile = (file: File): Promise<ExcelRow[]> => {
      loading.value = true; // Start loading when the file reading begins
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const firstSheet = workbook.SheetNames[1];
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
      });
    };

    const processRawData = (data: any[]): WorkRecord[] => {
      loading.value = true;
      return data
        .map((row) => ({
          assistantName: row["TÊN TRỢ GIẢNG"],
          workDate: normalizeDate(row["NGÀY LÀM VIỆC"] || "3/20/2025"),
          workDetails: row["CÔNG VIỆC THỰC HIỆN"],
          month: row["Tháng"],
          invigilateHours: parseNumber(
            row["THỜI GIAN GÁC THI [IELTS L-R-W = 3h] / [NB / PTL = 2h]"]
          ),
          gradedPapers: parseNumber(
            row["SỐ BÀI CHẤM THI [IELTS L-R / NB / PTL]"]
          ),
          gradingHours: parseNumber(row["Thời gian chấm thi"]),
          totalHours: parseNumber(row["TỔNG THỜI GIAN: Gác thi + Chấm thi"]),
          speakingSlots: parseNumber(row["SỐ SLOT GÁC THI [IELTS Speaking]"]),
          speakingHours: parseNumber(row["TỔNG THỜI GIAN GÁC THI SPEAKING"]),
          examClassCode: row["MÃ LỚP GÁC THI"],
          notes: row["GHI CHÚ (NẾU CÓ)"],
          tutoringHours: parseNumber(row["SỐ GIỜ TRỢ GIẢNG SPEAKING"]),
          classCode: row["MÃ LỚP"],
          classNotes: row["GHI CHÚ (NẾU CÓ)_1"], // Assuming second notes column
          homeworkClassCode: row["MÃ LỚP HOMEWORK CHẤM"],
          homeworkName: row["TÊN HOMEWORK"],
          homeworkGraded: parseNumber(row["SỐ BÀI HOMEWORK CHẤM"]),
          homeworkFolderLink: row["LINK FOLDER HOMEWORK CHẤM"],
          homeworkGradingHours: parseNumber(row["SỐ GIỜ CHẤM BÀI HOMEWORK"]),
          homeworkNotes: row["GHI CHÚ (NẾU CÓ)_2"], // Assuming third notes column
          tutorTime: row["THỜI GIAN TUTOR"],
          tutorNotes: row["GHI CHÚ (NẾU CÓ)_3"], // Assuming fourth notes column
        }))
        .filter((record) => record.assistantName); // Filter out empty rows
    };

    const parseNumber = (value: any): number | undefined => {
      const num =
        typeof value === "string"
          ? parseFloat(value.replace(",", "."))
          : Number(value);
      return isNaN(num) ? undefined : num;
    };

    const resetFile = () => {
      processedData.value = [];
      error.value = null;
    };

    const handleFileUpload = async (event: Event) => {
      resetFile();
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (!file) return;
      loading.value = true;
      error.value = null;

      try {
        const fileData = await readExcelFile(file);
        processedData.value = processRawData(fileData);
        setTimeout(() => {
          loading.value = false;
        }, 2000);
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Failed to read Excel file";
      }
    };

    return {
      loading,
      fileInput,
      handleFileUpload,
      error,
      columns,
      processedData,
    };
  },
});
</script>
<style lang="css" scoped>
@import "tailwindcss";
</style>
