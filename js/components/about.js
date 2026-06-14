const BP = 768;

export const aboutGallery = () => ({
  activeTrainer: -1,

  init() {
    if (window.innerWidth > BP) {
      this.activeTrainer = 0;
    }
    this._onResize = () => {
      if (window.innerWidth > BP && this.activeTrainer === -1) {
        this.activeTrainer = 0;
      }
    };
    window.addEventListener("resize", this._onResize);
  },

  destroy() {
    window.removeEventListener("resize", this._onResize);
  },

  toggleTrainer(index) {
    if (window.innerWidth <= BP) {
      this.activeTrainer = this.activeTrainer === index ? -1 : index;
    } else {
      this.activeTrainer = index;
    }
  },

  activateTrainer(index) {
    if (window.innerWidth > BP) {
      this.activeTrainer = index;
    }
  },
});