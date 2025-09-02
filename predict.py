import joblib
import pandas as pd

# Load model đã train
model = joblib.load("model.pkl")

# Nhập dữ liệu từ người dùng
mon_hoc = input("Nhập môn học: ")
diem_dau_gio = float(input("Nhập điểm đầu giờ (0-10): "))
diem_ky_nang = float(input("Nhập điểm kỹ năng (0-10): "))
so_buoi_di_hoc = input("Nhập số buổi đi học (đủ / vắng 1 / vắng 2 / vắng 3): ")
muc_do_tap_trung = input("Nhập mức độ tập trung (0-20% / 21-40% / 41-60% / 61-80% / 81-100%): ")
muc_do_tiep_nhan = input("Nhập mức độ tiếp nhận (0-20% / 21-40% / 41-60% / 61-80% / 81-100%): ")
muc_do_tu_hoc = input("Nhập mức độ tự học (<1h / <3h / >3h): ")

# Tạo dataframe 1 dòng dữ liệu mới
new_data = pd.DataFrame([{
    "mon_hoc": mon_hoc,
    "diem_dau_gio": diem_dau_gio,
    "diem_ky_nang": diem_ky_nang,
    "so_buoi_di_hoc": so_buoi_di_hoc,
    "muc_do_tap_trung": muc_do_tap_trung,
    "muc_do_tiep_nhan": muc_do_tiep_nhan,
    "muc_do_tu_hoc": muc_do_tu_hoc
}])

# Dự đoán
predicted_score = model.predict(new_data)[0]

print(f"\n📊 Điểm dự đoán cuối kỳ: {predicted_score:.2f}")
