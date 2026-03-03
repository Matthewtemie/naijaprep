from flask import Blueprint, request, jsonify
from models.user import db, User, MealPlan
from services.ai_generator import generate_meal_plan
from services.meal_fallback import fallback_plan
from datetime import date
import json
import gc

meals_bp = Blueprint("meals", __name__)


@meals_bp.route("/generate", methods=["POST"])
def generate():
    """Generate a new meal plan using AI, with fallback."""
    try:
        data = request.json
        user_id = data.get("user_id")
        profile = data.get("profile")

        if not profile:
            return jsonify(fallback_plan({"mealsPerDay": 3, "fitnessGoal": "Stay Healthy"}))

        # Try AI generation first
        result = generate_meal_plan(profile)

        if not result["success"]:
            print(f"AI failed, using fallback: {result.get('error')}")
            plan_data = fallback_plan(profile)
        else:
            plan_data = result["data"]

        # Save to database if user is logged in
        if user_id:
            try:
                MealPlan.query.filter_by(user_id=user_id, is_active=True).update(
                    {"is_active": False}
                )
                new_plan = MealPlan(
                    user_id=user_id,
                    plan_data=json.dumps(plan_data),
                    week_of=date.today(),
                    is_active=True,
                )
                db.session.add(new_plan)
                db.session.commit()
            except Exception as db_err:
                print(f"DB save error (non-fatal): {db_err}")
                db.session.rollback()

        gc.collect()
        return jsonify(plan_data)

    except Exception as e:
        gc.collect()
        print(f"Generate endpoint error: {e}")
        # Always return a meal plan, even on error
        profile = request.json.get("profile", {}) if request.json else {}
        return jsonify(fallback_plan(profile))


@meals_bp.route("/current/<int:user_id>", methods=["GET"])
def get_current_plan(user_id):
    """Get the user's current active meal plan."""
    plan = MealPlan.query.filter_by(user_id=user_id, is_active=True).first()

    if not plan:
        return jsonify({"error": "No active plan found"}), 404

    return jsonify(plan.get_plan())