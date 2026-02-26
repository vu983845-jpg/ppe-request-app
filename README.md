# Hệ thống Quản lý Yêu cầu & Cấp phát PPE (PPE Request Management System)

Đây là ứng dụng Web xây dựng bằng Next.js nhằm quản lý quy trình yêu cầu cấp phát thiết bị bảo hộ lao động (PPE) với luồng duyệt 2 bước, triển khai trên Vercel và Supabase.

## Công nghệ sử dụng
- Frontend & API: Next.js (App Router), TailwindCSS, shadcn/ui
- Backend: Supabase (PostgreSQL, Auth, Storage)
- Gửi Email: Resend API
- Xuất dữ liệu: `xlsx`

---

## 🚀 Cài đặt & Chạy trên máy cá nhân (Local)

### 1. Yêu cầu hệ thống
- Node.js bản 18 trở lên
- Một tài khoản [Supabase](https://supabase.com/)
- Một tài khoản [Resend](https://resend.com/)

### 2. Thiết lập Supabase
1. Tạo một project mới trên Dashboard của Supabase.
2. Vào phần **SQL Editor** trong Supabase.
3. Chạy các lệnh SQL có trong file `supabase/migrations/0001_schema.sql` để tạo bảng và Enum.
4. Chạy file `supabase/migrations/0002_rls.sql` để phân quyền bảo mật dòng (Row-Level Security).
5. Chạy file `supabase/seed.sql` để thêm dữ liệu mẫu (Danh sách vật tư, Phòng ban, Ngân sách...).
6. Vào phần **Authentication -> Users**, tạo tài khoản đăng nhập cho nhân viên của bạn (vd: `hse@company.com`, `admin@company.com`, `kho_a@company.com`).
7. Copy mã `id` (UUID) của các user vừa tạo. Vào **Table Editor**, mở bảng `app_users` và thêm thông tin để cấp quyền (`role` = `HSE`, `ADMIN`, hoặc `DEPT_HEAD`) cho các user này. Đừng quên gán `department_id` cho Trưởng bộ phận.

### 3. Biến môi trường (Environment Variables)
Tạo một file `.env.local` ở thư mục gốc của dự án, lấy thông tin URL/Key trong tab API của Supabase và Resend:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_CUA_BAN].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

RESEND_API_KEY=re_...
EMAIL_FROM="He Thong PPE <no-reply@tenmiencuaban.com>"
HSE_NOTIFY_EMAIL="hse@tenmiencuaban.com"
APP_BASE_URL="http://localhost:3000"
```

### 4. Khởi chạy
Cài đặt thư viện và chạy server nội bộ:

```bash
npm install
npm run dev
```
Mở trình duyệt ở địa chỉ `http://localhost:3000` để sử dụng ứng dụng.

---

## 🌍 Triển khai lên Vercel (Production)

1. Đẩy mã nguồn (Push code) của thư mục này lên một repo GitHub.
2. Vào [Vercel](https://vercel.com/) và tiến hành Import GitHub Project của bạn.
3. Trong bước cấu hình (Configuration), hãy mở phần **Environment Variables**.
4. Thêm toàn bộ các biến tương tự trong file `.env.local` của bạn. **Lưu ý**: Sửa giá trị `APP_BASE_URL` thành tên miền thật trên Vercel của bạn (ví dụ: `https://my-ppe.vercel.app`).
5. Bấm **Deploy**.

Nhờ sử dụng Supabase (cơ sở dữ liệu đám mây độc lập), toàn bộ dữ liệu hệ thống sẽ được lưu trữ an toàn mà không bị mất đi trên môi trường Serverless của Vercel. Chúc bạn sử dụng tiện lợi và quản lý kho thiết bị cấp hiệu quả!
