// Import react
import React, { Component } from 'react'
import ReactDOM from 'react-dom'

// Import sounds
import am2 from './am2.mp3'
import bm2 from './bm2.mp3'
import dm2 from './dm2.mp3'
import em2 from './em2.mp3'

/**
 * Houses row => sound mapping
 */
const sounds = {
  1: dm2,
  2: em2,
  3: am2,
  4: bm2
}

/**
 * Builds state based on height x width
 */
const buildMatrixState = (rowCount, rowLength) => {
  const totalSquares = rowCount * rowLength
  const matrixState = {}

  // Calculate details for each square
  for (let key = 1; key <= totalSquares; key++) {
    // Calculate beat and row details
    const calcBeat = key % rowLength
    const calcRow = Math.floor(key / rowLength)
    const row = (calcBeat === 0 ? calcRow : calcRow + 1)

    // Build the squareDetails
    const squareDetails = {
      active: false,
      beat: (calcBeat === 0 ? 1 : (rowLength - calcBeat) + 1),
      sound: new Audio(sounds[row])
    }

    // Add the square to the matrixState object
    matrixState[key] = squareDetails
  }

  return matrixState
}

/**
 * Stateless component for rendering
 * SoundSquares
 */
const SoundSquare = props => {
  // Set class/sizing
  let sqrClass = 'btn btn-secondary'
  let sqrStyle = {
    width: '25px',
    height: '25px',
    margin: '2px'
  }

  // Adjust the color as needed
  if (props.active) {
    sqrClass = 'btn btn-info'
  } else if (props.current) {
    sqrClass = 'btn btn-warning'
  }

  // Check if a sound should play
  if (props.active && props.current) props.sound.play()

  // Return the stylized div
  return (
    <div 
      className={sqrClass} 
      style={sqrStyle}
      id={props.key}
      beat={props.beat}
      key={props.key}
      onClick={props.handleClick}
    />
  )
}

/**
 * Main component for the sound matrix
 */
class SoundMatrix extends Component {
  constructor(props) {
    super(props)
    const initialRowCount = 4
    const initialRowLength = 8
    this.loop = null
    this.state = {
      rowCount: initialRowCount,
      rowLength: initialRowLength,
      beat: 0,
      playing: false,
      speed: 175,
      matrix: buildMatrixState(initialRowCount, initialRowLength)
    }
    this.handleClick = this.handleClick.bind(this)
    this.togglePlaying = this.togglePlaying.bind(this)
  }

  /**
   * Handle SoundSquare clicks
   * to adjust active state
   */
  handleClick(e) {
    // Find the matrix and square id
    const matrix = this.state.matrix
    const id = e.target.id

    // Update the square state
    matrix[id].active = !matrix[id].active
    this.setState({ matrix })
  }

  /**
   * Handles the click of the play
   * button. When enabled, an
   * interval is created to
   * continually increment beat
   */
  togglePlaying() {
    // Toggle the playing state
    const playing = !this.state.playing
    this.setState({ playing })
    
    if (playing) {
      // Set an interval that loops the beat
      this.loop = setInterval(() => {
        // Restart the beat if we reach rowLength
        if (this.state.beat >= this.state.rowLength) {
          this.setState({ beat: 1 })
        } else {
          // Increment the beat
          const newBeat = this.state.beat + 1
          this.setState({ beat: newBeat })
        }
      // Set interval speed
      }, this.state.speed)

    } else {
      // Clear loop and reset beat
      clearInterval(this.loop)
      this.setState({ beat: 0 })
    }
  }

  /**
   * Recursive function to build rows 
   * based on provided count
   */
  rowBuilder(rowCount, rowLength, rows = []) {
    if (rowCount > 0) {
      // Find the largest squareKey
      const squareKey = rowCount * rowLength

      // Add a row of squares
      rows.push(this.squareBuilder(squareKey, rowCount, rowLength))

      // Loop the rowBuilder by rowCount
      return this.rowBuilder(rowCount - 1, rowLength, rows)
    }

    // Return all the rows
    return rows
  }

  /**
   * Recursive function to build squares
   * based on provided count
   */
  squareBuilder(squareKey, rowCount, rowLength, row = []) {
    if (rowLength > 0) {
      // Find the square by key
      const square = this.state.matrix[squareKey]

      // Add a new square to the row
      row.push(SoundSquare({
        key: squareKey,
        active: square.active,
        handleClick: this.handleClick,
        beat: square.beat,
        current: (square.beat === this.state.beat ? true : false),
        sound: square.sound
      }))

      // Loop the squareBuidler by rowLength
      return this.squareBuilder(squareKey - 1, rowCount, rowLength - 1, row)
    }

    // Return the row with a unique row key
    return (<div key={'row-' + rowCount}>{row}</div>)
  }

  /**
   * Builds the visual output
   */
  render() {
    return (
      <div className="text-center mt-5">
        <button
          className="btn btn-primary my-2"
          onClick={this.togglePlaying}
        >
          {this.state.playing ? 'Stop Playing' : 'Start Playing'}
        </button>
        {this.rowBuilder(this.state.rowCount, this.state.rowLength)}
      </div>
    )
  }
}

// Renders the SoundMatrix component on the id, root.
ReactDOM.render(<SoundMatrix />, document.getElementById('root'));