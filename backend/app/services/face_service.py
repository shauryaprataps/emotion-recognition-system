from dataclasses import dataclass

import cv2

from app.utils.label_mapping import to_probability_vector
from app.utils.preprocess_face import load_image_from_bytes


@dataclass
class FaceServiceResult:
    emotion: str
    probabilities: dict[str, float]
    confidence: float


class FaceEmotionService:
    def __init__(self) -> None:
        self._detector = None

    def _get_detector(self):
        if self._detector is None:
            from fer import FER

            # FER uses a bundled emotion model and OpenCV face detection when mtcnn is disabled.
            self._detector = FER(mtcnn=False)
        return self._detector

    def analyze(self, file_bytes: bytes) -> FaceServiceResult:
        image = load_image_from_bytes(file_bytes)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        detector = self._get_detector()
        detections = detector.detect_emotions(rgb_image)
        if detections:
            best = max(
                detections,
                key=lambda item: item.get("box", [0, 0, 0, 0])[2] * item.get("box", [0, 0, 0, 0])[3],
            )
            raw_scores = best.get("emotions", {})
        else:
            # When FER cannot localize a face, run full-frame fallback so single-face webcam shots still work.
            raw_scores = detector.top_emotion(rgb_image)
            if isinstance(raw_scores, tuple) and raw_scores[0]:
                raw_scores = {raw_scores[0]: float(raw_scores[1])}
            else:
                raise ValueError("No face or emotion signal could be extracted from the image.")

        probabilities = to_probability_vector(raw_scores)
        emotion = max(probabilities, key=probabilities.get)

        return FaceServiceResult(
            emotion=emotion,
            probabilities=probabilities,
            confidence=probabilities[emotion],
        )
