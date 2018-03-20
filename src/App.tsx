import * as React from 'react'
import styled from 'styled-components'

import { p } from './players'

const Wrapper = styled.div`
  display: flex;
`
interface Move {
  damage: number
  range: number
  hit: number
  heal: number
  chance: number
}
interface Player {
  id: string
  first: Move
  second: Move
  third: Move
  life: number
}

interface Prop {
  life: number
  target: boolean
  className?: string
  onClick(): void
}

const Vertical = styled.div`
  display: flex;
  flex-flow: column wrap;
`
const Center = styled.h3`
  text-align: center;
`

const BaseMan: React.StatelessComponent<Prop> = props => (
  <button className={props.className} onClick={props.onClick}>
    {props.children}
  </button>
)

const Man = styled(BaseMan)`
  position: relative;
  width: 50px;
  height: 50px;
  background: #333;
  margin: 1rem;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: ${props => props.life}%;
    height: 5px;
    background: blueviolet;
  }
  box-shadow: ${props => (props.target ? '0 0 5px tomato' : 'none')};
`

const Man2 = Man.extend`
  background: tomato;
`

interface Props {
  player: Player
  team: string
  open: boolean
  target: boolean
  togglePanel(id: string): void
  registerChoice(id: string, move: Move): void
  applyAction(id: string): void
}

class Player extends React.Component<Props, {}> {
  onPlayerClick = () => {
    const { team, target, player: { id } } = this.props
    if (target) {
      return this.props.applyAction(id)
    }
    return this.props.togglePanel(team + id)
  }
  render() {
    const { team, open, target, player: { id, life, ...move } } = this.props
    const Component = team === 'alpha' ? Man : Man2
    return (
      <div>
        {id}
        <Component life={life} target={target} onClick={this.onPlayerClick} />
        {open && (
          <Vertical>
            {Object.keys(move).map(m => (
              <button key={m} onClick={() => this.props.registerChoice(id, move[m])}>
                {move[m].damage ? `damage: ${move[m].damage}` : `heal: ${move[m].heal}`}
                <br />
                range: {move[m].range}
                <br />
                hit: {move[m].hit}
                <br />
                chance: {move[m].chance}
              </button>
            ))}
          </Vertical>
        )}
      </div>
    )
  }
}

interface State {
  open: string
  status: string
  choice: {
    id: string
    move: Move
  } | null
  targets: string[]
  players: {}
  game: string[]
}

class App extends React.Component<{}, State> {
  state = {
    open: '',
    status: '',
    choice: null,
    targets: [],
    players: p,
    game: [
      'player-1',
      'player-2',
      'player-3',
      'player-4',
      'player-5',
      'player-6',
      'player-7',
      'player-8',
    ],
  }
  togglePanel = (id: string) => {
    this.setState({
      open: this.state.open === id ? '' : id,
      status: '',
    })
  }
  applyAction = (id: string) => {
    // @ts-ignore choice can't be null here
    const { players, choice: { move } } = this.state
    const touch = new Array(move.chance)
      .fill(1)
      .concat(new Array(100 - move.chance).fill(0))[Math.floor(Math.random() * 100)]
    const lifeChange = touch ? move.heal - move.damage : 0

    this.setState({
      open: '',
      targets: [],
      status: touch ? `success ${lifeChange}` : 'miss',
      players: {
        ...players,
        [id]: {
          ...players[id],
          life: players[id].life + lifeChange,
        },
      },
    })
  }
  registerChoice = (playerId: string, move: Move) => {
    const { game } = this.state
    const index = game.indexOf(playerId)
    const start = index - move.range < 0 ? 0 : index - move.range
    const end = index + move.range
    const targets = game.slice(start, end)
    this.setState({
      choice: {
        id: playerId,
        move,
      },
      targets,
    })
  }
  render() {
    const { open, players, status, targets, game } = this.state
    return (
      <div>
        <Wrapper>
          {game.map((key: string, i: number) => {
            const team = i < 4 ? 'alpha' : 'beta'
            // @ts-ignore: string is not assignable to never wtf
            const target = targets.includes(key)
            console.log(target)
            return (
              <Player
                key={team + key}
                open={open === team + key}
                target={target}
                player={players[key]}
                team={team}
                togglePanel={this.togglePanel}
                registerChoice={this.registerChoice}
                applyAction={this.applyAction}
              />
            )
          })}
        </Wrapper>
        <Center>{status}</Center>
      </div>
    )
  }
}

export default App
