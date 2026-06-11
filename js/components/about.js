export const aboutGallery = () => ({
  activeTrainer: 0, // 0 означает, что ничего не активно

  init() {
    try {
      // На десктопе по умолчанию показываем первого тренера
      if (window.innerWidth > 756) {
        this.activeTrainer = 1;
      }

      // Слушаем изменения размера окна
      window.addEventListener("resize", () => {
        try {
          if (window.innerWidth > 756 && this.activeTrainer === 0) {
            this.activeTrainer = 1;
          }
        } catch (error) {
          console.error("Ошибка при обработке изменения размера окна:", error);
        }
      });
    } catch (error) {
      console.error("Ошибка при инициализации компонента aboutGallery:", error);
    }
  },

  // Простой метод для переключения тренеров
  toggleTrainer(trainerId) {
    try {
      if (window.innerWidth <= 756) {
        // На мобильных: переключаем (если кликаем на активного - закрываем)
        this.activeTrainer = this.activeTrainer === trainerId ? 0 : trainerId;
      } else {
        // На десктопе: просто активируем
        this.activeTrainer = trainerId;
      }
    } catch (error) {
      console.error("Ошибка при переключении тренера:", error);
    }
  },

  // Для десктопа - активация при наведении
  activateTrainer(trainerId) {
    try {
      if (window.innerWidth > 756) {
        this.activeTrainer = trainerId;
      }
    } catch (error) {
      console.error("Ошибка при активации тренера:", error);
    }
  },
});