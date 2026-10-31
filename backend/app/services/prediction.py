import base64
import io
import torch
import torch.nn.functional as F
from PIL import Image

from app.config import (
    CLASS_NAMES,
    DISPLAY_NAMES,
    DISEASE_KNOWLEDGE_BASE
)
from app.models.paddy_model import get_transform
from app.services.gradcam import generate_gradcam_visuals
from app.services.region_analysis import analyze_leaf_regions

def pil_to_base64_data_url(pil_img, format="JPEG"):
    if format.upper() == "JPEG" and pil_img.mode != "RGB":
        pil_img = pil_img.convert("RGB")
    buffered = io.BytesIO()
    pil_img.save(buffered, format=format, quality=90)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{img_str}"


def generate_natural_explanation(pred_class, confidence, regions):
    """
    Generates farmer-friendly text explanation summarizing where the model looked and why.
    """
    display_name = DISPLAY_NAMES.get(pred_class, pred_class)
    
    # Identify most affected region
    sorted_regions = sorted(regions.items(), key=lambda x: x[1]["score"], reverse=True)
    top_reg_key, top_reg_data = sorted_regions[0]
    
    reg_name_clean = top_reg_data["name"].split(" (")[0]
    
    if pred_class == "healthy":
        explanation = (
            f"The model detected no significant disease visual signatures on the leaf. "
            f"Attention distribution is low and uniform across all regions ({top_reg_data['percentage']}% peak attention in {reg_name_clean}). "
            f"The foliage exhibits normal chlorophyll reflectance consistent with healthy paddy growth."
        )
    else:
        explanation = (
            f"The model predicted {display_name} with {confidence:.1f}% confidence. "
            f"Visual attention was heavily concentrated on the {reg_name_clean} of the leaf, "
            f"which registered {top_reg_data['percentage']}% attention intensity ({top_reg_data['status'].lower()}). "
            f"The neural network detected characteristic lesion boundaries and discoloration patterns in this region."
        )
        
    return explanation


def process_paddy_image(model, image_pil, opacity=0.55):
    """
    Executes complete end-to-end Paddy Disease Detection & Grad-CAM pipeline.
    """
    original_rgb = image_pil.convert("RGB")
    transform = get_transform()
    input_tensor = transform(original_rgb).unsqueeze(0) # [1, 3, 224, 224]
    
    # 1. Grad-CAM & Model Inference
    heatmap_pil, overlay_pil, cam_2d, target_class_idx, logits = generate_gradcam_visuals(
        model, input_tensor, original_rgb, alpha=opacity
    )
    
    # Calculate probabilities
    probs = F.softmax(logits, dim=1)[0]
    confidence_val = float(probs[target_class_idx].item())
    pred_class_name = CLASS_NAMES[target_class_idx]
    display_name = DISPLAY_NAMES.get(pred_class_name, pred_class_name)
    
    # All class probabilities
    all_confidences = {
        CLASS_NAMES[i]: round(float(probs[i].item()) * 100, 2)
        for i in range(len(CLASS_NAMES))
    }
    
    # 2. Region Analysis
    regions_analysis = analyze_leaf_regions(cam_2d, original_rgb)
    
    # 3. Natural Language Explanation
    explanation_text = generate_natural_explanation(pred_class_name, confidence_val * 100, regions_analysis)
    
    # 4. Disease Information
    disease_info = DISEASE_KNOWLEDGE_BASE.get(pred_class_name, {})
    
    # Low confidence warning flag
    is_low_confidence = confidence_val < 0.60
    
    # Base64 Images
    original_b64 = pil_to_base64_data_url(original_rgb, "JPEG")
    heatmap_b64 = pil_to_base64_data_url(heatmap_pil, "JPEG")
    overlay_b64 = pil_to_base64_data_url(overlay_pil, "JPEG")
    
    return {
        "prediction": pred_class_name,
        "display_name": display_name,
        "confidence": round(confidence_val * 100, 2),
        "confidence_raw": confidence_val,
        "all_confidences": all_confidences,
        "is_low_confidence": is_low_confidence,
        "low_confidence_message": (
            "The AI model is uncertain about this prediction (<60% confidence). "
            "Please upload a clearer, well-lit close-up image of the leaf or consult an agricultural extension officer."
            if is_low_confidence else None
        ),
        "explanation": explanation_text,
        "disclaimer": "The highlighted heatmap regions indicate model attention/influence during inference. This visual explanation estimates affected areas to assist diagnosis and does not constitute a clinical laboratory segmentation.",
        "regions": regions_analysis,
        "disease_info": disease_info,
        "images": {
            "original": original_b64,
            "heatmap": heatmap_b64,
            "overlay": overlay_b64
        }
    }
