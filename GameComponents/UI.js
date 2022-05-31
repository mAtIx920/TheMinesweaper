export class UI {
  uiSelectors = {
    board: '[data-board]',
    cell: '[data-cell]',
    counter: '[data-counter]',
    timer: '[data-timer]',
    reset: '[data-reset]',
    easy: '[data-easy]',
    normal: '[data-normal]',
    expert: '[data-expert]'
  }

  getElement = selector => {
    return document.querySelector(selector);
  }

  getElements = selector => {
    return document.querySelectorAll(selector);
  }
}