import React, { useState, useEffect } from "react";
import { Home } from "./components/Home";
import { Game } from "./components/Game";
import { HighScores } from "./components/HighScores";
import { Toaster } from "sonner";

export type Screen = "home" | "game" | "scores";
export type Difficulty = "easy" | "medium" | "hard" | "expert" | "master";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setScreen("game");
  };

  const goHome = () => setScreen("home");
  const viewScores = () => setScreen("scores");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <main className="max-w-md mx-auto min-h-screen flex flex-col">
        {screen === "home" && (
          <Home onStart={startGame} onViewScores={viewScores} />
        )}
        {screen === "game" && (
          <Game difficulty={difficulty} onBack={goHome} />
        )}
        {screen === "scores" && (
          <HighScores onBack={goHome} />
        )}
      </main>
      <Toaster position="top-center" style={{transition: "none"}} />
    </div>
  );
}
