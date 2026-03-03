import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from models.user import db
from routes.auth import auth_bp
from routes.meals import meals_bp

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


db.init_app(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(meals_bp, url_prefix="/api/meals")

with app.app_context():
    db.create_all()
    print("Database tables created!")


@app.route("/")
def home():
    return {"message": "NaijaPrep API is running!"}


if __name__ == "__main__":
    print("Starting NaijaPrep backend on http://localhost:5000")
    app.run(debug=True, port=5000)