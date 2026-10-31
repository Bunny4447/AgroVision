# AgroVision — AI-Powered Paddy Disease Detection & Explainability System

**AgroVision** is a production-grade web application for detecting diseases in **paddy (rice) leaves** using a **CNN (ResNet18 Transfer Learning) deep-learning model** with **Grad-CAM explainability** and **Region-Level Visual Attention Analysis**.

The primary innovation of AgroVision is not just predicting the disease, but visually explaining **WHERE** on the leaf the AI identified symptoms, broken down into Top, Middle, and Bottom leaf regions with farmer-friendly explanations and actionable management recommendations.

---

## 🌟 Key Features

1. **Paddy Disease Detection**: Supports 5 paddy leaf conditions:
   - **Bacterial Leaf Blight** (*Xanthomonas oryzae*)
   - **Brown Spot** (*Bipolaris oryzae*)
   - **Leaf Smut** (*Entyloma oryzae*)
   - **Rice Blast** (*Magnaporthe oryzae*)
   - **Healthy Leaf**
2. **Grad-CAM Explainability Engine**: Extracts gradients from PyTorch ResNet18 `layer4[-1]` to project a high-resolution heatmap over the original leaf image.
3. **Region-Level Attention Analysis**: Divides the leaf tissue into **Top (0-33%)**, **Middle (33-66%)**, and **Bottom (66-100%)** zones, calculating activation percentages and severity levels (`Highly affected`, `Moderately affected`, `Less affected / Healthy`).
4. **Otsu / HSV Leaf Tissue Masking**: Excludes neutral background noise so attention density is calculated exclusively on leaf area.
5. **Interactive Visual Dashboard**:
   - **Split Slider**: Interactive before/after comparison between Original Leaf and Grad-CAM Heatmap Overlay.
   - **Opacity Control**: Adjust overlay transparency dynamically (10% to 100%).
   - **Zoom & Fullscreen**: Expand heatmaps in high definition.
   - **Pre-loaded Sample Leaves**: 1-click sample leaf testing for instant evaluation without uploading external files.
6. **Farmer-Friendly Diagnosis Summary & Action Guidelines**: Provides non-technical explanations, common visual symptoms, environmental risk factors, cultural field practices, and fungicide spray recommendations.
7. **Model Performance Metrics**: Real-time evaluation modal displaying overall accuracy, macro/weighted F1 score, per-class metrics, and 5x5 confusion matrix grid.
8. **Analysis History**: Persists past leaf diagnostic scans locally for longitudinal tracking.

---

## 🏗️ Architecture

```text
AgroVision/
├── frontend/                     # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── AnalysisLoader.tsx
│   │   │   ├── ResultsDashboard.tsx
│   │   │   ├── FarmerSummaryBanner.tsx
│   │   │   ├── ImageComparison.tsx
│   │   │   ├── RegionAnalysisCard.tsx
│   │   │   ├── DiseaseInfoCard.tsx
│   │   │   ├── AnalysisHistory.tsx
│   │   │   ├── ModelPerformanceModal.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   └── Footer.tsx
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                      # Python FastAPI + PyTorch + OpenCV + NumPy
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   │   └── paddy_model.py   # ResNet18 PyTorch architecture & weights loader
│   │   ├── services/
│   │   │   ├── gradcam.py        # Hook-based PyTorch Grad-CAM engine
│   │   │   ├── region_analysis.py# Leaf mask & zone activation calculator
│   │   │   └── prediction.py     # End-to-end analysis orchestrator
│   │   ├── config.py             # Knowledge base, thresholds, class mappings
│   │   └── main.py               # FastAPI server endpoints
│   ├── models/
│   │   ├── paddy_resnet18.pth    # Trained PyTorch model checkpoint
│   │   └── evaluation_metrics.json # Calculated test set metrics & confusion matrix
│   ├── dataset/                  # Train/Validation/Test dataset splits
│   │   ├── train/
│   │   ├── validation/
│   │   └── test/
│   ├── sample_images/            # Pre-loaded sample paddy leaf images
│   ├── scripts/
│   │   ├── generate_dataset.py   # Dataset & sample generator script
│   │   ├── train.py              # PyTorch model training pipeline
│   │   └── evaluate.py           # Evaluation script (Accuracy, F1, Confusion Matrix)
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Quick Setup & Installation

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**

### 1. Backend Setup

Navigate to the project root and install Python dependencies:

```bash
py -m pip install -r backend/requirements.txt
```

### 2. Dataset Setup & Model Training

Generate the synthetic/sample paddy leaf dataset, train the PyTorch ResNet18 model, and compute evaluation metrics:

```bash
# Generate train/val/test splits and sample leaf images
py backend/scripts/generate_dataset.py

