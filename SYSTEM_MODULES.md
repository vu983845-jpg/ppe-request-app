# TỔNG QUAN CÁC MODULE TRONG HỆ THỐNG (SYSTEM MODULES)

Dựa trên cấu trúc dự án **Hệ thống Quản lý Yêu cầu & Cấp phát PPE**, ứng dụng này được chia cắt thành **4 Module chính** (chức năng cốt lõi) bao phủ toàn bộ vòng đời của thiết bị bảo hộ từ lúc xin cấp đến lúc nhận hàng:

## 1. Module Dành Cho Người Dùng (Employee Portal)
Module này là giao diện dành cho toàn bộ công nhân viên nhà máy thao tác.
*   **Đăng ký Yêu cầu (Request Form):** Cho phép nhân viên chọn loại đồ bảo hộ (PPE), size, điền số lượng và mô tả lý do. Kiểm tra tồn kho trước khi gửi đơn.
*   **Xử lý Đơn Bất thường (Lost/Broken flow):** Nếu nhân viên xin đồ do làm mất hoặc hỏng trước thời hạn, hệ thống yêu cầu tick chọn đồng ý đền bù hoặc khai báo rõ lý do.
*   **Theo dõi & Ký nhận (Tracking & Receipt):** Nhập Mã nhân viên (ID) để theo dõi tiến độ (Đang chờ -> Đã duyệt -> Đã chuẩn bị xong). Khi lấy đồ, nhân viên bấm xác nhận "Đã lấy hàng" để khép kín luồng phiếu.

## 2. Module Phê Duyệt Đa Cấp (Multi-Level Approval Dashboard)
Đây là "trái tim" của hệ thống phân quyền, bao gồm 4 Bảng điều khiển (Dashboards) riêng biệt cho 4 cấp Quản lý:
*   **Dashboard Trưởng Bộ Phận (Dept Head):** Phê duyệt cấp 1 (Duyệt theo lý do chuyên môn và nhân sự của xưởng).
*   **Dashboard An Toàn Vệ Sinh (HSE):** Phê duyệt cấp 2 (Duyệt kiểm tra tính hợp lệ về an toàn lao động và nhả hàng ở kho).
*   **Dashboard Giám Đốc Nhà Máy (Plant Manager) & Nhân Sự (HR):** Phê duyệt cấp Đặc biệt. Chỉ áp dụng cho các đơn vượt quá ngân sách hoặc xin cấp lại do mất/hỏng quá sớm, cần quyết định đền bù.

## 3. Module Quản Trị Kho & Ngân Sách (Inventory & Budget Control)
Module chạy ngầm và hiển thị một phần cho Admin/HSE.
*   **Thuật toán Vòng đời (Lifespan Engine - Ngầm):** Mỗi loại PPE có "Hạn sử dụng" riêng. Tự động kiểm tra lịch sử, nếu xin cấp lại khi chưa tới hạn sẽ giăng cờ Đỏ cảnh báo cho Quản lý.
*   **Giám sát Ngân sách (Budget Control):** Chuyển đổi Số lượng PPE thành Thành tiền tệ. Theo dõi mức độ tiêu hao ngân sách được cấp của từng phòng ban.
*   **Quản lý Kho (Inventory Master):** Tự động trừ tồn kho khi đơn hàng được cấp phát thành công.

## 4. Module Báo Cáo & Quản Trị Hệ Thống (Admin & Reporting)
Dành cho IT, Quản trị viên hệ thống hoặc Kế toán.
*   **Quản lý Phân quyền User (User & Role Management):** Gắn tài khoản đăng nhập với các chức vụ tương ứng (Admin, Giám đốc, HR...).
*   **Thống Kê Tổng Quan (Analytics KPIs):** Hiển thị sơ đồ, biểu đồ tiêu biểu về số lượng yêu cầu, chi phí tổng của toàn nhà máy.
*   **Kết xuất dữ liệu (Data Export):** Trích xuất toàn bộ lịch sử xin cấp phát và chi phí khấu hao thành file Excel (XLSX).

---
*Tài liệu tự động trích xuất từ lịch sử chat theo yêu cầu của Quản trị Hệ thống.*
