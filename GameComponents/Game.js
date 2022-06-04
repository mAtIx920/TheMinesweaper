import { Cell } from "./Cell.js";
import { UI } from "./UI.js";
import { Counter } from './Counter.js';
import { timer } from "./Timer.js";
import { buttons } from "./Buttons.js";
import { modal } from './Modal.js';
import { savingRecordTime } from './contextFunction.js';

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
  #currentLevel = 'easy'; //primary level of the game

  #gameCells = [];
  #boardElement = null;

  #isGameFinished = false;
  #isgameWon = null;
  #errorText =  false;

  #counter = new Counter();

  initializeGame = () => {
    this.handleElements();
    this.#counter.init();
    this.newGame();
  }

  //Geting layout elements
  handleElements = () => {
    this.#boardElement = this.getElement(this.uiSelectors.board);
    this.initializeButtonsListeners();
  }

  newGame = (
    rows = this.#config.easy.rows,
    cols = this.#config.easy.cols,
    mines = this.#config.easy.mines,
    lvl = this.#currentLevel
  ) => {
    this.#numberOfRows = rows;
    this.#numbersOfCols = cols;
    this.#numberOfMines = mines;
    this.#counter.setValue(mines);
    this.#currentLevel = lvl

    this.setStyles();
    this.changeEmotions('neutral') 
    this.generateCells();
    this.renderBoard();
    this.createMines();

    timer.startTimer();
    this.typeRecord()
  }

  //Setting some styles of components 
  setStyles = () => {
    document.documentElement.style.setProperty('--cells-in-row', this.#numbersOfCols);
  }

  //Creating cells on board
  generateCells = () => {
    this.#gameCells.length = 0
    for(let row = 0; row < this.#numberOfRows; row++) {
      this.#gameCells[row] = [];
      for(let col = 0; col < this.#numbersOfCols; col++) {
        this.#gameCells[row].push(new Cell(row, col))
      }
    }
   
  }

  //Creating mines on board
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

  //Display the prepared board on screen
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

  //Added listener functions some components
  initializeButtonsListeners = () => {
    buttons.resetButton.addEventListener('click', () => this.gameReset());
    buttons.easyButton.addEventListener('click', () => this.startEasyLevel());
    buttons.normalButton.addEventListener('click', () => this.startNormalLevel());
    buttons.expertButton.addEventListener('click', () => this.startExpertLevel());
    buttons.personalButton.addEventListener('click', () => this.startPersonalLevel());
    modal.modalButton.addEventListener('click', () => this.playAgain());
    modal.settingButton.addEventListener('click', () => this.startPersonalGame());
    modal.exitButton.addEventListener('click', () => this.exitModal());
  }

  //Function answering for clicking left button of computer mouse 
  handleLeftClick = e => {
    if(this.#isGameFinished || timer.finishedTime) return;

    const target = e.target;
    const rowIndex = Number(target.getAttribute('data-y'));
    const colIndex = Number(target.getAttribute('data-x'));

    const cell = this.#gameCells[colIndex][rowIndex];

    this.revealMine(cell);
    this.createCellValue(cell);
  }

  //Function answering for revealing all bombs after click on first bomb
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

  //Function answering for clicking right button of computer mouse
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

    //Checking if player put all flags on cells where are bombs
    if(!this.#counter.value) {
      const selectedAmount = this.#gameCells.flat().filter(cell => cell.isFlagged && cell.hasMine).length;

      if(selectedAmount === this.#numberOfMines) {
        this.#isgameWon = true;
        this.#isGameFinished = true;

        this.checkEndGame();
      }
    }
  }

  //Creating number value of bombs being around the cell
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

  //Function answering for checking if game is won or lose
  checkEndGame = () => {
    timer.stopTimer();
    let value = null;

    if(this.#isGameFinished) {
      if(!this.#isgameWon) {
        this.changeEmotions('negative');
        modal.modalElement.querySelector('h2').textContent = 'You lose';
      } else {
        this.changeEmotions('positive');
        modal.modalElement.querySelector('h2').textContent = 'You won';

        //Save record of player
        value = savingRecordTime(timer.getCurrentTime, this.#currentLevel);
        setTimeout(this.typeRecord, 400)
      } 

      modal.modalElement.classList.remove('hide');
    }
  }

  //Writing records of player on the screen
  typeRecord = async () => {
    const response = await fetch(`http://localhost:3000/records`);
    const data = await response.json();

    modal.easySpan.textContent = data[0].timeRecord !== null ? `${data[0].timeRecord}s` : 'Brak rekordu';
    modal.mediumSpan.textContent = data[1].timeRecord !== null ? `${data[1].timeRecord}s` : 'Brak rekordu';
    modal.expertSpan.textContent = data[2].timeRecord !== null ? `${data[2].timeRecord}s` : 'Brak rekordu';
  }

  //Change image depending on winning or defeat
  changeEmotions = emotion => {
    const use = buttons.resetButton.querySelector('use');
    use.setAttribute('href', `./assets/sprite.svg#${emotion}`)
  }

  //Reset game
  gameReset = () => {
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.newGame(this.#numberOfRows, this.#numbersOfCols, this.#numberOfMines);
  }

  //Buttons of levels 'easy, medium, expert, personal'
  startEasyLevel = () => {
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.newGame(this.#config.easy.rows, this.#config.easy.cols, this.#config.easy.mines);
    this.#currentLevel = buttons.easyButton.textContent;
  }

  startNormalLevel = () => {
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.newGame(this.#config.medium.rows, this.#config.medium.cols, this.#config.medium.mines);
    this.#currentLevel = buttons.normalButton.textContent;
  }
  
  startExpertLevel = () => {
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.newGame(this.#config.expert.rows, this.#config.expert.cols, this.#config.expert.mines);
    this.#currentLevel = buttons.expertButton.textContent;
  }

  startPersonalLevel = () => {
    modal.settingModal.classList.remove('hide');
    modal.minesSpanElement.textContent = (this.#numberOfRows * this.#numbersOfCols - 1)
  }
  

  startPersonalGame = () => {
    const amountRows = Number(modal.rowsInputElement.value);
    const amountCols = Number(modal.colsInputElement.value);
    const amountMines = Number(modal.minesInputElement.value);

    //Checking if player has written right data
    if(amountRows < 8 || amountCols < 8 || amountRows > 16 || amountCols > 45 || amountMines < 1 || amountMines > modal.getmaxMinesValue()) {
      if(!this.#errorText) {
        modal.settingButton.insertAdjacentHTML('beforebegin', '<p class="error">Wpisz prawidłowe dane!</p>');
        this.#errorText =  true;
      }

      return;
    }

    if(this.#errorText) {
      document.querySelector('.error').remove();
    }
    
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.#errorText =  false;
    this.newGame(amountRows, amountCols, amountMines);
    modal.settingModal.classList.add('hide');
  }
  
  //Buttons which launch the game again
  playAgain = () => {
    timer.restartTimer();
    this.#isGameFinished = false;
    this.#isgameWon = null;
    this.newGame(this.#numberOfRows, this.#numbersOfCols, this.#numberOfMines);
    this.#currentLevel = this.#currentLevel
    modal.modalElement.classList.add('hide');
  }

  //Display exit modal on the screen
  exitModal = () => {
    console.log('j')
    modal.modalElement.classList.add('hide');
  }

  //Makeshift function for creating cell value
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
}

window.onload = () => {
  const game = new Game();
  game.initializeGame();
}