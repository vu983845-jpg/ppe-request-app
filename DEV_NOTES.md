# Ghi chú Phát triển (Developer Notes)

## 1. Kiến trúc Hệ thống: Vercel (Mã nguồn) vs Supabase (Dữ liệu)

Trong quá trình vận hành hệ thống Quản lý Yêu cầu & Cấp phát PPE, cần hiểu rõ sự khác biệt giữa hai thành phần lõi để biết khi nào cần Deploy (cập nhật lại ứng dụng) và khi nào không.

### 1.1 Vercel (Front-end / Source Code)
Đây là nơi chứa **Mã Nguồn (Code)** của ứng dụng web (được viết bằng Next.js/React). Bản chất phần code này đóng vai trò như "cái vỏ hiển thị" (UI) và thiết lập "luồng quy tắc" (Logic/Flow).

*   **Đặc điểm:** Bất kỳ thay đổi nào làm biến đổi cấu trúc hiển thị hoặc logic hoạt động đều yêu cầu phải Commit mã nguồn mới lên Github và Vercel phải Build (Deploy) lại để áp dụng.
*   **Ví dụ bắt buộc phải Deploy:**
    *   Thêm một nút bấm (Button) mới, đổi màu giao diện.
    *   Sửa đổi văn bản, ngôn ngữ (Hard-coded chữ Tiếng Việt/Tiếng Anh trên UI).
    *   Thay đổi quyền hạn, bổ sung/lượt bỏ bước duyệt (Ví dụ: Bỏ bước duyệt của HR trong luồng code phê duyệt).

### 1.2 Supabase (Back-end / Database)
Đây là Cục Cơ Sở Dữ Liệu (Database) chạy độc lập trên Cloud. Chứa danh sách tài khoản người dùng, danh sách các loại PPE trong kho, lịch sử xuất/nhập, ngân sách các phòng ban...

*   **Đặc điểm:** Mã nguồn trên Vercel thực chất là lấy dữ liệu Real-time (Thời gian thực) từ Supabase về để hiển thị. Do đó, khi tương tác trực tiếp tới Dữ Liệu, hệ thống sẽ **Không cần Deploy lại code trên Vercel**.
*   **Ví dụ tự động cập nhật (Không cần Deploy):**
    *   Thêm mới, sửa, xóa thông tin Tài khoản người dùng (Role của Giám đốc, Admin...).
    *   Setup ngân sách mới cho các phòng ban.`
    *   Thêm mới các mặt hàng bảo hộ PPE vào kho, chỉnh sửa Số lượng, Hạn mức, Tuổi thọ của PPE.

### Tổng kết
*   **Đổi Dữ liệu (Thao tác trên Database - Supabase):** Không cần đụng tới Vercel. Refresh trang web là thấy cập nhật.
*   **Đổi Giao diện cấu trúc & Logic hệ thống (Thao tác Source Code):** Bắt buộc Deploy nhánh code mới lên Vercel. 

---
*Tài liệu tự động tạo để giải thích lý do app không cần deploy Vercel lại theo câu hỏi của Quản trị hệ thống (Project Admin).*
