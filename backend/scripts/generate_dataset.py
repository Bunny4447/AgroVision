import os
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"
SAMPLE_DIR = BASE_DIR / "sample_images"
MODELS_DIR = BASE_DIR / "models"

CLASSES = [
    "bacterial_leaf_blight",
    "blast",
    "brown_spot",
    "healthy",
    "leaf_smut"
]

def draw_paddy_leaf_base(width=256, height=512):
    """Generates a realistic paddy leaf shape on a neutral background."""
    img = Image.new("RGB", (width, height), (240, 245, 240))
    draw = ImageDraw.Draw(img)
    
    # Leaf polygon points (long slender rice leaf blade)
    center_x = width // 2
    margin = 30
    points = [
        (center_x, 30),                         # Tip
        (center_x + margin + 10, 150),
        (center_x + margin + 25, 300),
        (center_x + margin + 15, 420),
        (center_x, height - 30),                 # Base
        (center_x - margin - 15, 420),
        (center_x - margin - 25, 300),
        (center_x - margin - 10, 150),
    ]
    
    # Base leaf green color with subtle vertical gradient
    base_color = (46, 139, 87) # SeaGreen
    draw.polygon(points, fill=base_color)
    
    # Add leaf midrib (central vein)
    draw.line([(center_x, 35), (center_x, height - 35)], fill=(80, 175, 110), width=3)
    
    # Add longitudinal parallel veins
    for offset in [-15, -8, 8, 15]:
        draw.line([(center_x + offset, 80), (center_x + offset, height - 60)], fill=(60, 155, 95), width=1)
        
    return img, points


def add_bacterial_blight_lesions(img):
    """Draws wavy yellow-white streaks starting from tips and leaf margins."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    cx = w // 2
    
    # Blight streaks mainly upper and middle regions
    for _ in range(random.randint(3, 6)):
        start_y = random.randint(40, 220)
        length = random.randint(80, 180)
        x_offset = random.choice([-25, -15, 5, 15])
        
        # Yellowish to grayish-white blight streak
        color = random.choice([(235, 215, 110), (220, 200, 130), (240, 230, 160)])
        streak_pts = [
            (cx + x_offset, start_y),
            (cx + x_offset + random.randint(-5, 5), start_y + length // 2),
            (cx + x_offset + random.randint(-8, 8), start_y + length)
        ]
        draw.line(streak_pts, fill=color, width=random.randint(12, 22))
        
    # Apply light blur to synthesize natural tissue necrosis
    return img.filter(ImageFilter.GaussianBlur(radius=1.5))


def add_brown_spots(img):
    """Draws oval sesame-shaped brown spots with yellow halos."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    cx = w // 2
    
    for _ in range(random.randint(15, 30)):
        spot_x = cx + random.randint(-25, 25)
        spot_y = random.randint(60, h - 80)
        rx = random.randint(4, 9)
        ry = random.randint(6, 14)
        
        # Outer yellow halo
        draw.ellipse([spot_x - rx - 3, spot_y - ry - 3, spot_x + rx + 3, spot_y + ry + 3], fill=(210, 190, 70))
        # Outer brown margin
        draw.ellipse([spot_x - rx, spot_y - ry, spot_x + rx, spot_y + ry], fill=(100, 45, 20))
        # Inner grayish center
        draw.ellipse([spot_x - rx // 2, spot_y - ry // 2, spot_x + rx // 2, spot_y + ry // 2], fill=(180, 170, 160))
        
    return img.filter(ImageFilter.GaussianBlur(radius=0.8))


def add_leaf_smut_spots(img):
    """Draws small raised black rectangular spots clustered together."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    cx = w // 2
    
    for _ in range(random.randint(25, 45)):
        spot_x = cx + random.randint(-28, 28)
        spot_y = random.randint(50, h - 70)
        rw = random.randint(3, 7)
        rh = random.randint(4, 10)
        
        # Raised black pustules
        draw.rectangle([spot_x, spot_y, spot_x + rw, spot_y + rh], fill=(25, 25, 25))
        # Slight brown halo
        draw.rectangle([spot_x - 1, spot_y - 1, spot_x + rw + 1, spot_y + rh + 1], outline=(120, 80, 40))
        
    return img


def add_blast_lesions(img):
    """Draws diamond/spindle-shaped lesions with gray centers and dark borders."""
    draw = ImageDraw.Draw(img)
    w, h = img.size
    cx = w // 2
    
    for _ in range(random.randint(4, 8)):
        lx = cx + random.randint(-20, 20)
        ly = random.randint(70, h - 100)
        lw = random.randint(14, 26)
        lh = random.randint(25, 50)
        
        # Diamond shape coordinates
        diamond = [
            (lx, ly - lh // 2),        # Top point
            (lx + lw // 2, ly),        # Right point
            (lx, ly + lh // 2),        # Bottom point
            (lx - lw // 2, ly)         # Left point
        ]
        
        # Dark brown border
        draw.polygon(diamond, fill=(110, 35, 25))
        
        # Inner gray-white spindle center
        inner_diamond = [
            (lx, ly - lh // 3),
            (lx + lw // 4, ly),
            (lx, ly + lh // 3),
            (lx - lw // 4, ly)
        ]
        draw.polygon(inner_diamond, fill=(210, 210, 215))
        
    return img.filter(ImageFilter.GaussianBlur(radius=1.0))


def generate_image_for_class(cls_name):
    img, _ = draw_paddy_leaf_base()
    
    if cls_name == "bacterial_leaf_blight":
        return add_bacterial_blight_lesions(img)
    elif cls_name == "brown_spot":
        return add_brown_spots(img)
    elif cls_name == "leaf_smut":
        return add_leaf_smut_spots(img)
    elif cls_name == "blast":
        return add_blast_lesions(img)
    elif cls_name == "healthy":
        return img
    return img


def main():
    print("[Dataset Setup] Generating synthetic Paddy Leaf Disease dataset...")
    
    splits = {
        "train": 40,      # 40 images per class = 200 train images
        "validation": 10, # 10 images per class = 50 val images
        "test": 10        # 10 images per class = 50 test images
    }
    
    for split_name, count in splits.items():
        for cls in CLASSES:
            dir_path = DATASET_DIR / split_name / cls
            os.makedirs(dir_path, exist_ok=True)
            
            for i in range(count):
                img = generate_image_for_class(cls)
                # Random rotation/jitter for dataset diversity
                angle = random.uniform(-8, 8)
                img_rot = img.rotate(angle, fillcolor=(240, 245, 240))
                
                filename = f"{cls}_{split_name}_{i+1:03d}.jpg"
                img_rot.save(dir_path / filename, quality=92)
                
    # Also generate sample images for UI quick-test selection
    os.makedirs(SAMPLE_DIR, exist_ok=True)
    for cls in CLASSES:
        img = generate_image_for_class(cls)
        sample_path = SAMPLE_DIR / f"sample_{cls}.jpg"
        img.save(sample_path, quality=95)
        print(f"[Samples] Created sample image: {sample_path}")
        
    print(f"[Dataset Setup] Dataset generated successfully at {DATASET_DIR}")

if __name__ == "__main__":
    main()
