export const header = () => ({
  menuOpen: false,
  scrolled: false,

  init() {
    try {
      // Закрываем меню при клике вне его
      document.addEventListener("click", (e) => {
        try {
          if (!e.target.closest(".header__content") && this.menuOpen) {
            this.menuOpen = false;
          }
        } catch (error) {
          console.error("Ошибка при обработке клика вне меню:", error);
        }
      });

      // Закрываем меню при ресайзе на десктоп
      window.addEventListener("resize", () => {
        try {
          if (window.innerWidth > 968 && this.menuOpen) {
            this.menuOpen = false;
          }
        } catch (error) {
          console.error("Ошибка при обработке изменения размера окна:", error);
        }
      });
    } catch (error) {
      console.error("Ошибка при инициализации компонента header:", error);
    }
  },
});