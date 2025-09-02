const API_BASE = "https://dudoandiem-1.onrender.com"; // thay bằng domain backend

// =======================
// Mock Signup
// =======================
async function mockSignup(user, pass) {
    const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user, password: pass })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi đăng ký");
    }

    return await res.json();
}

// =======================
// Mock Login
// =======================
async function mockLogin(user, pass) {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user, password: pass })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi đăng nhập");
    }

    const data = await res.json();

    // 🟢 Lưu user vào localStorage
    localStorage.setItem("currentUser", JSON.stringify({
        student_id: user,
        token: data.token || null
    }));

    return data;
}

// =======================
// Lấy user hiện tại
// =======================
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

// =======================
// Logout
// =======================
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

// =======================
// SUBJECTS API
// =======================

// Thêm môn học
async function addSubject(tenMon, khoiKienThuc) {
    const res = await fetch(`${API_BASE}/api/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ten_mon: tenMon,
            khoi_kien_thuc: khoiKienThuc
        })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi thêm môn học");
    }

    return await res.json();
}

// Lấy danh sách môn học
async function getSubjects() {
    const res = await fetch(`${API_BASE}/api/subjects`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi lấy danh sách môn học");
    }

    return await res.json();
}

// Xoá môn học (nếu cần)
async function deleteSubject(id) {
    const res = await fetch(`${API_BASE}/api/subjects/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi xóa môn học");
    }

    return await res.json();
}
