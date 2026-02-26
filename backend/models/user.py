from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Profile fields stored as JSON strings
    dietary_restrictions = db.Column(db.Text, default="[]")
    allergies = db.Column(db.Text, default="[]")
    fitness_goal = db.Column(db.String(50))
    activity_level = db.Column(db.String(50))
    meals_per_day = db.Column(db.Integer, default=3)
    budget = db.Column(db.String(30), default="Moderate")
    prep_days = db.Column(db.Text, default='["Sunday"]')
    wake_time = db.Column(db.String(10), default="06:30")
    lunch_break = db.Column(db.String(10), default="30")
    preferred_cuisine = db.Column(db.Text, default='["Traditional Nigerian"]')

    # Email preferences
    email_notifications = db.Column(db.Boolean, default=True)

    # Relationships
    meal_plans = db.relationship("MealPlan", backref="user", lazy=True)

    def get_profile_dict(self):
        """Convert user profile to a dictionary for the AI prompt."""
        return {
            "name": self.name,
            "email": self.email,
            "dietaryRestrictions": json.loads(self.dietary_restrictions),
            "allergies": json.loads(self.allergies),
            "fitnessGoal": self.fitness_goal,
            "activityLevel": self.activity_level,
            "mealsPerDay": self.meals_per_day,
            "budget": self.budget,
            "prepDays": json.loads(self.prep_days),
            "wakeTime": self.wake_time,
            "lunchBreak": self.lunch_break,
            "preferredCuisine": json.loads(self.preferred_cuisine),
        }


class MealPlan(db.Model):
    __tablename__ = "meal_plans"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plan_data = db.Column(db.Text, nullable=False)
    week_of = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def get_plan(self):
        """Parse the stored JSON plan data."""
        return json.loads(self.plan_data)