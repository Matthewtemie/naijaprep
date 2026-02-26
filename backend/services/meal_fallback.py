def fallback_plan(profile):
    """
    Generate a curated Nigerian meal plan without the API.
    Used as a fallback when Claude is unavailable.
    """
    goal = profile.get("fitnessGoal", "Stay Healthy")
    meals_per_day = profile.get("mealsPerDay", 3)

    # Calorie multiplier based on goal
    if goal == "Lose Weight":
        gm = 0.8
        daily_cals = 1800
    elif goal == "Build Muscle":
        gm = 1.3
        daily_cals = 2600
    else:
        gm = 1.0
        daily_cals = 2100

    def sc(v):
        return round(v * gm)

    breakfasts = [
        {"time": "Breakfast", "name": "Akara & Ogi", "desc": "Golden bean cakes with silky corn pap", "cal": sc(340), "protein": 14, "carbs": 46, "fat": 12, "prep": "15 min"},
        {"time": "Breakfast", "name": "Yam & Egg Sauce", "desc": "Boiled yam with peppered tomato-egg sauce", "cal": sc(420), "protein": 18, "carbs": 54, "fat": 14, "prep": "20 min"},
        {"time": "Breakfast", "name": "Moi Moi & Pap", "desc": "Steamed bean pudding — great for batch prep", "cal": sc(380), "protein": 20, "carbs": 42, "fat": 13, "prep": "Prep ahead"},
        {"time": "Breakfast", "name": "Oats with Groundnuts & Banana", "desc": "Quick Nigerian-style porridge oats", "cal": sc(350), "protein": 14, "carbs": 48, "fat": 11, "prep": "8 min"},
        {"time": "Breakfast", "name": "Plantain & Egg Frittata", "desc": "Pan-fried ripe plantain with seasoned eggs", "cal": sc(400), "protein": 20, "carbs": 38, "fat": 18, "prep": "15 min"},
        {"time": "Breakfast", "name": "Hausa Koko & Koose", "desc": "Spiced millet porridge with bean fritters", "cal": sc(330), "protein": 12, "carbs": 50, "fat": 10, "prep": "20 min"},
        {"time": "Breakfast", "name": "Bread, Stew & Boiled Eggs", "desc": "Classic Nigerian breakfast combo", "cal": sc(410), "protein": 22, "carbs": 40, "fat": 18, "prep": "10 min"},
    ]

    lunches = [
        {"time": "Lunch", "name": "Jollof Rice & Grilled Chicken", "desc": "Smoky party jollof with lean grilled chicken", "cal": sc(560), "protein": 34, "carbs": 62, "fat": 16, "prep": "Batch prep", "tip": "Cook a big pot Sunday — tastes even better reheated"},
        {"time": "Lunch", "name": "Beans & Plantain Porridge", "desc": "Hearty one-pot high-protein comfort food", "cal": sc(500), "protein": 22, "carbs": 68, "fat": 11, "prep": "Batch prep"},
        {"time": "Lunch", "name": "Ofada Rice & Ayamase", "desc": "Local rice with spicy green pepper sauce", "cal": sc(540), "protein": 28, "carbs": 60, "fat": 18, "prep": "Batch prep"},
        {"time": "Lunch", "name": "Fried Rice & Grilled Tilapia", "desc": "Veggie-loaded fried rice with crispy fish", "cal": sc(530), "protein": 30, "carbs": 58, "fat": 16, "prep": "Batch prep"},
        {"time": "Lunch", "name": "Yam Porridge & Smoked Fish", "desc": "Chunky yam in rich peppered sauce", "cal": sc(480), "protein": 24, "carbs": 56, "fat": 14, "prep": "30 min"},
        {"time": "Lunch", "name": "Coconut Rice & Peppered Turkey", "desc": "Fragrant coconut rice with spicy turkey", "cal": sc(550), "protein": 30, "carbs": 62, "fat": 17, "prep": "Batch prep"},
        {"time": "Lunch", "name": "Tuwo Shinkafa & Miyan Kuka", "desc": "Northern rice swallow with baobab leaf soup", "cal": sc(470), "protein": 22, "carbs": 64, "fat": 12, "prep": "Batch prep"},
    ]

    dinners = [
        {"time": "Dinner", "name": "Egusi Soup & Pounded Yam", "desc": "Rich melon seed soup — the king of Nigerian dinners", "cal": sc(600), "protein": 30, "carbs": 52, "fat": 26, "prep": "Batch prep", "tip": "Freeze in portions for easy weeknight dinners"},
        {"time": "Dinner", "name": "Pepper Soup with Fish", "desc": "Light, spicy broth — gentle on the stomach at night", "cal": sc(360), "protein": 32, "carbs": 14, "fat": 16, "prep": "25 min"},
        {"time": "Dinner", "name": "Efo Riro & Amala", "desc": "Rich spinach stew with smooth yam flour swallow", "cal": sc(520), "protein": 26, "carbs": 46, "fat": 24, "prep": "Batch prep"},
        {"time": "Dinner", "name": "Suya-Spiced Chicken Salad", "desc": "Grilled suya chicken over fresh greens", "cal": sc(400), "protein": 36, "carbs": 16, "fat": 22, "prep": "20 min", "tip": "Great low-carb option for weight loss days"},
        {"time": "Dinner", "name": "Edikaikong & Garri", "desc": "Cross River vegetable soup, packed with greens", "cal": sc(480), "protein": 24, "carbs": 48, "fat": 20, "prep": "Batch prep"},
        {"time": "Dinner", "name": "Banga Soup & Starch", "desc": "Palm fruit soup — rich, aromatic, and filling", "cal": sc(540), "protein": 26, "carbs": 50, "fat": 24, "prep": "Batch prep"},
        {"time": "Dinner", "name": "Ogbono Soup & Semolina", "desc": "Silky draw soup with your choice of protein", "cal": sc(510), "protein": 28, "carbs": 48, "fat": 22, "prep": "Batch prep"},
    ]

    snacks = [
        {"time": "Snack", "name": "Roasted Plantain Chips", "desc": "Crunchy, lightly salted", "cal": sc(150), "protein": 2, "carbs": 28, "fat": 5, "prep": "Grab & go"},
        {"time": "Snack", "name": "Boiled Groundnuts", "desc": "Protein-packed traditional snack", "cal": sc(180), "protein": 8, "carbs": 12, "fat": 12, "prep": "Grab & go"},
        {"time": "Snack", "name": "Garden Egg & Groundnut Paste", "desc": "Crunchy veggies with nutty dip", "cal": sc(120), "protein": 4, "carbs": 14, "fat": 6, "prep": "5 min"},
        {"time": "Snack", "name": "Tiger Nuts", "desc": "Sweet, crunchy superfood", "cal": sc(160), "protein": 3, "carbs": 22, "fat": 7, "prep": "Grab & go"},
        {"time": "Snack", "name": "Kilishi", "desc": "Nigerian dried spiced meat", "cal": sc(140), "protein": 18, "carbs": 4, "fat": 6, "prep": "Grab & go"},
        {"time": "Snack", "name": "Coconut Chunks", "desc": "Fresh coconut wedges", "cal": sc(130), "protein": 2, "carbs": 8, "fat": 10, "prep": "Grab & go"},
        {"time": "Snack", "name": "Small Chin Chin", "desc": "Crunchy fried dough bites", "cal": sc(170), "protein": 3, "carbs": 24, "fat": 8, "prep": "Grab & go"},
    ]

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    plan = {}
    for i, day in enumerate(days):
        day_meals = [breakfasts[i], lunches[i], dinners[i]]
        if meals_per_day >= 4:
            day_meals.insert(2, snacks[i])
        if meals_per_day >= 5:
            day_meals.append(snacks[(i + 3) % 7])
        plan[day] = day_meals

    prep_days_list = profile.get("prepDays", ["Sunday"])

    return {
        "plan": plan,
        "grocery": {
            "Proteins": [
                "Chicken breast (2kg)",
                "Tilapia (1.5kg)",
                "Eggs (1 crate - 30pcs)",
                "Smoked fish (500g)",
                "Turkey (1kg)",
                "Beef (1kg)",
                "Honey beans (4 cups)",
            ],
            "Grains & Starches": [
                "Rice (5kg bag)",
                "Yam (1 medium tuber)",
                "Plantain (1 bunch - 7 fingers)",
                "Garri (1 paint bucket)",
                "Semolina (1kg)",
                "Bread (2 loaves)",
                "Oats (500g)",
            ],
            "Vegetables & Greens": [
                "Spinach/Efo tete (3 bunches)",
                "Pumpkin leaves (2 bunches)",
                "Tomatoes (1 basket)",
                "Scotch bonnet peppers (1 bag)",
                "Onions (10 pieces)",
                "Garden eggs (10)",
                "Okra (15 fingers)",
            ],
            "Oils & Seasonings": [
                "Palm oil (1 bottle)",
                "Vegetable oil (1 bottle)",
                "Crayfish (1 cup)",
                "Locust beans/iru (small bag)",
                "Seasoning cubes (1 pack)",
                "Suya spice (1 bag)",
                "Thyme & curry",
            ],
            "Soup Essentials": [
                "Egusi melon seeds (2 cups)",
                "Ogbono seeds (1 cup)",
                "Stockfish (2 pieces)",
                "Dried fish (5 pieces)",
                "Uziza leaves (1 bunch)",
                "Banga extract (1 tin)",
            ],
            "Snacks & Extras": [
                "Groundnuts (2 cups)",
                "Tiger nuts (1 cup)",
                "Coconut (2 pieces)",
                "Chin chin (small pack)",
                "Kilishi (1 pack)",
            ],
        },
        "prepSchedule": [
            {
                "day": day,
                "totalTime": "3.5 - 4 hours",
                "tasks": [
                    {"time": "8:00 AM", "task": "Wash, blend and portion pepper mix (tomatoes, peppers, onions)", "duration": "25 min"},
                    {"time": "8:30 AM", "task": "Cook base tomato stew in a large pot", "duration": "40 min"},
                    {"time": "9:10 AM", "task": "Parboil and cook rice (enough for 3-4 days)", "duration": "35 min"},
                    {"time": "9:45 AM", "task": "Prepare main soup (Egusi, Efo Riro, or Ogbono)", "duration": "50 min"},
                    {"time": "10:35 AM", "task": "Season and grill/bake chicken and fish portions", "duration": "40 min"},
                    {"time": "11:15 AM", "task": "Wrap and steam Moi Moi. Boil eggs (6-8)", "duration": "30 min"},
                    {"time": "11:45 AM", "task": "Portion meals into labeled containers", "duration": "20 min"},
                    {"time": "12:05 PM", "task": "Clean kitchen and organize fridge", "duration": "15 min"},
                ],
            }
            for day in prep_days_list
        ],
        "weeklyTip": "Invest in good meal prep containers — glass ones keep food fresher and reheat better.",
        "dailyCals": daily_cals,
    }