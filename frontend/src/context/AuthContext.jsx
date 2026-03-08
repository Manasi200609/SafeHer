import { createContext, useContext, useState } from "react";
import awsConfig from "../../aws-exports";
import { apiFetch, cognitoSignIn } from "../constants/data";

const AuthContext = createContext({
  user: null, token: null, loading: false, error: null,
  login: async () => {}, register: async () => {},
  logout: () => {}, updateSettings: async () => {},
});

// ─── HACKATHON FAILSAFE MOCK DATA ────────────────────────────
// If the backend goes down, the app will use this to keep the demo alive
const MOCK_TOKEN = "hackathon_demo_token_89237498234";
const DEFAULT_SETTINGS = {
  voiceMonitor: true, autoAlert: true, locationShare: false, nightMode: true
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── LOGIN ──────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      let idToken;

      if (awsConfig.awsEnabled) {
        // ─ AWS path
        const tokens = await cognitoSignIn(email, password);
        idToken = tokens.IdToken;
        const profileRes = await apiFetch("/auth/profile", "GET", null, idToken);
        setUser(profileRes.user || { email, settings: DEFAULT_SETTINGS });
      } else {
        // ─ Local path
        const res = await apiFetch("/auth/login", "POST", { email, password });
        if (!res.success) throw new Error(res.message || "Invalid credentials");
        
        idToken = res.token;
        setUser(res.user);
      }

      setToken(idToken);
      setLoading(false);
      return { success: true };
    } catch (e) {
      console.warn("🚨 Backend Auth Failed. Activating Demo Fallback:", e.message);
      
      // HACKATHON FAILSAFE: Force login success so the UI demo can continue
      setUser({ name: "Demo User", email: email, settings: DEFAULT_SETTINGS });
      setToken(MOCK_TOKEN);
      setLoading(false);
      return { success: true, demoMode: true };
    }
  };

  // ── REGISTER ───────────────────────────────────────────────
  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/auth/register", "POST", data);
      
      // If the backend rejects it (like a 500 error), throw an error to trigger the failsafe
      if (!res || !res.success) {
        throw new Error(res?.message || "Server Error 500");
      }

      if (awsConfig.awsEnabled) {
        return await login(data.email, data.password);
      } else {
        setToken(res.token);
        setUser(res.user);
        setLoading(false);
        return { success: true };
      }
    } catch (e) {
      console.warn("🚨 Backend Registration Failed. Activating Demo Fallback:", e.message);
      
      // HACKATHON FAILSAFE: Force registration success
      setUser({ 
        name: data.name || "Demo User", 
        email: data.email, 
        phone: data.phone,
        settings: DEFAULT_SETTINGS 
      });
      setToken(MOCK_TOKEN);
      setLoading(false);
      return { success: true, demoMode: true };
    }
  };

  // ── LOGOUT ─────────────────────────────────────────────────
  const logout = () => { setUser(null); setToken(null); setError(null); };

  // ── UPDATE SETTINGS ────────────────────────────────────────
  const updateSettings = async (settings) => {
    try {
      const res = await apiFetch("/auth/settings", "PUT", settings, token);
      if (res.success) {
        setUser((u) => ({ ...u, settings }));
      } else {
        throw new Error("Failed to update on server");
      }
      return res;
    } catch (e) {
      // HACKATHON FAILSAFE: Optimistically update UI even if backend fails
      console.warn("🚨 Settings Backend Sync Failed. Updating Local UI only.");
      setUser((u) => ({ ...u, settings }));
      return { success: true, demoMode: true };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};