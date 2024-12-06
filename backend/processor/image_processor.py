import os
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.vgg16 import preprocess_input
from skimage.feature import local_binary_pattern
from scipy.ndimage import gaussian_laplace
from scipy.stats import skew, kurtosis
from bson import json_util
from pymongo import MongoClient
import pandas as pd
from datetime import datetime, timedelta
from statsmodels.tsa.statespace.sarimax import SARIMAX
from dotenv import load_dotenv
import pickle


class ImageProcessor:
    load_dotenv()

    IMG_SIZE = 224
    BASE_DIR = os.getenv("BASE_DIR", os.getcwd())

    class_names = [
        'FreshApple', 'FreshBanana', 'FreshCapsicum', 'FreshCarrots', 'FreshGrape',
        'FreshGuava', 'FreshLime', 'FreshOrange', 'FreshPotato', 'FreshTomato',
        'RottenApple', 'RottenBanana', 'RottenCapsicum', 'RottenCarrot', 'RottenGrape',
        'RottenGuava', 'RottenLime', 'RottenOrange', 'RottenPotato', 'RottenTomato'
    ]

    price_datasets = {
        'FreshApple': os.path.join(BASE_DIR, 'datasets/Carrot.xlsx'),
        'FreshBanana': os.path.join(BASE_DIR, 'datasets/Banana.xlsx'),
        'FreshCapsicum': os.path.join(BASE_DIR, 'datasets/Capsicum.xlsx'),
        'FreshCarrots': os.path.join(BASE_DIR, 'datasets/Carrot.xlsx'),
        'FreshGrape': os.path.join(BASE_DIR, 'datasets/Grape.xlsx'),
        'FreshGuava': os.path.join(BASE_DIR, 'datasets/Guava.xlsx'),
        'FreshLime': os.path.join(BASE_DIR, 'datasets/Lime.xlsx'),
        'FreshOrange': os.path.join(BASE_DIR, 'datasets/Orange.xlsx'),
        'FreshPotato': os.path.join(BASE_DIR, 'datasets/Potato.xlsx'),
        'FreshTomato': os.path.join(BASE_DIR, 'datasets/Tomato.xlsx')
    }

    weights = {'texture': 0.3516, 'color': 0.3989, 'edge': 0.2496}
    shelf_life_mapping = {
        'Fresh': (7, 10),
        'ShelfLife': (3, 7),
        'Rotten': (0, 3)
    }
    upper_threshold = 0.8934887673815148
    lower_threshold = 0.46346304980538544

    def __init__(self, model_path):
        self.model = load_model(model_path)

        # Initialize MongoDB connection
        mongo_uri = os.getenv('MONGO_URI')
        if not mongo_uri:
            raise ValueError(
                "Error: MONGO_URI is not defined in the environment variables.")
        self.client = MongoClient(mongo_uri)

        mongo_db_name = os.getenv('MONGO_DB_NAME')
        mongo_collection_name = os.getenv('MONGO_COLLECTION_NAME')
        if not mongo_db_name or not mongo_collection_name:
            raise ValueError(
                "Error: Database or collection name not defined in environment variables.")

        self.db = self.client[mongo_db_name]
        self.collection = self.db[mongo_collection_name]

    @staticmethod
    def validate_image_path(img_path):
        if not os.path.exists(img_path):
            raise FileNotFoundError("Error: File does not exist.")
        if not img_path.lower().endswith(('.png', '.jpg', '.jpeg', '.jfif', '.webp')):
            raise ValueError(
                "Error: Unsupported file format. Please upload a PNG, JPEG, JPG, JFIF, or WEBP image.")

    def predict_price(self, class_name, date):
        if class_name in self.price_datasets:
            price_file = self.price_datasets[class_name]
            df = pd.read_excel(price_file)

            df['price date'] = pd.to_datetime(
                df['price date'], format='%d-%b-%y')

            start_date = date - timedelta(days=90)
            filtered_data = df[(df['price date'] >= start_date)
                               & (df['price date'] <= date)]

            if not filtered_data.empty:
                filtered_data.set_index('price date', inplace=True)
                filtered_data = filtered_data.asfreq('D')

                sarimax_model = SARIMAX(filtered_data['modal price'], order=(1, 1, 1), seasonal_order=(
                    1, 1, 1, 7), enforce_stationarity=False, enforce_invertibility=False)
                sarimax_results = sarimax_model.fit()

                predicted_price = sarimax_results.forecast(steps=1).iloc[0]

                return predicted_price
            else:
                print(
                    f"No data available for {class_name} in the given date range.")
                return None
        else:
            print(f"Price data for {class_name} is not available.")
            return None

    def predict_single_image(self, img_path, confidence_threshold=0.98):
        self.validate_image_path(img_path)

        img = image.load_img(img_path, target_size=(
            self.IMG_SIZE, self.IMG_SIZE))
        img_array = image.img_to_array(img)
        img_array = preprocess_input(img_array)
        img_array = np.expand_dims(img_array, axis=0)

        predictions = self.model.predict(img_array)
        max_confidence = np.max(predictions)
        predicted_class_index = np.argmax(predictions, axis=1)[0]
        predicted_class_name = self.class_names[predicted_class_index]

        if max_confidence >= confidence_threshold:
            result = "Fresh" if 'Fresh' in predicted_class_name else "Rotten"
            classification = 1 if result == "Fresh" else 0
            return result, classification, predicted_class_name, f"Predicted class: {predicted_class_name}, ({result}) with confidence {max_confidence * 100:.2f}%"
        else:
            return None, None, None, "The fruit or vegetable uploaded is not confidently classified as any known category."

    @staticmethod
    def extract_color_features(image):
        hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv_image)

        color_features = [
            np.mean(h), np.mean(s), np.mean(v),
            np.std(h), np.std(s), np.std(v),
            skew(h.flatten()), skew(s.flatten()), skew(v.flatten()),
            kurtosis(h.flatten()), kurtosis(s.flatten()), kurtosis(v.flatten())
        ]
        return np.array(color_features)

    @staticmethod
    def extract_texture_features(image):
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        radius = 3
        n_points = 8 * radius
        lbp = local_binary_pattern(
            gray_image, n_points, radius, method='uniform')
        n_bins = int(lbp.max() + 1)
        lbp_hist, _ = np.histogram(
            lbp, bins=n_bins, range=(0, n_bins), density=True)
        return lbp_hist

    @staticmethod
    def extract_edge_features(image, sigma=0.55):
        fixed_size = (128, 128)
        image_resized = cv2.resize(
            image, fixed_size, interpolation=cv2.INTER_AREA)
        gray_image = cv2.cvtColor(image_resized, cv2.COLOR_BGR2GRAY)
        log_image = gaussian_laplace(gray_image, sigma=sigma)
        features = log_image.flatten()
        mean = np.mean(features)
        std_dev = np.std(features)
        return (features - mean) / std_dev if std_dev > 0 else features

    @staticmethod
    def load_classifier(filename):
        with open(filename, 'rb') as f:
            return pickle.load(f)

    def process_single_image(self, image_path, userid):
        result, classification, predicted_class_name, info = self.predict_single_image(
            image_path)
        if not result or classification != 1:
            return {"result": result, "info": info}

        # Load classifiers
        texture_classifier = self.load_classifier(
            './classifiers/texture_classifier_train.pkl')
        color_classifier = self.load_classifier(
            './classifiers/color_classifier_train.pkl')
        edge_classifier = self.load_classifier(
            './classifiers/edge_classifier_train.pkl')

        image_cv = cv2.imread(image_path)
        if image_cv is None:
            raise ValueError("Error: Unable to load image.")

        color_features = self.extract_color_features(image_cv)
        texture_features = self.extract_texture_features(image_cv)
        edge_features = self.extract_edge_features(image_cv)

        texture_score = texture_classifier.predict_proba([texture_features])[
            0, 1]
        color_score = color_classifier.predict_proba([color_features])[0, 1]
        edge_score = edge_classifier.predict_proba([edge_features])[0, 1]

        freshness_index = (
            self.weights['texture'] * texture_score +
            self.weights['color'] * color_score +
            self.weights['edge'] * edge_score
        )

        if freshness_index >= self.upper_threshold:
            predicted_category = 'Fresh'
        elif freshness_index <= self.lower_threshold:
            predicted_category = 'Rotten'
        else:
            predicted_category = 'ShelfLife'

        document = {
            "Type": predicted_class_name,
            "Result": predicted_category,
            "Freshness Index": freshness_index,
            "Texture Score": texture_score,
            "Color Score": color_score,
            "Edge Score": edge_score,
            "User ID": str(userid)
        }

        inserted_id = self.collection.insert_one(document)
        document.pop("User ID", None)
        document.pop("_id", None)

        return document
