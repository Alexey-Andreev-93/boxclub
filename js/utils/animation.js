export const animateCounter = (stats, stat, target, duration) => {
  let start = 0;
  const increment = target / (duration / 16);

  const timer = setInterval(() => {
    try {
      start += increment;
      if (start >= target) {
        stats[stat] = stat === "students" ? target + "+" : target;
        clearInterval(timer);
      } else {
        stats[stat] = Math.floor(start);
      }
    } catch (error) {
      console.error("Ошибка при обновлении счетчика:", error);
      clearInterval(timer);
    }
  }, 16);
};

export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = { threshold: 0.3 };
  const observer = new IntersectionObserver(callback, {
    ...defaultOptions,
    ...options
  });
  return observer;
};