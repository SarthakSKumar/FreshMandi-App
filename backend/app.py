from flask import Flask, request, jsonify
from processor.image_processor import ImageProcessor
import os
from datetime import datetime

app = Flask(__name__)
processor = ImageProcessor('./models/tl_model_v2.weights.best.hdf5')


@app.route('/process_image', methods=['POST'])
def process_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided."}), 400

        file = request.files['image']
        userid = request.form.get('userid')
        img_path = f"./uploads/temp_{file.filename}"
        file.save(img_path)

        result = processor.process_single_image(img_path, userid)
        os.remove(img_path)

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/predict_image', methods=['POST'])
def predict_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided."}), 400

        file = request.files['image']
        img_path = f"./uploads/temp_{file.filename}"
        file.save(img_path)

        result = processor.predict_single_image(img_path)
        os.remove(img_path)

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/predict_price', methods=['POST'])
def predict_price():
    try:
        class_name = request.form.get('class_name')
        date = request.form.get('date')
        formatted_date = datetime.strptime(date, '%d-%m-%Y')
        result = processor.predict_price(class_name, formatted_date)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
1``
