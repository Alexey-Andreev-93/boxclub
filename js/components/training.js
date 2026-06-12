export const trainingPricing = () => ({
  categories: [],

  activeCategory: "children",

  // Состояние модального окна с расписанием
  scheduleModalOpen: false,

  async loadTraining() {
    try {
      const data = await (await fetch(`${import.meta.env.BASE_URL}content/training.json`)).json();
      this.categories = data.categories;
    } catch (error) {
      console.error("Ошибка загрузки тренировок:", error);
    }
  },

  init() {
    this.loadTraining();
  },

  setActiveCategory(categoryId) {
    try {
      this.activeCategory = categoryId;
    } catch (error) {
      console.error("Ошибка при установке активной категории:", error);
    }
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