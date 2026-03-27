# THÔNG TIN DỰ ÁN DÀNH CHO AI AGENT MỚI (PROJECT CONTEXT)

**Tên dự án:** Hệ thống Quản lý Yêu cầu & Cấp phát PPE (PPE Request Management System)
**Stack Công nghệ:** Next.js 14+ (App Router), TypeScript, TailwindCSS, shadcn/ui, Supabase (PostgreSQL, Auth, RLS).

## 1. MỤC TIÊU DỰ ÁN
Xây dựng Web Application cho Intersnack Vietnam để quản trị toàn diện quy trình xin cấp phát thiết bị bảo hộ lao động (PPE) nội bộ. Bao gồm cổng cho nhân sự đăng ký và Dashboard cho các cấp Quản lý phê duyệt.

## 2. LUỒNG NGHIỆP VỤ (WORKFLOW) ĐÃ XÂY DỰNG
*   **Nhân viên nộp yêu cầu:** Chọn loại đồ bảo hộ (lấy tồn kho từ `ppe_master`), điền lý do, chọn kích cỡ.
*   **Phân loại yêu cầu:**
    *   `NORMAL` (Bình thường): Đang áp dụng luồng duyệt 2 cấp (Dept Head -> HSE).
    *   `LOST_BROKEN` (Mất/Hỏng cần đền bù): Đang áp dụng luồng duyệt 4 cấp (Trưởng bộ phận -> HSE -> Giám đốc nhà máy -> Nhân sự & Pháp chế).
*   **Vòng đời (Lifespan) & Ngân sách (Budget):** Cảnh báo nếu xin cấp lại thiết bị khi chưa hết hạn sử dụng. Tự động quy đổi số lượng ra chi phí và trừ vào ngân sách của phòng ban.

## 3. CƠ SỞ DỮ LIỆU (SUPABASE SCHEMA) LÕI
1.  `departments`: ID, name, budget_allocated, budget_used.
2.  `app_users`: auth_user_id (link với Supabase Auth), email, role (`ADMIN`, `HSE`, `DEPT_HEAD`, `HR`, `PLANT_MANAGER`), department_id.
3.  `ppe_master`: id, name_en, name_vn, size, unit, life_span_months, unit_price, stock_quantity.
4.  `ppe_requests`: Bảng lưu yêu cầu (id, requester_id, department_id, item_id, quantity, status, request_type).
    *   Chứa các cột lưu trữ lịch sử người duyệt: `fk_dept_approver`, `fk_hse_approver`, `fk_pm_approver`, `fk_hr_approver` (và các cột Timestamp tương ứng).
    *   *Lưu ý:* Foreign keys của các approver trỏ trực tiếp đến `app_users(id)`, không phải `auth.users(id)`.
5.  `yearly_budget`: Bảng theo dõi ngân sách năm (nếu có cập nhật chi tiết).
6.  `ppe_issue_log` / `ppe_purchases`: Theo dõi lịch sử xuất/nhập kho.

## 4. TÌNH TRẠNG LỖI CÒN TỒN ĐỌNG (LƯU Ý QUAN TRỌNG CHO AGENT SAU)
*   **Vấn đề:** Tài khoản Giám đốc nhà máy (Plant Manager - `thien.nguyen@viccla.com`) bị lỗi khi Login. Mặc dù đã thêm Role `PLANT_MANAGER` vào trong database và code Next.js (`auth.ts`, `dashboard/page.tsx`), nhưng khi đăng nhập, hệ thống vẫn không đọc được Role (hoặc RLS chặn) và trả về lỗi không xác định Role, dẫn đến không cho vào xem Dashboard.
*   **Nguyên nhân tình nghi:**
    *   Cache của Next.js Server Actions vẫn còn lưu phiên bản logic cũ chưa có `PLANT_MANAGER`.
    *   PostgreSQL Row Level Security (RLS) policies trên bảng `app_users` đang chặn Auth user mới đọc cột Role của chính họ lúc đăng nhập.
    *   Cấu trúc của Client Side Components hoặc Middleware.ts chưa thực sự nhả Caching.

## 5. CÁCH LÀM VIỆC TIẾP THEO
*   Đọc file này làm kim chỉ nam.
*   Toàn bộ mã nguồn nằm trong thư mục `src/`. API Server action nằm ở `src/app/actions/`. Middleware quản lý Auth nằm ở `src/middleware.ts` và `src/lib/supabase/middleware.ts`.
*   Cơ sở dữ liệu lưu tại Supabase (local dùng key `.env.local`).

*(Tài liệu này dùng để nạp ngữ cảnh cho các phiên làm việc AI tiếp theo nhằm tiết kiệm bộ nhớ)*
