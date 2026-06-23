export function isAiRoute(pathname: string) {
  return pathname === "/home/ai" || /^\/home\/[^/]+\/ai$/.test(pathname);
}

export function isDashboardRoute(pathname: string) {
  return pathname === "/home";
}

export function isRoadmapRoute(pathname: string) {
  return pathname.startsWith("/home/roadmap");
}
