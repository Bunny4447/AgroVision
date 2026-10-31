import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from pathlib import Path

import sys
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.config import DATASET_DIR, MODELS_DIR, MODEL_PATH, CLASS_NAMES
from app.models.paddy_model import PaddyResNet18

def get_data_loaders(batch_size=16):
    train_dir = DATASET_DIR / "train"
    val_dir = DATASET_DIR / "validation"
    
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    train_dataset = datasets.ImageFolder(root=str(train_dir), transform=train_transform)
    val_dataset = datasets.ImageFolder(root=str(val_dir), transform=val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    
    return train_loader, val_loader, train_dataset.classes


def train_model(epochs=10, lr=1e-3, batch_size=16):
    os.makedirs(MODELS_DIR, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[Training] Using device: {device}")
    
    train_loader, val_loader, dataset_classes = get_data_loaders(batch_size=batch_size)
    print(f"[Training] Classes found in dataset: {dataset_classes}")
    
    model = PaddyResNet18(num_classes=len(dataset_classes), pretrained=True)
    model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    best_val_acc = 0.0
    start_time = time.time()
    
    for epoch in range(1, epochs + 1):
        # Training Phase
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct_train += torch.sum(preds == labels.data).item()
            total_train += labels.size(0)
            
        train_loss = running_loss / total_train
        train_acc = (correct_train / total_train) * 100.0
        
        # Validation Phase
        model.eval()
        val_running_loss = 0.0
        correct_val = 0
        total_val = 0
        
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_running_loss += loss.item() * images.size(0)
                _, preds = torch.max(outputs, 1)
                correct_val += torch.sum(preds == labels.data).item()
                total_val += labels.size(0)
                
        val_loss = val_running_loss / total_val
        val_acc = (correct_val / total_val) * 100.0
        scheduler.step()
        
        print(f"Epoch [{epoch:02d}/{epochs:02d}] "
              f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% || "
              f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%")
              
        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), MODEL_PATH)
            print(f"  |- Best model saved to {MODEL_PATH} (Val Acc: {val_acc:.2f}%)")
            
    elapsed = time.time() - start_time
    print(f"[Training Complete] Total time: {elapsed:.2f}s | Best Val Acc: {best_val_acc:.2f}%")

if __name__ == "__main__":
    train_model(epochs=10)
