export interface Teacher {
  created_at: string; // "Dấu thời gian" (Excel timestamp)
  date: string; // "NGÀY DẠY" (Teaching date)
  teacherName: string; // "TÊN GIÁO VIÊN"
  classCode: string; // "MÃ LỚP"
  teachingHours: number; // "SỐ GIỜ DẠY (H)"
  email: string; // "Địa chỉ email"
  month: string; // "Tháng" (MM/YYYY format)
}
