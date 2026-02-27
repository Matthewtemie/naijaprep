import { useState, useCallback, useEffect } from "react";
import { authApi, mealsApi } from "./services/api";

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */

const RESTRICTIONS = [
  { label: "Halal", emoji: "🕌" },
  { label: "No Pork", emoji: "🚫" },
  { label: "Vegetarian", emoji: "🥬" },
  { label: "Pescatarian", emoji: "🐟" },
  { label: "Low Carb", emoji: "🥩" },
  { label: "Keto", emoji: "🥑" },
  { label: "Gluten Free", emoji: "🌾" },
  { label: "Dairy Free", emoji: "🥛" },
];
const ALLERGIES = [
  { label: "Nuts", emoji: "🥜" },
  { label: "Shellfish", emoji: "🦐" },
  { label: "Eggs", emoji: "🥚" },
  { label: "Soy", emoji: "🌱" },
];
const GOALS = [
  { id: "lose", label: "Lose Weight", desc: "Calorie deficit with balanced macros", emoji: "🏃‍♀️" },
  { id: "gain", label: "Build Muscle", desc: "High protein, caloric surplus", emoji: "💪" },
  { id: "maintain", label: "Stay Healthy", desc: "Balanced nutrition maintenance", emoji: "🌿" },
  { id: "energy", label: "Boost Energy", desc: "Complex carbs and steady fuel", emoji: "⚡" },
];
const ACTIVITY = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"];
const BUDGETS = [
  { label: "Budget Friendly", emoji: "🪙" },
  { label: "Moderate", emoji: "💳" },
  { label: "Flexible", emoji: "💎" },
];
const PREP_DAYS = [
  { label: "Saturday", emoji: "📅" },
  { label: "Sunday", emoji: "📅" },
  { label: "Wednesday", emoji: "📅" },
  { label: "Both Weekend Days", emoji: "📅" },
];
const CUISINES = [
  { label: "Traditional", full: "Traditional Nigerian", emoji: "🍲" },
  { label: "Modern Fusion", full: "Modern Fusion", emoji: "✨" },
  { label: "Northern", full: "Northern Nigerian", emoji: "🌍" },
  { label: "Southern", full: "Southern Nigerian", emoji: "🌊" },
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MEAL_EMOJIS = {
  Breakfast: "🍳", Lunch: "🍛", Dinner: "🍲", Snack: "🍿",
  "7:00 AM": "🍳", "12:30 PM": "🌾", "4:00 PM": "🍿", "7:00 PM": "🍲",
};

const GROCERY_EMOJIS = {
  "Proteins": "🥩",
  "Grains & Starches": "🌾",
  "Vegetables & Greens": "🥬",
  "Oils & Seasonings": "🫒",
  "Soup Essentials": "🍜",
  "Snacks & Extras": "🍬",
};


/* ═══════════════════════════════════════════════════
   ONBOARDING
   ═══════════════════════════════════════════════════ */

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    name: "", email: "", password: "",
    dietaryRestrictions: [], allergies: [],
    fitnessGoal: "", activityLevel: "",
    mealsPerDay: 3, budget: "Moderate",
    prepDays: ["Sunday"], wakeTime: "06:30",
    lunchBreak: "30", preferredCuisine: ["Traditional Nigerian"],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k, v) =>
    setF((p) => ({
      ...p,
      [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v],
    }));

  const valid = () => {
    if (step === 0) return f.name.trim().length >= 2 && f.email.includes("@") && f.password.length >= 6;
    if (step === 1) return true;
    if (step === 2) return f.fitnessGoal && f.activityLevel;
    return f.prepDays.length > 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.signup(f);
      onComplete(data.user, data.profile);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
      setLoading(false);
    }
  };

  const stepLabels = ["Account", "Dietary", "Fitness", "Schedule"];

  const steps = [
    // Step 0: Account
    <div key="s0" className="fade-up">
      <h2 className="serif step-title">Account</h2>
      <p className="step-subtitle">Let's get to know you</p>
      <div className="form-stack">
        <div>
          <label className="label">Your Name</label>
          <input className="input" placeholder="e.g. Adaeze" value={f.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Email Address</label>
          <input className="input" type="email" placeholder="adaeze@email.com" value={f.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="6+ characters" value={f.password} onChange={(e) => update("password", e.target.value)} />
        </div>
      </div>
    </div>,

    // Step 1: Dietary
    <div key="s1" className="fade-up">
      <h2 className="serif step-title">Dietary</h2>
      <p className="step-subtitle">What do you eat?</p>
      <label className="label">Dietary Restrictions</label>
      <div className="chip-grid">
        {RESTRICTIONS.map((r) => (
          <div key={r.label} className={`chip-emoji ${f.dietaryRestrictions.includes(r.label) ? "active" : ""}`} onClick={() => toggle("dietaryRestrictions", r.label)}>
            <span className="chip-icon">{r.emoji}</span>{r.label}
          </div>
        ))}
      </div>
      <label className="label" style={{ marginTop: 20 }}>Allergies</label>
      <div className="chip-grid">
        {ALLERGIES.map((a) => (
          <div key={a.label} className={`chip-emoji ${f.allergies.includes(a.label) ? "active" : ""}`} onClick={() => toggle("allergies", a.label)}>
            <span className="chip-icon">{a.emoji}</span>{a.label}
          </div>
        ))}
      </div>
      <label className="label" style={{ marginTop: 20 }}>Cuisine Preference</label>
      <div className="chip-grid">
        {CUISINES.map((c) => (
          <div key={c.label} className={`chip-emoji ${f.preferredCuisine.includes(c.full) ? "active" : ""}`} onClick={() => toggle("preferredCuisine", c.full)}>
            <span className="chip-icon">{c.emoji}</span>{c.label}
          </div>
        ))}
      </div>
    </div>,

    // Step 2: Fitness
    <div key="s2" className="fade-up">
      <h2 className="serif step-title">Fitness</h2>
      <p className="step-subtitle">What's your goal?</p>
      <div className="goal-grid">
        {GOALS.map((g) => (
          <div key={g.id} className={`goal-card ${f.fitnessGoal === g.label ? "active" : ""}`} onClick={() => update("fitnessGoal", g.label)}>
            <span className="goal-emoji">{g.emoji}</span>
            <div className="goal-label">{g.label}</div>
            <div className="goal-desc">{g.desc}</div>
          </div>
        ))}
      </div>
      <label className="label" style={{ marginTop: 20 }}>Activity Level</label>
      <div className="chip-grid">
        {ACTIVITY.map((a) => (
          <div key={a} className={`chip-emoji ${f.activityLevel === a ? "active" : ""}`} onClick={() => update("activityLevel", a)}>{a}</div>
        ))}
      </div>
    </div>,

    // Step 3: Schedule
    <div key="s3" className="fade-up">
      <h2 className="serif step-title">Schedule</h2>
      <p className="step-subtitle">When do you cook?</p>
      <label className="label">Meals per day</label>
      <div className="meals-number-row">
        {[2, 3, 4, 5].map((n) => (
          <div key={n} className={`meals-number ${f.mealsPerDay === n ? "active" : ""}`} onClick={() => update("mealsPerDay", n)}>{n}</div>
        ))}
      </div>
      <label className="label" style={{ marginTop: 20 }}>Prep Days</label>
      <div className="chip-grid">
        {PREP_DAYS.map((d) => (
          <div key={d.label} className={`chip-emoji ${f.prepDays.includes(d.label) ? "active" : ""}`} onClick={() => toggle("prepDays", d.label)}>
            <span className="chip-icon">{d.emoji}</span>{d.label}
          </div>
        ))}
      </div>
      <label className="label" style={{ marginTop: 20 }}>Weekly Budget</label>
      <div className="chip-grid">
        {BUDGETS.map((b) => (
          <div key={b.label} className={`chip-emoji ${f.budget === b.label ? "active" : ""}`} onClick={() => update("budget", b.label)}>
            <span className="chip-icon">{b.emoji}</span>{b.label}
          </div>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="onboarding-layout">
      {/* Left: Food Photo */}
      <div className="onboarding-left" style={{ backgroundImage: "url(/onboarding-bg.jpg)" }}>
        <div className="onboarding-left-overlay">
          <div className="onboarding-left-content">
            <h1 className="serif onboarding-brand">NaijaPrep</h1>
            <p className="onboarding-tagline">
              Your AI-powered kitchen companion for authentic Nigerian meal planning. Eat well, save time, stay healthy.
            </p>
            <div className="onboarding-stats">
              <div className="onboarding-stat">
                <div className="onboarding-stat-value">28+</div>
                <div className="onboarding-stat-label">Nigerian Dishes</div>
              </div>
              <div className="onboarding-stat">
                <div className="onboarding-stat-value">7</div>
                <div className="onboarding-stat-label">Day Plans</div>
              </div>
              <div className="onboarding-stat">
                <div className="onboarding-stat-value">AI</div>
                <div className="onboarding-stat-label">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="onboarding-right">
        <div className="onboarding-form-container">
          {/* Progress bar */}
          <div className="step-progress">
            {stepLabels.map((label, i) => (
              <div key={label} className="step-progress-item">
                <div className={`step-progress-bar ${i <= step ? "filled" : ""}`} />
                <span className={`step-progress-label ${i === step ? "current" : ""}`}>{label}</span>
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="step-content">{steps[step]}</div>

          {/* Error */}
          {error && <div className="error-banner">{error}</div>}

          {/* Buttons */}
          <div className="step-buttons">
            {step > 0 && (
              <button className="btn-back" onClick={() => setStep((s) => s - 1)}>‹ Back</button>
            )}
            <button
              className={step === 3 ? "btn-generate" : "btn-next"}
              disabled={!valid() || loading}
              onClick={() => (step === 3 ? handleSubmit() : setStep((s) => s + 1))}
            >
              {loading ? "Creating..." : step === 3 ? "Generate My Plan ✦" : "Next ›"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   LOADING SCREEN
   ═══════════════════════════════════════════════════ */

function LoadingScreen({ name }) {
  const [idx, setIdx] = useState(0);
  const msgs = [
    { emoji: "🔍", text: "Analyzing your dietary profile..." },
    { emoji: "🍅", text: "Selecting authentic Nigerian dishes..." },
    { emoji: "📊", text: "Calculating optimal macros..." },
    { emoji: "🛒", text: "Building your grocery list..." },
    { emoji: "📅", text: "Scheduling batch prep sessions..." },
    { emoji: "✨", text: "Finalizing your plan..." },
  ];

  useEffect(() => {
    const i = setInterval(() => setIdx((p) => Math.min(p + 1, msgs.length - 1)), 2200);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-card scale-in">
        <div className="loading-pot">🍲</div>
        <h2 className="serif" style={{ fontSize: 24, marginBottom: 8 }}>Cooking up your plan{name ? `, ${name}` : ""}...</h2>
        <div className="loading-steps">
          {msgs.map((m, i) => (
            <div key={i} className={`loading-step ${i <= idx ? "visible" : ""} ${i === idx ? "current" : ""}`}>
              <span className="loading-step-emoji">{m.emoji}</span>
              <span className="loading-step-text">{m.text}</span>
              {i < idx && <span className="loading-check">✓</span>}
              {i === idx && <span className="loading-spinner">⟳</span>}
            </div>
          ))}
        </div>
        <div className="loading-bar">
          <div className="loading-bar-fill" style={{ width: `${Math.min(((idx + 1) / msgs.length) * 100, 95)}%` }} />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════ */

function Dashboard({ data, user, profile, onRegenerate, onLogout }) {
  const [tab, setTab] = useState("meals");
  const [dayIdx, setDayIdx] = useState(0);
  const day = DAYS[dayIdx];

  const meals = data.plan?.[day] || [];
  const totals = meals.reduce(
    (a, m) => ({ cal: a.cal + (m.cal || 0), protein: a.protein + (m.protein || 0), carbs: a.carbs + (m.carbs || 0), fat: a.fat + (m.fat || 0) }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const maxCal = data.dailyCals || 2200;

  // Count total grocery items
  const allGroceryItems = Object.values(data.grocery || {}).flat();
  const [checkedItems, setCheckedItems] = useState({});
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const toggleGrocery = (item) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-logo">🍲</span>
          <span className="serif nav-title">NaijaPrep</span>
        </div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={onRegenerate}>🔄 Regenerate</button>
          <button className="nav-btn-icon" onClick={onLogout} title="Sign out">⎋</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero" style={{ backgroundImage: "url(/hero-food.jpg)" }}>
        <div className="hero-overlay">
          <p className="hero-welcome">Welcome back, {user.name} 👋</p>
          <h1 className="serif hero-title">Your Weekly Meal Plan</h1>
          <p className="hero-meta">{profile.fitnessGoal} · {profile.mealsPerDay} meals/day</p>
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-label"><span className="stat-emoji">🎯</span> Daily Target</div>
              <div className="stat-value">{maxCal}</div>
              <div className="stat-unit">kcal</div>
            </div>
            <div className="stat-card">
              <div className="stat-label"><span className="stat-emoji">🔥</span> {day}</div>
              <div className="stat-value">{totals.cal}</div>
              <div className="stat-progress-bar">
                <div className="stat-progress-fill" style={{ width: `${Math.min((totals.cal / maxCal) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label"><span className="stat-emoji">🌿</span> Protein</div>
              <div className="stat-value">{totals.protein}g</div>
              <div className="stat-unit">today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="dash-content">
        {/* Weekly tip */}
        {data.weeklyTip && (
          <div className="tip-card fade-up">
            <span className="tip-emoji">💡</span>
            <p className="tip-text">{data.weeklyTip}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="tab-bar fade-up">
          {[
            { id: "meals", label: "Meal Plan", emoji: "📋" },
            { id: "grocery", label: "Grocery List", emoji: "🛒" },
            { id: "prep", label: "Prep Schedule", emoji: "⏰" },
          ].map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="tab-emoji">{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ── Meals Tab ── */}
        {tab === "meals" && (
          <div className="fade-up">
            <div className="day-pills">
              {DAYS.map((d, i) => (
                <button key={d} className={`day-pill ${dayIdx === i ? "active" : ""}`} onClick={() => setDayIdx(i)}>
                  <span className="day-pill-name">{DAY_SHORT[i]}</span>
                  <span className="day-pill-num">{i + 1}</span>
                </button>
              ))}
            </div>

            {meals.map((meal, mi) => (
              <div key={mi} className={`meal-card fade-up stagger-${Math.min(mi + 1, 5)}`}>
                <div className="meal-header">
                  <div className="meal-header-left">
                    <span className="meal-emoji">{MEAL_EMOJIS[meal.time] || "🍽️"}</span>
                    <div>
                      <div className="meal-time">{meal.time}</div>
                      <h3 className="serif meal-name">{meal.name}</h3>
                    </div>
                  </div>
                  <div className="meal-cal-badge">
                    <span className="meal-cal-num">{meal.cal}</span>
                    <span className="meal-cal-unit">kcal</span>
                  </div>
                </div>
                <p className="meal-desc">{meal.desc}</p>
                <div className="meal-macros">
                  {[
                    { label: "Protein", val: meal.protein, max: 50, color: "var(--forest)" },
                    { label: "Carbs", val: meal.carbs, max: 80, color: "var(--terra)" },
                    { label: "Fat", val: meal.fat, max: 40, color: "var(--amber)" },
                  ].map((m) => (
                    <div key={m.label} className="macro-row">
                      <span className="macro-label">{m.label}</span>
                      <div className="macro-bar">
                        <div className="macro-fill" style={{ width: `${Math.min((m.val / m.max) * 100, 100)}%`, background: m.color }} />
                      </div>
                      <span className="macro-val">{m.val}g</span>
                    </div>
                  ))}
                </div>
                {(meal.prep || meal.tip) && (
                  <div className="meal-footer">
                    {meal.prep && <span className="meal-prep-tag">⏱ {meal.prep}</span>}
                    {meal.tip && <span className="meal-tip-text">· {meal.tip}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Grocery Tab ── */}
        {tab === "grocery" && (
          <div className="fade-up">
            {/* Progress */}
            <div className="grocery-progress-card">
              <span className="grocery-progress-emoji">🛒</span>
              <div className="grocery-progress-info">
                <div className="grocery-progress-text">
                  <span>{checkedCount} of {allGroceryItems.length} items</span>
                  <span>{allGroceryItems.length > 0 ? Math.round((checkedCount / allGroceryItems.length) * 100) : 0}%</span>
                </div>
                <div className="grocery-progress-bar">
                  <div className="grocery-progress-fill" style={{ width: `${allGroceryItems.length > 0 ? (checkedCount / allGroceryItems.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            {Object.entries(data.grocery || {}).map(([category, items], ci) => (
              <div key={category} className={`fade-up stagger-${Math.min(ci + 1, 5)}`}>
                <div className="grocery-category-header">
                  <span>{GROCERY_EMOJIS[category] || "📦"}</span>
                  <span className="serif">{category}</span>
                </div>
                <div className="grocery-list-card">
                  {(items || []).map((item, j) => {
                    const parts = parseGroceryItem(item);
                    return (
                      <div key={j} className={`grocery-item ${checkedItems[item] ? "checked" : ""}`} onClick={() => toggleGrocery(item)}>
                        <div className={`grocery-checkbox ${checkedItems[item] ? "checked" : ""}`}>
                          {checkedItems[item] && <span>✓</span>}
                        </div>
                        <span className="grocery-item-name">{parts.name}</span>
                        {parts.qty && <span className="grocery-item-qty">{parts.qty}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Prep Tab ── */}
        {tab === "prep" && (
          <div className="fade-up">
            {(data.prepSchedule || []).map((sched, si) => (
              <div key={si} className={`fade-up stagger-${Math.min(si + 1, 3)}`}>
                <h3 className="serif prep-day-title">{sched.day}</h3>
                <div className="prep-timeline">
                  {(sched.tasks || []).map((task, ti) => (
                    <div key={ti} className="prep-task">
                      <div className="prep-dot-col">
                        <div className="prep-dot" />
                        {ti < sched.tasks.length - 1 && <div className="prep-line" />}
                      </div>
                      <div className="prep-task-card">
                        <div className="prep-task-header">
                          <span className="prep-task-time">{task.time}</span>
                          <span className="prep-task-duration">{task.duration}</span>
                        </div>
                        <p className="prep-task-text">{task.task}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="footer">NaijaPrep · AI-Powered Meal Planning for Nigerian Professionals 🇳🇬</div>
      </div>
    </div>
  );
}


/* Helper: parse "Chicken breast (2kg)" into { name, qty } */
function parseGroceryItem(item) {
  const match = item.match(/^(.+?)\s*\((.+)\)$/);
  if (match) return { name: match[1].trim(), qty: match[2].trim() };
  return { name: item, qty: null };
}


/* ═══════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════ */

export default function App() {
  const [screen, setScreen] = useState("onboarding");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mealData, setMealData] = useState(null);

  const handleOnboardingComplete = useCallback(async (userData, profileData) => {
    setUser(userData);
    setProfile(profileData);
    setScreen("loading");
    try {
      const { data } = await mealsApi.generate(userData.id, profileData);
      setMealData(data);
      setScreen("dashboard");
    } catch (err) {
      console.error("Meal generation error:", err);
      setScreen("dashboard");
    }
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (!user || !profile) return;
    setScreen("loading");
    try {
      const { data } = await mealsApi.generate(user.id, profile);
      setMealData(data);
      setScreen("dashboard");
    } catch (err) {
      console.error("Regenerate error:", err);
      setScreen("dashboard");
    }
  }, [user, profile]);

  const handleLogout = () => {
    setScreen("onboarding");
    setUser(null);
    setProfile(null);
    setMealData(null);
  };

  return (
    <>
      {screen === "onboarding" && <Onboarding onComplete={handleOnboardingComplete} />}
      {screen === "loading" && <LoadingScreen name={user?.name} />}
      {screen === "dashboard" && mealData && (
        <Dashboard
          data={mealData}
          user={user}
          profile={profile}
          onRegenerate={handleRegenerate}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}