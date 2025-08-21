// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const { spawn } = require('child_process'); // <== thêm để gọi Python

dotenv.config({ override: true }); // Load .env

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh
app.use(express.static(path.join(__dirname, '../public')));

// Kết nối database
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false } // cần cho Render
});

// Test kết nối DB
async function testDB() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    console.log(`✅ DB kết nối OK, giờ hiện tại: ${res.rows[0].now}`);
    client.release();
  } catch (err) {
    console.error('❌ KHÔNG CONNECT ĐƯỢC DB:', err.message);
  }
}
testDB();

// ================== API Đăng ký ==================
app.post('/signup', async (req, res) => {
  const { student_id, password } = req.body;

  if (!student_id || !password) {
    return res.status(400).json({ message: 'Thiếu thông tin' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO students (student_id, password) VALUES ($1, $2) RETURNING *',
      [student_id, hashedPassword]
    );

    res.json({ message: 'Đăng ký thành công', user: result.rows[0] });
  } catch (err) {
    console.error("Lỗi khi đăng ký:", err);

    if (err.code === '23505') {
      return res.status(400).json({ message: 'Tên đã tồn tại' });
    }

    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// ================== API Đăng nhập ==================
app.post('/login', async (req, res) => {
  const { student_id, password } = req.body;

  if (!student_id || !password) {
    return res.status(400).json({ message: 'Thiếu thông tin' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM students WHERE student_id = $1',
      [student_id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Sai mã sinh viên hoặc mật khẩu' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: 'Sai mã sinh viên hoặc mật khẩu' });
    }

    res.json({ message: 'Đăng nhập thành công', user: { student_id: user.student_id } });
  } catch (err) {
    console.error("❌ Lỗi khi đăng nhập:", err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ================== API Lưu dự đoán (cơ sở dữ liệu) ==================
app.post('/predict', async (req, res) => {
  try {
    const { student_id, subject, score } = req.body;

    if (!student_id || !subject || score === undefined) {
      return res.status(400).json({ error: 'Thiếu dữ liệu' });
    }

    const query = `
      INSERT INTO predict_history(student_id, subject, score)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [student_id, subject, score]);

    res.json({ message: 'Lưu dự đoán thành công', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// ================== API Lấy lịch sử dự đoán ==================
app.get('/history/:student_id', async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM predict_history WHERE student_id = $1 ORDER BY time DESC',
      [student_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy lịch sử:", err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});


// ================== ML: API Huấn luyện model ==================
app.get('/train', (req, res) => {
  const python = spawn("python", ["train_model.py"]);

  python.stdout.on("data", (data) => {
    console.log(`📢 train stdout: ${data}`);
  });

  python.stderr.on("data", (data) => {
    console.error(`❌ train stderr: ${data}`);
  });

  python.on("close", (code) => {
    if (code === 0) {
      res.json({ success: true, message: "✅ Huấn luyện xong, đã lưu model.pkl" });
    } else {
      res.status(500).json({ success: false, message: "❌ Lỗi khi huấn luyện mô hình" });
    }
  });
});

// ================== ML: API Dự đoán bằng model.pkl ==================
app.post('/ml-predict', (req, res) => {
  const python = spawn("python", ["predict.py"]);

  let result = "";
  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error(`❌ ml-predict stderr: ${data}`);
  });

  python.on("close", (code) => {
    try {
      res.json(JSON.parse(result));
    } catch (e) {
      res.status(500).json({ success: false, error: "❌ Lỗi khi parse kết quả từ Python" });
    }
  });

  // Gửi dữ liệu JSON từ frontend sang Python
  python.stdin.write(JSON.stringify(req.body));
  python.stdin.end();
});

// ================== Chạy server ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});
