import { AuthService } from "./auth.types";
import { mockAuthService } from "./mockAuthService";

// Switch this based on VITE_DATA_MODE environment variable later
const isMockMode = import.meta.env.VITE_DATA_MODE !== "firebase";

export const authService: AuthService = isMockMode ? mockAuthService : mockAuthService; // Will replace second arg with firebaseAuthService later
