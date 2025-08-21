import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import joblib

print("📂 Đang đọc dataset.csv ...")
data = pd.read_csv("dataset.csv")

# Tách input và output
X = data.drop("diem", axis=1)
y = data["diem"]

# Cột phân loại (categorical)
categorical_cols = ["mon_hoc", "so_buoi_di_hoc", "muc_do_tap_trung", "muc_do_tiep_nhan", "muc_do_tu_hoc"]

# Cột số (numeric)
numeric_cols = ["diem_dau_gio", "diem_ky_nang"]

# Tiền xử lý
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("num", "passthrough", numeric_cols),
    ]
)

# Pipeline huấn luyện
model = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(n_estimators=200, random_state=42))
])

print("🚀 Đang huấn luyện mô hình ...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model.fit(X_train, y_train)

# Dự đoán và đánh giá
y_pred = model.predict(X_test)

mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)

print(f"✅ Huấn luyện xong! RMSE = {rmse:.2f}")

# Lưu mô hình và thông tin cột
joblib.dump(model, "model.pkl")
with open("model_columns.txt", "w", encoding="utf-8") as f:
    for col in categorical_cols + numeric_cols:
        f.write(col + "\n")

print("📂 Đã lưu model.pkl và model_columns.txt")
