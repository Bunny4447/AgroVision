import os
import torch
import torch.nn as nn
import torchvision.models as models
from torchvision import transforms
from PIL import Image
from app.config import MODEL_PATH, CLASS_NAMES

class PaddyResNet18(nn.Module):
    def __init__(self, num_classes=5, pretrained=True):
        super(PaddyResNet18, self).__init__()
        # Load backbone
        weights = models.ResNet18_Weights.DEFAULT if pretrained else None
        self.backbone = models.resnet18(weights=weights)
        
        # Replace final classification head
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_features, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        return self.backbone(x)

    def get_target_layer(self):
        # Target layer for Grad-CAM is layer4 (last conv layer of ResNet18)
        return self.backbone.layer4[-1]


def get_transform():
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])


def load_paddy_model(model_path=MODEL_PATH, device="cpu"):
    num_classes = len(CLASS_NAMES)
    model = PaddyResNet18(num_classes=num_classes, pretrained=True)
    
    if os.path.exists(model_path):
        try:
            state_dict = torch.load(model_path, map_location=device)
            model.load_state_dict(state_dict)
            print(f"[Model] Successfully loaded weights from {model_path}")
        except Exception as e:
            print(f"[Model Warning] Could not load checkpoint from {model_path}: {e}. Using initialized model.")
    else:
        print(f"[Model Warning] Checkpoint {model_path} not found. Initialized fresh ResNet18 model.")
        
    model.to(device)
    model.eval()
    return model
