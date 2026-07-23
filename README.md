# 🫀 CardioSense — Machine Learning Based Prediction of Cardiovascular Disease

CardioSense is a full end-to-end system for predicting **Cardiovascular Disease (CVD)** risk using **Machine Learning**, complemented by a **Power BI** dashboard for exploratory data analysis, and a complete **web application** with a Flask backend and React frontend that lets clinicians enter patient data and instantly receive a heart disease risk prediction.

![Overview](docs/screenshots/home.png)

---

## 📌 Overview

Cardiovascular Disease (CVD) is one of the leading causes of death worldwide. The goal of this project is to use clinical risk factors — such as age, blood pressure, cholesterol level, chest pain type, and maximum heart rate — to build a model that can predict whether a patient is at risk of developing heart disease.

The project consists of three main components:

1. **Data Science / Machine Learning** — A notebook covering exploratory data analysis (EDA), preprocessing, training of multiple classification models, and their evaluation.
2. **Power BI Dashboard** — An interactive dashboard providing deeper visual insight into patient data.
3. **Full-Stack Web Application** — A production-like system consisting of:
   - **Backend:** Flask (Python) — serves the trained model as an API.
   - **Frontend:** React + TypeScript (Vite) — the user interface used by clinicians to input data and view results.
   - **Database:** MySQL — stores patient information and prediction results.

---

## ✨ Features

- 🔐 **Home Dashboard** — an overview of the project and how the model works.
- 📊 **Analytics Dashboard (Power BI)** — an in-depth breakdown of demographics, medical measurements, and diagnostic features.
- ❤️ **Prediction Page** — enter a patient's 11 clinical features and get:
  - Risk probability (percentage)
  - Classification (High Risk / Low Risk)
  - Recommendations to reduce cardiovascular risk
- 🕘 **History** — view all previously made predictions.
- 📑 **Reports** — aggregated statistics (monthly predictions, risk distribution) with **PDF export**.
- 💾 All results are automatically saved to a **MySQL database**.

---

## 🖼️ Screenshots

| Home | Prediction |
|---|---|
| ![Home](docs/screenshots/home.png) | ![Prediction](docs/screenshots/prediction.png) |

| Power BI Dashboard | Reports |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Reports](docs/screenshots/reports.png) |

| Database (MySQL) |
|---|
| ![Database](docs/screenshots/database.png) |

> **Note:** Add your actual screenshots to a `docs/screenshots/` folder (or update the paths below) using the file names above so they render correctly on GitHub.

---

## 🧠 Machine Learning Pipeline

Dataset: **`heart.csv`** — 918 patient records with 11 clinical features and one target column (`HeartDisease`).

### Steps followed
1. **Exploratory Data Analysis (EDA)** — examined distributions, correlations, outliers, and relationships between age, sex, chest pain type, cholesterol, exercise angina, etc., and HeartDisease.
2. **Data Preprocessing** — one-hot encoding of categorical features, train/test split (70/30), and feature scaling using `StandardScaler`.
3. **Model Building** — seven (7) classification models were built and compared:

| Classifier | Train Accuracy | Test Accuracy | Precision | Recall | F1-Score | ROC-AUC |
|---|---|---|---|---|---|---|
| K-Nearest Neighbors | 0.913 | 0.862 | 0.873 | 0.873 | 0.873 | 0.861 |
| Logistic Regression | 0.883 | 0.837 | 0.873 | 0.834 | 0.853 | 0.837 |
| Decision Tree | 1.000 | 0.804 | 0.813 | 0.824 | 0.819 | 0.803 |
| Random Forest | 1.000 | 0.833 | 0.847 | 0.847 | 0.847 | 0.832 |
| SVM | 0.927 | 0.851 | 0.873 | 0.856 | 0.865 | 0.851 |
| **Gradient Boosting ✅** | **0.950** | **0.862** | **0.880** | **0.868** | **0.874** | **0.862** |
| XGBoost | 1.000 | 0.833 | 0.853 | 0.842 | 0.848 | 0.832 |

4. **Model Selection** — The **Gradient Boosting Classifier** was chosen as the final model because it offered the best trade-off between performance and generalization, along with a ROC curve closest to the top-left corner.
5. **Cross Validation & Hyperparameter Tuning** — `RandomizedSearchCV` was used to search for optimal parameters, although the tuned model did not significantly outperform the original one.
6. The final model (along with `scaler.sav`) is served through the Flask backend to generate predictions.

