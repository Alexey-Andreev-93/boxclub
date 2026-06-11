export const header = () => ({
  menuOpen: false,
  scrolled: false,

  _onClick: null,
  _onTouch: null,
  _onResize: null,
  _onScroll: null,

  _closeIfOutside(e) {
    if (!e.target.closest("#header__menu") && !e.target.closest(".header__hamburger") && this.menuOpen) {
      this.menuOpen = false;
    }
  },

  init() {
    this._onClick = (e) => this._closeIfOutside(e);
    this._onTouch = (e) => this._closeIfOutside(e);

    this._onResize = () => {
      if (window.innerWidth > 968 && this.menuOpen) {
        this.menuOpen = false;
      }
    };

    this._onScroll = () => {
      const scrollY = window.pageYOffset;
      if (scrollY > 50 && !this.scrolled) {
        this.scrolled = true;
      } else if (scrollY <= 50 && this.scrolled) {
        this.scrolled = false;
      }
    };

    this._onScroll();

    document.addEventListener("click", this._onClick);
    document.addEventListener("touchstart", this._onTouch, { passive: true });
    window.addEventListener("resize", this._onResize);
    window.addEventListener("scroll", this._onScroll, { passive: true });
  },

  destroy() {
    document.removeEventListener("click", this._onClick);
    document.removeEventListener("touchstart", this._onTouch);
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("scroll", this._onScroll);
  },
});