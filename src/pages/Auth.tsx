import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, Sun, Moon, Briefcase } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";

// ── Zod Schemas ─────────────────────────────────────
const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email")
  .max(255, "Email is too long");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number");

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  jobTitle: z
    .string()
    .trim()
    .min(1, "Job title is required")
    .max(80, "Job title is too long"),
  email: emailSchema,
  password: passwordSchema,
});

// ── Strength meter ──────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: "Weak", color: "bg-destructive" };
  if (s <= 3) return { score: s, label: "Fair", color: "bg-amber-500" };
  return { score: s, label: "Strong", color: "bg-emerald-500" };
}

// ── Silk Input ──────────────────────────────────────
function SilkInput({
  label, type = "text", value, onChange, placeholder, error, children,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground tracking-wide uppercase font-['JetBrains_Mono',monospace]">
        {label}
      </label>
      <div className="relative group">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full h-12 px-4 rounded-2xl text-sm
            bg-foreground/[0.04] dark:bg-white/[0.06]
            text-foreground placeholder:text-muted-foreground/50
            border-[0.5px] border-black/5 dark:border-white/15
            backdrop-blur-xl
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] focus:border-transparent
            transition-all duration-300
          "
        />
        {children}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Auth Page ──────────────────────────────────
export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = useMemo(() => getStrength(password), [password]);

  const toggle = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // prevent double submit
    setErrors({});

    const schema = mode === "login" ? loginSchema : registerSchema;
    const data = mode === "login" ? { email, password } : { fullName, jobTitle, email, password };
    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    // Auth methods are async (password hashing uses Web Crypto)
    setTimeout(async () => {
      const res = await (mode === "login"
        ? login(email, password)
        : register(email, password, fullName, jobTitle));

      setLoading(false);
      if (!res.success) {
        toast.error(res.error);
      }
    }, 600);
  };

  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`fixed inset-0 flex ${theme === "dark" ? "mesh-gradient-dark" : "mesh-gradient-light"}`}>
      {/* ── Theme toggle (top-right) ── */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        onClick={toggleTheme}
        className="
          fixed top-6 right-6 z-50 w-11 h-11 rounded-2xl
          flex items-center justify-center
          bg-white/40 dark:bg-white/[0.06]
          backdrop-blur-[40px]
          border-[0.5px] border-black/5 dark:border-white/15
          text-muted-foreground hover:text-foreground
          shadow-[0_8px_32px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]
          dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)]
          transition-all duration-500
        "
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* ── Branding panel (desktop) ── */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center space-y-8 max-w-md"
        >
          <motion.div
            animate={{ boxShadow: ["0 0 40px rgba(99,102,241,0.3)", "0 0 80px rgba(99,102,241,0.5)", "0 0 40px rgba(99,102,241,0.3)"] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-24 h-24 mx-auto rounded-3xl bg-primary/20 backdrop-blur-xl flex items-center justify-center ring-1 ring-black/5 dark:ring-white/20 overflow-hidden"
          >
            <img src="/stride-logo.webp" alt="STRIDE" className="w-20 h-20 object-contain" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground font-['JetBrains_Mono',monospace]">
            STRIDE
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed italic">
            "Plan Smarter, Move Faster"
          </p>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <p className="text-sm text-muted-foreground/60">
            Sculpt your productivity with precision and elegance.
          </p>
        </motion.div>
      </div>

      {/* ── Form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
          className="
            w-full max-w-md p-8 lg:p-10 rounded-[2.5rem]
            bg-white/60 dark:bg-white/[0.04]
            backdrop-blur-[40px]
            border-[0.5px] border-black/5 dark:border-white/20
            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07),0_8px_24px_-8px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.4)]
            dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5),0_0_30px_rgba(99,102,241,0.04),inset_0_1px_1px_rgba(255,255,255,0.06)]
            transition-shadow duration-500
          "
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] dark:shadow-[0_0_20px_rgba(99,102,241,0.25)] overflow-hidden">
              <img src="/stride-logo.webp" alt="STRIDE" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-lg font-['JetBrains_Mono',monospace] text-foreground">STRIDE</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-2xl font-black tracking-tighter text-foreground mb-1 font-['JetBrains_Mono',monospace]">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                {mode === "login"
                  ? "Sign in to continue to your workspace"
                  : "Join and start planning your weeks"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <>
                    <SilkInput
                      label="Full Name"
                      value={fullName}
                      onChange={setFullName}
                      placeholder="Mohamed Abdulrahim"
                      error={errors.fullName}
                    />
                    <SilkInput
                      label="Job Title / Role"
                      value={jobTitle}
                      onChange={setJobTitle}
                      placeholder="Frontend Developer"
                      error={errors.jobTitle}
                    />
                  </>
                )}

                <SilkInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  error={errors.email}
                />

                <div className="space-y-2">
                  <SilkInput
                    label="Password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    error={errors.password}
                  >
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </SilkInput>

                  {/* Strength meter */}
                  {mode === "register" && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1.5"
                    >
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-muted"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-['JetBrains_Mono',monospace]">
                        Strength: {strength.label}
                      </p>
                    </motion.div>
                  )}
                </div>

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => toast.info("Password reset is not available in the local demo. Clear your browser storage to start fresh.")}
                    className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    Forgot password?
                  </button>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="
                    w-full h-12 rounded-2xl btn-silk text-sm
                    disabled:opacity-50 disabled:pointer-events-none
                    flex items-center justify-center gap-2
                  "
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                    />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  onClick={toggle}
                  className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
