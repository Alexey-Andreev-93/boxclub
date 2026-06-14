export const contactInfo = () => ({
  init() {
    try {
      this.$watch('$store.contact', () => {});
    } catch (error) {
      console.error('Ошибка инициализации contactInfo:', error);
    }
  },
});
