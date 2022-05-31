import { UI } from './UI.js';
import { buttons } from './Buttons.js';
import { modal } from './Modal.js';

class Timer extends UI {
  constructor() {
    super();
    this.#init();
  }

  #element = null;
  #numberOfSeconds = 0;
  #maxNumberOfSeconds = 999;
  #endTime = false;

  #init = () => {
    this.#element = this.getElement(this.uiSelectors.timer);
  }

  startTimer = () => {
    this.#element.textContent = this.#numberOfSeconds;
    this.id = setInterval(() => this.#updateTimer(), 1000);
  }
  
  stopTimer = () => {
    clearInterval(this.id);
  }

  restartTimer = () => {
    this.stopTimer()
    this.#numberOfSeconds = 0;
    this.#endTime =  false;
  }

  #updateTimer = () => {
    if(this.#numberOfSeconds >= this.#maxNumberOfSeconds) {
      this.stopTimer();
      buttons.resetButton.querySelector('use').setAttribute('href', './assets/sprite.svg#negative');
      modal.modalElement.querySelector('h2').textContent =  'You lose';
      modal.modalElement.classList.remove('hide');
      this.#endTime =  true;
      return;
    }

    this.#numberOfSeconds++;
    this.#element.textContent = this.#numberOfSeconds;
  }

  get finishedTime() {
    return this.#endTime;
  }
}

export const timer = new Timer();