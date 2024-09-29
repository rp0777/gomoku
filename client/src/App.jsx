import React, { useEffect, useState } from "react";
import Square from "./components/Square/Square";
import io from "socket.io-client";

const renderFrom5 = [
  [1, 2, 3, 4, 5, 6, 7, 8],
  [9, 10, 11, 12, 13, 14, 15, 16],
  [17, 18, 19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, 31, 32],
  [33, 34, 35, 36, 37, 38, 39, 40],
  [41, 42, 43, 44, 45, 46, 47, 48],
  [49, 50, 51, 52, 53, 54, 55, 56],
  [57, 58, 59, 60, 61, 62, 63, 64],
];

const App = () => {
  const [gameState, setGameState] = useState(renderFrom5);
  const [currentPlayer, setCurrentPlayer] = useState("firstCoin");
  const [finishedState, setFinishedState] = useState(false);
  const [startGame, setStartGame] = useState(false);
  const [socket, setSocket] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [loader, setLoader] = useState(false);
  const [playingAs, setPlayingAs] = useState(null);

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishedState(winner);
    }
  }, [gameState]);

  socket?.on("opponentLeftMatch", () => {
    setFinishedState("opponentLeftMatch");
  });

  socket?.on("playerMoveFromServer", (data) => {
    const id = data?.state?.id;
    setGameState((prevState) => {
      const newState = [...prevState];
      const rowIndex = Math.floor(id / 8);
      const colIndex = id % 8;
      newState[rowIndex][colIndex] = data?.state?.sign;

      return newState;
    });

    setCurrentPlayer(
      data.state.sign === "firstCoin" ? "secondCoin" : "firstCoin"
    );
  });

  socket?.on("connect", function () {
    setStartGame(true);
  });

  socket?.on("OpponentNotFound", function () {
    setOpponent(false);
  });

  socket?.on("OpponentFound", function (data) {
    setLoader(!loader);
    // setCurrentPlayer(
    //   data.opponent === "firstCoin" ? "secondCoin" : "firstCoin"
    // );
    setPlayingAs(data.playingAs);
    setOpponent(data.opponent);
  });

  function handleStartGame() {
    setLoader(!loader);
    const newSocket = io("http://localhost:3000", {
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      player: "firstCoin",
    });

    setStartGame(!startGame);
    setSocket(newSocket);
  }

  function checkWinner() {
    // Row dynamic for 5x5
    for (let row = 0; row < gameState.length; row++) {
      for (let i = 0; i <= gameState.length - 5; i++) {
        if (
          gameState[row][i + 0] === gameState[row][i + 1] &&
          gameState[row][i + 1] === gameState[row][i + 2] &&
          gameState[row][i + 2] === gameState[row][i + 3] &&
          gameState[row][i + 3] === gameState[row][i + 4]
        ) {
          return gameState[row][i + 0];
        }
      }
    }

    // Column dynamic for 5x5
    for (let col = 0; col < gameState.length; col++) {
      for (let i = 0; i <= gameState.length - 5; i++) {
        if (
          gameState[i + 0][col] === gameState[i + 1][col] &&
          gameState[i + 1][col] === gameState[i + 2][col] &&
          gameState[i + 2][col] === gameState[i + 3][col] &&
          gameState[i + 3][col] === gameState[i + 4][col]
        ) {
          return gameState[i + 0][col];
        }
      }
    }

    // Diagonal left to right (\) for 5x5
    for (let row = 0; row <= gameState.length - 5; row++) {
      for (let col = 0; col <= gameState.length - 5; col++) {
        if (
          gameState[row][col] === gameState[row + 1][col + 1] &&
          gameState[row + 1][col + 1] === gameState[row + 2][col + 2] &&
          gameState[row + 2][col + 2] === gameState[row + 3][col + 3] &&
          gameState[row + 3][col + 3] === gameState[row + 4][col + 4]
        ) {
          return gameState[row][col];
        }
      }
    }

    // Diagonal right to left (/) for 5x5
    for (let row = 0; row <= gameState.length - 5; row++) {
      for (let col = 4; col < gameState.length; col++) {
        if (
          gameState[row][col] === gameState[row + 1][col - 1] &&
          gameState[row + 1][col - 1] === gameState[row + 2][col - 2] &&
          gameState[row + 2][col - 2] === gameState[row + 3][col - 3] &&
          gameState[row + 3][col - 3] === gameState[row + 4][col - 4]
        ) {
          return gameState[row][col];
        }
      }
    }

    return null;
  }

  return (
    <div className="app py-[5vh] bg-background text-white flex flex-col justify-center items-center gap-4">
      <div
        className={`transition-all duration-500 ${
          finishedState || loader ? "blur-sm" : ""
        } h-[70%] flex flex-col justify-between items-center gap-4`}
      >
        <div className="heading px-2 rounded-md text-4xl">
          <h1>Play Gomoku</h1>
          <p className=" text-opacity-50 text-white text-center text-lg">
            mini app
          </p>
        </div>

        <div className="logo w-[80px] h-[80px]">
          <img src="/logo.png" alt="Logo" />
        </div>

        <div
          className={`square-wrapper grid grid-cols-8 shadow-[0px_0px_30px_0px_rgba(0,0,0,0.1),_0px_0px_30px_0px_rgba(45,78,255,0.15)] border border-gridborder border-opacity-40 ${
            !startGame && "cursor-not-allowed"
          }`}
        >
          {gameState.map((arr, rowIndex) =>
            arr.map((s, colIndex) => (
              <Square
                id={rowIndex * 8 + colIndex}
                key={rowIndex * 8 + colIndex}
                gameState={gameState}
                setGameState={setGameState}
                currentPlayer={currentPlayer}
                setCurrentPlayer={setCurrentPlayer}
                finishedState={finishedState}
                startGame={startGame}
                socket={socket}
                currentElement={s}
                playingAs={playingAs}
              />
            ))
          )}
        </div>

        <button
          className={`start ${startGame && "hidden"}`}
          onClick={handleStartGame}
        >
          TAP TO START
        </button>
      </div>

      {finishedState && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-60">
          {finishedState !== opponent ? (
            <>
              {finishedState === "opponentLeftMatch" && (
                <h3 className="text-3xl font-bold mb-4">Opponent Left the Match!</h3>
              )}
              <h3 className="text-3xl font-bold mb-4">You win the game</h3>

              <p className=" text-center">
                we sent prize to your wallet <br /> please check your wallet and
                have fun!
              </p>
            </>
          ) : (
            <>
              <h3 className="text-3xl font-bold mb-4">You Lose the game</h3>

              <p>Let's play again</p>
            </>
          )}
          <div
            onClick={() => window.location.reload()}
            className=" cursor-pointer absolute bottom-10"
          >
            TAP TO BACK HOME
          </div>
        </div>
      )}

      {loader && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-60">
          <h3 className="text-3xl font-bold mb-4">Matching...</h3>
        </div>
      )}
    </div>
  );
};

export default App;
