import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class App extends React.Component {
  constructor() {
    super();
    this.state = getState();
    // binding methods
    this.reset = this.reset.bind(this);
    this.playerMove = this.playerMove.bind(this);
    this.freeMove = this.freeMove.bind(this);
    this.fightVillain = this.fightVillain.bind(this);
    this.pickHealth = this.pickHealth.bind(this);
    this.pickWeapon = this.pickWeapon.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  reset() {
    const state = getState();
    this.setState(state);
  }

  playerMove(direction) {
    let { player, grid } = this.state;
    let position = {
      row : player.position.row + direction[0],
      col : player.position.col + direction[1],
    }
    if(!((position.row >= 0 && position.row < 40) &&
         (position.col >= 0 && position.col < 40))){
           this.setState({
             message : {
               text : 'You hit the wall',
               type : 'alert',
             }
           });
           return;
         }
    let gridVal = grid[position.row][position.col];
    switch (gridVal) {
      case 1: // moving in the lightblue(walkable) area
        this.freeMove(player, grid, position);
        break;

      case 3: // fight the villain in turns to move ahead
        this.fightVillain(player, grid, position);
        break;

      case 4: // pick up random amount of health
        this.pickHealth(player, grid, position);
        break;

      case 5: // pick up a random weapon
        this.pickWeapon(player, grid, position);
        break;

      default: // when you hit a wall (gray area)
        this.setState({
          message : {
            text : 'You hit the wall',
            type : 'alert',
          }
        });
    }
  }

  freeMove(player, grid, position) {
    grid[player.position.row][player.position.col] = 1;
    grid[position.row][position.col] = 2;
    player.position = position;
    this.setState({
      player,
      grid,
      message : {
        text : 'Use the arrow keys or WASD to move the player',
        type : 'inform',
      },
    });
  }

  fightVillain(player, grid, position) {
    let { villains } = this.state;
    let index;
    for(let i = 0; i < villains.length; i++) {
      if(villains[i].position.row === position.row &&
         villains[i].position.col === position.col) {
        index = i;
      }
    }
    villains[index].health -= dealDamage(player.level, player.weapon);
    if(villains[index].health > 0) {
      player.health -= dealDamage(villains[index].level, Math.ceil(Math.random() * 5));
      if(player.health > 0) {
        this.setState({
          player,
          villains,
          message : {
            text : `You are fighting a villain. His remaining health is ${villains[index].health}`,
            type : 'hit flash',
          }
        })
      } else {
        player.health = 0;
        this.setState({
          player,
          villains,
          message : {
            text : 'You were killed. Game Over!',
            type : 'alert',
          },
          gameStatus : 0,
        })
      }
    } else {
      villains.splice(index, 1);
      // player.xp += (villains[index].level * 100);
      grid[player.position.row][player.position.col] = 1;
      grid[position.row][position.col] = 2;
      player.position = position;
      this.setState({
        player,
        villains,
        grid,
        message : {
          text : 'You killed a bad guy. Time to kill some more',
          type : 'good',
        }
      });
    }
  }

  pickHealth(player, grid, position) {
    let healths = [20, 40, 60, 80, 100, 120];
    let health;
    grid[player.position.row][player.position.col] = 1;
    grid[position.row][position.col] = 2;
    player.position = position;
    health = healths[Math.floor(Math.random() * healths.length)]
    player.health += health;
    // player.xp += health;
    this.setState({
      player,
      grid,
      message : {
        text : `You collected a health booster! Current player health is ${player.health}`,
        type : 'good',
      },
    });
  }

  pickWeapon(player, grid, position) {
    let weapons = ['Weapon1', 'Weapon2', 'Weapon3', 'Weapon4', 'Weapon5', 'Weapon6'];
    grid[player.position.row][player.position.col] = 1;
    grid[position.row][position.col] = 2;
    player.position = position;
    player.weapon = Math.floor(Math.random() * weapons.length);
    // player.xp += (player.weapon * 50);
    this.setState({
      player,
      grid,
      message : {
        text : `You collected a new weapon! Current weapon is ${weapons[player.weapon]}`,
        type : 'good',
      },
    });
  }

  handleKeyPress(event) {
    switch (event.keyCode) {
      case 38: // Up
      case 87: // W
        this.playerMove([-1, 0]);
        break;

      case 39: // Right
      case 68: // D
        this.playerMove([0, 1]);
        break;

      case 40: // Down
      case 83: // S
        this.playerMove([1, 0]);
        break;

      case 37: // Left
      case 65: // A
        this.playerMove([0, -1]);
        break;

      case 82: // R
        this.reset();
        break;

      // case 84: // T
      //   //toggleLights
      //   break;
      default:
        console.log('default');
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUpdate() {
    // const levels = [0, 50, 100, 150, 200,
    //                 300, 400, 500, 600, 700,
    //                 900, 1100, 1300, 1500, 1700,
    //                 2100, 2500, 2900, 3300, 3700];
    // let { player } = this.state;
    // if(player.xp >= levels[player.level]) {
    //   player.level += 1;
    //   this.setState({
    //     player,
    //     message : {
    //       text : 'You levelled up!',
    //       type : 'good',
    //     }
    //   });
    // }
  }

  render() {
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
    let { grid } = this.props;
    const gameMap = grid.map((rowsArr, row) => {
      return (
        rowsArr.map((cell, col) => {
          const cellId = `${row}|${col}`;
					const val = grid[row][col];
          return (
            <Cell
              key = {cellId}
              id = {cellId}
              cellClass = {(val === 0) ? 'cell unwalkable' : 'cell walkable'}
     					val = { val }
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
        {this.props.val === 2 && <div className = "player"></div>}
				{this.props.val === 3 && <div className = "villain"></div>}
				{this.props.val === 4 && <div className = "health"></div>}
				{this.props.val === 5 && <div className = "weapon"></div>}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

function createArray(num, dimensions) {
  let array = [];
  for(let i = 0; i < dimensions; i++) {
    array.push([]);
    for(let j = 0; j < dimensions; j++) {
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
      level : Math.ceil(Math.random() * level),
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
  while(weaponCount < 10) {
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

function dealDamage(level, weapon) {
  const damages = [20, 30, 50, 80, 120, 170, 230, 300, 380, 470];
  const damage = damages[Math.ceil(Math.random() * (level / 2))];
  return (damage + ((weapon * 10 * damage) / 100));
}
