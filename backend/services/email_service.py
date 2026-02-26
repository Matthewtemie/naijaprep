from flask_mail import Mail, Message
import os

mail = Mail()


def configure_mail(app):
    """Set up Flask-Mail with Gmail credentials."""
    app.config["MAIL_SERVER"] = "smtp.gmail.com"
    app.config["MAIL_PORT"] = 587
    app.config["MAIL_USE_TLS"] = True
    app.config["MAIL_USERNAME"] = os.getenv("GMAIL_ADDRESS")
    app.config["MAIL_PASSWORD"] = os.getenv("GMAIL_APP_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = ("NaijaPrep", os.getenv("GMAIL_ADDRESS"))
    mail.init_app(app)


def send_welcome_email(user):
    """Send a welcome email when a new user signs up."""
    try:
        html = f"""
        <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#FBF7F2;">
          <div style="background:linear-gradient(135deg,#C4633F,#1B4332);padding:36px;text-align:center;">
            <div style="font-size:40px;margin-bottom:10px;">🍲</div>
            <h1 style="color:white;font-size:28px;margin:0;">Welcome to NaijaPrep, {user.name}!</h1>
          </div>
          <div style="padding:28px;">
            <p style="font-size:15px;color:#2D2A26;line-height:1.6;">
              Your account is set up and your first personalized meal plan is being generated.
            </p>
            <p style="font-size:15px;color:#2D2A26;line-height:1.6;">Every week, you'll receive:</p>
            <ul style="color:#2D2A26;font-size:14px;line-height:1.8;">
              <li>A 7-day meal plan tailored to your <strong>{user.fitness_goal}</strong> goal</li>
              <li>A complete grocery list with Nigerian market quantities</li>
              <li>A batch prep schedule for your chosen prep days</li>
            </ul>
            <p style="font-size:13px;color:#7C7670;margin-top:24px;">Eat well, perform better 🇳🇬</p>
          </div>
        </div>
        """

        msg = Message(
            subject="🍲 Welcome to NaijaPrep!",
            recipients=[user.email],
            html=html,
        )
        mail.send(msg)
        return {"success": True}

    except Exception as e:
        print(f"Welcome email error: {e}")
        return {"success": False, "error": str(e)}


def send_meal_plan_email(user, plan_data):
    """Send the weekly meal plan via email."""
    try:
        profile = user.get_profile_dict()
        html = _build_meal_plan_html(plan_data, profile)

        msg = Message(
            subject="🍲 Your NaijaPrep Weekly Meal Plan",
            recipients=[user.email],
            html=html,
        )
        mail.send(msg)
        return {"success": True}

    except Exception as e:
        print(f"Meal plan email error: {e}")
        return {"success": False, "error": str(e)}


def _build_meal_plan_html(data, profile):
    """Build the HTML email content."""
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    h = '<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#FBF7F2;">'

    # Header
    h += '<div style="background:linear-gradient(135deg,#C4633F 0%,#9E4A2A 50%,#1B4332 100%);padding:36px 32px;text-align:center;">'
    h += '<div style="font-size:32px;margin-bottom:8px;">🍲</div>'
    h += '<h1 style="color:white;font-size:24px;margin:0 0 6px;">Your Weekly Meal Plan</h1>'
    h += f'<p style="color:rgba(255,255,255,.8);font-size:13px;margin:0;">'
    h += f'Goal: {profile["fitnessGoal"]} · {profile["mealsPerDay"]} meals/day</p></div>'

    h += '<div style="padding:24px 28px;">'
    h += f'<p style="font-size:15px;color:#2D2A26;margin-bottom:20px;">Hi {profile["name"]} 👋 Here\'s your plan for the week.</p>'

    # Daily meals
    for day in days:
        meals = data.get("plan", {}).get(day, [])
        if not meals:
            continue
        h += '<div style="margin-bottom:16px;background:white;border-radius:12px;padding:16px;border:1px solid #E8E0D4;">'
        h += f'<h3 style="color:#C4633F;font-size:14px;font-weight:700;margin:0 0 10px;text-transform:uppercase;">{day}</h3>'
        for meal in meals:
            h += '<div style="padding:6px 0;border-bottom:1px solid #F5F0EA;">'
            h += f'<span style="font-size:10px;color:#C4633F;font-weight:700;text-transform:uppercase;">{meal.get("time", "")}</span><br/>'
            h += f'<span style="font-size:14px;font-weight:600;">{meal.get("name", "")}</span>'
            h += f'<span style="font-size:12px;color:#7C7670;"> — {meal.get("cal", 0)} kcal · {meal.get("protein", 0)}g protein</span></div>'
        h += '</div>'

    # Grocery list
    h += '<div style="background:#F5F0EA;border-radius:12px;padding:18px;margin:16px 0;">'
    h += '<h3 style="color:#1B4332;font-size:13px;font-weight:700;margin:0 0 12px;">🛒 GROCERY LIST</h3>'
    for cat, items in data.get("grocery", {}).items():
        h += f'<p style="font-weight:700;color:#C4633F;font-size:11px;margin:10px 0 4px;text-transform:uppercase;">{cat}</p>'
        for item in items:
            h += f'<div style="font-size:13px;padding:2px 0;">☐ {item}</div>'
    h += '</div>'

    # Weekly tip
    tip = data.get("weeklyTip", "")
    if tip:
        h += f'<div style="background:#D4E7DC;border-radius:12px;padding:14px 18px;margin-bottom:16px;">'
        h += f'<p style="font-size:13px;color:#1B4332;margin:0;">💡 <strong>Tip:</strong> {tip}</p></div>'

    h += '<p style="text-align:center;font-size:11px;color:#7C7670;margin-top:20px;">NaijaPrep AI · Eat well, perform better 🇳🇬</p>'
    h += '</div></div>'

    return h