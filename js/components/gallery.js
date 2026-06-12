export const gallery = () => ({
  // Данные галереи
  items: [],

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
      if (this.activeFilter === "all") {
        return this.items;
      }
      return this.items.filter((item) => item.type === this.activeFilter);
    } catch (error) {
      console.error("Ошибка при фильтрации элементов:", error);
      return [];
    }
  },

  get totalPages() {
    try {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    } catch (error) {
      console.error("Ошибка при вычислении общего количества страниц:", error);
      return 0;
    }
  },

  get displayedItems() {
    try {
      const start = this.currentPage * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
    } catch (error) {
      console.error("Ошибка при получении отображаемых элементов:", error);
      return [];
    }
  },

  // Методы
  setFilter(filter) {
    try {
      this.activeFilter = filter;
      this.currentPage = 0;
      this.updateActiveFilterButtons();
    } catch (error) {
      console.error("Ошибка при установке фильтра:", error);
    }
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
    try {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
      }
    } catch (error) {
      console.error("Ошибка при переходе на следующую страницу:", error);
    }
  },

  prevPage() {
    try {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
    } catch (error) {
      console.error("Ошибка при переходе на предыдущую страницу:", error);
    }
  },

  goToPage(page) {
    try {
      this.currentPage = page;
    } catch (error) {
      console.error("Ошибка при переходе на страницу:", error);
    }
  },

  openLightbox(item) {
    try {
      this.lightbox = {
        open: true,
        image: item.image,
        title: item.title,
        description: item.description,
        date: item.date,
        category: item.category,
      };
      document.body.style.overflow = "hidden";
    } catch (error) {
      console.error("Ошибка при открытии лайтбокса:", error);
    }
  },

  closeLightbox() {
    try {
      this.lightbox.open = false;
      document.body.style.overflow = "";
    } catch (error) {
      console.error("Ошибка при закрытии лайтбокса:", error);
    }
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

  async loadGallery() {
    try {
      const data = await (await fetch(`${import.meta.env.BASE_URL}content/gallery.json`)).json();
      this.items = data.items;
    } catch (error) {
      console.error("Ошибка загрузки галереи:", error);
    }
  },

  init() {
    try {
      this.loadGallery();
      this.updateActiveFilterButtons();

      // Обработка клавиш
      document.addEventListener("keydown", (e) => {
        try {
          if (!this.lightbox.open) return;

          switch (e.key) {
            case "Escape":
              this.closeLightbox();
              break;
            case "ArrowRight":
              this.nextImage();
              break;
            case "ArrowLeft":
              this.prevImage();
              break;
          }
        } catch (error) {
          console.error("Ошибка при обработке нажатия клавиши:", error);
        }
      });

      // Закрытие лайтбокса по клику на оверлей
      this.$watch("lightbox.open", (value) => {
        try {
          if (!value) {
            document.body.style.overflow = "";
          }
        } catch (error) {
          console.error("Ошибка при закрытии лайтбокса по клику на оверлей:", error);
        }
      });
    } catch (error) {
      console.error("Ошибка при инициализации компонента gallery:", error);
    }
  },
});