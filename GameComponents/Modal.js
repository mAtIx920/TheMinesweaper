import { UI } from "./UI.js";

class Modal extends UI {
  constructor() {
    super();
    this.initModal();
  }

  initModal = () => {
    this.modalElement = this.getElement(this.uiSelectors.modal);
    this.modalButton = this.getElement(this.uiSelectors.modalButton);
  }
}

export const modal = new Modal();