from io import BytesIO

import cv2
import numpy as np
from PIL import Image


def load_image_from_bytes(file_bytes: bytes) -> np.ndarray:
    image = Image.open(BytesIO(file_bytes)).convert("RGB")
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
