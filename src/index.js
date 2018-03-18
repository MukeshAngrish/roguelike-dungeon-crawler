import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid : createMap(),
      player : {
        position : {
          row : Math.floor(Math.random() * 40),
          col : Math.floor(Math.random() * 40),
        }
      },
    }
    // binding methods
    this.reset = this.reset.bind(this);
  }

  reset() {
    const state = this.initiateState();
    this.setState(state);
  }

  componentWillMount() {
    this.setState(getState());
  }

  render() {
    console.log(this.state.grid);
    return (
      <div className = "roguelike">
        <Map
          grid = {this.state.grid}
          player = {this.state.player}
        />
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
              cellClass = {(grid[row][col] === 0) ? 'cell unwalkable' : 'cell walkable'}
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

class Cell extends React.Component {
  render() {
    return (
      <div className = {this.props.cellClass}>
        {this.props.playerCell === true && <div className = "player"></div>}
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

function randomPosition(grid) {
  let row, col, val;
  do {
    row = Math.floor(Math.random() * 40);
    col = Math.floor(Math.random() * 40);
    val = grid[row][col]
  } while(val === 0 ||
          val === 2 ||
          val === 3 ||
          val === 4 ||
          val === 5)
  return {
    row,
    col,
  }
}

function initialState() {
  let grid = createMap();
  let position = randomPosition(grid);
  const state = {
    grid,
    player : {
      position,
      level : 1,
      xp : 0,
      health : 100,
      weapon : 0,
    },
    message : {
      text : 'Use the arrow keys or WASD to move the player',
      type : 'inform',
    },
    villains : [],
    theBoss : 1000,
    gameStatus : 3,
    lights : 'off',
  };
  state.grid[position.row][position.col] = 2;
  return state;
}

function placeVillains(state) {
  let villainCount = 0,
    health = 50,
    level = 1,
    position;
  state.villains = [];
  while(villainCount < 20) {
    position = randomPosition(state.grid);
    state.villains.push({
      position,
      health,
      level,
    });
    state.grid[position.row][position.col] = 3;
    health += 50;
    level++;
    villainCount++;
  }
  return state;
}

function placeHealth(state) {
  let healthCount = 0,
    position;
  while(healthCount < 30) {
    position = randomPosition(state.grid);
    state.grid[position.row][position.col] = 4;
    healthCount++;
  }
  return state;
}

function placeWeapons(state) {
  let weaponCount = 0,
    position;
  while(weaponCount < 5) {
    position = randomPosition(state.grid);
    state.grid[position.row][position.col] = 5;
    weaponCount++;
  }
  return state;
}

function getState() {
  const state1 = initialState();
	const state2 = placeVillains(state1);
	const state3 = placeHealth(state2);
	const state4 = placeWeapons(state3);
	return state4;
}

// function cloneArray(arr) {
//   return JSON.parse(JSON.stringify(arr));
// }
//
// function handleKeyPress(event) {
//   let {player} = this.state;
//   switch (event.keyCode) {
//     case 38:
//     case 87:
//       //up W
//       player.position.row--;
//       break;
//
//     case 39:
//     case 68:
//       //right D
//       player.position.col++;
//       break;
//
//     case 40:
//     case 83:
//       //down S
//       player.position.row++;
//       break;
//
//     case 37:
//     case 65:
//       //left A
//       player.position.col--;
//       break;
//
//     default:
//       console.log('default');
//   }
// }
