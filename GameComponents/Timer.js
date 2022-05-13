import { UI } from "./UI.js";

class Timer extends UI {
  constructor() {
    super();
    this.#init();
  }

  #element = null;
  #numberOfSeconds = 0;
  #maxNumberOfSeconds = 999;

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

  #updateTimer = () => {
    if(this.#numberOfSeconds >= this.#maxNumberOfSeconds) {
      this.stopTimer();
      return;
    }

    this.#numberOfSeconds++;
    this.#element.textContent = this.#numberOfSeconds;
  }
}

export const timer = new Timer();