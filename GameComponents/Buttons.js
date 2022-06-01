import { UI } from "./UI.js";

class Buttons extends UI {
  constructor() {
    super();
    this.createButtons();
  }

  createButtons = () => {
    this.resetButton = this.getElement(this.uiSelectors.reset);
    this.easyButton = this.getElement(this.uiSelectors.easy);
    this.normalButton = this.getElement(this.uiSelectors.normal);
    this.expertButton = this.getElement(this.uiSelectors.expert);
    this.personalButton = this.getElement(this.uiSelectors.personal);
  }
}

export const buttons = new Buttons();