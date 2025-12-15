from fastapi import FastAPI
import os
import psycopg2
import pandas as pd
from datetime import datetime
import joblib
from psycopg2.extras import execute_values
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="Predictive Lead Scoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# koneksi db
DB_CONFIG = {
    "host": "hopper.proxy.rlwy.net",
    "port": 56004,
    "user": "postgres",
    "password": "GVadVDXDiPZYJUuwrXmbTbkIcyDCSEQw",
    "database": "railway",
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "LightGBM_Smote.joblib")

# model = joblib.load(MODEL_PATH)
model = None    


@app.on_event("startup")
def load_model():
    global model
    model = joblib.load(MODEL_PATH)

def get_connection():
    return psycopg2.connect(**DB_CONFIG)


# Preprocessing sesuai data train
def prepare_features(df: pd.DataFrame):
    nasabah_ids = df["nasabah_id"]

    drop_cols = [
        "nasabah_id",
        "user_id",
        "name",
        "phone",
        "email",
        "status",
        "notes",
        "contacted_at",
        "duration",
    ]

    X = df.drop(columns=[c for c in drop_cols if c in df.columns])

    # Feature engineering
    X["was_prev_contacted"] = X["pdays"].apply(lambda x: 0 if x == 999 else 1)

    X["age_bin"] = pd.cut(
        X["age"],
        bins=[17, 25, 35, 45, 55, 65, 100],
        labels=False,
    )

    return nasabah_ids, X


# endpoint
@app.post("/leads/refresh-ml")
def predict_batch():
    conn = get_connection()

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

    nasabah_ids, X = prepare_features(df)

    proba = model.predict_proba(X)[:, 1]

    now = datetime.now()
    model_version = "LightGBM_SMOTE_v1"

    rows = [
        (nid, float(p), now, model_version)
        for nid, p in zip(nasabah_ids, proba)
    ]

    insert_query = """
        INSERT INTO hasil_perhitungan_probabilitas (
            nasabah_id,
            predicted_score,
            calculation_date,
            model_version
        )
        VALUES %s
        ON CONFLICT (nasabah_id)
        DO UPDATE SET
            predicted_score = EXCLUDED.predicted_score,
            calculation_date = EXCLUDED.calculation_date,
            model_version = EXCLUDED.model_version;
    """

    with conn:
        with conn.cursor() as cur:
            execute_values(cur, insert_query, rows)

    conn.close()

    return {
        "status": "success",
        "total_processed": len(rows),
        "model_version": model_version,
    }
