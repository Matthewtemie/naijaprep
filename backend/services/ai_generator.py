import anthropic
import json
import os


def generate_meal_plan(profile):
    """
    Call Claude API to generate a personalized Nigerian meal plan.
    Returns {"success": True, "data": {...}} or {"success": False, "error": "..."}
    """
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    prompt = f"""You are NaijaPrep, an AI nutritionist specializing in Nigerian cuisine
for busy professionals.

Generate a 7-day meal plan based on this profile:
- Name: {profile['name']}
- Goal: {profile['fitnessGoal']}
- Activity: {profile['activityLevel']}
- Meals/day: {profile['mealsPerDay']}
- Dietary restrictions: {', '.join(profile['dietaryRestrictions']) or 'None'}
- Allergies: {', '.join(profile['allergies']) or 'None'}
- Cuisine preference: {', '.join(profile['preferredCuisine'])}
- Budget: {profile['budget']}
- Prep days: {', '.join(profile['prepDays'])}
- Wake time: {profile['wakeTime']}
- Lunch break: {profile['lunchBreak']} minutes

RESPOND ONLY WITH VALID JSON (no markdown, no backticks, no extra text).
Use this exact structure:
{{
  "plan": {{
    "Monday": [
      {{"time":"Breakfast","name":"Dish Name","desc":"Short description","cal":350,"protein":15,"carbs":40,"fat":12,"prep":"15 min","tip":"Optional prep tip"}}
    ],
    "Tuesday": [...],
    "Wednesday": [...],
    "Thursday": [...],
    "Friday": [...],
    "Saturday": [...],
    "Sunday": [...]
  }},
  "grocery": {{
    "Proteins": ["Chicken breast (2kg)", "..."],
    "Grains & Starches": ["Rice (5kg)", "..."],
    "Vegetables & Greens": ["Spinach (3 bunches)", "..."],
    "Oils & Seasonings": ["Palm oil (1 bottle)", "..."],
    "Soup Essentials": ["Egusi (2 cups)", "..."],
    "Snacks & Extras": ["Groundnuts (2 cups)", "..."]
  }},
  "prepSchedule": [
    {{
      "day": "Sunday",
      "totalTime": "4 hours",
      "tasks": [
        {{"time": "8:00 AM", "task": "Blend pepper mix for the week", "duration": "25 min"}}
      ]
    }}
  ],
  "weeklyTip": "One helpful tip for the week",
  "dailyCals": 2000
}}

Rules:
- Use ONLY authentic Nigerian dishes (Jollof Rice, Egusi Soup, Amala, Ofada Rice,
  Pepper Soup, Akara, Moi Moi, Banga, Efo Riro, Edikaikong, etc.)
- Include each day Monday through Sunday
- Each day must have exactly {profile['mealsPerDay']} meals
- Adjust calories for the {profile['fitnessGoal']} goal
- Respect all dietary restrictions and allergies
- Grocery quantities should feed 1 person for 7 days
- Use realistic Nigerian market quantities"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}],
        )

        # Get the text from Claude's response
        text = ""
        for block in message.content:
            if block.type == "text":
                text += block.text

        # Clean and parse the JSON
        clean = text.replace("```json", "").replace("```", "").strip()
        plan = json.loads(clean)

        # Make sure the plan has all 7 days
        if "plan" in plan and len(plan["plan"]) >= 7:
            return {"success": True, "data": plan}
        else:
            return {"success": False, "error": "Plan missing days"}

    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        return {"success": False, "error": f"JSON parse error: {str(e)}"}
    except Exception as e:
        print(f"AI generation error: {e}")
        return {"success": False, "error": str(e)}