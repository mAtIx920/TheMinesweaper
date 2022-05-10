import { Cell } from "./Cell.js";
import { UI } from "./UI.js"

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

  initializeGame = () => {
    this.handleElements();
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

    this.setStyles();
    this.generateCells();
    this.renderBoard();

    // this.#cellElements = this.getElements(this.uiSelectors.cell)
    // this.addCellsEvents();
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

    this.#gameCells[colIndex][rowIndex].revealCell();
  }

  handleRightClick = e => {
    e.preventDefault();
    const target = e.target;
    const rowIndex = Number(target.getAttribute('data-y'));
    const colIndex = Number(target.getAttribute('data-x'));

    this.#gameCells[colIndex][rowIndex].toggleFlag();
  }

  // addCellsEvents = () => {
  //   this.#cellElements.forEach(element => {
  //     console.log(element)
  //     element.addEventListener('click', this.revealCell);
  //     element.addEventListener('contextmenu', this.putFlagCell);
  //   })
  // }

  // revealCell = e => {
  //   const target = e.target;
  //   console.log(target)
  // }
}

window.onload = () => {
  const game = new Game();
  game.initializeGame();
}