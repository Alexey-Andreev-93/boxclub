export const trainingPricing = () => ({
  activeCategory: "children",

  // Состояние модального окна с расписанием
  scheduleModalOpen: false,

  setActiveCategory(categoryId) {
    this.activeCategory = categoryId;
  },

  openScheduleModal() {
    try {
      this.scheduleModalOpen = true;
      document.body.style.overflow = "hidden";
    } catch (error) {
      console.error("Ошибка при открытии модального окна расписания:", error);
    }
  },

  closeScheduleModal() {
    try {
      this.scheduleModalOpen = false;
      document.body.style.overflow = "";
    } catch (error) {
      console.error("Ошибка при закрытии модального окна расписания:", error);
    }
  },

  scrollToContact(category, plan) {
    try {
      // Плавная прокрутка к секции контактов
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } catch (error) {
      console.error("Ошибка при прокрутке к секции контактов:", error);
    }
  },
});