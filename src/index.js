import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Cell extends React.Component {
  render() {
    return (
      <div className = {this.props.cellClass}>
        {this.props.playerCell === true && <div className = "player"></div>}

      </div>
    );
  }
}

class Map extends React.Component {
  render() {
    let { grid, player } = this.props;
    const gameMap = grid.map((rowsArr, row) => {
      return (
        rowsArr.map((cell, col) => {
          const cellId = `${row}|${col}`;
          return (
            <Cell
              key = {cellId}
              id = {cellId}
              cellClass = {(grid[row][col] === 1) ? 'cell walkable' : 'cell unwalkable'}
              playerCell = {(player.position.row === row && player.position.col === col) ? true : false }
              row = {row}
              col = {col}
            />
          );
        })
      )
    })
    return (
      <div className = "map">
        {gameMap}
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid : createMap(),
      gameMap : [],
      player : {
        position : {
          row : 0,
          col : 0,
        },
      },
    }
    //binding methods
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.randomPosition = this.randomPosition.bind(this);
  }

  handleKeyPress(event) {
    let {player} = this.state;
    switch (event.keyCode) {
      case 38:
      case 87:
        //up W
        console.log(player.position);
        player.position.row--;
        console.log(player.position);
        break;

      case 39:
      case 68:
        //right D
        break;

      case 40:
      case 83:
        //down S
        break;

      case 37:
      case 65:
        //left A
        break;

      default:
        console.log('default');
    }
  }

  randomPosition(item) {
    let row, col;
    let { grid } = this.state;
    do {
      row = Math.floor(Math.random() * 40);
      col = Math.floor(Math.random() * 40);
    } while(
        grid[row][col] === 0
      /*&& (
        (grid[row - 1][col] === 0 && grid[row - 1][col + 1] === 0 && grid[row][col + 1] === 0) ||
        (grid[row][col + 1] === 0 && grid[row + 1][col + 1] === 0 && grid[row + 1][col] === 0) ||
        (grid[row + 1][col] === 0 && grid[row + 1][col - 1] === 0 && grid[row][col - 1] === 0) ||
        (grid[row][col - 1] === 0 && grid[row - 1][col - 1] === 0 && grid[row - 1][col] === 0)
      )*/
    )
    return {
      row,
      col,
    }
  }

  componentWillMount() {
    let { player } = this.state;
    let playerPosition = this.randomPosition();
    player.position.row = playerPosition.row;
    player.position.col = playerPosition.col;
    this.setState({player});
  }

  render() {
    return (
      <div className = "roguelike" onKeyPress = {this.handleKeyPress}>
        <Map
          grid = {this.state.grid}
          player = {this.state.player}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

function createArray(num, dimensions) {
  var array = [];
  for(var i = 0; i < dimensions; i++) {
    array.push([]);
    for(var j = 0; j < dimensions; j++) {
      array[i].push(num);
    }
  }
  return array;
}

function createMap() { //Random Walker Algorithm
  let dimensions = 40,
    maxTunnels = 210,
    maxLength = 12,
    map = createArray(0, dimensions),
    currentRow = Math.floor(Math.random() * dimensions),
    currentColumn = Math.floor(Math.random() * dimensions),
    directions = [[-1, 0],[1, 0],[0, -1],[0, 1]],
    lastDirection = [],
    randomDirection;

  while(maxTunnels && maxLength && dimensions) {
    do {
      randomDirection = directions[Math.floor(Math.random() * directions.length)];
    } while(
      (randomDirection[0] === lastDirection[0] &&
        randomDirection[1] === lastDirection[1]) ||
        (randomDirection[0] === -lastDirection[0] &&
          randomDirection[1] === -lastDirection[1]));

    var randomLength = Math.ceil(Math.random() * maxLength),
      tunnelLength = 0;

    while(tunnelLength < randomLength) {
      if(((currentRow === 0) && (randomDirection[0] === -1)) ||
          ((currentColumn === 0) && (randomDirection[1] === -1)) ||
            ((currentRow === dimensions - 1) && (randomDirection[0] === 1)) ||
              ((currentColumn === dimensions - 1) && (randomDirection[1] === 1))) {
        break;
      } else {
        map[currentRow][currentColumn] = 1;
        currentRow += randomDirection[0];
        currentColumn += randomDirection[1];
        tunnelLength++;
      }
    }

    if(tunnelLength) {
      lastDirection = randomDirection;
      maxTunnels--;
    }
  }
  return map;
}

function cloneArray(arr) {
  return JSON.parse(JSON.stringify(arr));
}
