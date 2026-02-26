from flask import Blueprint, request, jsonify
from models.user import db, User, MealPlan
from services.email_service import send_meal_plan_email

email_bp = Blueprint("email", __name__)


@email_bp.route("/send-plan", methods=["POST"])
def send_plan():
    """Send the current meal plan to the user via email."""
    data = request.json
    user_id = data.get("user_id")

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    plan = MealPlan.query.filter_by(user_id=user_id, is_active=True).first()
    if not plan:
        return jsonify({"error": "No active meal plan"}), 404

    result = send_meal_plan_email(user, plan.get_plan())
    return jsonify(result)