"""
CardioSense Flask API
---------------------
Serves the trained Gradient Boosting model (finalized_model.sav) for
predictions, AND now reads/writes all patient predictions to a MySQL
database (the same database you manage through phpMyAdmin).

Setup:
    1. Import schema.sql into your MySQL server (phpMyAdmin -> Import,
       or `mysql -u root -p < schema.sql`).
    2. Copy .env.example to .env and fill in your DB credentials.
    3. pip install -r requirements.txt
    4. python app.py

Endpoints:
    GET    /health              -> {"status": "ok"}
    GET    /patients             -> list all patients/predictions (newest first)
    POST   /patients             -> save a new patient/prediction record
    DELETE /patients/<id>         -> remove a record
    POST   /predict              -> run the ML model on 11 clinical features
"""

import base64
import io
import os
import pickle
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

MODEL_PATH = Path(__file__).parent / "finalized_model.sav"

# Load the pickled Gradient Boosting model (used by /predict only)
model = None
if MODEL_PATH.exists():
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

CATEGORICAL = ["Sex", "ChestPainType", "RestingECG", "ExerciseAngina", "ST_Slope"]
NUMERIC = ["Age", "RestingBP", "Cholesterol", "FastingBS", "MaxHR", "Oldpeak"]

HIGH_RISK_RECS = [
    "Consult a cardiologist immediately for a full clinical assessment.",
    "Adopt a strict low-sodium, low-saturated-fat diet (DASH / Mediterranean).",
    "Engage in supervised aerobic exercise 30 minutes, 5 days a week.",
    "Quit smoking and avoid second-hand smoke completely.",
    "Limit alcohol to <1 drink/day and eliminate sugary drinks.",
    "Monitor blood pressure, cholesterol, and blood sugar weekly.",
    "Take prescribed medication (statins, antihypertensives) consistently.",
    "Manage stress through mindfulness, therapy, or breathing exercises.",
    "Aim for a BMI between 18.5 and 24.9; reduce weight if overweight.",
    "Ensure 7-8 hours of quality sleep every night.",
]

LOW_RISK_RECS = [
    "Maintain a balanced diet rich in vegetables, fruits, and whole grains.",
    "Continue regular physical activity - at least 150 min/week.",
    "Keep annual cardiovascular check-ups and lipid panels.",
    "Avoid smoking and limit alcohol intake.",
    "Manage stress and maintain healthy sleep habits.",
    "Keep blood pressure under 120/80 mmHg.",
    "Maintain cholesterol (LDL) below 100 mg/dL.",
    "Stay hydrated and limit processed foods.",
]

# ---------------------------------------------------------------------------
# Database helpers (MySQL / phpMyAdmin)
# ---------------------------------------------------------------------------

DB_CONFIG = dict(
    host=os.environ.get("DB_HOST", "localhost"),
    port=int(os.environ.get("DB_PORT", "3306")),
    user=os.environ.get("DB_USER", "root"),
    password=os.environ.get("DB_PASSWORD", "@1979breezy"),
    database=os.environ.get("DB_NAME", "cardiosense"),
    cursorclass=DictCursor,
    autocommit=True,
)


def get_db():
    return pymysql.connect(**DB_CONFIG)


