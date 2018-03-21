import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/*------------------------- Components --------------------------*/

class App extends React.Component {
  constructor() {
    super();
    this.state = getState();
    // binding methods
    this.reset = this.reset.bind(this);
    this.toggleLights = this.toggleLights.bind(this);
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

  toggleLights() {
    const lightsOn = this.state.lightsOn === false ? true : false;
    this.setState({ lightsOn });
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

      case 2: // fight the boss
        console.log('fightBoss');
        this.fightBoss(player, grid, position);
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
    let message;
    if(this.state.theBoss.isHere) {
      message = {
        text : 'The Boss has appeared on the map. Its time to save the world!',
        type : 'good',
      }
    } else {
      message = {
        text : 'Find and kill the villains to weaken the simulation and force The Boss to appear.',
        type : 'inform',
      }
    }
    this.setState({
      player,
      grid,
      message,
    });
  }

  fightBoss(player, grid, position) {
    let { theBoss } = this.state;
    theBoss.health -= dealDamage(player.level, player.weapon);
    console.log(theBoss.health)
    if(theBoss.health > 0) {
      player.health -= dealDamage(theBoss.level, theBoss.weapon);
      if(player.health > 0) {
        this.setState({
          player,
          theBoss,
          message : {
            text : `You are fighting The Boss.
                    His remaining health is ${theBoss.health}.`,
            type : 'hit flash',
          }
        })
      } else {
        player.health = 0;
        this.setState({
          player,
          message : {
            text : 'You were killed by The Boss. Game Over!',
            type : 'alert',
          },
        })
      }
    } else {
      grid[player.position.row][player.position.col] = 1;
      grid[position.row][position.col] = 2;
      player.xp += (theBoss.level * 1000);
      player.position = position;
      theBoss = {
        isHere : true,
      }
      this.setState({
        player,
        grid,
        message : {
          text : 'You killed The Boss. You saved the world!',
          type : 'good',
        },
        theBoss,
      });
    }
  }

  fightVillain(player, grid, position) {
    let { villains, theBoss } = this.state;
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
            text : `You are fighting a Level ${villains[index].level} villain.
                    His remaining health is ${villains[index].health}.`,
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
        })
      }
    } else {
      grid[player.position.row][player.position.col] = 1;
      grid[position.row][position.col] = 2;
      player.xp += (villains[index].level * 100);
      player.position = position;
      villains.splice(index, 1);
      this.setState({
        player,
        villains,
        grid,
        message : {
          text : 'You killed a bad guy. Time to kill some more.',
          type : 'good',
        },
        theBoss,
        lightsOn: true,
      });
      if(!villains.length) {
        theBoss = {
          isHere : true,
          health : 6000,
          weapon : 6,
          level : 25,
          position : randomPosition(grid),
          message : {
            text : 'The Boss has been forced to face you. Kill him and save the world!',
            type : 'good',
          },
        }
        grid[theBoss.position.row][theBoss.position.col] = 2;
      }
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
    player.xp += health;
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
    const weapons = ['Weapon1', 'Weapon2', 'Weapon3', 'Weapon4', 'Weapon5', 'Weapon6'];
    grid[player.position.row][player.position.col] = 1;
    grid[position.row][position.col] = 2;
    player.position = position;
    player.weapon = Math.floor(Math.random() * weapons.length);
    player.xp += (player.weapon * 50);
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

      case 84: // T
        this.toggleLights();
        break;
      default:
        console.log('default');
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUpdate() {
    const levels = [0, 50, 100, 150, 200,
                    300, 400, 500, 600, 700,
                    900, 1100, 1300, 1500, 1700,
                    2000, 2300, 2600, 2900, 3200,
                    3600, 4000, 4400, 4800, 5200];
    const { player } = this.state;
    if(player.xp >= levels[player.level]) {
      player.level += 1;
      this.setState({
        player,
        message : {
          text : 'You levelled up!',
          type : 'good',
        }
      });
    }
  }

  render() {
    const { player, grid, lights, message, lightsOn } = this.state;
    return (
      <div className = "roguelike">
        <Menu
          player = { player }
          grid = { grid }
          lights = { lights }
          message = { message }
        />
        <Map
          grid = { grid }
          player = { player }
          lightsOn = { lightsOn }
        />
        <Instructions
          toggleLights = { this.toggleLights }
        />
      </div>
    );
  }
}

