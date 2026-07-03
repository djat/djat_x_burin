export function scrollPageToTop(behavior: ScrollBehavior = "smooth") {
  window.scrollTo({ top: 0, left: 0, behavior });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function scrollOverviewToTop() {
  const start = document.getElementById("overview-start");
  if (start) {
    start.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    scrollPageToTop();
  }
}

export function scrollJourneyToTop() {
  scrollPageToTop();
}
