import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { LandingPage } from './components/Lobby/LandingPage';
import { RoomLobby } from './components/Lobby/RoomLobby';
import { GameRoom } from './components/Game/GameRoom';

const MainScreen: React.FC = () => {
  const { roomId, gameState } = useGame();

  if (!roomId) {
    return <LandingPage />;
  }

  if (gameState?.phase === 'LOBBY') {
    return <RoomLobby />;
  }

  return <GameRoom />;
};

export const App: React.FC = () => {
  return (
    <GameProvider>
      <MainScreen />
    </GameProvider>
  );
};

export default App;
