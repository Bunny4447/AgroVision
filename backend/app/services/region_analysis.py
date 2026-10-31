import cv2
import numpy as np
from PIL import Image
from app.config import REGION_ATTENTION_THRESHOLDS

def create_leaf_mask(image_pil):
    """
    Creates a binary mask (255 = leaf, 0 = background) using Otsu & HSV leaf thresholds.
    Prevents background pixels from skewing regional attention scores.
    """
    img_np = np.array(image_pil.convert("RGB"))
    hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
    
    # Range for paddy leaves (greens, yellows, browns)
    # Mask out extreme whites/blacks/neutrals if background is plain
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    _, otsu_mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Fused HSV leaf range (greens + lesion yellow/browns)
    lower_green = np.array([10, 20, 20])
    upper_green = np.array([100, 255, 255])
    color_mask = cv2.inRange(hsv, lower_green, upper_green)
    
    combined = cv2.bitwise_or(otsu_mask, color_mask)
    
    # If mask is empty or nearly all 1s/0s, fallback to full image
    leaf_ratio = np.mean(combined > 0)
    if leaf_ratio < 0.05 or leaf_ratio > 0.95:
        return np.ones(gray.shape, dtype=np.uint8) * 255
        
    return combined


def analyze_leaf_regions(cam_normalized_2d, original_image_pil):
    """
    Divides leaf into Top (0-33%), Middle (33-66%), and Bottom (66-100%) regions.
    Calculates activation statistics per region.
    """
    H, W = cam_normalized_2d.shape
    leaf_mask = create_leaf_mask(original_image_pil)
    
    # Resize leaf mask to match CAM dimensions if necessary
    if leaf_mask.shape != cam_normalized_2d.shape:
        leaf_mask = cv2.resize(leaf_mask, (W, H), interpolation=cv2.INTER_NEAREST)
        
    leaf_bool = leaf_mask > 0
    
    # Define vertical slice indices
    slice_top_end = int(H * 0.33)
    slice_mid_end = int(H * 0.66)
    
    regions_def = {
        "top": (0, slice_top_end, "Top Region (Upper 33%)"),
        "middle": (slice_top_end, slice_mid_end, "Middle Region (Middle 33%)"),
        "bottom": (slice_mid_end, H, "Bottom Region (Lower 34%)")
    }
    
    results = {}
    high_thresh = REGION_ATTENTION_THRESHOLDS["high"]
    med_thresh = REGION_ATTENTION_THRESHOLDS["medium"]
    
    for key, (y1, y2, name) in regions_def.items():
        sub_cam = cam_normalized_2d[y1:y2, :]
        sub_mask = leaf_bool[y1:y2, :]
        
        # Filter pixels inside leaf mask if possible
        if np.any(sub_mask):
            valid_pixels = sub_cam[sub_mask]
        else:
            valid_pixels = sub_cam
            
        mean_score = float(np.mean(valid_pixels)) if len(valid_pixels) > 0 else 0.0
        peak_score = float(np.max(valid_pixels)) if len(valid_pixels) > 0 else 0.0
        
        # Categorize status
        if mean_score >= high_thresh:
            status = "Highly affected"
            level = "high"
            color = "red"
        elif mean_score >= med_thresh:
            status = "Moderately affected"
            level = "medium"
            color = "amber"
        else:
            status = "Less affected / Healthy"
            level = "low"
            color = "emerald"
            
        results[key] = {
            "name": name,
            "score": round(mean_score, 3),
            "percentage": round(mean_score * 100, 1),
            "peak": round(peak_score, 3),
            "status": status,
            "level": level,
            "color": color
        }
        
    return results
