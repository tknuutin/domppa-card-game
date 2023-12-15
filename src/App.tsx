import React from 'react';
import './App.css';
import * as Rx from 'rxjs'
import { map } from 'rxjs/operators'
import { DecisionPoint, iterateUntilDecision, executeChoice } from './game/game'
import { isMultiselectDecision } from './game/game-util';
import { GameUI } from './GameUI';
import { initialiseGame, getInitialStep } from './game/game-init';
import { State } from './game/game-types';

type UIState = {
  oldState: State | undefined
  decisionPoint: DecisionPoint | undefined
  oldLog: string[]
}

class App extends React.Component<{}, UIState> {
  state: UIState  = {
    oldState: undefined,
    decisionPoint: undefined,
    oldLog: [],
  }

  choiceSink: Rx.Subject<string>

  constructor(props: {}) {
    super(props)
    this.choiceSink = new Rx.Subject()
  }

  componentDidMount() {
    const initialState = initialiseGame('Player1', 'Computer')
    const [initialStep, initialLog] = getInitialStep(initialState)
    const firstDecisionPoint = iterateUntilDecision(initialState, initialStep, initialLog)
    const firstDecision = firstDecisionPoint.decision
    const log = firstDecisionPoint.log
    const firstDecisionState = firstDecisionPoint.state

    const initialStream = Rx.from([{
      decision: firstDecision,
      log,
      state: firstDecisionState
    }])

    const decisionStream: Rx.Observable<DecisionPoint> = Rx.merge(
      this.choiceSink.asObservable().pipe(
        map(choice => executeChoice(choice, this.state.decisionPoint!))
      ),
      initialStream
    )
    
    decisionStream.subscribe(({ decision, log, state }) => {
      this.setState((uiState) => {
        const oldLog = uiState.oldLog.concat(
          uiState.decisionPoint
            ? uiState.decisionPoint.log
            : []
        )

        if (state.debug) {
          (window as any).domppadebug = state
        }

        console.log('NEW APP UI STATE', state.turn)

        const MAXLOG = 7
        return {
          oldState: uiState.decisionPoint
            ? uiState.decisionPoint.state
            : undefined,
          decisionPoint: {
            decision,
            state,
            log
          },
          oldLog: (oldLog.length > MAXLOG)
            ? oldLog.slice(oldLog.length - MAXLOG, oldLog.length)
            : oldLog
        }
      })
    })
  }

  onChoice = (choice: string) => {
    const decision = this.state.decisionPoint!.decision
    if (isMultiselectDecision(decision)) {
      this.choiceSink.next(choice)
    } else {
      throw new Error('oops')
    }
  }

  render() {
    const dp = this.state.decisionPoint
    if (!dp) {
      return (
        <div className="App">
          <h1>loading game</h1>
        </div>
      )
    }

    const { oldState } = this.state
    const { state, log, decision } = dp
    const callbacks = {
      onChoice: this.onChoice
    }
    return (
      <div className="App">
        <GameUI
          state={state}
          oldState={oldState}
          decision={decision}
          oldLog={this.state.oldLog}
          log={log}
          callbacks={callbacks}
        />
      </div>
    )
  }
}

export default App;