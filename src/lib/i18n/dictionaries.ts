export const dictionaries = {
    en: {
        common: {
            loading: "Loading...",
            save: "Save",
            cancel: "Cancel",
            submit: "Submit Request",
            approve: "Approve",
            reject: "Reject",
            actions: "Actions",
            status: "Status",
            date: "Date",
            signOut: "Sign Out",
            required: "Required",
            optional: "Optional"
        },
        index: {
            title: "Manufacturing PPE Management",
            subtitle: "Request Personal Protective Equipment quickly, or log in to manage approvals and inventory.",
            requestBtn: "Request PPE",
            loginBtn: "Staff Login"
        },
        login: {
            title: "Staff Login",
            subtitle: "Enter your email below to login.",
            emailLabel: "Email Address",
            emailPlaceholder: "name@intersnack.com.vn",
            passwordLabel: "Password",
            loginBtn: "Login",
            loggingIn: "Logging in...",
            success: "Login successful! Redirecting...",
            error: "Login failed."
        },
        requestForm: {
            title: "PPE Request Form",
            subtitle: "Fill out this public form to request PPE. No login required.",
            detailsTitle: "Request Details",
            detailsSubtitle: "All fields with * are required.",
            fullName: "Full Name",
            empCode: "Employee Code",
            email: "Email",
            location: "Location / Line / Area",
            dept: "Department",
            selectDept: "Select a department",
            ppeItem: "PPE Item",
            selectItem: "Select an item",
            qty: "Quantity",
            reason: "Reason / Note",
            reasonPlaceholder: "Please specify why you need this item...",
            attachment: "Attachment",
            attachmentDesc: "Upload any supporting document",
            submitting: "Submitting...",
            success: "Your request has been submitted successfully!",
            error: "Failed to submit request."
        },
        deptHead: {
            title: "Department Dashboard",
            subtitle: "Review PPE requests from your department.",
            pendingTitle: "Pending Approvals",
            table: {
                date: "Date",
                requester: "Requester",
                item: "Item",
                qty: "Qty",
                status: "Status",
                actions: "Actions"
            },
            rejectDialogTitle: "Reject Request",
            rejectDialogPlaceholder: "Provide a reason for rejection (required)...",
            rejectConfirmBtn: "Confirm Reject",
            noRequests: "No pending requests."
        },
        hse: {
            title: "HSE Dashboard",
            subtitle: "Manage PPE Issuance and view safety stock.",
            pendingTitle: "Requests Needing Attention",
            inventoryTitle: "Inventory Overview",
            table: {
                deptDate: "Dept / Date",
                requester: "Requester",
                item: "Item",
                qty: "Qty",
                stockWarning: "Stock / Warning",
                stock: "Stock",
                insufficient: "Insufficient",
                status: "Status",
                actions: "Actions"
            },
            inventoryTable: {
                itemName: "Item Name",
                category: "Category",
                unit: "Unit",
                price: "Price",
                minStock: "Min Stock",
                currStock: "Current Stock",
                noItems: "No inventory items found."
            },
            historyTitle: "Monthly Issuance History",
            historyTable: {
                month: "Month",
                item: "Item",
                dept: "Department",
                qty: "Qty Issued",
                cost: "Total Cost",
                noHistory: "No issuance history found."
            },
            issueBtn: "Issue",
            rejectDialogTitle: "Reject HSE Request",
            noRequests: "No requests pending HSE approval."
        },
        admin: {
            title: "System Admin Dashboard",
            subtitle: "Overview of costs, requests, and budget.",
            metrics: {
                yearlyBudget: "Yearly Budget",
                spent: "Total Spent",
                remaining: "Remaining",
                totalRequests: "Total Requests",
                pending: "Pending",
                issued: "Issued",
                rejected: "Rejected",
                thisMonthRequests: "This Month Requests",
                thisMonthCost: "This Month Cost",
                budgetUsed: "Budget Used",
                lowStockAlerts: "Low Stock Alerts",
                lowStockItems: "Low Stock Items",
                allStocked: "All items are sufficiently stocked.",
                min: "Min",
                stock: "Stock"
            },
            exportBtn: "Export to Excel"
        }
    },
    vi: {
        common: {
            loading: "Đang tải...",
            save: "Lưu",
            cancel: "Hủy",
            submit: "Gửi Yêu Cầu",
            approve: "Duyệt",
            reject: "Từ Chối",
            actions: "Thao Tác",
            status: "Trạng Thái",
            date: "Ngày",
            signOut: "Đăng Xuất",
            required: "Bắt buộc",
            optional: "Tùy chọn"
        },
        index: {
            title: "Quản Lý Đồ Bảo Hộ Intersnack",
            subtitle: "Đăng ký nhận trang thiết bị bảo hộ lao động (PPE) nhanh chóng, hoặc đăng nhập để quản lý phê duyệt và kho.",
            requestBtn: "Đăng Ký PPE",
            loginBtn: "Nhân Viên Đăng Nhập"
        },
        login: {
            title: "Đăng Nhập Lãnh Đạo",
            subtitle: "Nhập email của bạn để truy cập hệ thống.",
            emailLabel: "Địa chỉ Email",
            emailPlaceholder: "name@intersnack.com.vn",
            passwordLabel: "Mật khẩu",
            loginBtn: "Đăng Nhập",
            loggingIn: "Đang xử lý...",
            success: "Đăng nhập thành công! Đang chuyển hướng...",
            error: "Đăng nhập thất bại."
        },
        requestForm: {
            title: "Biểu Mẫu Yêu Cầu PPE",
            subtitle: "Điền vào biểu mẫu này để đăng ký nhận đồ bảo hộ. Không cần đăng nhập.",
            detailsTitle: "Chi Tiết Yêu Cầu",
            detailsSubtitle: "Các trường có dấu * là bắt buộc.",
            fullName: "Họ và Tên",
            empCode: "Mã Nhân Viên",
            email: "Email (Nhận thông báo)",
            location: "Vị Trí / Chuyền / Khu Vực",
            dept: "Phòng Ban",
            selectDept: "Chọn phòng ban",
            ppeItem: "Vật Dụng PPE",
            selectItem: "Chọn một thiết bị",
            qty: "Số lượng",
            reason: "Lý Do / Ghi Chú",
            reasonPlaceholder: "Vui lòng ghi rõ lý do bạn cần vật dụng này...",
            attachment: "Đính Kèm Dẫn Chứng",
            attachmentDesc: "Tải lên tài liệu chứng minh nếu có",
            submitting: "Đang Gửi...",
            success: "Bạn đã gửi yêu cầu thành công!",
            error: "Gửi yêu cầu thất bại."
        },
        deptHead: {
            title: "Quản Lý Bộ Phận",
            subtitle: "Xét duyệt các yêu cầu PPE từ nhân viên trong bộ phận/chuyền của bạn.",
            pendingTitle: "Yêu Cầu Chờ Duyệt",
            table: {
                date: "Ngày tạo",
                requester: "Người xin",
                item: "Vật dụng",
                qty: "S.L",
                status: "Trạng thái",
                actions: "Thao tác"
            },
            rejectDialogTitle: "Từ Chối Yêu Cầu",
            rejectDialogPlaceholder: "Nhập lý do từ chối để báo cho nhân viên (Bắt buộc)...",
            rejectConfirmBtn: "Xác Nhận Từ Chối",
            noRequests: "Hiện không có yêu cầu nào chờ duyệt."
        },
        hse: {
            title: "Bảng Điều Khiển HSE",
            subtitle: "Quản lý cấp phát đồ bảo hộ và theo dõi tồn kho an toàn.",
            pendingTitle: "Yêu Cầu Đợi Cấp Phát",
            inventoryTitle: "Tổng Quan Kho Chứa",
            table: {
                deptDate: "Bộ Phận / Ngày",
                requester: "Người nhận",
                item: "Vật dụng",
                qty: "S.L",
                stockWarning: "Tồn Kho / Cảnh Báo",
                stock: "Tồn",
                insufficient: "Không Đủ Hàng",
                status: "Trạng Thái",
                actions: "Thao Tác"
            },
            inventoryTable: {
                itemName: "Tên Vật Phẩm",
                category: "Danh Mục",
                unit: "Đơn vị",
                price: "Đơn giá",
                minStock: "Ngưỡng An Toàn",
                currStock: "Tồn Kho Hiện Tại",
                noItems: "Không tìm thấy vật phẩm trong kho."
            },
            historyTitle: "Lịch Sử Cấp Phát Theo Tháng",
            historyTable: {
                month: "Tháng",
                item: "Vật Phẩm",
                dept: "Bộ Phận",
                qty: "S.L Cấp Phát",
                cost: "Tổng Chi Phí",
                noHistory: "Chưa có dữ liệu cấp phát."
            },
            issueBtn: "Cấp Phát",
            rejectDialogTitle: "HSE Từ Chối Cấp Phát",
            noRequests: "Không có yêu cầu nào đang chờ HSE."
        },
        admin: {
            title: "Bảng Điều Khiển Quản Trị Hệ Thống",
            subtitle: "Tổng quan về chi phí, yêu cầu và ngân sách.",
            metrics: {
                yearlyBudget: "Ngân Sách Năm",
                spent: "Đã Chi Tiêu",
                remaining: "Còn Lại",
                totalRequests: "Tổng Yêu Cầu",
                pending: "Đang Chờ",
                issued: "Đã Cấp Phát",
                rejected: "Đã Từ Chối",
                thisMonthRequests: "Yêu Cầu Tháng Này",
                thisMonthCost: "Chi Phí Tháng Này",
                budgetUsed: "Ngân Sách Đã Dùng",
                lowStockAlerts: "Cảnh Báo Tồn Kho",
                lowStockItems: "Vật Phẩm Sắp Hết",
                allStocked: "Tất cả vật phẩm đều còn đủ.",
                min: "Ngưỡng",
                stock: "Tồn"
            },
            exportBtn: "Xuất file Excel"
        }
    }
}

export type Locale = keyof typeof dictionaries
export type TranslationDict = typeof dictionaries.en 
