class Tooltip {

  static element;

  constructor() {
      if (!Tooltip._instance) {
        Tooltip._instance = this;
      }
      return Tooltip._instance;
  }

  initialize() {
    document.addEventListener("pointerover", (item) => {
      if (item.target.getAttribute('data-tooltip')) {
        this.message = item.target.getAttribute('data-tooltip');
        this.render();

        this.addMoveListener(item);
      }

    })
    document.addEventListener("pointerout", (item) => {
      if (item.target.getAttribute('data-tooltip')) {
        this.destroy()
      }
    })
  }

  addMoveListener(item) {
    item.target.append(this.element);
    document.addEventListener('pointermove', this.callBack);
  }

  callBack = (event) => {
    this.element.style.left = event.pageX + 10 + 'px';
    this.element.style.top = event.pageY + 10 + 'px';
  }

  getTemplate() {
    return `
      <div class="tooltip">${this.message}</div>
    `
  }

  render(item) {
    const customTooltip = document.createElement('div');

    customTooltip.innerHTML = this.getTemplate();

    this.element = customTooltip.firstElementChild;

    if (item === "") document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    document.removeEventListener('pointermove', this.callBack);
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
