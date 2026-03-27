# PROJECT CONTEXT - PPE Request Management System
*Đọc file này trước khi làm việc với project*

## 1. THÔNG TIN CƠ BẢN
- **Website:** https://ppe-management-intersnack.vercel.app
- **Github:** https://github.com/vu983845-jpg/ppe-request-app.git (branch: `main`)
- **Stack:** Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Supabase (PostgreSQL + Auth)
- **Thư mục code gốc:** `C:\Users\Cashew\.gemini\antigravity\playground\sparse-sunspot`

---

## 2. QUY TRÌNH DEPLOY - CỰC KỲ QUAN TRỌNG

> ⛔ TUYỆT ĐỐI KHÔNG dùng lệnh `vercel deploy` trong Terminal. Lệnh này sẽ chờ đăng nhập và bị **TREO** mãi mãi.

**Quy trình chuẩn: Chỉ cần push lên Github, Vercel tự Deploy:**
```bash
git add .
git commit -m "Mô tả thay đổi"
git push origin main
```
Sau 2-3 phút, Vercel tự động kéo code mới về và deploy. Không cần làm thêm gì.

---

## 3. DATABASE (SUPABASE)
**Bảng lõi:**
- `app_users`: auth_user_id, email, role (`ADMIN`, `HSE`, `DEPT_HEAD`, `HR`, `PLANT_MANAGER`), department_id
- `ppe_master`: id, name, category, unit, size, life_span_months, unit_price, stock_quantity
- `ppe_requests`: Bảng đơn xin cấp phát. status: `PENDING_DEPT` → `PENDING_HSE` → `PENDING_PLANT_MANAGER` → `PENDING_HR` → `APPROVED_ISSUED`
- `departments`: id, name, dept_head_email

**Tài khoản test:**
- Admin/HSE: `admin@test.com`
- Plant Manager: `thien.nguyen@viccla.com` / `Viccla@12345`

---

## 4. VẤN ĐỀ CÒN TỒN ĐỌNG
- **Tài khoản Plant Manager bị lỗi đăng nhập:** Đăng nhập thành công nhưng bị văng về trang Home thay vì vào `/dashboard/plant-manager`. Nguyên nhân tình nghi: RLS policies trên bảng `app_users` chặn user đọc role của mình, hoặc Next.js cache Server Actions chưa được làm mới. Code đã sửa trong `src/app/actions/auth.ts` và `src/app/dashboard/page.tsx` nhưng vẫn chưa hoạt động.

---

## 5. CẤU TRÚC CODE CHÍNH
```
src/
  app/
    actions/        ← Server Actions (auth, hse, dept-head, hr, plant-manager, analytics)
    dashboard/
      hse/          ← Dashboard HSE
      dept-head/    ← Dashboard Trưởng bộ phận
      plant-manager/← Dashboard Giám đốc
      hr/           ← Dashboard HR
    admin/          ← Dashboard Admin
    request/        ← Form xin cấp PPE (public)
    tracking/       ← Theo dõi đơn (public)
    login/          ← Trang đăng nhập
  lib/
    supabase/       ← Client, Server, Middleware Supabase
    i18n/           ← Đa ngôn ngữ Anh/Việt
  components/       ← UI components dùng chung
supabase/migrations/← Lịch sử thay đổi database
```
