import { useState, useCallback, useRef } from "react";
import { authApi, mealsApi, emailApi } from "./services/api";

/* ═══════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════ */

const RESTRICTIONS = ["Halal", "No Pork", "Vegetarian", "Pescatarian", "Low Carb", "Keto", "Gluten Free", "Dairy Free"];
const ALLERGIES = ["Nuts", "Shellfish", "Eggs", "Soy", "Fish", "Sesame"];
const GOALS = [
  { id: "lose", label: "Lose Weight", desc: "Calorie deficit with high protein" },
  { id: "gain", label: "Build Muscle", desc: "Calorie surplus with macro targets" },
  { id: "maintain", label: "Stay Healthy", desc: "Balanced nutrition & energy" },
  { id: "energy", label: "Boost Energy", desc: "Sustained fuel for long workdays" },
];
const ACTIVITY = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"];
const BUDGETS = ["Budget Friendly", "Moderate", "Flexible"];
const PREP_DAYS = ["Saturday", "Sunday", "Wednesday", "Both Weekend Days"];
const CUISINES = ["Traditional Nigerian", "Modern Fusion", "Northern Nigerian", "Southern Nigerian"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


/* ═══════════════════════════════════════════════════
   ONBOARDING SCREEN
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
      const msg = err.response?.data?.error || "Something went wrong";
      setError(msg);
      setLoading(false);
    }
  };

  const steps = [
    // Step 0: Account info
    <div key="s0" className="fade-up">
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12, animation: "float 3s ease-in-out infinite" }}>🍲</div>
        <h1 className="serif" style={{ fontSize: 28, marginBottom: 6 }}>Let's build your meal plan</h1>
        <p style={{ color: "var(--stone)", fontSize: 15, lineHeight: 1.5, maxWidth: 380, margin: "0 auto" }}>
          AI-optimized Nigerian meals tailored to your goals, schedule, and taste.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label className="label">Your first name</label>
          <input className="input" placeholder="Adaeze" value={f.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Email address</label>
          <input className="input" type="email" placeholder="you@company.com" value={f.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="At least 6 characters" value={f.password} onChange={(e) => update("password", e.target.value)} />
        </div>
      </div>
    </div>,

    // Step 1: Dietary preferences
    <div key="s1" className="fade-up">
      <h2 className="serif" style={{ fontSize: 24, marginBottom: 4 }}>Dietary preferences</h2>
      <p style={{ color: "var(--stone)", fontSize: 14, marginBottom: 24 }}>We'll make sure every meal respects your needs</p>
      <label className="label">Restrictions</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {RESTRICTIONS.map((r) => (
          <div key={r} className={`chip ${f.dietaryRestrictions.includes(r) ? "active" : ""}`} onClick={() => toggle("dietaryRestrictions", r)}>
            {f.dietaryRestrictions.includes(r) && "✓ "}{r}
          </div>
        ))}
      </div>
      <label className="label">Allergies</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {ALLERGIES.map((a) => (
          <div key={a} className={`chip ${f.allergies.includes(a) ? "active" : ""}`} onClick={() => toggle("allergies", a)}>
            {f.allergies.includes(a) && "✓ "}{a}
          </div>
        ))}
      </div>
      <label className="label">Cuisine style</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {CUISINES.map((c) => (
          <div key={c} className={`chip ${f.preferredCuisine.includes(c) ? "active" : ""}`} onClick={() => toggle("preferredCuisine", c)}>
            {f.preferredCuisine.includes(c) && "✓ "}{c}
          </div>
        ))}
      </div>
    </div>,

    // Step 2: Fitness goals
    <div key="s2" className="fade-up">
      <h2 className="serif" style={{ fontSize: 24, marginBottom: 4 }}>Your fitness goal</h2>
      <p style={{ color: "var(--stone)", fontSize: 14, marginBottom: 24 }}>This shapes your portions and calorie targets</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {GOALS.map((g) => (
          <div key={g.id} className={`option-card ${f.fitnessGoal === g.label ? "active" : ""}`} onClick={() => update("fitnessGoal", g.label)}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{g.label}</div>
              <div style={{ fontSize: 12, color: "var(--stone)" }}>{g.desc}</div>
            </div>
            {f.fitnessGoal === g.label && <span style={{ color: "var(--terra)", fontSize: 18 }}>✓</span>}
          </div>
        ))}
      </div>
      <label className="label">Activity level</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ACTIVITY.map((a) => (
          <div key={a} className={`chip ${f.activityLevel === a ? "active" : ""}`} onClick={() => update("activityLevel", a)}>{a}</div>
        ))}
      </div>
    </div>,

    // Step 3: Schedule
    <div key="s3" className="fade-up">
      <h2 className="serif" style={{ fontSize: 24, marginBottom: 4 }}>Your weekly schedule</h2>
      <p style={{ color: "var(--stone)", fontSize: 14, marginBottom: 24 }}>We'll optimize prep around your availability</p>
      <label className="label">Meals per day</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {[2, 3, 4, 5].map((n) => (
          <div key={n} className={`chip ${f.mealsPerDay === n ? "active" : ""}`} style={{ minWidth: 50, justifyContent: "center" }} onClick={() => update("mealsPerDay", n)}>{n}</div>
        ))}
      </div>
      <label className="label">Prep days</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {PREP_DAYS.map((d) => (
          <div key={d} className={`chip ${f.prepDays.includes(d) ? "active" : ""}`} onClick={() => toggle("prepDays", d)}>
            {f.prepDays.includes(d) && "✓ "}{d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div>
          <label className="label">Wake-up time</label>
          <input className="input" type="time" value={f.wakeTime} onChange={(e) => update("wakeTime", e.target.value)} />
        </div>
        <div>
          <label className="label">Lunch break</label>
          <select className="input" value={f.lunchBreak} onChange={(e) => update("lunchBreak", e.target.value)}>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>
      </div>
      <label className="label">Weekly budget</label>
      <div style={{ display: "flex", gap: 8 }}>
        {BUDGETS.map((b) => (
          <div key={b} className={`chip ${f.budget === b ? "active" : ""}`} onClick={() => update("budget", b)}>{b}</div>
        ))}
      </div>
    </div>,
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px" }}>
      <div style={{ paddingTop: 28, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--terra), var(--terra-dark))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22 }}>🍲</span>
          </div>
          <div>
            <div className="serif" style={{ fontSize: 28, lineHeight: 1.1 }}>NaijaPrep</div>
            <div style={{ fontSize: 12, color: "var(--stone)", fontWeight: 500 }}>AI Meal Planning for Professionals</div>
          </div>
        </div>
      </div>

      {/* Step dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "20px 0 24px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: i === step ? 28 : 8, height: 8, borderRadius: 4, background: i < step ? "var(--forest)" : i === step ? "var(--terra)" : "var(--sand)", transition: "all .3s" }} />
        ))}
      </div>

      <div className="card" style={{ padding: "32px 28px", marginBottom: 40 }}>
        {steps[step]}

        {error && (
          <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "var(--radius-xs)", background: "var(--amber-light)", color: "#8B6914", fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          {step > 0 && (
            <button className="btn-ghost" style={{ padding: "12px 20px" }} onClick={() => setStep((s) => s - 1)}>
              ← Back
            </button>
          )}
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={!valid() || loading}
            onClick={() => (step === 3 ? handleSubmit() : setStep((s) => s + 1))}
          >
            {loading ? "Creating account..." : step === 3 ? "Generate My Plan →" : "Continue →"}
          </button>
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

  useState(() => {
    const i = setInterval(() => setIdx((p) => Math.min(p + 1, msgs.length - 1)), 2200);
    return () => clearInterval(i);
  });

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div className="card scale-in" style={{ padding: "56px 40px", textAlign: "center", maxWidth: 420, width: "100%" }}>
        <div style={{ fontSize: 56, animation: "cookPot 1s ease-in-out infinite", display: "inline-block", marginBottom: 28 }}>🍲</div>
        <h2 className="serif" style={{ fontSize: 24, marginBottom: 8 }}>Cooking up your plan{name ? `, ${name}` : ""}...</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 28, textAlign: "left" }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", opacity: i <= idx ? 1 : 0.25, transition: "opacity .4s" }}>
              <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{m.emoji}</span>
              <span style={{ fontSize: 14, color: i <= idx ? "var(--charcoal)" : "var(--stone)", fontWeight: i === idx ? 600 : 400 }}>{m.text}</span>
              {i < idx && <span style={{ marginLeft: "auto", color: "var(--forest)" }}>✓</span>}
              {i === idx && <span style={{ marginLeft: "auto", color: "var(--terra)", animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>}
            </div>
          ))}
        </div>
        <div style={{ height: 4, background: "var(--sand)", borderRadius: 2, marginTop: 24, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg, var(--terra), var(--forest))", width: `${Math.min(((idx + 1) / msgs.length) * 100, 95)}%`, transition: "width .8s ease" }} />
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════ */

function Dashboard({ data, user, profile, onRegenerate, onSendEmail, emailStatus }) {
  const [tab, setTab] = useState("meals");
  const [day, setDay] = useState("Monday");

  const meals = data.plan?.[day] || [];
  const totals = meals.reduce(
    (a, m) => ({ cal: a.cal + (m.cal || 0), protein: a.protein + (m.protein || 0), carbs: a.carbs + (m.carbs || 0), fat: a.fat + (m.fat || 0) }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const maxCal = data.dailyCals || 2200;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg, var(--terra), var(--terra-dark))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 17 }}>🍲</span>
          </div>
          <span className="serif" style={{ fontSize: 21 }}>NaijaPrep</span>
        </div>
        <button className="btn-ghost" onClick={onRegenerate}>⟳ Regenerate</button>
      </div>

      {/* Hero */}
      <div className="fade-up" style={{ padding: "28px 28px 24px", borderRadius: "var(--radius)", background: "linear-gradient(135deg, #C4633F 0%, #9E4A2A 40%, #1B4332 100%)", color: "white", marginBottom: 14 }}>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>Welcome back,</p>
        <h1 className="serif" style={{ fontSize: 28, marginBottom: 6 }}>{user.name} 👋</h1>
        <p style={{ fontSize: 13, opacity: 0.75, marginBottom: 20 }}>
          {profile.fitnessGoal} plan · {profile.mealsPerDay} meals/day · {profile.activityLevel}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "Daily Target", val: `${maxCal} kcal` },
            { label: "Today's Total", val: `${totals.cal} kcal` },
            { label: "Protein", val: `${totals.protein}g` },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,.12)", borderRadius: 11, padding: "12px 16px", minWidth: 110 }}>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Email CTA */}
      <div className="card fade-up stagger-1" style={{ padding: "16px 20px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--terra-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✉️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Get this plan in your inbox</div>
            <div style={{ fontSize: 12, color: "var(--stone)" }}>Meal plan + grocery list → {user.email}</div>
          </div>
        </div>
        <button className="btn-primary" style={{ width: "auto", padding: "11px 22px", fontSize: 13 }} onClick={onSendEmail} disabled={emailStatus === "sending"}>
          {emailStatus === "sending" ? "Sending..." : emailStatus === "sent" ? "✓ Sent!" : emailStatus === "error" ? "Retry" : "Send Plan →"}
        </button>
      </div>

      {emailStatus === "sent" && (
        <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", borderRadius: "var(--radius-sm)", background: "var(--forest-light)", border: "1px solid rgba(27,67,50,.15)", marginBottom: 14, fontSize: 13, color: "var(--forest)" }}>
          ✓ Meal plan delivered to <strong>{user.email}</strong>
        </div>
      )}

      {/* Weekly tip */}
      {data.weeklyTip && (
        <div className="card-flat fade-up stagger-2" style={{ padding: "14px 18px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <p style={{ fontSize: 13, lineHeight: 1.5 }}><strong>Tip of the week:</strong> {data.weeklyTip}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar fade-up stagger-3" style={{ marginBottom: 18 }}>
        {["meals", "grocery", "prep"].map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "meals" ? "Meal Plan" : t === "grocery" ? "Grocery List" : "Prep Schedule"}
          </button>
        ))}
      </div>

      {/* Meals Tab */}
      {tab === "meals" && (
        <div className="fade-up">
          <div className="scroll-hide" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 14 }}>
            {DAYS.map((d) => (
              <button key={d} className={`day-pill ${day === d ? "active" : ""}`} onClick={() => setDay(d)}>{d.slice(0, 3)}</button>
            ))}
          </div>

          {/* Macro bar */}
          <div className="card-flat" style={{ padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{day}'s macros</span>
              <span style={{ fontSize: 12, color: "var(--stone)" }}>{totals.cal} / {maxCal} kcal</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {[
                { label: "Protein", val: totals.protein, max: Math.round(maxCal * 0.3 / 4), color: "var(--forest)" },
                { label: "Carbs", val: totals.carbs, max: Math.round(maxCal * 0.4 / 4), color: "var(--terra)" },
                { label: "Fat", val: totals.fat, max: Math.round(maxCal * 0.3 / 9), color: "var(--amber)" },
              ].map((m) => (
                <div key={m.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "var(--stone)", fontWeight: 600 }}>{m.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: m.color }}>{m.val}g</span>
                  </div>
                  <div className="macro-bar">
                    <div className="macro-fill" style={{ width: `${Math.min((m.val / m.max) * 100, 100)}%`, background: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meal cards */}
          {meals.map((meal, i) => (
            <div key={i} className={`card fade-up stagger-${Math.min(i + 1, 5)}`} style={{ padding: "20px 22px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "var(--terra)" }}>{meal.time}</span>
                {meal.prep && <span style={{ fontSize: 11, color: "var(--stone)" }}>⏱ {meal.prep}</span>}
              </div>
              <h3 className="serif" style={{ fontSize: 18, marginBottom: 3, lineHeight: 1.3 }}>{meal.name}</h3>
              <p style={{ fontSize: 13, color: "var(--stone)", lineHeight: 1.4, marginBottom: 10 }}>{meal.desc}</p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { label: "kcal", val: meal.cal, color: "var(--charcoal)" },
                  { label: "protein", val: `${meal.protein}g`, color: "var(--forest)" },
                  { label: "carbs", val: `${meal.carbs}g`, color: "var(--terra)" },
                  { label: "fat", val: `${meal.fat}g`, color: "var(--amber)" },
                ].map((m) => (
                  <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 3, background: m.color }} />
                    <span style={{ fontSize: 12, color: "var(--stone)" }}>
                      <strong style={{ color: "var(--charcoal)", fontWeight: 600 }}>{m.val}</strong> {m.label}
                    </span>
                  </div>
                ))}
              </div>
              {meal.tip && (
                <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: "var(--radius-xs)", background: "var(--forest-light)", fontSize: 12, color: "var(--forest)", lineHeight: 1.4 }}>
                  🌿 {meal.tip}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Grocery Tab */}
      {tab === "grocery" && (
        <div className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 className="serif" style={{ fontSize: 20, marginBottom: 2 }}>Weekly groceries</h3>
              <p style={{ fontSize: 12, color: "var(--stone)" }}>Tap items to check them off</p>
            </div>
            <span style={{ padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "var(--forest-light)", color: "var(--forest)" }}>
              {profile.budget} budget
            </span>
          </div>
          {Object.entries(data.grocery || {}).map(([category, items], ci) => (
            <div key={category} className={`card fade-up stagger-${Math.min(ci + 1, 5)}`} style={{ padding: "18px 20px", marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--terra)", marginBottom: 6 }}>{category}</div>
              {(items || []).map((item, j) => (
                <GroceryItem key={j} item={item} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Prep Tab */}
      {tab === "prep" && (
        <div className="fade-up">
          <h3 className="serif" style={{ fontSize: 20, marginBottom: 16 }}>Prep schedule</h3>
          {(data.prepSchedule || []).map((sched, si) => (
            <div key={si} className={`card fade-up stagger-${Math.min(si + 1, 3)}`} style={{ padding: "22px 24px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, var(--terra), var(--terra-dark))", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18 }}>📅</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{sched.day}</div>
                  <div style={{ fontSize: 12, color: "var(--stone)" }}>Total: {sched.totalTime || "~4 hours"}</div>
                </div>
              </div>
              {(sched.tasks || []).map((task, ti) => (
                <div key={ti} style={{ display: "flex", gap: 14, marginBottom: 2 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, background: "var(--terra)", border: "2.5px solid var(--terra-light)", marginTop: 4, flexShrink: 0 }} />
                    {ti < sched.tasks.length - 1 && <div style={{ width: 1.5, flex: 1, background: "var(--sand)", margin: "4px 0" }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>{task.task}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--stone)" }}>{task.time}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--forest)", background: "var(--forest-light)", padding: "2px 8px", borderRadius: 4 }}>{task.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", padding: "32px 0 48px", color: "var(--stone)", fontSize: 12 }}>
        NaijaPrep · AI-Powered Meal Planning for Nigerian Professionals 🇳🇬
      </div>
    </div>
  );
}


function GroceryItem({ item }) {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid var(--surface2)", cursor: "pointer", opacity: checked ? 0.4 : 1, transition: "opacity .2s" }} onClick={() => setChecked((c) => !c)}>
      <div className={`grocery-check ${checked ? "checked" : ""}`}>
        {checked && <span style={{ fontSize: 12 }}>✓</span>}
      </div>
      <span style={{ fontSize: 14, textDecoration: checked ? "line-through" : "none" }}>{item}</span>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   MAIN APP — ties everything together
   ═══════════════════════════════════════════════════ */

export default function App() {
  const [screen, setScreen] = useState("onboarding");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [mealData, setMealData] = useState(null);
  const [emailStatus, setEmailStatus] = useState("idle");

  // Called after signup completes
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

  // Regenerate a new plan
  const handleRegenerate = useCallback(async () => {
    if (!user || !profile) return;
    setScreen("loading");
    setEmailStatus("idle");

    try {
      const { data } = await mealsApi.generate(user.id, profile);
      setMealData(data);
      setScreen("dashboard");
    } catch (err) {
      console.error("Regenerate error:", err);
      setScreen("dashboard");
    }
  }, [user, profile]);

  // Send meal plan via email
  const handleSendEmail = useCallback(async () => {
    if (!user) return;
    setEmailStatus("sending");

    try {
      const { data } = await emailApi.sendPlan(user.id);
      setEmailStatus(data.success ? "sent" : "error");
    } catch (err) {
      console.error("Email error:", err);
      setEmailStatus("error");
    }
  }, [user]);

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
          onSendEmail={handleSendEmail}
          emailStatus={emailStatus}
        />
      )}
    </>
  );
}