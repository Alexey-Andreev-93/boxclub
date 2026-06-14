export const aboutGallery = () => ({
  activeTrainer: -1,

  init() {
    try {
      if (window.innerWidth > 756) {
        this.activeTrainer = 0;
      }
      window.addEventListener("resize", () => {
        try {
          if (window.innerWidth > 756 && this.activeTrainer === -1) {
            this.activeTrainer = 0;
          }
        } catch (error) {
          console.error("Ошибка при обработке изменения размера окна:", error);
        }
      });
    } catch (error) {
      console.error("Ошибка при инициализации компонента aboutGallery:", error);
    }
  },

  toggleTrainer(index) {
    try {
      if (window.innerWidth <= 756) {
        this.activeTrainer = this.activeTrainer === index ? -1 : index;
      } else {
        this.activeTrainer = index;
      }
    } catch (error) {
      console.error("Ошибка при переключении тренера:", error);
    }
  },

  activateTrainer(index) {
    try {
      if (window.innerWidth > 756) {
        this.activeTrainer = index;
      }
    } catch (error) {
      console.error("Ошибка при активации тренера:", error);
    }
  },
});