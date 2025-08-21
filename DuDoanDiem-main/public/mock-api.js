// =======================
// Mock Signup
// =======================
async function mockSignup(user, pass) {
    const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user, password: pass })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    const data = await res.json();
    return data;
}

// =======================
// Mock Login
// =======================
async function mockLogin(user, pass) {
    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user, password: pass })
    });
    if (!res.ok) throw new Error((await res.json()).message);
    const data = await res.json();

    // 🟢 Lưu thông tin user vào localStorage để dùng cho trang sau
    localStorage.setItem("currentUser", JSON.stringify({
        student_id: user,
        token: data.token || null   // nếu backend có trả token thì lưu
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
