export const gallery = () => ({
  // Состояние
  activeFilter: "all",
  currentPage: 0,
  itemsPerPage: 6,

  lightbox: {
    open: false,
    image: "",
    title: "",
    description: "",
    date: "",
    category: "",
  },

  // Вычисляемые свойства
  get filteredItems() {
    try {
      const items = this.$store.gallery.items || [];
      if (this.activeFilter === "all") {
        return items;
      }
      return items.filter((item) => item.type === this.activeFilter);
    } catch (error) {
      console.error("Ошибка при фильтрации элементов:", error);
      return [];
    }
  },

  get totalPages() {
    return Math.ceil(this.filteredItems.length / this.itemsPerPage);
  },

  get displayedItems() {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredItems.slice(start, end);
  },

  setFilter(filter) {
    this.activeFilter = filter;
    this.currentPage = 0;
    this.updateActiveFilterButtons();
  },

  updateActiveFilterButtons() {
    try {
      // Обновляем классы кнопок фильтров
      document.querySelectorAll(".gallery__filter").forEach((btn) => {
        try {
          btn.classList.remove("active");
          if (btn.dataset.filter === this.activeFilter) {
            btn.classList.add("active");
          }
        } catch (error) {
          console.error("Ошибка при обновлении кнопок фильтров:", error);
        }
      });
    } catch (error) {
      console.error("Ошибка при обновлении активных кнопок фильтров:", error);
    }
  },

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  },

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  },

  goToPage(page) {
    this.currentPage = page;
  },

  openLightbox(item) {
    this.lightbox = {
      open: true,
      image: item.image,
      title: item.title,
      description: item.description,
      date: item.date,
      category: item.category,
    };
    document.body.style.overflow = "hidden";
  },

  closeLightbox() {
    this.lightbox.open = false;
    document.body.style.overflow = "";
  },

  nextImage() {
    try {
      const currentIndex = this.filteredItems.findIndex(
        (item) => item.image === this.lightbox.image
      );
      const nextIndex = (currentIndex + 1) % this.filteredItems.length;
      this.openLightbox(this.filteredItems[nextIndex]);
    } catch (error) {
      console.error("Ошибка при переходе к следующему изображению:", error);
    }
  },

  prevImage() {
    try {
      const currentIndex = this.filteredItems.findIndex(
        (item) => item.image === this.lightbox.image
      );
      const prevIndex =
        (currentIndex - 1 + this.filteredItems.length) %
        this.filteredItems.length;
      this.openLightbox(this.filteredItems[prevIndex]);
    } catch (error) {
      console.error("Ошибка при переходе к предыдущему изображению:", error);
    }
  },

  startFloat(element) {
    try {
      element.classList.add("gallery__item--floating");
    } catch (error) {
      console.error("Ошибка при начале плавания элемента:", error);
    }
  },

  stopFloat(element) {
    try {
      element.classList.remove("gallery__item--floating");
    } catch (error) {
      console.error("Ошибка при остановке плавания элемента:", error);
    }
  },

  init() {
    this.updateActiveFilterButtons();

    this._onKeydown = (e) => {
      if (!this.lightbox.open) return;
      switch (e.key) {
        case "Escape": this.closeLightbox(); break;
        case "ArrowRight": this.nextImage(); break;
        case "ArrowLeft": this.prevImage(); break;
      }
    };
    document.addEventListener("keydown", this._onKeydown);

    this.$watch("lightbox.open", (value) => {
      if (!value) {
        document.body.style.overflow = "";
      }
    });
  },

  destroy() {
    document.removeEventListener("keydown", this._onKeydown);
  },
});