import { useState } from "react";
import signin from "../../assets/animations/Tablet login.gif";
import signup from "../../assets/animations/Sign up.gif";
import styles from "./AuthPage.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LoginPayload = { email: string; password: string };
export type SignUpPayload = { name: string; email: string; password: string };

type AuthPageProps = {
  /**
   * Called when the sign-in form is submitted. Throw (or reject) to show
   * an error message — e.g. wrong password. Currently wired in App.tsx to
   * a local, backend-free auth store (`src/utils/localAuth.ts`) so the
   * flow actually works; swap it for a real API call once the backend
   * exists.
   */
  onLogin: (payload: LoginPayload) => Promise<void>;
  /** Same as `onLogin`, for account creation. */
  onSignUp: (payload: SignUpPayload) => Promise<void>;
};

/**
 * Sign-in / sign-up screen shown before the rest of the app. Same
 * flip-card animation as the original design, recolored to match the
 * dashboard (white cards, blue-700 brand accent, dark slate panel)
 * instead of the template's gold.
 */
export default function AuthPage({ onLogin, onSignUp }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);

  // ----- Sign-in fields -----
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // ----- Sign-up fields -----
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);

  const switchMode = (signup: boolean) => {
    setIsSignUp(signup);
    setSignInError("");
    setSignUpError("");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    if (!signInEmail || !signInPassword) {
      setSignInError("Please enter your email and password.");
      return;
    }
    try {
      setSignInLoading(true);
      await onLogin({ email: signInEmail, password: signInPassword });
    } catch (err) {
      setSignInError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");
    if (!signUpName || !signUpEmail || !signUpPassword) {
      setSignUpError("Please fill in every field.");
      return;
    }
    if (signUpPassword.length < 8) {
      setSignUpError("Password must be at least 8 characters.");
      return;
    }
    try {
      setSignUpLoading(true);
      await onSignUp({ name: signUpName, email: signUpEmail, password: signUpPassword });
    } catch (err) {
      setSignUpError(err instanceof Error ? err.message : "Unable to create account. Please try again.");
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.cont} ${isSignUp ? styles["s--signup"] : ""}`}>
        {/* ---------------- Sign in ---------------- */}
        <form
          className={`${styles.form} ${styles["sign-in"]}`}
          onSubmit={handleSignIn}
          noValidate
        >
          <h1>SkyStorage</h1>
          <h2>Welcome back</h2>

          <label>
            <span>Email</span>
            <input
              type="email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {signInError && <p className={styles.error}>{signInError}</p>}

          <p className={styles["forgot-pass"]}>Forgot password?</p>

          <button type="submit" className={styles.submit} disabled={signInLoading}>
            {signInLoading ? "Signing In…" : "Sign In"}
          </button>
        </form>

        {/* ---------------- Sub container: side panel + sign up ---------------- */}
        <div className={styles["sub-cont"]}>
          <div className={styles.img}>
            <div className={`${styles.img__text} ${styles["m--up"]}`}>
              <h2>Don't have an account? Please sign up!</h2>
              
              
            </div>
            <div className={`${styles.img__text} ${styles["m--in"]}`}>
              <h2>If you already have an account, just sign in.</h2>
              
            </div>
            <button type="button" className={styles.img__btn} onClick={() => switchMode(!isSignUp)}>
              <span className={styles["m--up"]}>Sign Up</span>
              <span className={styles["m--in"]}>Sign In</span>
            </button>
          </div>

          <form
            className={`${styles.form} ${styles["sign-up"]}`}
            onSubmit={handleSignUp}
            noValidate
          >
            <h1>SkyStorage</h1>
            <h2>Create your Account</h2>

            <label>
              <span>Name</span>
              <input
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                autoComplete="name"
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            {signUpError && <p className={styles.error}>{signUpError}</p>}

            <button type="submit" className={styles.submit} disabled={signUpLoading}>
              {signUpLoading ? "Creating Account…" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
