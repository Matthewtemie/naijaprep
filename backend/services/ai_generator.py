import anthropic
import json
import os
import gc


def generate_meal_plan(profile):
    """
    Call Claude API to generate a personalized Nigerian meal plan.
    Returns {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    # Use calorie target from body profile if available, otherwise estimate
    calorie_target = profile.get("calorieTarget", "")
    calorie_line = f"- Daily calorie target: {calorie_target} kcal" if calorie_target else ""

    macros = profile.get("macros", {})
    macros_line = ""
    if macros:
        macros_line = f"- Macro targets: {macros.get('protein', '')}g protein, {macros.get('carbs', '')}g carbs, {macros.get('fat', '')}g fat"

    prompt = f"""You are NaijaPrep, a Nigerian meal planning AI.

Generate a 7-day meal plan. Profile:
- Goal: {profile.get('fitnessGoal', 'Stay Healthy')}
- Activity: {profile.get('activityLevel', 'Moderately Active')}
- Meals/day: {profile.get('mealsPerDay', 3)}
- Restrictions: {', '.join(profile.get('dietaryRestrictions', [])) or 'None'}
- Allergies: {', '.join(profile.get('allergies', [])) or 'None'}
- Cuisine: {', '.join(profile.get('preferredCuisine', ['Traditional Nigerian']))}
- Budget: {profile.get('budget', 'Moderate')}
- Prep days: {', '.join(profile.get('prepDays', ['Sunday']))}
{calorie_line}
{macros_line}

RESPOND ONLY WITH VALID JSON. No markdown, no backticks.
Structure:
{{
  "plan": {{
    "Monday": [{{"time":"Breakfast","name":"Dish","desc":"Short desc","cal":350,"protein":15,"carbs":40,"fat":12,"prep":"15 min","tip":"Tip"}}],
    "Tuesday": [...], "Wednesday": [...], "Thursday": [...],
    "Friday": [...], "Saturday": [...], "Sunday": [...]
  }},
  "grocery": {{
    "Proteins": ["Chicken breast (2kg)"],
    "Grains & Starches": ["Rice (5kg)"],
    "Vegetables & Greens": ["Spinach (3 bunches)"],
    "Oils & Seasonings": ["Palm oil (1 bottle)"],
    "Soup Essentials": ["Egusi (2 cups)"],
    "Snacks & Extras": ["Groundnuts (2 cups)"]
  }},
  "prepSchedule": [{{
    "day": "Sunday", "totalTime": "4 hours",
    "tasks": [{{"time":"8:00 AM","task":"Blend pepper mix","duration":"25 min"}}]
  }}],
  "weeklyTip": "One tip",
  "dailyCals": {calorie_target or 2000}
}}

Rules:
- ONLY authentic Nigerian dishes
- Each day: exactly {profile.get('mealsPerDay', 3)} meals
- Respect all restrictions and allergies
- Grocery for 1 person, 7 days"""

    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=3000,
            messages=[{"role": "user", "content": prompt}],
        )

        text = ""
        for block in message.content:
            if block.type == "text":
                text += block.text

        clean = text.replace("```json", "").replace("```", "").strip()
        plan = json.loads(clean)

        # Free memory
        del text, clean, message
        gc.collect()

        if "plan" in plan and len(plan["plan"]) >= 7:
            return {"success": True, "data": plan}
        else:
            return {"success": False, "error": "Plan missing days"}

    except json.JSONDecodeError as e:
        gc.collect()
        print(f"JSON parse error: {e}")
        return {"success": False, "error": f"JSON parse error: {str(e)}"}
    except Exception as e:
        gc.collect()
        print(f"AI generation error: {e}")
        return {"success": False, "error": str(e)}