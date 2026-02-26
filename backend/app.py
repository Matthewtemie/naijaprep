import sys
import os

# Add the backend directory to Python's path so imports work
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from models.user import db
from routes.auth import auth_bp
from routes.meals import meals_bp
from routes.email import email_bp
from services.email_service import configure_mail

# Load environment variables from .env file
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Allow the React frontend to call the backend
CORS(app)

# Initialize database
db.init_app(app)

# Initialize email
configure_mail(app)

# Register route blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(meals_bp, url_prefix="/api/meals")
app.register_blueprint(email_bp, url_prefix="/api/email")

# Create database tables
with app.app_context():
    db.create_all()
    print("Database tables created!")


# Simple test route
@app.route("/")
def home():
    return {"message": "NaijaPrep API is running!"}


if __name__ == "__main__":
    print("Starting NaijaPrep backend on http://localhost:5000")
    app.run(debug=True, port=5000)