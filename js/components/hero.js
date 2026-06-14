export const hero = () => ({
  // Данные для счетчиков
  stats: {
    students: 0,
    experience: 0,
    price: "0 ₽",
  },

  // Данные для модального окна
  modal: {
    open: false,
    image: "",
    title: "",
  },

  // Сборка инлайн-стиля для достижения
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

  // Метод для инициализации компонента
  init() {
    try {
      this.initParallax();
      // Анимация счетчиков при появлении в viewport
      const observer = new IntersectionObserver(
        (entries) => {
          try {
            if (entries[0].isIntersecting) {
              this.animateCounters();
            }
          } catch (error) {
            console.error("Ошибка при обработке пересечения:", error);
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(this.$el);

      document.addEventListener("keydown", (e) => {
        try {
          if (e.key === "Escape" && this.modal.open) {
            this.closeModal();
          }
        } catch (error) {
          console.error("Ошибка при обработке нажатия клавиши Escape:", error);
        }
      });
    } catch (error) {
      console.error("Ошибка при инициализации компонента hero:", error);
    }
  },

  // Метод для инициализации параллакса
  initParallax() {
    try {
      // Только для десктопных устройств
      if (window.innerWidth < 768) return;

      const bgElement = this.$el.querySelector(".hero__bg");
      if (!bgElement) return;

      window.addEventListener("scroll", () => {
        try {
          const scrolled = window.pageYOffset;
          const rate = scrolled * 0.3; // Скорость параллакса

          bgElement.style.transform = `translateY(${rate}px)`;
        } catch (error) {
          console.error("Ошибка при обработке события прокрутки:", error);
        }
      });
    } catch (error) {
      console.error("Ошибка при инициализации параллакса:", error);
    }
  },

  // Метод для анимации счетчиков
  animateCounters() {
    try {
      // Анимация счетчика учеников
      this.animateCounter("students", 100, 2000);

      // Анимация опыта
      this.animateCounter("experience", 5, 1500);

      // Цена (без анимации)
      setTimeout(() => {
        try {
          this.stats.price = "0 ₽";
        } catch (error) {
          console.error("Ошибка при установке цены:", error);
        }
      }, 500);
    } catch (error) {
      console.error("Ошибка при анимации счетчиков:", error);
    }
  },

  // Метод для анимации счетчика
  animateCounter(stat, target, duration) {
    try {
      let start = 0;
      const increment = target / (duration / 16);

      const timer = setInterval(() => {
        try {
          start += increment;
          if (start >= target) {
            this.stats[stat] = stat === "students" ? target + "+" : target;
            clearInterval(timer);
          } else {
            this.stats[stat] = Math.floor(start);
          }
        } catch (error) {
          console.error("Ошибка при обновлении счетчика:", error);
          clearInterval(timer);
        }
      }, 16);
    } catch (error) {
      console.error("Ошибка при анимации счетчика:", error);
    }
  },

  // Метод для открытия модального окна
  openModal(achievement) {
    try {
      this.modal = {
        open: true,
        image: achievement.image,
        title: achievement.title,
      };

      // Блокируем скролл страницы
      document.body.style.overflow = "hidden";
    } catch (error) {
      console.error("Ошибка при открытии модального окна:", error);
    }
  },

  // Метод для закрытия модального окна
  closeModal() {
    try {
      this.modal.open = false;
      document.body.style.overflow = "";
    } catch (error) {
      console.error("Ошибка при закрытии модального окна:", error);
    }
  },

  // Пауза анимации при наведении
  pauseAnimation(event) {
    try {
      event.target.style.animationPlayState = "paused";
    } catch (error) {
      console.error("Ошибка при паузе анимации:", error);
    }
  },

  // Возобновление анимации
  resumeAnimation(event) {
    try {
      event.target.style.animationPlayState = "running";
    } catch (error) {
      console.error("Ошибка при возобновлении анимации:", error);
    }
  },
});