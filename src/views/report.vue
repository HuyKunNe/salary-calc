<template>
  <div class="">
    <h1 class="text-center sticky top-0">
      BÁO CÁO GIỜ DẠY THÁNG {{ monthFilter }} - GIÁO VIÊN
    </h1>
    <n-config-provider>
      <n-data-table
        :columns="columns"
        :data="data"
        :max-height="700"
        :style="{ fontSize: '1rem' }"
      />
    </n-config-provider>
    <n-modal v-model:show="showModal" transform-origin="center">
      <n-card
        id="pdf-export"
        style="width: 70%"
        title="Salary Slip"
        :show-header="true"
        :bordered="true"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-button
          v-if="salaryData.length > 0 && duplicateIndices.size == 0"
          type="primary"
          @click="handleExport"
          class="export-btn"
          id="export-btn"
        >
          Export to PDF
        </n-button>
        <div class="infor w-3/5 mx-auto mb-1">
          <div class="infor-row">
            <div class="infor-col flex justify-between">
              <div class="infor-col-value label">Name:</div>
              <div class="infor-col-value value">
                {{ employeeSelected?.name }}
              </div>
            </div>
            <div class="infor-col flex justify-between">
              <div class="infor-col-value label">Job Title:</div>
              <div class="infor-col-value value">Teacher</div>
            </div>
            <div class="infor-col flex justify-between">
              <div class="infor-col-value label">Job Status:</div>
              <div class="infor-col-value value">Part-time</div>
            </div>
            <div class="infor-col flex justify-between">
              <div class="infor-col-value label">Period</div>
              <div class="infor-col-value value">
                {{ getMonthPeriod() }}
              </div>
            </div>
            <div class="infor-col flex justify-between">
              <div class="infor-col-value label">Total teaching hours</div>
              <div class="infor-col-value value">
                {{
                  salaryData
                    .reduce(
                      (sum, item) =>
                        sum + parseFloat(item.teachingHours.toString()),
                      0
                    )
                    .toFixed(2)
                }}
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mb-1" v-if="duplicateIndices.size > 0">
          <span class="warning-text">
            Invalid data, please check again to export the PDF file.
          </span>
        </div>
        <n-config-provider>
          <n-data-table
            :columns="salaryColumns"
            :data="salaryData"
            :bordered="false"
            :single-line="false"
            :row-props="rowProps"
            :style="{ fontSize: '1rem' }"
          />
        </n-config-provider>
      </n-card>
    </n-modal>
  </div>
  <SpinnerComponent
    v-model:show="loading"
    :message="'Exporting to PDF'"
  ></SpinnerComponent>
