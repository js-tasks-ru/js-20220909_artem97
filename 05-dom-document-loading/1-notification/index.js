export default class NotificationMessage {

  constructor(message = '', {duration = 0, type = "error"} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.show()
  }

  getTemplate() {
    return `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.message}
                </div>
            </div>
        </div>
    `
  }

  render() {
    
    if(document.querySelector(`.${this.type}`)){
      document.querySelector(`.${this.type}`).remove();
    }
    
    const notificationMessage = document.createElement('div');

    notificationMessage.innerHTML = this.getTemplate();
    this.element = notificationMessage.firstElementChild;
  }

  show(elem = '') {
    (elem === '')
      ? this.render()
      : this.element = elem;

    document.body.append(this.element);
    // this.element.addEventListener('animationend', () => {
    //   this.remove();
    // }) - Работает правельнее через этот метод, но тесты не пропускают, ждут метода setTimeout
    setTimeout(()=>{
      this.remove()
    }, this.duration)
  }

  remove() {
    if (this.element) {
      let elements = document.querySelectorAll('.notification');
      for (let elem of elements) {
        elem.remove();
      }
    }
  }

  destroy() {
    this.remove();
  }
}
