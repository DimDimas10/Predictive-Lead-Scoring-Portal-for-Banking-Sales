import os
import psycopg2
import pandas as pd
from datetime import datetime
import joblib
from psycopg2.extras import execute_values

# ============================
# 1. KONEKSI DATABASE
# ============================
conn = psycopg2.connect(
    host="127.0.0.1",
    port=5432,
    user="postgres",
    password="dimasgundar10",
    database="predictive_bank",
)

# ============================
# 2. AMBIL DATA NASABAH
# ============================
query = """
    SELECT
        nasabah_id,
        user_id,
        name,
        age,
        job,
        marital,
        education,
        balance,
        phone,
        email,
        housing,
        loan,
        status,
        notes,
        contacted_at,
        "default",
        contact,
        month,
        day_of_week,
        duration,
        campaign,
        pdays,
        previous,
        poutcome,
        "emp.var.rate",
        "cons.price.idx",
        "cons.conf.idx",
        euribor3m,
        "nr.employed"
    FROM nasabah;
"""

df = pd.read_sql(query, conn)

# ============================
# 3. PERSIAPKAN DATA FITUR (CLEANING)
# ============================

# Simpan ID
nasabah_ids = df["nasabah_id"]

# menghapus kolom yang TIDAK digunakan model
drop_cols = [
    "nasabah_id",
    "user_id",
    "name",
    "phone",
    "email",
    "status",
    "notes",
    "contacted_at",
    "duration"
]

X = df.drop(columns=[c for c in drop_cols if c in df.columns])

# ============================
# 4. FEATURE ENGINEERING 
# ============================

# Kolom tambahan: was_prev_contacted
X["was_prev_contacted"] = X["pdays"].apply(lambda x: 0 if x == 999 else 1)

# Kolom tambahan: age_bin
X["age_bin"] = pd.cut(
    X["age"],
    bins=[17, 25, 35, 45, 55, 65, 100],
    labels=False
)

# ============================
# 5. LOAD MODEL JOBLIB
# ============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "GradientBoosting.joblib")

model = joblib.load(MODEL_PATH)

# ============================
# 6. PREDIKSI PROBABILITAS
# ============================
proba = model.predict_proba(X)[:, 1]

# ============================
# 7. PERSIAPKAN DATA UNTUK INSERT
# ============================
model_version = "GradientBoosting_v1"
now = datetime.now()

rows_to_insert = [
    (nasabah_id, float(p), now, model_version)
    for nasabah_id, p in zip(nasabah_ids, proba)
]

insert_query = """
    INSERT INTO hasil_perhitungan_probabilitas (
        nasabah_id,
        predicted_score,
        calculation_date,
        model_version
    )
    VALUES %s;
"""

# ============================
# 8. INSERT KE DATABASE
# ============================
with conn:
    with conn.cursor() as cur:
        execute_values(cur, insert_query, rows_to_insert)

conn.close()

print(f"Berhasil menyimpan {len(rows_to_insert)} skor prediksi ke tabel hasil_perhitungan_probabilitas.")
