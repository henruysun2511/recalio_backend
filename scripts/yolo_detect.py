#!/usr/bin/env python3
"""YOLOv10 object detection via stdin/stdout."""
import json, sys, base64, io
from PIL import Image
from ultralytics import YOLO

MODEL_PATH = "yolov10n.pt"

def main():
    try:
        model = YOLO(MODEL_PATH)
    except Exception as e:
        print(json.dumps({"error": f"Failed to load YOLO model: {e}"}))
        sys.exit(1)

    data = json.loads(sys.stdin.read())
    image_data = base64.b64decode(data["image"])
    img = Image.open(io.BytesIO(image_data))

    results = model(img, verbose=False)[0]

    objects = []
    for box in results.boxes:
        label = results.names[int(box.cls[0])]
        conf = float(box.conf[0])
        x1, y1, x2, y2 = map(float, box.xyxy[0])
        w, h = x2 - x1, y2 - y1
        objects.append({
            "label": label,
            "confidence": round(conf, 4),
            "bbox": [int(x1), int(y1), int(w), int(h)],
        })

    objects.sort(key=lambda o: o["confidence"], reverse=True)
    print(json.dumps({"objects": objects}))

if __name__ == "__main__":
    main()
