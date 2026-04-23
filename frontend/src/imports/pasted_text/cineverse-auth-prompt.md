Got it 👍 you want **“Remember Me”** to stay (like already in your UI) but properly defined in the system.

Here’s your **UPDATED Figma AI prompt** with that feature clearly included 👇

---

## 🎯 Updated Figma Prompt (with Remember Me)

**Prompt:**

Design a modern dark-themed authentication system for **CineVerse** with red cinematic UI.

---

### 1. Sign In Screen

Keep the current design and improve it.

**Fields:**

* Username (input)
* Password (input with show/hide icon)

**Options:**

* ✅ Checkbox: **“Remember Me”** (keep existing)

  * When checked → user stays logged in across sessions
  * When unchecked → session expires after browser close

**Add:**

* “Forgot Password?” link
* “Don’t have an account? Sign Up” link

**Buttons:**

* Primary: Red “Sign In”
* Secondary: “Try Demo Account”

---

### 2. Sign Up Screen

**Fields:**

* Email
* Username
* Password
* Confirm Password

**Options:**

* ✅ Checkbox: **“Remember Me” (optional)**

  * If checked → auto login after signup

**Validation UI:**

* Password strength indicator
* Confirm password match ✔️

---

### 3. Demo Account Feature

* Keep “Try Demo Account”
* Auto login with pre-filled credentials
* Label: “Explore without signup”

---

### 4. UX States

Design:

* Loading spinner on buttons
* Error messages:

  * Invalid credentials
  * User already exists
* Success message:

  * “Account created successfully”
* Disabled buttons when inputs are empty

---

### 5. Backend Notes (IMPORTANT for Dev)

**User Table:**

* id
* email
* username
* password (hashed)
* rememberMe (boolean)
* created_at

---

### 6. Auth Logic (Mention in Design Notes)

* If **Remember Me = ON**
  → Store token in **localStorage**
  → Long session (7–30 days)

* If **Remember Me = OFF**
  → Store token in **sessionStorage**
  → Logout when browser closes

---

### 7. API Flow

* POST /signup
* POST /login
* GET /demo-login

---

## 💡 Simple Explanation (for you)

* “Remember Me” = user ko baar baar login nahi karna padega
* Works using **tokens + storage**
* Backend + frontend dono me handle hota hai

---

If you want next step, I can:
👉 Give you **React + Node.js code for Remember Me (working)**
👉 Or connect this with **MongoDB + AWS deployment (easy beginner way)**