def init_db():
    """Create the patients table if it doesn't exist yet (schema.sql also does this)."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS patients (
                    id            VARCHAR(20)  NOT NULL PRIMARY KEY,
                    name          VARCHAR(255) NOT NULL,
                    age           INT          NOT NULL,
                    sex           ENUM('M','F') NOT NULL,
                    bp            INT          NOT NULL,
                    chol          INT          NOT NULL,
                    risk          ENUM('High','Low') NOT NULL,
                    probability   DECIMAL(6,4) NOT NULL,
                    date          DATE         NOT NULL,
                    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
    finally:
        conn.close()


try:
    init_db()
except Exception as e:  # pragma: no cover - only hit if MySQL isn't reachable yet
    print(f"[CardioSense] Warning: could not connect to MySQL on startup: {e}")


def next_patient_id(conn) -> str:
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM patients")
        rows = cur.fetchall()
    nums = []
    for r in rows:
        digits = "".join(ch for ch in r["id"] if ch.isdigit())
        if digits:
            nums.append(int(digits))
    nxt = (max(nums) + 1) if nums else 10421
    return f"P-{nxt}"


# ---------------------------------------------------------------------------
# Prediction helpers
# ---------------------------------------------------------------------------

def build_feature_frame(payload: dict) -> pd.DataFrame:
    """Construct a one-row DataFrame that matches the training dummies layout."""
    row = {c: [payload.get(c)] for c in NUMERIC + CATEGORICAL}
    df = pd.DataFrame(row)
    df[NUMERIC] = df[NUMERIC].apply(pd.to_numeric, errors="coerce")
    df = pd.get_dummies(df, columns=CATEGORICAL, drop_first=True)

    expected = getattr(model, "feature_names_in_", None)
    if expected is not None:
        for col in expected:
            if col not in df.columns:
                df[col] = 0
        df = df[list(expected)]
    return df


def make_chart(prob: float) -> str:
    low = (1 - prob) * 100
    high = prob * 100
    fig, ax = plt.subplots(figsize=(5, 3.2), dpi=120)
    bars = ax.bar(["Low risk", "High risk"], [low, high], color=["#10b981", "#ef4444"])
    ax.set_ylim(0, 100)
    ax.set_ylabel("Probability (%)")
    ax.set_title("Cardiovascular Risk Probability")
    for b, v in zip(bars, [low, high]):
        ax.text(b.get_x() + b.get_width() / 2, v + 1.5, f"{v:.1f}%", ha="center", fontsize=10)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    buf = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format="png")
    plt.close(fig)
    return base64.b64encode(buf.getvalue()).decode("ascii")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return jsonify(status="ok")


@app.get("/patients")
def list_patients():
    """Return all stored patients/predictions, newest first."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, name, age, sex, bp, chol, risk, probability,
                       DATE_FORMAT(date, '%Y-%m-%d') AS date
                FROM patients
                ORDER BY date DESC, created_at DESC
                """
            )
            rows = cur.fetchall()
        for r in rows:
            r["probability"] = float(r["probability"])
        return jsonify(rows)
    except Exception as e:
        return jsonify(error=str(e)), 500
    finally:
        conn.close()


@app.post("/patients")
def create_patient():
    """Save a new patient/prediction record (called from the Prediction page)."""
    payload = request.get_json(force=True) or {}
    conn = get_db()
    try:
        record = {
            "id": payload.get("id") or next_patient_id(conn),
            "name": payload.get("name", "Patient"),
            "age": int(payload.get("age", 0)),
            "sex": payload.get("sex", "M"),
            "bp": int(payload.get("bp", 0)),
            "chol": int(payload.get("chol", 0)),
            "risk": payload.get("risk", "Low"),
            "probability": float(payload.get("probability", 0)),
            "date": payload.get("date"),
        }
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO patients (id, name, age, sex, bp, chol, risk, probability, date)
                VALUES (%(id)s, %(name)s, %(age)s, %(sex)s, %(bp)s, %(chol)s, %(risk)s, %(probability)s, %(date)s)
                """,
                record,
            )
        return jsonify(record), 201
    except Exception as e:
        return jsonify(error=str(e)), 400
    finally:
        conn.close()


@app.delete("/patients/<patient_id>")
def delete_patient(patient_id):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM patients WHERE id = %s", (patient_id,))
        return jsonify(deleted=patient_id)
    except Exception as e:
        return jsonify(error=str(e)), 400
    finally:
        conn.close()


@app.post("/predict")
def predict():
    """Run the ML model on 11 clinical features (does not touch the database)."""
    if model is None:
        return jsonify(error="Model file finalized_model.sav not found on server."), 500

    payload = request.get_json(force=True) or {}
    name = payload.get("name", "Patient")
    try:
        X = build_feature_frame(payload)
        proba = float(model.predict_proba(X)[0, 1])
    except Exception as e:
        return jsonify(error=str(e)), 400

    label = "High" if proba >= 0.5 else "Low"
    recs = HIGH_RISK_RECS if label == "High" else LOW_RISK_RECS
    chart = make_chart(proba)

    return jsonify(
        name=name,
        probability=round(proba, 4),
        risk=label,
        threshold=0.5,
        recommendations=recs,
        chart_png_base64=chart,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
