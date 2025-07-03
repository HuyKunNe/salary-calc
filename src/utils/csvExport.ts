// utils/csvExport.ts
export function exportToCsv(filename: string, rows: any[], headers?: string[]) {
  const processRow = (row: any) => {
    return Object.values(row)
      .map((value) => {
        if (value === null || value === undefined) return "";
        // Escape quotes and wrap in quotes if contains commas, quotes, or newlines
        const str = String(value).replace(/"/g, '""');
        if (/[",\n]/.test(str)) return `"${str}"`;
        return str;
      })
      .join(",");
  };

  // Add UTF-8 BOM
  let csvContent = "\uFEFF";

  // Add headers if provided
  if (headers) {
    csvContent += headers.join(",") + "\r\n";
  }

  // Add rows
  csvContent += rows.map(processRow).join("\r\n");

  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
