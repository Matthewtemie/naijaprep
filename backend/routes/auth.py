from flask import Blueprint, request, jsonify
from models.user import db, User
from services.email_service import send_welcome_email
import bcrypt
import json

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Create a new user account and send welcome email."""
    data = request.json

    # Check if email already exists
    existing = User.query.filter_by(email=data["email"]).first()
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    # Hash the password
    pw_hash = bcrypt.hashpw(
        data["password"].encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    # Create user with all profile data from onboarding
    user = User(
        name=data["name"],
        email=data["email"],
        password_hash=pw_hash,
        dietary_restrictions=json.dumps(data.get("dietaryRestrictions", [])),
        allergies=json.dumps(data.get("allergies", [])),
        fitness_goal=data.get("fitnessGoal", ""),
        activity_level=data.get("activityLevel", ""),
        meals_per_day=data.get("mealsPerDay", 3),
        budget=data.get("budget", "Moderate"),
        prep_days=json.dumps(data.get("prepDays", ["Sunday"])),
        wake_time=data.get("wakeTime", "06:30"),
        lunch_break=data.get("lunchBreak", "30"),
        preferred_cuisine=json.dumps(data.get("preferredCuisine", ["Traditional Nigerian"])),
    )

    db.session.add(user)
    db.session.commit()

    # Skip welcome email for now — SMTP crashes on Render free tier
    # TODO: switch to an email API like Resend or SendGrid
    print(f"User created: {user.email}")

    return jsonify({
        "message": "Account created",
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "profile": user.get_profile_dict(),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Log in an existing user."""
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if not bcrypt.checkpw(data["password"].encode("utf-8"), user.password_hash.encode("utf-8")):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "profile": user.get_profile_dict(),
    })