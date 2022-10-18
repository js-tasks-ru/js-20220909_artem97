class Tooltip {

  static element;

  constructor() {
    this.controller = new AbortController();
      if (!Tooltip._instance) {
        Tooltip._instance = this;
      }
      return Tooltip._instance;
  }

  initialize() {
    document.addEventListener("pointerover", this.onPointerOver, {
      signal: this.controller.signal
    });
    document.addEventListener("pointerout", this.onPointerOut,{
      signal: this.controller.signal
      }
    );
  }

  addMoveListener(item) {
    item.target.append(this.element);
    document.addEventListener('pointermove', this.callBack);
  }

  onPointerOver = (event) =>  {
    if (event.target.getAttribute('data-tooltip')) {
      this.message = event.target.getAttribute('data-tooltip');
      this.render();

      this.addMoveListener(event);
    }

  }

  onPointerOut = (event) => {
    if (event.target.getAttribute('data-tooltip')) {
      this.destroy()
    }
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
    //document.removeEventListener('pointerover', this.onPointerOver);
    //document.removeEventListener('pointerout', this.onPointerOut);
    this.controller.abort();
    document.removeEventListener('pointermove', this.callBack);
    this.remove();
    this.element = null;
  }
}

export default Tooltip;
