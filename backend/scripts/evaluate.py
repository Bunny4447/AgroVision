import json
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support, accuracy_score
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.config import DATASET_DIR, MODELS_DIR, MODEL_PATH, METRICS_PATH, CLASS_NAMES, DISPLAY_NAMES
from app.models.paddy_model import PaddyResNet18

def evaluate_model():
    print("[Evaluation] Loading test dataset...")
    test_dir = DATASET_DIR / "test"
    
    test_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    test_dataset = datasets.ImageFolder(root=str(test_dir), transform=test_transform)
    test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    num_classes = len(test_dataset.classes)
    
    model = PaddyResNet18(num_classes=num_classes, pretrained=False)
    if not MODEL_PATH.exists():
        print(f"[Error] Model weights not found at {MODEL_PATH}. Train the model first.")
        return
        
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.to(device)
    model.eval()
    
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = torch.max(outputs, 1)
            
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            
    # Calculate Metrics
    acc = accuracy_score(all_labels, all_preds)
    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(all_labels, all_preds, average='macro', zero_division=0)
    weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(all_labels, all_preds, average='weighted', zero_division=0)
    
    # Per-class metrics
    per_class_p, per_class_r, per_class_f1, support = precision_recall_fscore_support(
        all_labels, all_preds, labels=range(num_classes), zero_division=0
    )
    
    cm = confusion_matrix(all_labels, all_preds, labels=range(num_classes))
    
    per_class_data = {}
    for i, cls_key in enumerate(test_dataset.classes):
        display_name = DISPLAY_NAMES.get(cls_key, cls_key)
        per_class_data[cls_key] = {
            "display_name": display_name,
            "precision": round(float(per_class_p[i]) * 100, 2),
            "recall": round(float(per_class_r[i]) * 100, 2),
            "f1_score": round(float(per_class_f1[i]) * 100, 2),
            "support": int(support[i])
        }
        
    metrics_summary = {
        "accuracy": round(float(acc) * 100, 2),
        "macro_precision": round(float(macro_p) * 100, 2),
        "macro_recall": round(float(macro_r) * 100, 2),
        "macro_f1": round(float(macro_f1) * 100, 2),
        "weighted_precision": round(float(weighted_p) * 100, 2),
        "weighted_recall": round(float(weighted_r) * 100, 2),
        "weighted_f1": round(float(weighted_f1) * 100, 2),
        "per_class": per_class_data,
        "confusion_matrix": cm.tolist(),
        "classes": [DISPLAY_NAMES.get(c, c) for c in test_dataset.classes],
        "class_keys": test_dataset.classes
    }
    
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics_summary, f, indent=2)
        
    print(f"[Evaluation] Metrics written to {METRICS_PATH}")
    print(f"  |- Test Accuracy: {acc*100:.2f}%")
    print(f"  |- Macro F1 Score: {macro_f1*100:.2f}%")
    print(f"  |- Weighted F1 Score: {weighted_f1*100:.2f}%")

if __name__ == "__main__":
    evaluate_model()
