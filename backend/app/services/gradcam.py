import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        
        # Register hooks
        self.handles = []
        self.handles.append(target_layer.register_forward_hook(self._save_activations))
        self.handles.append(target_layer.register_full_backward_hook(self._save_gradients))

    def _save_activations(self, module, input, output):
        self.activations = output.detach()

    def _save_gradients(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(self, input_tensor, target_class=None):
        """
        Generate Grad-CAM heatmap for input_tensor.
        Returns:
            cam_normalized: 2D numpy array [0..1] of size (H, W) matching input_tensor spatial dim
            target_class: integer index of target class
        """
        self.model.zero_grad()
        output = self.model(input_tensor)
        
        if target_class is None:
            target_class = torch.argmax(output, dim=1).item()
            
        score = output[0, target_class]
        score.backward(retain_graph=True)
        
        gradients = self.gradients[0]     # [C, H, W]
        activations = self.activations[0] # [C, H, W]
        
        # Global average pooling over spatial dimensions to get channel weights
        weights = torch.mean(gradients, dim=(1, 2), keepdim=True) # [C, 1, 1]
        
        # Weighted sum of activations
        cam = torch.sum(weights * activations, dim=0) # [H, W]
        
        # Apply ReLU to keep positive influences only
        cam = F.relu(cam)
        
        cam_np = cam.cpu().numpy()
        
        # Normalize to [0, 1]
        cam_max = np.max(cam_np)
        cam_min = np.min(cam_np)
        if cam_max > cam_min:
            cam_normalized = (cam_np - cam_min) / (cam_max - cam_min)
        else:
            cam_normalized = np.zeros_like(cam_np)
            
        return cam_normalized, target_class, output

    def remove_hooks(self):
        for handle in self.handles:
            handle.remove()


def generate_gradcam_visuals(model, input_tensor, original_pil_image, alpha=0.55):
    """
    Computes Grad-CAM and generates original, heatmap, and overlay images.
    Returns:
        heatmap_pil: PIL.Image of colorized heatmap
        overlay_pil: PIL.Image of blended original + heatmap
        cam_normalized_resized: 2D numpy array [0..1] resized to original image dimensions
        target_class: int
        output_logits: torch.Tensor
    """
    target_layer = model.get_target_layer()
    gradcam = GradCAM(model, target_layer)
    
    try:
        cam_normalized, target_class, output_logits = gradcam.generate(input_tensor)
        
        orig_w, orig_h = original_pil_image.size
        
        # Resize CAM to match original image dimensions
        cam_resized = cv2.resize(cam_normalized, (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)
        cam_resized = np.clip(cam_resized, 0, 1)
        
        # Convert to 8-bit heatmap using cv2.COLORMAP_JET
        cam_uint8 = np.uint8(255 * cam_resized)
        heatmap_cv = cv2.applyColorMap(cam_uint8, cv2.COLORMAP_JET)
        heatmap_rgb = cv2.cvtColor(heatmap_cv, cv2.COLOR_BGR2RGB)
        
        # Convert original image to numpy RGB
        orig_np = np.array(original_pil_image.convert("RGB"))
        
        # Blend original and heatmap
        overlay_np = np.uint8(orig_np * (1 - alpha) + heatmap_rgb * alpha)
        
        heatmap_pil = Image.fromarray(heatmap_rgb)
        overlay_pil = Image.fromarray(overlay_np)
        
        return heatmap_pil, overlay_pil, cam_resized, target_class, output_logits
    finally:
        gradcam.remove_hooks()
