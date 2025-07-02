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
          v-if="salaryData.length > 0"
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
            Invalid data, please check it again.
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
        <div class="w-2/3 bonus m-auto my-1">
          <div class="bonus-label">Bonus</div>
          <n-input
            type="textarea"
            placeholder=""
            style="width: 40%"
            :autosize="{
              minRows: 1,
            }"
          />
          <n-input
            v-model:value="bonus"
            type="text"
            placeholder="0 ₫"
            style="width: 40%"
            @blur="bonus = formatVND(bonus)"
            @focus="bonus = unformatVND(bonus)"
          />
        </div>
        <div class="salary">
          <div class="salary-header"></div>
          <div class="salary-line w-full bg-[#ffff01]">
            <div class="salary-label">
              <p class="text-center">GROSS salary</p>
            </div>
            <div class="salary-text">
              {{
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  minimumFractionDigits: 0,
                }).format(balanceSalary())
              }}
            </div>
          </div>
          <div class="salary-line w-full bg-[#cafff5]">
            <div class="salary-label">
              <p class="text-center">NET salary</p>
            </div>
            <div class="salary-text">
              {{
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  minimumFractionDigits: 0,
                }).format(balanceSalary() * 0.9)
              }}
            </div>
          </div>
        </div>
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
import { computed, defineComponent, h, ref, watch } from "vue";
import SpinnerComponent from "../components/spinner.vue";
import type { Employee } from "../interface/Employee";
import type { RateHour } from "../interface/RateHour";
import type { SalaryData } from "../interface/SalaryData";
import type { Teacher } from "../interface/Teacher";
import { exportToPDF } from "../utils/exportToPDF";
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
    const viewReport = async (employee: any) => {
      employeeSelected.value = employee.email
        ? employee
        : employeeData.value.find((emp) => emp.email === employee.email);
      const data = filteredData.value.filter(
        (item) => item.email === employee.email
      );
      teacherRate.value =
        listTeacherRates.value.find((v) => v.email == employee.email) || null;
      salaryData.value = data.map((item, index) => ({
        no: index + 1,
        date: item.date,
        classCode: item.classCode,
        teachingHours: item.teachingHours,
        note: item.note,
        rate: getRateValue(teacherRate.value, extractPrefixes(item.classCode)),
        balance:
          getRateValue(teacherRate.value, extractPrefixes(item.classCode)) *
          item.teachingHours *
          1000,
      }));

      showModal.value = true;
    };
    const bonus = ref("");
    const formatVND = (value: any) => {
      if (!value) return "";
      // Remove all non-digit characters
      const num = String(value).replace(/\D/g, "");
      // Format with commas and add ₫
      return new Intl.NumberFormat("vi-VN").format(Number(num)) + " ₫";
    };

    const balanceSalary = (): number => {
      return (
        salaryData.value.reduce(
          (sum, item) => sum + parseFloat(item.balance.toString()),
          0
        ) + getNumericValue(bonus.value)
      );
    };

    // Revert to raw number when editing
    const unformatVND = (value: any) => {
      return value.replace(/[^\d]/g, "");
    };

    watch(bonus, (newValue: any) => {
      // Update the formatted value
      bonus.value = formatVND(newValue);
    });
    const getNumericValue = (formattedValue: string): number => {
      // Remove all non-digit characters (including ₫, commas, etc.)
      const numericString = formattedValue.replace(/[^\d]/g, "");

      // Convert to number (returns 0 for empty strings)
      return numericString ? Number(numericString) : 0;
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

    type RateProperties = Pick<
      RateHour,
      | "mtc"
      | "tesol"
      | "ya"
      | "tn"
      | "tl"
      | "ptl"
      | "nb"
      | "oto"
      | "cm"
      | "speakingTest"
      | "hsu"
    >;

    // Then update the mapping to only allow these properties
    const ratePropertyMap: Record<string, keyof RateProperties> = {
      MTC: "mtc",
      TESOL: "tesol",
      YA: "ya",
      TN: "tn",
      TL: "tl",
      PTL: "ptl",
      NB: "nb",
      OTO: "oto",
      CM: "cm",
      SPEAKING_TEST: "speakingTest",
      HSU: "hsu",
    };

    function getRateValue(item: RateHour | null, rateType: string): number {
      if (!rateType || !item) {
        return 0;
      }
      const normalizedType = rateType?.toUpperCase();
      const propertyName = ratePropertyMap[normalizedType];

      if (propertyName && item) {
        // TypeScript now knows this can only be a number | undefined
        return item[propertyName] || 0;
      }
      return 0;
    }

    const extractPrefixes = (item: any) => {
      // Handle "1-1" cases (including variations)
      if (item.includes("1-1")) {
        return "oto";
      }
      if (item.includes("HSU")) {
        return "hsu";
      }
      if (item.includes("OTS")) {
        return "tesol";
      }
      // Extract codes starting with O followed by letters (OYA, ONB, etc.)
      const codeMatch = item.match(/^O([A-Z]+)\d*\.\d+$/);
      if (codeMatch) {
        return codeMatch[1];
      }
      // Extract other codes (YA, NB, etc.) if they appear at start
      const otherCodeMatch = item.match(/^[A-Z]{2,}(?=\d|\.)/);
      if (otherCodeMatch) return otherCodeMatch[0];
      // Return the item as-is if no pattern matches
      return;
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
      if (row)
        return {
          class: duplicateIndices.value.has(index) ? "duplicate-row" : "",
        };
    };

    const handleExport = async () => {
      loading.value = true;
      try {
        removeActionColumn();
        await exportToPDF(
          "pdf-export",
          `${employeeSelected.value?.name} - ${monthFilter.value}`
        );
        addActionColumn();
      } catch (error) {
        console.error("Export failed:", error);
      }
      loading.value = false;
    };

    const removeItem = (no: number) => {
      salaryData.value = salaryData.value.filter((item) => item.no !== no);
    };

    const salaryColumns = ref<DataTableColumn<SalaryData>[]>([
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
        width: 200,
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
        sorter: "default",
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
        width: 150,
        align: "center",
      },
      {
        title: "Balance",
        key: "balance",
        width: 150,
        align: "right", // Right-align for currency
        render(row: any) {
          // Format as currency (e.g., 1000 → "1,000 VND" or "$1,000")
          return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0, // No decimals for VND
          }).format(row.balance);
        },
      },
      {
        title: "Action",
        key: "action",
        width: 200,
        align: "center",
        render(row) {
          return h(
            NButton,
            {
              type: "error",
              size: "small",
              onClick: () => removeItem(row.no),
            },
            { default: () => "Remove" }
          );
        },
      },
    ]);

    const addActionColumn = () => {
      // Type-safe check for existing action column
      const hasActionColumn = salaryColumns.value.some(
        (col): col is DataTableColumn<SalaryData> & { key: "action" } =>
          "key" in col && col.key === "action"
      );

      if (!hasActionColumn) {
        const actionColumn: DataTableColumn<SalaryData> = {
          title: "Action",
          key: "action",
          width: 200,
          align: "center",
          render(row) {
            return h(
              NButton,
              {
                type: "error",
                size: "small",
                onClick: () => removeItem(row.no),
              },
              { default: () => "Remove" }
            );
          },
        };
        salaryColumns.value = [...salaryColumns.value, actionColumn];
      }
    };

    const removeActionColumn = () => {
      salaryColumns.value = salaryColumns.value.filter(
        (col): col is DataTableColumn<SalaryData> =>
          "key" in col && col.key !== "action"
      );
    };

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
      bonus,
      unformatVND,
      getNumericValue,
      formatVND,
      balanceSalary,
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
.salary-header {
  height: 2rem;
  background-color: var(--primary-color);
}
.salary-line {
  border: 1px solid #6b8061;
  height: 2.5rem;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-around;
}
.salary-label {
  border-right: 1px solid #6b8061;
  display: flex;
  align-items: center;
  height: 100%;
  width: 25rem;
  font-size: 1.2rem;
  font-weight: 600;
}
.salary-text {
  height: 100%;
  width: 15%;
  display: flex;
  font-size: 1.2rem;
  font-weight: 600;
  align-items: center;
  color: red;
}
.bonus {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: max-content;
}
.bonus-label {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.2rem;
  font-weight: 400;
}
</style>
