export class UI {
  uiSelectors = {
    board: '[data-board]',
    cell: '[data-cell]',
    counter: '[data-counter]',
    timer: '[data-timer]',
    reset: '[data-reset]',
    easy: '[data-easy]',
    normal: '[data-normal]',
    expert: '[data-expert]',
    personal: '[data-personal]',
    settingModal: '[data-settingModal]',
    settingButton: '[data-settingModalButton]',
    modal: '[data-modal]',
    modalButton: '[data-modalButton]',
    rowsInput: '[data-rows]',
    colsInput: '[data-cols]',
    minesInput: '[data-mines]',
    minesSpan: '[data-minesSpan]',
    easyRecord: '[data-easyRecord]',
    mediumRecord: '[data-mediumRecord]',
    expertRecord: '[data-expertRecord]'
  }

  getElement = selector => {
    return document.querySelector(selector);
  }

  getElements = selector => {
    return document.querySelectorAll(selector);
  }
}