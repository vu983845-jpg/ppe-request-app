-- Nâng cấp quyền RLS (Row-Level Security) cho Trưởng Bộ Phận
-- Hiện tại Trưởng bộ phận bị dính RLS giới hạn chỉ được xem và duyệt đơn của phòng ban mình.
-- Kịch bản này sẽ cấp quyền mở rộng cho DEPT_HEAD được xem và cập nhật toàn bộ đơn của nhà máy.

-- 1. Xóa Policy cũ giới hạn phòng ban
DROP POLICY IF EXISTS "DEPT HEAD can view own dept requests" ON public.ppe_requests;
DROP POLICY IF EXISTS "DEPT HEAD can update own dept requests" ON public.ppe_requests;

-- 2. Tạo Policy mới mở rộng quyền truy cập
-- Bất kì ai là DEPT_HEAD đều được quyền SELECT (xem) tất cả các đơn
CREATE POLICY "DEPT HEAD can view all requests" ON public.ppe_requests FOR SELECT 
USING (get_current_user_role() = 'DEPT_HEAD');

-- Bất kì ai là DEPT_HEAD đều được quyền UPDATE (duyệt/từ chối) tất cả các đơn
CREATE POLICY "DEPT HEAD can update all requests" ON public.ppe_requests FOR UPDATE 
USING (get_current_user_role() = 'DEPT_HEAD');
