import React from 'react';
// import logo from './logo.svg';
import './App.css';
import * as R from 'ramda'

import { State, Step, } from './game/game-types'
import { initialiseGame, getInitialStep } from './game/game'
import { isDecision } from './game/game-util';

function execAct() {
  let mockDecisions: string[] = [
    'play action: village'
  ]

  console.log('starting execute')

  const execStep = (s: State, step: Step, inputLog: string[] = []): [State, string[]] => {
    let newState: State = s
    let log: string[] = inputLog
    if (isDecision(step)) {
      const { player, execute, then } = step
      const { parseDecision } = execute(s)

      if (mockDecisions.length < 1) {
        throw new Error('Ran out of decisions!')
      }

      const [first, ...rest] = mockDecisions
      mockDecisions = rest;
      // console.log('Decision: ', first)

      R.forEach((line) => {
        console.log(line)
      }, log)
      log = []
      console.log('> ' + first);

      const decisionResult = parseDecision(first, s)

      if (!decisionResult) {
        throw new Error('Oops could not parse decision! ' + first)
      }

      const decisionStep = decisionResult(s, log);

      [newState, log] = execStep(s, decisionStep)
    } else {
      // console.log('acts?', s.turn.actions, log);
      [newState, log] = step.stateChange(s, log)
    }

    if (step.then) {
      // console.log('exec then', log)
      return execStep(newState, step.then(newState, log), log)
    }
    // console.log('---New state: ', newState, '---')
    return [newState, log]
  }

  // const village = findCard('Village', actions)
  // const smithy = findCard('Smithy', actions)
  // const copper = findCard('Copper', moneyCards)
  // const estate = findCard('Estate', points)

  // const s: State = 
  const startState = initialiseGame('Player1', 'Computer')

  // const erg = smithy.execAction!(s, [])
  // debugger
  const [initialStep, initialLog] = getInitialStep(startState)
  const [state, log] = execStep(startState, initialStep, initialLog)
  R.forEach(console.log, log)
  console.log('final state')
  console.log(state)
}

class Game extends React.Component<{}, any> {
  componentDidMount() {
    execAct()
  }
  render() {
    return (
      <p>game here</p>
    )
  }
}

const App: React.FC = () => {
  return (
    <div className="App">
      <p>Hello</p>
      <Game/>
    </div>
  );
}

export default App;