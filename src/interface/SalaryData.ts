export interface SalaryData {
  no: number; // "STT"
  date: string; // "Ngày dạy"
  classCode: string; // "Mã lớp"
  teachingHours: number; // "Số giờ dạy"
  note?: string; // "Ghi chú"
  rate: number; // "Đơn giá"
  balance: number; // "Số tiền"
}
