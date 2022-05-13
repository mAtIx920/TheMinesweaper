import { UI } from './UI.js';

export class Counter extends UI {
  value = null;
  #element = null;

  init = () => {
    this.#element = this.getElement(this.uiSelectors.counter);
  }

  setValue = value => {
    this.value = value;
    this.#element.textContent = this.value;
  }

  incrementValue = () => {
    this.value++;
    this.#element.textContent = this.value;
  }

  decrementValue = () => {
    this.value--;
    this.#element.textContent = this.value;
  }
}