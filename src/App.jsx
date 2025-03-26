import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [breakLength, setBreakLength] = useState(5);
  const [sessionLength, setSessionLength] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);
  const [beepPlaying, setBeepPlaying] = useState(false);

  const timerRef = useRef(null);
  const beepRef = useRef(null);

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Handle break length changes
  const changeBreakLength = (amount) => {
    if (!timerRunning) {
      const newLength = breakLength + amount;
      if (newLength > 0 && newLength <= 60) {
        setBreakLength(newLength);
        if (!sessionActive) {
          setTimeLeft(newLength * 60);
        }
      }
    }
  };

  // Handle session length changes
  const changeSessionLength = (amount) => {
    if (!timerRunning) {
      const newLength = sessionLength + amount;
      if (newLength > 0 && newLength <= 60) {
        setSessionLength(newLength);
        if (sessionActive) {
          setTimeLeft(newLength * 60);
        }
      }
    }
  };

  // Start or pause the timer
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  // Reset everything
  const resetTimer = () => {
    setTimerRunning(false);
    setBreakLength(5);
    setSessionLength(25);
    setTimeLeft(25 * 60);
    setSessionActive(true);
    setBeepPlaying(false);
    if (beepRef.current) {
      beepRef.current.pause();
      beepRef.current.currentTime = 0;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            // Time's up - switch session/break
            setBeepPlaying(true);
            beepRef.current.play();

            if (sessionActive) {
              // Switch to break
              setSessionActive(false);
              return breakLength * 60;
            } else {
              // Switch to session
              setSessionActive(true);
              return sessionLength * 60;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, sessionActive, breakLength, sessionLength]);

  // Reset beep when it finishes playing
  useEffect(() => {
    if (beepPlaying) {
      const handleBeepEnd = () => setBeepPlaying(false);
      beepRef.current.addEventListener("ended", handleBeepEnd);
      return () => {
        if (beepRef.current) {
          beepRef.current.removeEventListener("ended", handleBeepEnd);
        }
      };
    }
  }, [beepPlaying]);

  return (
    <div className="App">
      <div id="timer-container">
        <h1>25 + 5 Clock</h1>

        <div id="length-controls">
          <div id="break-control">
            <div id="break-label">Break Length</div>
            <button id="break-decrement" onClick={() => changeBreakLength(-1)}>
              -
            </button>
            <span id="break-length">{breakLength}</span>
            <button id="break-increment" onClick={() => changeBreakLength(1)}>
              +
            </button>
          </div>

          <div id="session-control">
            <div id="session-label">Session Length</div>
            <button
              id="session-decrement"
              onClick={() => changeSessionLength(-1)}
            >
              -
            </button>
            <span id="session-length">{sessionLength}</span>
            <button
              id="session-increment"
              onClick={() => changeSessionLength(1)}
            >
              +
            </button>
          </div>
        </div>

        <div id="timer-display">
          <div id="timer-label">{sessionActive ? "Session" : "Break"}</div>
          <div id="time-left">{formatTime(timeLeft)}</div>
        </div>

        <div id="timer-buttons">
          <button id="start_stop" onClick={toggleTimer}>
            {timerRunning ? "Pause" : "Start"}
          </button>
          <button id="reset" onClick={resetTimer}>
            Reset
          </button>
        </div>

        <audio
          id="beep"
          ref={beepRef}
          src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
          preload="auto"
        />
      </div>
    </div>
  );
}

export default App;