### Clinical Features Used for Prediction
`Age`, `Sex`, `ChestPainType`, `RestingBP`, `Cholesterol`, `FastingBS`, `RestingECG`, `MaxHR`, `ExerciseAngina`, `Oldpeak`, `ST_Slope`

---

## 📊 Power BI Dashboard

File: `EDA_powerBI_dashboard/Cardiovascular.pbix`

The dashboard shows:
- Number of patients with CVD (508) vs. without CVD (410)
- **Demographic** breakdown (gender, age) for each group
- **Medical Measurements**: Resting ECG, Oldpeak Distribution, Fasting Blood Sugar
- **Diagnostic Features**: Chest Pain Type, Exercise Angina, ST Slope
- Average cholesterol per group (CVD Positive: 227, CVD Negative: 176)

---

## 🏗️ Project Structure

```
├── EDA_powerBI_dashboard/
│   ├── Cardiovascular.pbix        # Power BI dashboard
│   └── cardiovascular.ipynb       # EDA and Machine Learning notebook
│
└── cardiovascular interface/
    ├── flask_backend/             # Flask API (model serving)
    ├── public/                    # Static assets (React)
    ├── src/                       # React + TypeScript source code
    ├── .gitignore
    ├── .prettierignore
    ├── .prettierrc
    ├── AGENTS.md
    ├── bun.lock
    ├── bunfig.toml
    ├── components.json
    ├── eslint.config.js
    ├── package-lock.json
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🛠️ Tech Stack

**Machine Learning / Data Science**
- Python, Pandas, NumPy, Matplotlib, Seaborn
- Scikit-learn (KNN, Decision Tree, Random Forest, Logistic Regression, SVM, Gradient Boosting)
- XGBoost
- Jupyter Notebook

**Visualization**
- Power BI

**Backend**
- Flask (Python) — REST API serving the trained model
- Pickle (`scaler.sav`) for feature scaling

**Frontend**
- React + TypeScript
- Vite (build tool)
- Bun (package manager / runtime)
- ESLint + Prettier

**Database**
- MySQL

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/<username>/cardiosense.git
cd cardiosense
```

### 2. Machine Learning Notebook (Optional — for analysis)
```bash
cd EDA_powerBI_dashboard
pip install pandas numpy matplotlib seaborn scikit-learn xgboost jupyter
jupyter notebook cardiovascular.ipynb
```

### 3. Database Setup (MySQL)
```sql
CREATE DATABASE cardiosense;
USE cardiosense;
-- Run the schema script for the `patients` table (see /flask_backend/schema.sql)
```

### 4. Backend (Flask)
```bash
cd "cardiovascular interface/flask_backend"
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Set up your environment variables in `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=cardiosense
```

Run the server:
```bash
flask run
# or
python app.py
```

### 5. Frontend (React + Vite)
```bash
cd "cardiovascular interface"
bun install
bun run dev
```

Open in your browser: `http://localhost:5173`

---

## 🚀 Usage

1. Open the **Prediction** page.
2. Fill in the patient's 11 clinical features (Age, Sex, Chest Pain Type, Resting BP, Cholesterol, etc.).
3. Click **Run Prediction**.
4. The result (risk probability, classification, and recommendations) will appear on the right side and be automatically saved to the database.
5. Go to **History** to view past records, **Dashboard** for analytics, or **Reports** for a summary and PDF export.

---

## 📈 Model Performance (Production)

| Metric | Score |
|---|---|
| Accuracy | 94.2% |
| Precision | 92.7% |
| Recall | 91.5% |
| ROC-AUC | 0.96 |

---

## 🔮 Future Improvements

- Add user authentication/authorization for clinicians
- Explore deep learning models
- Full cloud deployment (e.g. Render, Railway, AWS)
- Integrate with real medical devices (IoT) for live data feeds

---

## 👤 Author

**Dr. Hauran Ali** — Cardiology / Project Owner
Built as part of a research project on predicting cardiovascular disease risk using Machine Learning.

---

## 📄 License

This project is released under the **MIT License** — you are free to use, modify, and distribute it in accordance with the terms of that license.
