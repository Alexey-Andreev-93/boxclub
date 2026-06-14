export const hero = () => ({
  stats: {
    students: 0,
    experience: 0,
    price: "0 ₽",
  },

  modal: {
    open: false,
    image: "",
    title: "",
  },

  _observer: null,
  _counterTimers: [],

  achievementStyle(a) {
    let s = '';
    if (a.top !== undefined) s += `top:${a.top}%;`;
    if (a.left !== undefined) s += `left:${a.left}%;`;
    if (a.right !== undefined) s += `right:${a.right}%;`;
    if (a.bottom !== undefined) s += `bottom:${a.bottom}%;`;
    if (a.rotate !== undefined) s += `transform:rotate(${a.rotate}deg);`;
    if (a.duration !== undefined) s += `animation-duration:${a.duration}s;`;
    return s;
  },

  init() {
    this._onKeydown = (e) => {
      if (e.key === "Escape" && this.modal.open) {
        this.closeModal();
      }
    };
    document.addEventListener("keydown", this._onKeydown);

    this._initParallax();
    this._initCounters();
  },

  destroy() {
    document.removeEventListener("keydown", this._onKeydown);
    if (this._onScroll) {
      window.removeEventListener("scroll", this._onScroll);
    }
    if (this._observer) {
      this._observer.disconnect();
    }
    this._counterTimers.forEach(fn => fn());
  },

  _initParallax() {
    if (window.innerWidth < 768) return;

    const bgElement = this.$el.querySelector(".hero__bg");
    if (!bgElement) return;

    let ticking = false;
    this._onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          bgElement.style.transform = `translateY(${window.pageYOffset * 0.3}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", this._onScroll, { passive: true });
  },

  _initCounters() {
    this._observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          this._animateCounters();
          this._observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    this._observer.observe(this.$el);
  },

  _animateCounters() {
    this._animateCounter("students", 100, 2000);
    this._animateCounter("experience", 5, 1500);

    const priceTimer = setTimeout(() => {
      this.stats.price = "0 ₽";
    }, 500);
    this._counterTimers.push(() => clearTimeout(priceTimer));
  },

  _animateCounter(stat, target, duration) {
    const startTime = performance.now();
    const isStudents = stat === "students";

    const frame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(progress * target);

      this.stats[stat] = progress >= 1
        ? (isStudents ? target + "+" : target)
        : current;

      if (progress < 1) {
        this._rafId = requestAnimationFrame(frame);
      }
    };

    this._rafId = requestAnimationFrame(frame);
    this._counterTimers.push(() => {
      if (this._rafId) cancelAnimationFrame(this._rafId);
    });
  },

  openModal(achievement) {
    this.modal = {
      open: true,
      image: achievement.image,
      title: achievement.title,
    };
    document.body.style.overflow = "hidden";
  },

  closeModal() {
    this.modal.open = false;
    document.body.style.overflow = "";
  },

  pauseAnimation(event) {
    event.target.style.animationPlayState = "paused";
  },

  resumeAnimation(event) {
    event.target.style.animationPlayState = "running";
  },
});