import { AuthService } from "./auth.types";
import { firebaseAuthService } from "./firebaseAuthService";

export const authService: AuthService = firebaseAuthService;
