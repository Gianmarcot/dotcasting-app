const KEY = "dc_pending_signup_email";

export const setPendingSignupEmail = (email: string) => {
  try {
    localStorage.setItem(KEY, email);
  } catch {
    /* storage non disponibile */
  }
};

export const getPendingSignupEmail = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const clearPendingSignupEmail = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage non disponibile */
  }
};