</template>
<script lang="ts">
import { useStorage } from "@vueuse/core";
import { NButton, NTooltip, type DataTableColumn } from "naive-ui";
import { computed, defineComponent, h, ref } from "vue";
import SpinnerComponent from "../components/spinner.vue";
import type { Employee } from "../interface/Employee";
import type { SalaryData } from "../interface/SalaryData";
import type { Teacher } from "../interface/Teacher";
import { exportToPDF } from "../utils/exportToPDF";
import type { RateHour } from "../interface/RateHour";
export default defineComponent({
  name: "ReportPage",
  components: {
    SpinnerComponent,
  },
  setup() {
    const filteredData = useStorage<Teacher[]>("filteredData", []);
    const monthFilter = useStorage<string>("monthFilter", "");
    const employeeData = useStorage<Employee[]>("employeeData", []);
    const showModal = ref(false);
    const loading = ref(false);
    const salaryData = ref<SalaryData[]>([]);
    const employeeSelected = ref<Employee | null>(null);
    const listTeacherRates = useStorage<RateHour[]>("teacherRate", []);
    const teacherRate = ref<RateHour | null>(null);
    const viewReport = (employee: any) => {
      employeeSelected.value = employee.email
        ? employee
        : employeeData.value.find((emp) => emp.email === employee.email);
      salaryData.value = filteredData.value
        .filter((item) => item.email === employee.email)
        .map((item, index) => ({
          no: index + 1,
          date: item.date,
          classCode: item.classCode,
          teachingHours: item.teachingHours,
          note: item.note,
          rate: 100000,
          balance: 100000,
        }));
      showModal.value = true;
    };
    const columns = [
      { title: "No", key: "no", width: 50, align: "center" },
      { title: "Họ và Tên", key: "name" },
      { title: "Email", key: "email" },
      {
        title: "Action",
        key: "actions",
        width: 250,
        align: "center",
        render(row: any) {
          return h(
            NButton,
            {
              type: "primary",
              size: "small",
              onClick: () => viewReport(row),
            },
            { default: () => "View report" }
          );
        },
      },
    ];
    const getMonthPeriod = (): string => {
      const [month, year] = monthFilter.value.split("/");

      // Create date object (months are 0-indexed in JS)
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);

      // Get the last day of the month
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();

      // Format month name in English (full name)
      const monthName = date.toLocaleString("en-US", { month: "long" });

      return `1-${lastDay} ${monthName}`;
    };

    const findDuplicates = (data: SalaryData[]) => {
      const seen = new Map<string, boolean>();
      const duplicates = new Set<number>();

      data.forEach((item, index) => {
        const key = `${item.date}-${item.classCode}`;
        if (seen.has(key)) {
          duplicates.add(index);
          // Also mark the original duplicate
          const originalIndex = data.findIndex(
            (x) => `${x.date}-${x.classCode}` === key
          );
          duplicates.add(originalIndex);
        } else {
          seen.set(key, true);
        }
      });
      return duplicates;
    };

    const duplicateIndices = computed(() => findDuplicates(salaryData.value));

    const rowProps = (row: SalaryData, index: number) => {
      return {
        class: duplicateIndices.value.has(index) ? "duplicate-row" : "",
      };
    };
    const handleExport = async () => {
      loading.value = true;
      try {
        await exportToPDF(
          "pdf-export",
          `${employeeSelected.value?.name} - ${monthFilter.value}`
        );
      } catch (error) {
        console.error("Export failed:", error);
      }
      loading.value = false;
    };

    const salaryColumns: DataTableColumn<SalaryData>[] = [
      {
        title: "No",
        key: "no",
        width: 60,
        align: "center",
      },
      {
        title: "Teaching Date",
        key: "date",
        width: 150,
      },
      {
        title: "Class Code",
        key: "classCode",
        render(row: SalaryData, index: number) {
          return h(
            NTooltip,
            {
              trigger: "hover",
              disabled: !duplicateIndices.value.has(index),
            },
            {
              default: () => row.classCode,
              trigger: () =>
                duplicateIndices.value.has(index)
                  ? h("span", { class: "duplicate-text" }, row.classCode)
                  : row.classCode,
            }
          );
        },
      },
      {
        title: "Teaching Hours",
        key: "teachingHours",
        align: "center",
        width: 150,
      },
      {
        title: "Note",
        key: "note",
      },
      {
        title: "Rate/Hour",
        key: "rate",
      },
      {
        title: "Balance",
        key: "balance",
      },
    ];
    return {
      filteredData,
      monthFilter,
      columns,
      data: employeeData.value.map((employee, index) => ({
        no: index + 1,
        name: employee.name,
        email: employee.email,
      })),
      employeeData,
      showModal,
      salaryColumns,
      salaryData,
      getMonthPeriod,
      rowProps,
      viewReport,
      handleExport,
      loading,
      employeeSelected,
      duplicateIndices,
      listTeacherRates,
      teacherRate,
    };
  },
});
</script>
<style scoped>
@import "tailwindcss";

.infor-col-value {
  text-align: center;
  margin-bottom: 0.5rem;
  &.label {
    width: 40%;
    font-weight: bold;
  }
  &.value {
    width: 60%;
    font-weight: bold;
    color: var(--primary-color);
    font-size: 1rem;
  }
}

.warning-text {
  font-size: 1.4rem;
  font-style: italic;
  color: red;
  font-weight: 600;
}
</style>
