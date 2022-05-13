import { UI } from "./UI.js";

export class Cell extends UI{
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.value = 0;
    this.hasMine = false;
    this.isRevealed = false;
    this.isFlagged = false;
    this.selector = `[data-x="${this.x}"][data-y="${this.y}"]`;
    this.element = null;
  }

  //Creates cell items
  createElement = () => {
    const element = `<div class="cell border border--concave" data-cell data-x="${this.x}" data-y="${this.y}"></div>`;
    return element;
  }

  //Answering for revealing cells
  revealCell = () => {
    if(this.isFlagged) {
      return;
    }

    this.isRevealed = true;
    this.element.classList.remove('border--concave');
    this.element.classList.add('border--revealed');
  }

  //Answering for puting flag on cells
  toggleFlag = () => {
    this.isFlagged = this.isFlagged ? false : true;
    this.element.classList.toggle('cell--is-flag');
  }
}