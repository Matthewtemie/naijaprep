from flask import Blueprint, request, jsonify
from models.user import db, User
import json

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Create a new user profile (no email/password required)."""
    data = request.json

    user = User(
        name=data.get("name", "User"),
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
        # Body profile fields
        gender=data.get("gender", ""),
        age=data.get("age", ""),
        weight_kg=data.get("weightKg", ""),
        height_cm=data.get("heightCm", ""),
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Profile created",
        "user": {"id": user.id, "name": user.name},
        "profile": user.get_profile_dict(),
    }), 201