class Menu extends React.Component {
  render() {
    const levels = [0, 50, 100, 150, 200,
                    300, 400, 500, 600, 700,
                    900, 1100, 1300, 1500, 1700,
                    2000, 2300, 2600, 2900, 3200,
                    3600, 4000, 4400, 4800, 5200];
    const weapons = ['Weapon1', 'Weapon2', 'Weapon3', 'Weapon4', 'Weapon5', 'Weapon6'];
    let { player, message } = this.props;
    return (
      <div className = 'menu'>
        <div className = 'title'>
          <div>Vogue</div>
          <div>A Roguelike</div>
        </div>
        <div className = 'stats'>
          <h3 className = 'text-center'>Player Stats</h3>
          <ul>
            <li><strong>Level: </strong>{ player.level }</li>
            <li><strong>Health: </strong>{ player.health }</li>
            <li><strong>XP: </strong>{ player.xp } / { levels[player.level] }</li>
            <li><strong>Armed with: </strong>{ weapons[player.weapon] }</li>
          </ul>
        </div>
        <div className = 'message'>
          <div className = {message.type}>{message.text}</div>
        </div>
        <div className = 'map-items'>
          <h3 className = 'text-center'>Map Items</h3>
          <ul>
            <li><Cell val={0} visible={true} />
              <span> Unaccessible Area</span>
            </li>
            <li><Cell val={1} visible={true} />
              <span> Accessible Area</span>
            </li>
            <li><Cell val={2} visible={true} />
              <span> You (The President)</span>
            </li>
            <li><Cell val={3} visible={true} />
              <span> Villain</span>
            </li>
            <li><Cell val={4} visible={true} />
              <span> Health</span>
            </li>
            <li><Cell val={5} visible={true} />
              <span> Weapon</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

class Map extends React.Component {
  render() {
    const { grid, lightsOn } = this.props;
    const { row, col } = this.props.player.position;
    const gameMap = grid.map((rowsArr, rowIdx) => {
      return (
        rowsArr.map((cell, colIdx) => {
          const cellId = `${rowIdx}|${colIdx}`;
					const val = grid[rowIdx][colIdx];
          let visible;
          if(lightsOn) {
            visible = true;
          } else {
            const rowDiff = Math.abs(row - rowIdx);
            const colDiff = Math.abs(col - colIdx);
            visible = (
              (rowDiff === 3 && colDiff === 0) ||
              (rowDiff === 2 && colDiff === 0) ||
              (rowDiff === 2 && colDiff === 1) ||
              (rowDiff === 1 && colDiff === 0) ||
              (rowDiff === 1 && colDiff === 1) ||
              (rowDiff === 1 && colDiff === 2) ||
              (rowDiff === 0 && colDiff === 0) ||
              (rowDiff === 0 && colDiff === 1) ||
              (rowDiff === 0 && colDiff === 2) ||
              (rowDiff === 0 && colDiff === 3)
            );
          }
          return (
            <Cell
              key = { cellId }
              id = { cellId }
              val = { val }
              visible = { visible }
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
    const { val, visible, id } = this.props;
    const cellClass = 'cell ' + (visible ? (val === 0 ? 'unwalkable' : 'walkable') : 'dark')
    return (
      <div className = { cellClass } id = { id }>
        {val === 2 && <div className = "player"></div>}
        {visible && val === 3 && <div className = "villain"></div>}
        {visible && val === 4 && <div className = "health"></div>}
        {visible && val === 5 && <div className = "weapon"></div>}
      </div>
    );
  }
}

class Instructions extends React.Component {
  render() {
    return (
      <div className = 'menu'>
        <div className = 'title'>
          Introduction
        </div>
        <div className = 'story'>
          <p>
            It is a truth universally acknowledged that every now and again
            a situation arises that defies explanation. And so it was with your
            ascension to the Presidency of the United States.
          </p>
          <p>
            While preparing for a press conference, you are warned of an
            impending alien invasion. Just as you are informed, the invasion
            begins, spearheaded by the alien warlord The Boss, who captures
            the entire cabinet, including you.
          </p>
          <p>
            You realise that you are trapped inside a randomised simulation.
            You can collect weapons and health to gain XP. Kill all the villains
            to weakens the simulation and gain mega XP. Without any villains
            left The Boss will be forced to face you.
          </p>
          <p>
            It's time to save the world!
          </p>
        </div>
        <div className = 'instructions'>
          <h3 className = 'text-center'>Instructions</h3>
          <ol>
            <li>Press R to restart the game</li>
            <li>Press T to toggle visible area in the map</li>
          </ol>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

/*-------------------- Helper Functions below --------------------------*/

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

function createMap(dimensions = 40, maxTunnels = 210, maxLength = 12) {
  //Random Walker Algorithm
  let map = createArray(0, dimensions),
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
  let grid = createMap(40, 210, 12);
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
    theBoss : {
      isHere : false,
    },
    lightsOn : false,
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
  const damages = [20, 30, 50, 80, 120, 170, 230, 300, 380, 470, 570, 680];
  const damage = damages[Math.ceil(Math.random() * (level / 2))];
  return (damage + ((weapon * 10 * damage) / 100));
}

/*------------------------- Program End --------------------------*/
