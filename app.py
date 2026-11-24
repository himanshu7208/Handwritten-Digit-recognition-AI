from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
from PIL import Image, ImageOps
import numpy as np
import base64
import io
import os

app = Flask(__name__)

# Load trained AI model
MODEL_PATH = "model/lenet5_mnist.keras"
model = load_model(MODEL_PATH)


def preprocess_image(image):
    # Convert to grayscale
    image = image.convert("L")

    # Canvas uses black background and white strokes.
    # MNIST also uses black background and white digits.
    image = ImageOps.autocontrast(image)

    # Remove background noise and find digit boundaries
    image = image.point(lambda p: 255 if p > 40 else 0)
    bbox = image.getbbox()

    if bbox is None:
        return None

    image = image.crop(bbox)

    # Fit digit inside a square, leaving margins
    image.thumbnail((20, 20))

    square = Image.new("L", (28, 28), 0)

    x = (28 - image.width) // 2
    y = (28 - image.height) // 2

    square.paste(image, (x, y))

    # Normalize and add batch/channel dimensions
    array = np.array(square, dtype="float32") / 255.0
    array = array.reshape(1, 28, 28, 1)

    return array


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        if not data or "image" not in data:
            return jsonify({
                "error": "Image not received"
            }), 400

        image_data = data["image"]

        # Yahan actual model prediction code aayega

        return jsonify({
            "digit": 5,
            "confidence": 98.75,
            "probabilities": [
                0.1, 0.1, 0.2, 0.1, 0.1,
                98.75, 0.1, 0.2, 0.2, 0.15
            ]
        })

    except Exception as e:
        print("Prediction Error:", str(e))

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)