import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
DATASET_DIR = BASE_DIR / "dataset"
SAMPLE_IMAGES_DIR = BASE_DIR / "sample_images"

MODEL_PATH = MODELS_DIR / "paddy_resnet18.pth"
METRICS_PATH = MODELS_DIR / "evaluation_metrics.json"

CLASS_NAMES = [
    "bacterial_leaf_blight",
    "blast",
    "brown_spot",
    "healthy",
    "leaf_smut"
]

DISPLAY_NAMES = {
    "bacterial_leaf_blight": "Bacterial Leaf Blight",
    "brown_spot": "Brown Spot",
    "leaf_smut": "Leaf Smut",
    "blast": "Rice Blast",
    "healthy": "Healthy Leaf"
}

# Configurable regional attention thresholds
REGION_ATTENTION_THRESHOLDS = {
    "high": 0.55,
    "medium": 0.28
}

# Agricultural Disease Knowledge Database
DISEASE_KNOWLEDGE_BASE = {
    "bacterial_leaf_blight": {
        "name": "Bacterial Leaf Blight",
        "pathogen": "Xanthomonas oryzae pv. oryzae",
        "description": "A serious bacterial disease causing yellowing and drying of leaves, severely dropping photosynthetic capacity and yield loss up to 50%.",
        "symptoms": [
            "Water-soaked streaks starting at leaf tips and margins",
            "Wavy margins expanding downward into yellowish to white lesions",
            "Bacterial ooze droplets appearing on leaves in early morning high humidity",
            "Drying and wilting of whole leaves ('kresek' phase in young plants)"
        ],
        "favorable_conditions": "High temperature (28-34°C), high relative humidity (>70%), heavy rainfall, and excessive nitrogen fertilization.",
        "cultural_control": [
            "Ensure balanced nitrogen application; split N fertilizer application into 3-4 split doses.",
            "Maintain proper field drainage during early crop development to prevent standing water stagnation.",
            "Use certified disease-free seeds and resistant paddy cultivars (e.g., IR64 derivatives)."
        ],
        "chemical_control": [
            "Apply Copper hydroxide or Copper oxychloride at 2.5 g/L upon early symptom detection.",
            "Foliar spray of Streptomycin sulfate + Tetracycline combination (100 ppm) if bacterial spread is severe."
        ],
        "urgency": "High",
        "icon_color": "red"
    },
    "brown_spot": {
        "name": "Brown Spot",
        "pathogen": "Bipolaris oryzae / Cochliobolus miyabeanus",
        "description": "Fungal infection producing oval or circular brown lesions across paddy leaves, often associated with nutrient-deficient or water-stressed soil.",
        "symptoms": [
            "Small sesame-shaped brown spots with yellow halos",
            "Fully developed spots with dark reddish-brown borders and grayish-white centers",
            "Lesions coalescing to cover large areas of the leaf blade",
            "Premature leaf drying and seed discoloration on infected panicles"
        ],
        "favorable_conditions": "Soil potassium or iron deficiency, prolonged leaf wetness, drought stress followed by high air humidity.",
        "cultural_control": [
            "Apply balanced fertilizer regimen rich in Potassium (K) and Silica (Si) to strengthen cell walls.",
            "Correct soil nutrient deficiencies through soil testing and organic compost incorporation.",
            "Perform seed treatment with hot water (53-54°C for 10-12 mins) before nursery sowing."
        ],
        "chemical_control": [
            "Foliar spraying with Mancozeb (2 g/L) or Carbendazim (1 g/L) at early tiller stage.",
            "Apply Propiconazole 25% EC (1 mL/L) if leaf spot coverage exceeds 10% of field."
        ],
        "urgency": "Medium",
        "icon_color": "amber"
    },
    "leaf_smut": {
        "name": "Leaf Smut",
        "pathogen": "Entyloma oryzae",
        "description": "Fungal disease characterized by small, raised, black linear spots that break open to release black powdery teliospores.",
        "symptoms": [
            "Small, slightly raised, rectangular black spots scattered on both surfaces of leaf blade",
            "Lesions remaining small (0.5 to 5 mm) but occurring in dense clusters",
            "Ruptured spots exposing powdery black fungal spore masses",
            "Severe infections cause leaf tips to turn brown and dry out prematurely"
        ],
        "favorable_conditions": "Late crop growth stage, high atmospheric humidity, shaded microclimate, and excessive nitrogen.",
        "cultural_control": [
            "Remove and burn infected crop residue immediately post-harvest to destroy overwintering spores.",
            "Optimize planting density to enhance sunlight penetration and leaf drying inside canopy.",
            "Avoid late-season excessive nitrogenous fertilizers."
        ],
        "chemical_control": [
            "Usually minor economic impact; apply Copper Oxychloride (2.5 g/L) if infection covers lower leaves heavily.",
            "Systemic fungicide spray with Difenoconazole 25% EC (0.5 mL/L) at panicle initiation."
        ],
        "urgency": "Low",
        "icon_color": "yellow"
    },
    "blast": {
        "name": "Rice Blast",
        "pathogen": "Magnaporthe oryzae / Pyricularia oryzae",
        "description": "One of the most destructive fungal diseases of rice worldwide, forming diamond-shaped spindle lesions that can destroy entire fields rapidly.",
        "symptoms": [
            "Spindle or diamond-shaped lesions with pointed ends and gray/white centers",
            "Dark brown or reddish borders surrounding eye-shaped spots",
            "Lesions enlarging rapidly and coalescing, leading to leaf blade burn ('blast')",
            "Nodal and neck rot leading to empty panicles ('white heads')"
        ],
        "favorable_conditions": "Cool nights, daytime temperatures around 25-28°C, relative humidity >90%, long dew periods, high soil nitrogen.",
        "cultural_control": [
            "Avoid excess nitrogen fertilizer; use split applications based on leaf color chart (LCC).",
            "Maintain 5-10 cm continuous water layer during critical tillering phase.",
            "Sow blast-resistant varieties suited for local agro-climatic zone."
        ],
        "chemical_control": [
            "Spray Tricyclazole 75% WP (0.6 g/L) or Isoprothiolane 40% EC (1.5 mL/L) immediately upon symptom appearance.",
            "Preventive spray of Azoxystrobin + Difenoconazole at boot leaf stage."
        ],
        "urgency": "High",
        "icon_color": "rose"
    },
    "healthy": {
        "name": "Healthy Paddy Leaf",
        "pathogen": "None (Healthy Crop)",
        "description": "The paddy leaf shows robust chlorophyll concentration, uniform green coloration, clear vascular structure, and no visible pathogenic lesions.",
        "symptoms": [
            "Vibrant, uniform green foliage without necrotic spots or lesions",
            "Intact leaf margins and sharp leaf tips",
            "Smooth leaf cuticle with healthy light reflection",
            "Strong turgor pressure and erect tiller canopy"
        ],
        "favorable_conditions": "Optimal soil moisture, balanced N-P-K-Si nutrition, adequate sunlight, and good field ventilation.",
        "cultural_control": [
            "Continue regular Integrated Pest & Disease Management (IPDM) monitoring.",
            "Maintain optimal irrigation schedules and leaf color chart (LCC) based nitrogen feeding.",
            "Keep bunds free of weed hosts that act as fungal or bacterial reservoirs."
        ],
        "chemical_control": [
            "No chemical fungicide or bactericide treatment required."
        ],
        "urgency": "None",
        "icon_color": "emerald"
    }
}
