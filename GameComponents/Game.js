import { Cell } from "./Cell.js";
import { UI } from "./UI.js";
import { Counter } from './Counter.js';
import { timer } from "./Timer.js";
import { buttons } from "./Buttons.js";
import { modal } from './Modal.js';

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
  #isGameFinished = false;
  #isgameWon = null;
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
    this.initializeButtonsListeners();
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
    this.changeEmotions('neutral') 
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
    this.#gameCells.length = 0
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
    while(this.#boardElement.firstChild) {
      this.#boardElement.removeChild(this.#boardElement.lastChild)
    }

    this.#gameCells.flat().forEach(cell => {
      this.#boardElement.insertAdjacentHTML('beforeend', cell.createElement());
      cell.element = cell.getElement(cell.selector);
      cell.element.addEventListener('click', this.handleLeftClick);
      cell.element.addEventListener('contextmenu', this.handleRightClick);
    })
  }

  initializeButtonsListeners = () => {
    buttons.resetButton.addEventListener('click', () => this.gameReset());
    buttons.easyButton.addEventListener('click', () => this.startEasyLevel());
    buttons.normalButton.addEventListener('click', () => this.startNormalLevel());
    buttons.expertButton.addEventListener('click', () => this.startExpertLevel());
    modal.modalButton.addEventListener('click', () => this.playAgain());
  }

  handleLeftClick = e => {
    if(this.#isGameFinished || timer.finishedTime) return;

    const target = e.target;
    const rowIndex = Number(target.getAttribute('data-y'));
    const colIndex = Number(target.getAttribute('data-x'));

    const cell = this.#gameCells[colIndex][rowIndex];
    
    this.revealMine(cell);
    this.createCellValue(cell);
  }

  //Function which answering for revealing bombs
  revealMine = cell => {
    if(cell.hasMine && !cell.isFlagged) {
      this.#isGameFinished = true;
      this.#isgameWon =  false;

      this.#gameCells.flat().forEach(cell => {
        if(cell.hasMine) {
         
          cell.element.classList.add('border--revealed');
          cell.element.classList.add('cell--is-mine');
        }
      })

      this.checkEndGame();
    }
  }

  handleRightClick = e => {
    e.preventDefault();
    if(this.#isGameFinished || timer.finishedTime) return;

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

    if(!this.#counter.value) {
      const selectedAmount = this.#gameCells.flat().filter(cell => cell.isFlagged && cell.hasMine).length;

      if(selectedAmount === this.#numberOfMines) {
        this.#isgameWon = true;
        this.#isGameFinished = true;

        this.checkEndGame();
      }
    }
  }

  createCellValue = cell => {
    let value = 0;
   
    for (
      let rowIndex = Math.max(cell.x - 1, 0);
      rowIndex <= Math.min(cell.x + 1, this.#numberOfRows - 1);
      rowIndex++
    ) {
      for (
        let colIndex = Math.max(cell.y - 1, 0);
        colIndex <= Math.min(cell.y + 1, this.#numbersOfCols - 1);
        colIndex++
      ) {  
        if(this.#gameCells[rowIndex][colIndex].hasMine) {
          value++; 
        }
      }
    }

    cell.value = value;
    cell.revealCell();
    
    if(!cell.value) {
      for (
        let rowIndex = Math.max(cell.x - 1, 0);
        rowIndex <= Math.min(cell.x + 1, this.#numberOfRows - 1);
        rowIndex++
      ) {
        for (
          let colIndex = Math.max(cell.y - 1, 0);
          colIndex <= Math.min(cell.y + 1, this.#numbersOfCols - 1);
          colIndex++
        ) { 
          const cell =  this.#gameCells[rowIndex][colIndex]; 
          if(!cell.isRevealed) {
            this.createCellValue(cell);
          }
        }
      }
    }
  }

  // createCellValue = () => {
  //   const colsNumber = this.#numbersOfCols;
  //   const rowsNumber = this.#numberOfRows;
  //   let value = null;

  //   this.#gameCells.flat().forEach((cell, index, board) => {
  //     //Checking first row
  //     if(index < colsNumber && !cell.hasMine) {
  //       //Checking first cell in first row
  //       if(index === 0) {
  //         if(board[index + 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index + colsNumber].hasMine) {
  //           value++;
  //         }
  //         if(board[index + colsNumber + 1].hasMine) {
  //           value++;
  //         }
          
  //         cell.value = value;
  //         value = null
  //       }
  //       //Checking all cells in first row without first cell and last cell
  //       if(index !== 0 && index !== colsNumber - 1) {
  //         if(board[index - 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index + 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index + colsNumber - 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index + colsNumber].hasMine) {
  //           value++;
  //         }
  //         if(board[index + colsNumber + 1].hasMine) {
  //           value++;
  //         }

  //         cell.value = value;
  //         value = null;
  //       }
  //       //Checking last cell in first row
  //       if(index === colsNumber - 1) {
  //         if(board[index - 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index + colsNumber - 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index + colsNumber].hasMine) {
  //           value++;
  //         }

  //         cell.value = value;
  //         value = null;
  //       }
  //     }

  //     //Checking all rows without first row and last row
  //     if(index > colsNumber - 1 && index < (colsNumber * (rowsNumber - 1)) && !cell.hasMine) {
  //       //Checking cells by the left edge of each row without first row and last row
  //       if(index % colsNumber === 0) {
  //         if(board[index - colsNumber].hasMine) {
  //           value++;
  //         }
  //         if(board[index - colsNumber + 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index + 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index + colsNumber].hasMine) {
  //           value++;
  //         }
  //         if(board[index + colsNumber + 1].hasMine) {
  //           value++;
  //         }

  //         cell.value = value;
  //         value = null;
  //       }
  //       //Checking all cells without first cell and last cell in rows without first row and last row
  //       if(index % colsNumber !== 0 && index % colsNumber !== colsNumber - 1) {
  //         if(board[index - colsNumber - 1].hasMine){
  //           value++;
  //         }
  //         if(board[index - colsNumber].hasMine){
  //           value++;
  //         }
  //         if(board[index - colsNumber + 1].hasMine){
  //           value++;
  //         }
  //         if(board[index - 1].hasMine){
  //           value++;
  //         }
  //         if(board[index + 1].hasMine){
  //           value++;
  //         }
  //         if(board[index + colsNumber - 1].hasMine){
  //           value++;
  //         }
  //         if(board[index + colsNumber].hasMine){
  //           value++;
  //         }
  //         if(board[index + colsNumber + 1].hasMine){
  //           value++;
  //         }

  //         cell.value = value;
  //         value = null;
  //       }
  //       //Checking cells by the right edge of each row without first row and last row
  //       if(index % colsNumber === colsNumber - 1) {
  //         if(board[index - colsNumber].hasMine) {
  //           value++;;
  //         }
  //         if(board[index - 1].hasMine) {
  //           value++;;
  //         }
  //         if(board[index + colsNumber - 1].hasMine) {
  //           value++;;
  //         }
  //         if(board[index + colsNumber].hasMine) {
  //           value++;;
  //         }

  //         cell.value = value;
  //         value = null;
  //       }
  //     }

  //     //Checking last row
  //     if(index > (colsNumber * (rowsNumber - 1) - 1) && !cell.hasMine) {
  //       //Checking first cell in last row
  //       if(index === (colsNumber * (rowsNumber - 1))) {
  //         if(board[index - colsNumber].hasMine) {
  //           value++;
  //         }
  //         if(board[index - colsNumber + 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index + 1].hasMine) {
  //           value++;
  //         }
          
  //         cell.value = value;
  //         value = null;
  //       }
  //       //Checking all cells in last row without first cell and last cell
  //       if(index !== (colsNumber * (rowsNumber - 1)) && index !== (colsNumber * rowsNumber) - 1) {
  //         if(board[index - colsNumber - 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index - colsNumber].hasMine) {
  //           value++;
  //         }
  //         if(board[index - colsNumber + 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index - 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index + 1].hasMine) {
  //           value++;
  //         }

  //         cell.value = value;
  //         value = null;
  //       }
  //       //Checking las cell in last row
  //       if(index === (colsNumber * rowsNumber - 1)) {
  //         if(board[index - colsNumber - 1].hasMine) {
  //           value++;
  //         }
  //         if(board[index - colsNumber].hasMine) {
  //           value++;
  //         }
  //         if(board[index - 1].hasMine) {
  //           value++;
  //         }

  //         cell.value = value;
  //         value = null
  //       }
  //     }

  //     // cell.element.textContent = cell.value;
  //   })
  // }

  checkEndGame = () => {
    timer.stopTimer();

    if(this.#isGameFinished) {
      if(!this.#isgameWon) {
        this.changeEmotions('negative');
        modal.modalElement.querySelector('h2').textContent = 'You lose';
      } else {
        this.changeEmotions('positive');
        modal.modalElement.querySelector('h2').textContent = 'You win';
      }

      modal.modalElement.classList.remove('hide');
    }
  }

  changeEmotions = emotion => {
    const use = buttons.resetButton.querySelector('use');
    use.setAttribute('href', `./assets/sprite.svg#${emotion}`)
  }

  gameReset = () => {
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.newGame(this.#numberOfRows, this.#numbersOfCols, this.#numberOfMines);
  }

  startEasyLevel = () => {
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.newGame(this.#config.easy.rows, this.#config.easy.cols, this.#config.easy.mines);
  }
  startNormalLevel = () => {
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.newGame(this.#config.medium.rows, this.#config.medium.cols, this.#config.medium.mines);
  }
  
  startExpertLevel = () => {
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.newGame(this.#config.expert.rows, this.#config.expert.cols, this.#config.expert.mines);
  }
  
  playAgain = () => {
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.newGame(this.#numberOfRows, this.#numbersOfCols, this.#numberOfMines);
    modal.modalElement.classList.add('hide');
  }
}

window.onload = () => {
  const game = new Game();
  game.initializeGame();
}