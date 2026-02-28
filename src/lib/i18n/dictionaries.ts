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
            title: "PPE Management System",
            subtitle: "A centralized portal to request, approve, and manage Personal Protective Equipment inventory.",
            requestBtn: "Request PPE",
            trackBtn: "Track Request",
            loginBtn: "System Login",
            timeline: {
                title: "How It Works",
                step1: { title: "Submit Request", desc: "Fill out the form" },
                step2: { title: "Dept Approval", desc: "Manager reviews" },
                step3: { title: "HSE Review", desc: "Stock check & approval" },
                step4: { title: "Receive Item", desc: "Collect your PPE" }
            }
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
            email: "Zalo Phone Number",
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
            error: "Failed to submit request.",
            addItem: "+ Add Another Item",
            removeItem: "Remove Item",
            minOneItem: "You must request at least one item.",
            captchaPrompt: "To prevent spam, please solve:",
            captchaError: "Incorrect answer.",
            confirmTitle: "Confirm Your Request",
            confirmSubtitle: "Please review the details below before submitting.",
            goBackBtn: "Go Back & Edit",
            confirmBtn: "Confirm & Submit",
            requestedItems: "Items Requested:",
            typeNormal: "Normal Request",
            typeLostBroken: "Lost / Broken Report",
            incidentDesc: "Event Description",
            incidentDescPlaceholder: "Explain the event that caused it to be lost or broken...",
            incidentDate: "Date of Event",
            acceptCompensation: "I confirm the above information is accurate and accept responsibility for compensation or payroll deduction for the replacement cost.",
            mustAcceptCompensation: "You must accept responsibility to proceed with a replacement request.",
            lostBrokenAlert: {
                title: "Important Notice",
                desc: "For Lost/Broken reports, please provide accurate details. Per company policy, replacement costs may be subject to payroll deduction after review."
            }
        },
        tracking: {
            title: "Request Tracking",
            subtitle: "Enter your Employee Code to track your PPE requests and history.",
            welcome: "Welcome, {name}",
            searchBtn: "Search",
            searching: "Searching...",
            empCode: "Employee Code",
            empCodePlaceholder: "e.g. EMP123",
            captchaPrompt: "To prevent spam, please solve:",
            captchaError: "Incorrect answer.",
            myRequests: "My Recent Requests",
            history: "Issuance History",
            table: {
                date: "Date",
                requester: "Requester",
                dept: "Dept",
                item: "Item",
                qty: "Qty",
                status: "Status"
            },
            historyTable: {
                date: "Issued Date",
                item: "Item",
                qty: "Qty",
                cost: "Total Cost"
            },
            noRequests: "No requests found for this code.",
            confirmReceiptBtn: "Confirm Receipt",
            confirmSuccess: "Receipt confirmed successfully!",
            statusMap: {
                PENDING_DEPT: "Dept Pending",
                PENDING_HSE: "HSE Pending",
                PENDING_PLANT_MANAGER: "PM Pending",
                PENDING_HR: "HR Pending",
                READY_FOR_PICKUP: "Ready for Pickup",
                COMPLETED: "Completed",
                APPROVED_ISSUED: "Issued",
                REJECTED_BY_DEPT: "Dept Rejected",
                REJECTED_BY_HSE: "HSE Rejected",
                REJECTED_BY_PLANT_MANAGER: "PM Rejected",
                REJECTED_BY_HR: "HR Rejected"
            }
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
                noItems: "No inventory items found.",
                addStockBtn: "+ Add Stock",
                addStockTitle: "Add Stock (Inward)",
                addStockQty: "Quantity to Add",
                addStockPrice: "Unit Price (Total recalculates automatically)",
                addStockNote: "Remark / Note (Quality, Delivery, Supplier, ...)",
                addStockConfirm: "Confirm Purchase",
                addStockSuccess: "Stock added successfully!"
            },
            tabs: {
                approvals: "Approvals",
                inventory: "Inventory",
                analytics: "Analytics & History",
                budgets: "Budgets & Costs"
            },
            historyTitle: "Monthly & Yearly Analytics",
            chartTitle: "Yearly Overview (In vs Out)",
            historyTable: {
                selectMonth: "Select Month",
                entireYear: "Entire Year Overview",
                item: "Item",
                unit: "Unit",
                openBal: "Opening Balance",
                in: "IN (Purchased)",
                out: "OUT (Issued)",
                closeBal: "Closing Balance",
                noHistory: "No data available."
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
        },
        plantManager: {
            title: "Plant Manager Dashboard",
            subtitle: "Review incidents and approve lost/broken PPE replacements.",
            pendingTitle: "Lost/Broken PPE Requests Pending Your Approval",
            noRequests: "No requests pending your approval."
        },
        hr: {
            title: "HR Dashboard",
            subtitle: "Review and approve payroll deductions for lost/broken PPE.",
            pendingTitle: "Lost/Broken PPE Requests Pending Deduction Approval",
            noRequests: "No requests pending HR approval."
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
            title: "Hệ Thống Quản Lý BHLĐ Intersnack",
            subtitle: "Cổng thông tin điện tử hỗ trợ yêu cầu, phê duyệt và quản trị tồn kho Thiết bị Bảo hộ Cá nhân (PPE).",
            requestBtn: "Tạo Yêu Cầu Cấp Phát",
            trackBtn: "Tra Cứu Tình Trạng",
            loginBtn: "Đăng Nhập Hệ Thống",
            timeline: {
                title: "Quy Trình 4 Bước",
                step1: { title: "Gửi Yêu Cầu", desc: "Điền đầy đủ form" },
                step2: { title: "Trưởng BP Duyệt", desc: "Quản lý xem xét" },
                step3: { title: "HSE Duyệt", desc: "Kiểm kho & cấp phát" },
                step4: { title: "Nhận Thiết Bị", desc: "Ký nhận trên hệ thống" }
            }
        },
        login: {
            title: "Đăng Nhập Hệ Thống",
            subtitle: "Nhập email của bạn để truy cập hệ thống quản lý.",
            emailLabel: "Địa chỉ Email",
            emailPlaceholder: "name@intersnack.com.vn",
            passwordLabel: "Mật khẩu",
            loginBtn: "Đăng Nhập",
            loggingIn: "Hệ thống đang xử lý...",
            success: "Đăng nhập thành công! Đang chuyển trang...",
            error: "Tài khoản hoặc mật khẩu chưa chính xác."
        },
        requestForm: {
            title: "Yêu Cầu Cấp Phát Thiết Bị Bảo Hộ",
            subtitle: "Điền đầy đủ các thông tin chuyên môn vào biểu mẫu dưới đây để hệ thống ghi nhận.",
            detailsTitle: "Chi Tiết Yêu Cầu",
            detailsSubtitle: "Vui lòng cung cấp đầy đủ thông tin vào các trường đánh dấu (*).",
            fullName: "Họ và Tên",
            empCode: "Mã Nhân Viên",
            email: "SĐT Zalo (Để nhận thông báo)",
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
            submitting: "Hệ Thống Đang Xử Lý...",
            success: "Tuyệt vời, đơn cấp phát của bạn đã được ghi nhận thành công!",
            error: "Không thể xử lý yêu cầu lúc này.",
            addItem: "+ Thêm Loại Đồ Bảo Hộ Khác",
            removeItem: "Loại Bỏ",
            minOneItem: "Bạn cần cung cấp ít nhất một vật dụng để tạo đơn.",
            captchaPrompt: "Xác thực chống tự động, vui lòng nhập kết quả phép tính:",
            captchaError: "Kết quả toán học không chính xác, vui lòng thử lại.",
            confirmTitle: "Xác Nhận Yêu Cầu Cấp Phát",
            confirmSubtitle: "Vui lòng rà soát lại thông tin chi tiết trước khi xác nhận gửi lên hệ thống.",
            goBackBtn: "Chỉnh Sửa Lại Thông Tin",
            confirmBtn: "Gửi Đơn Xin Cấp Phát",
            requestedItems: "Danh mục đồ bảo hộ đã chọn:",
            typeNormal: "Yêu cầu cấp phát mới",
            typeLostBroken: "Báo cáo Mất / Hỏng (Cấp lại)",
            incidentDesc: "Mô tả sự việc",
            incidentDescPlaceholder: "Trình bày sự việc dẫn đến làm mất hoặc hỏng thiết bị...",
            incidentDate: "Thời điểm xảy ra sự việc",
            acceptCompensation: "Tôi xác nhận thông tin trên là chính xác và chấp nhận trách nhiệm bồi thường/trừ lương đối với chi phí cấp lại trang thiết bị này.",
            mustAcceptCompensation: "Bạn buộc phải đánh dấu đồng ý bồi thường để tiếp tục yêu cầu cấp lại.",
            lostBrokenAlert: {
                title: "Lưu ý quan trọng",
                desc: "Đối với Báo Cáo Mất/Hỏng, bạn vui lòng khai báo trung thực. Mọi chi phí cấp lại có thể được xem xét khấu trừ vào lương theo quy định hiện hành của công ty."
            }
        },
        tracking: {
            title: "Hệ Thống Tra Cứu Yêu Cầu",
            subtitle: "Vui lòng cung cấp Mã Nhân Viên để theo dõi tiến độ xử lý và lịch sử nhận thiết bị.",
            welcome: "Xin chào, {name}",
            searchBtn: "Tra Cứu",
            searching: "Đang tra cứu dữ liệu...",
            empCode: "Mã Nhân Viên",
            empCodePlaceholder: "Ví dụ: EMP123",
            captchaPrompt: "Xác thực chống tự động, vui lòng nhập kết quả phép tính:",
            captchaError: "Kết quả toán học không chính xác, vui lòng thử lại.",
            myRequests: "Danh Sách Yêu Cầu Đang Xử Lý",
            history: "Lịch Sử Cấp Phát Thiết Bị",
            table: {
                date: "Ngày tạo",
                requester: "Người yêu cầu",
                dept: "Phòng/Ban",
                item: "Trang thiết bị",
                qty: "Số lượng",
                status: "Tình trạng"
            },
            historyTable: {
                date: "Ngày Cấp",
                item: "Vật Phẩm",
                qty: "S.L",
                cost: "Tổng Chi Phí"
            },
            noRequests: "Hệ thống không tìm thấy dữ liệu khớp với Mã Nhân Viên cung cấp.",
            confirmReceiptBtn: "Xác nhận đã nhận",
            confirmSuccess: "Đã xác nhận nhận hàng thành công!",
            statusMap: {
                PENDING_DEPT: "Chờ BP Duyệt",
                PENDING_HSE: "Chờ HSE Duyệt",
                PENDING_PLANT_MANAGER: "Chờ GĐ Nhà Máy",
                PENDING_HR: "Chờ HR Duyệt",
                READY_FOR_PICKUP: "Chờ Bạn Xác Nhận",
                COMPLETED: "Hoàn Tất",
                APPROVED_ISSUED: "Đã Cấp Phát",
                REJECTED_BY_DEPT: "BP Từ Chối",
                REJECTED_BY_HSE: "HSE Từ Chối",
                REJECTED_BY_PLANT_MANAGER: "GĐ Từ Chối",
                REJECTED_BY_HR: "HR Từ Chối"
            }
        },
        deptHead: {
            title: "Quản Trị Kênh Bộ Phận",
            subtitle: "Phê duyệt các yêu cầu cấp phát thiết bị từ nhân sự trực thuộc bộ phận/chuyền sản xuất.",
            pendingTitle: "Danh Sách Yêu Cầu Chờ Phê Duyệt",
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
                noItems: "Không tìm thấy vật phẩm trong kho.",
                addStockBtn: "+ Nhập Kho",
                addStockTitle: "Nhập Thêm Hàng (Stock In)",
                addStockQty: "Số lượng nhập thêm",
                addStockPrice: "Đơn giá nhập",
                addStockNote: "Ghi chú / Remark (Chất lượng, Giao hàng, NCC,...)",
                addStockConfirm: "Xác Nhận Nhập",
                addStockSuccess: "Nhập kho thành công!"
            },
            tabs: {
                approvals: "Phê Duyệt",
                inventory: "Kho Chứa",
                analytics: "Phân Tích & Lịch Sử",
                budgets: "Ngân Sách & Chi Phí"
            },
            historyTitle: "Báo Cáo Nhập Xuất Tồn & Lịch Sử",
            chartTitle: "Biểu Đồ Tổng Quan Cả Năm",
            historyTable: {
                selectMonth: "Chọn Tháng",
                entireYear: "Tổng Quan Cả Năm",
                item: "Vật Phẩm",
                unit: "Đơn vị",
                openBal: "Tồn Đầu Kỳ",
                in: "Nhập Trong Kỳ",
                out: "Xuất Trong Kỳ",
                closeBal: "Tồn Cuối Kỳ",
                noHistory: "Không có dữ liệu."
            },
            issueBtn: "Cấp Phát",
            rejectDialogTitle: "HSE Từ Chối Cấp Phát",
            noRequests: "Không có yêu cầu nào đang chờ HSE."
        },
        admin: {
            title: "Bảng Điều Khiển Quản Trị Hệ Thống",
            subtitle: "Báo cáo tổng quan về chi phí vận hành, tình trạng yêu cầu và ngân sách toàn nhà máy.",
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
        },
        plantManager: {
            title: "Bảng điều khiển Giám đốc Nhà máy",
            subtitle: "Xem xét báo cáo sự cố và phê duyệt cấp lại PPE mất/hỏng.",
            pendingTitle: "Yêu cầu cấp lại PPE Mất/Hỏng chờ phê duyệt",
            noRequests: "Không có yêu cầu nào chờ phê duyệt."
        },
        hr: {
            title: "Bảng điều khiển Hành chính Nhân sự",
            subtitle: "Xem xét và phê duyệt trừ lương đối với PPE mất/hỏng.",
            pendingTitle: "Yêu cầu cấp lại PPE Mất/Hỏng chờ phê duyệt trừ lương",
            noRequests: "Không có yêu cầu nào chờ HR phê duyệt."
        }
    }
}

export type Locale = keyof typeof dictionaries
export type TranslationDict = typeof dictionaries.en 
