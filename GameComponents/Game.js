import { Cell } from "./Cell.js";
import { UI } from "./UI.js";
import { Counter } from './Counter.js';
import { timer } from "./Timer.js";

class Game extends UI {
  #config = {
    easy: {
      rows: 8,
      cols: 8,
      mines: 10
    },
    medium: {
      rows: 16,
      cols: 16,
      mines: 40
    },
    expert: {
      rows: 16,
      cols: 30,
      mines: 99
    }
  }
  #numberOfRows = null;
  #numbersOfCols = null;
  #numberOfMines = null;
  #gameCells = [];
  #boardElement = null;
  #counter = new Counter();

  initializeGame = () => {
    this.handleElements();
    this.#counter.init();
    this.newGame();
  }

  //Get layout elements
  handleElements = () => {
    this.#boardElement = this.getElement(this.uiSelectors.board);
  }

  //Create new game layout
  newGame = (
    rows = this.#config.easy.rows,
    cols = this.#config.easy.cols,
    mines = this.#config.easy.mines
  ) => {
    this.#numberOfRows = rows;
    this.#numbersOfCols = cols;
    this.#numberOfMines = mines;
    this.#counter.setValue(mines);

    this.setStyles();
    this.generateCells();
    this.renderBoard();
    this.createMines();

    timer.startTimer();
  }

  setStyles = () => {
    document.documentElement.style.setProperty('--cells-in-row', this.#numbersOfCols);
  }

  //Create cells of the game
  generateCells = () => {
    for(let row = 0; row < this.#numberOfRows; row++) {
      this.#gameCells[row] = [];
      for(let col = 0; col < this.#numbersOfCols; col++) {
        this.#gameCells[row].push(new Cell(row, col))
      }
    }
  }

  createMines = () => {
    let minesNumber = this.#numberOfMines;
    while(minesNumber) {
      const cellIndex = Math.floor(Math.random() * (this.#numberOfRows * this.#numbersOfCols));
      
      this.#gameCells.flat().forEach((cell, index) => {
        if(index === cellIndex && !cell.hasMine) {
          cell.hasMine = true;
          minesNumber--;
        }
      })
    }
  }

  renderBoard = () => {
    this.#gameCells.flat().forEach(cell => {
      this.#boardElement.insertAdjacentHTML('beforeend', cell.createElement());
      cell.element = cell.getElement(cell.selector);
      cell.element.addEventListener('click', this.handleLeftClick);
      cell.element.addEventListener('contextmenu', this.handleRightClick);
    })
  }

  handleLeftClick = e => {
    const target = e.target;
    const rowIndex = Number(target.getAttribute('data-y'));
    const colIndex = Number(target.getAttribute('data-x'));

    const cell = this.#gameCells[colIndex][rowIndex];
    
    this.revealMine(cell);
    cell.revealCell();
  }

  revealMine = cell => {
    if(cell.hasMine) {
      this.#gameCells.flat().forEach(cell => {
        cell.element.removeEventListener('click', this.handleLeftClick);
        cell.element.removeEventListener('contextmenu', this.handleRightClick);

        if(cell.hasMine) {
          timer.stopTimer();
          cell.element.classList.add('border--revealed');
          cell.element.classList.add('cell--is-mine');
        }
      })
    }
  }

  handleRightClick = e => {
    e.preventDefault();
    const target = e.target;
    const rowIndex = Number(target.getAttribute('data-y'));
    const colIndex = Number(target.getAttribute('data-x'));

    const cell = this.#gameCells[colIndex][rowIndex];

    if(cell.isRevealed) return;

    if(cell.isFlagged) {
      this.#counter.incrementValue();
      cell.toggleFlag();
      return;
    }

    if(!!this.#counter.value) {
      this.#counter.decrementValue();
      cell.toggleFlag();
    }
  }
}

window.onload = () => {
  const game = new Game();
  game.initializeGame();
}