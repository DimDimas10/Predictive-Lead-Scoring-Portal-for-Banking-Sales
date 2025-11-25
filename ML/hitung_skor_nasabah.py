import os
import psycopg2
import pandas as pd
from datetime import datetime
import joblib  
from psycopg2.extras import execute_values

# Koneksi ke DB
conn = psycopg2.connect(
    host="127.0.0.1",
    port=5432,
    user="postgres",
    password="",
    database="",
)

# 2. Ambil data nasabah yang mau diprediksi
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

# 3. Pisahkan ID dan fitur
nasabah_ids = df["nasabah_id"]
X = df.drop(columns=["nasabah_id"])

# 4. Load model pipeline 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "SVM_RBF_model.pkl")

model = joblib.load(MODEL_PATH)

# 5. Prediksi probabilitas 
proba = model.predict_proba(X)[:, 1]  # ambil kolom probabilitas positive class

# 6. Siapkan data untuk insert ke DB
model_version = "SVM_RBF"  
now = datetime.now()

rows_to_insert = []
for nasabah_id, p in zip(nasabah_ids, proba):
    rows_to_insert.append((
        nasabah_id,
        float(p),
        now,
        model_version,
    ))

# 7. Insert ke tabel hasil_perhitungan_probabilitas
insert_query = """
    INSERT INTO hasil_perhitungan_probabilitas (
        nasabah_id,
        predicted_score,
        calculation_date,
        model_version
    )
    VALUES %s;
"""

with conn:
    with conn.cursor() as cur:
        execute_values(cur, insert_query, rows_to_insert)

conn.close()

print(f"Berhasil menyimpan {len(rows_to_insert)} skor prediksi ke tabel hasil_perhitungan_probabilitas.")
