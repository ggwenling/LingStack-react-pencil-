const EXERCISE_PANEL_COLLAPSED_KEY = "lingstack:exercise-panel-collapsed";

export function readExercisePanelCollapsed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(EXERCISE_PANEL_COLLAPSED_KEY) === "1";
}

export function persistExercisePanelCollapsed(collapsed: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    EXERCISE_PANEL_COLLAPSED_KEY,
    collapsed ? "1" : "0",
  );
}