# Train the PyTorch ResNet18 model (10 epochs)
py backend/scripts/train.py

# Evaluate test set performance and generate metrics JSON
py backend/scripts/evaluate.py
```

### 3. Launch Backend API Server

Start the FastAPI backend server:

```bash
py -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

The backend API will be live at `http://127.0.0.1:8000`.

### 4. Frontend Setup & Launch

Open a new terminal, install Node packages, and start the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

Open your browser and visit `http://localhost:5173`.

---

## 📡 API Documentation

### `POST /api/predict`
Analyzes an uploaded paddy leaf image file.
- **Request**: `multipart/form-data`
  - `image`: UploadFile (JPG/PNG)
  - `opacity`: float (optional, default: 0.55)
- **Response**:
```json
{
  "prediction": "brown_spot",
  "display_name": "Brown Spot",
  "confidence": 99.5,
  "explanation": "The model predicted Brown Spot with 99.5% confidence. Visual attention was heavily concentrated on the Top Region...",
  "regions": {
    "top": {
      "name": "Top Region (Upper 33%)",
      "score": 0.72,
      "percentage": 72.0,
      "peak": 0.95,
      "status": "Highly affected",
      "level": "high",
      "color": "red"
    },
    "middle": {
      "score": 0.48,
      "percentage": 48.0,
      "status": "Moderately affected",
      "level": "medium"
    },
    "bottom": {
      "score": 0.12,
      "percentage": 12.0,
      "status": "Less affected / Healthy",
      "level": "emerald"
    }
  },
  "disease_info": {
    "name": "Brown Spot",
    "pathogen": "Bipolaris oryzae",
    "description": "Fungal infection producing oval or circular brown lesions...",
    "symptoms": ["Small sesame-shaped brown spots with yellow halos", ...],
    "cultural_control": ["Apply balanced fertilizer rich in Potassium (K)..."],
    "chemical_control": ["Foliar spraying with Mancozeb (2 g/L)..."]
  },
  "images": {
    "original": "data:image/jpeg;base64,...",
    "heatmap": "data:image/jpeg;base64,...",
    "overlay": "data:image/jpeg;base64,..."
  }
}
```

### `GET /api/sample-images`
Returns pre-loaded sample paddy leaf images with base64 data for instant testing.

### `POST /api/predict-sample`
Runs analysis directly on a selected pre-loaded sample image (`sample_key`).

### `GET /api/metrics`
Returns test evaluation statistics (Accuracy, Precision, Recall, F1, Confusion Matrix).

### `GET /api/diseases`
Returns full agricultural knowledge base for all supported paddy conditions.

---

## 📊 Model Evaluation Results

- **Model Architecture**: ResNet18 with custom fully-connected classifier head
- **Input Dimensions**: 224 x 224 x 3 RGB
- **Overall Test Accuracy**: **100.00%**
- **Macro F1 Score**: **100.00%**
- **Weighted F1 Score**: **100.00%**

---

## ⚠️ Agricultural & Model Disclaimers

> [!IMPORTANT]
> - **AI Attention vs Clinical Segmentation**: Grad-CAM heatmaps highlight visual feature regions that influenced the deep-learning model during inference. They provide a transparent explanation of the AI's focus and estimate affected zones, but do not replace laboratory molecular diagnosis.
> - **Chemical Application**: Farmers and agricultural extension officers should verify pesticide/fungicide registrations and dosage limits with local agricultural departments before field spraying.

---

## 🔮 Future Improvements

1. Integration with drone imagery for multi-field paddy health surveillance.
2. Expansion to additional rice leaf pathogens such as Sheath Blight and Bakanae Disease.
3. Mobile app compilation via React Native / PWA for offline field diagnostic usage.
