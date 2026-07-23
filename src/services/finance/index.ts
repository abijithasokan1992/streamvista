import { mockFinanceService } from "./mockFinanceService";

// Future real service implementation placeholder
// import { firebaseFinanceService } from "./firebaseFinanceService";

const isMockMode = import.meta.env.VITE_DATA_MODE !== "firebase";

// Export the active finance service
export const financeService = isMockMode ? mockFinanceService : mockFinanceService; // Fallback to mock until firebase logic is done
