import React, { useState } from "react";

const Square = ({
  id,
  gameState,
  setGameState,
  currentPlayer,
  setCurrentPlayer,
  finishedState,
  startGame,
  socket,
  currentElement,
  playingAs,
}) => {
  const [icon, setIcon] = useState(null);

  const clickOnSquare = () => {
    if (finishedState || !startGame || currentPlayer !== playingAs) {
      return;
    }

    if (!icon) {
      if (currentPlayer === "firstCoin") {
        setIcon(FirstCoin);
      } else {
        setIcon(SecondCoin);
      }

      socket.emit("playerMoveFromClient", {
        state: {
          id,
          sign: currentPlayer,
        },
      });

      setCurrentPlayer(
        currentPlayer === "firstCoin" ? "secondCoin" : "firstCoin"
      );

      setGameState((prevState) => {
        const newState = [...prevState];
        const rowIndex = Math.floor(id / 8);
        const colIndex = id % 8;
        newState[rowIndex][colIndex] = currentPlayer;

        return newState;
      });
    }
  };

  return (
    <div
      onClick={clickOnSquare}
      className={`square ${
        (currentPlayer !== playingAs) && "cursor-not-allowed"
      } w-10 h-10 bg-transparent border border-gridborder border-opacity-15 cursor-pointer flex justify-center items-center`}
    >
      {currentElement === "firstCoin" ? (
        <FirstCoin />
      ) : currentElement === "secondCoin" ? (
        <SecondCoin />
      ) : (
        icon
      )}
    </div>
  );
};

const FirstCoin = () => {
  return <div className="firstcoin bg-firstcoin rounded-full w-8 h-8"></div>;
};

const SecondCoin = () => {
  return <div className="firstcoin bg-secondcoin rounded-full w-8 h-8"></div>;
};

export default Square;
