export const reviews = () => ({
  reviews: [],

  async init() {
    try {
      const data = await (await fetch(`${import.meta.env.BASE_URL}content/reviews.json`)).json();
      this.reviews = data.items;
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
    }
  },
});
