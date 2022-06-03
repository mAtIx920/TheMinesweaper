import { UI } from "./UI.js";

class Modal extends UI {
  constructor() {
    super();
    this.initModal();
    this.addInputEvents();
    this._maxMinesValue = null;

    this.getmaxMinesValue = () => this._maxMinesValue;
  }

  initModal = () => {
    this.modalElement = this.getElement(this.uiSelectors.modal);
    this.modalButton = this.getElement(this.uiSelectors.modalButton);
    this.settingModal = this.getElement(this.uiSelectors.settingModal);
    this.settingButton = this.getElement(this.uiSelectors.settingButton);
    this.rowsInputElement = this.getElement(this.uiSelectors.rowsInput);
    this.colsInputElement = this.getElement(this.uiSelectors.colsInput);
    this.minesInputElement = this.getElement(this.uiSelectors.minesInput);
    this.minesSpanElement = this.getElement(this.uiSelectors.minesSpan);
    this.easySpan = this.getElement(this.uiSelectors.easyRecord);
    this.mediumSpan = this.getElement(this.uiSelectors.mediumRecord);
    this.expertSpan = this.getElement(this.uiSelectors.expertRecord);
  }
  
  addInputEvents = () => {
    this.rowsInputElement.addEventListener('change', () => this.checkInput());
    this.colsInputElement.addEventListener('change', () => this.checkInput());
  }

  checkInput = () => {
    const rowsValue = this.rowsInputElement.value;
    const colsValue = this.colsInputElement.value;
    this.minesSpanElement.textContent = (rowsValue * colsValue - 1) === -1 ? 0 : (rowsValue * colsValue - 1);
    this._maxMinesValue = rowsValue * colsValue - 1;
  }
}

export const modal = new Modal();