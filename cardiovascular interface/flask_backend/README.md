# CardioSense Flask API

Serves the trained Gradient Boosting model (`finalized_model.sav`) for
cardiovascular disease risk prediction.

## Setup

1. Copy your trained model file into this folder:
   ```
   flask_backend/finalized_model.sav
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the server:
   ```
   python app.py
   ```
   The API starts at `http://localhost:5000`.

## Endpoints

### `GET /health`
Returns `{"status": "ok"}`.

### `POST /predict`
Request body (JSON):
```json
{
  "name": "Jane Doe",
  "Age": 54,
  "Sex": "M",
  "ChestPainType": "ASY",
  "RestingBP": 140,
  "Cholesterol": 250,
  "FastingBS": 0,
  "RestingECG": "Normal",
  "MaxHR": 150,
  "ExerciseAngina": "N",
  "Oldpeak": 1.2,
  "ST_Slope": "Flat"
}
```

Response:
```json
{
  "name": "Jane Doe",
  "probability": 0.72,
  "risk": "High",
  "threshold": 0.5,
  "recommendations": ["..."],
  "chart_png_base64": "iVBORw0K..."
}
```

- `probability >= 0.5` → **High risk**
- `probability <  0.5` → **Low risk**

The `chart_png_base64` field is a ready-to-render PNG bar chart comparing
Low vs High risk probabilities.

## Connect from the React dashboard

In `src/routes/prediction.tsx`, replace the local `scorePatient` call with:

```ts
const res = await fetch("http://localhost:5000/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(features),
});
const data = await res.json();
```
