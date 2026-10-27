import React, { useState } from "react";
import { Difficulty } from "../App";
import { Trophy, Play, Settings2 } from "lucide-react";
import { motion } from "motion/react";

interface HomeProps {
  onStart: (diff: Difficulty) => void;
  onViewScores: () => void;
}

const difficulties: { label: string; value: Difficulty }[] = [
  { label: "쉬움", value: "easy" },
  { label: "보통", value: "medium" },
  { label: "어려움", value: "hard" },
  { label: "전문가", value: "expert" },
];

export function Home({ onStart, onViewScores }: HomeProps) {
  const [showDifficulty, setShowDifficulty] = useState(false);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-5xl font-bold tracking-tighter text-foreground">스도쿠</h1>
        <p className="text-muted-foreground font-medium text-sm">빈칸에 1~9를 채워 행·열·3×3 구역을 완성하세요</p>
      </motion.div>

      {!showDifficulty ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full space-y-4"
        >
          <button
            onClick={() => setShowDifficulty(true)}
            className="w-full flex items-center justify-center gap-3 py-4 bg-foreground text-background rounded-2xl font-bold text-lg hover:opacity-90 transition-all active:scale-95 "
          >
            <Play size={20} fill="currentColor" />
            새 게임 시작
          </button>
          <button
            onClick={onViewScores}
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-border rounded-2xl font-bold text-lg hover:bg-secondary transition-all active:scale-95"
          >
            <Trophy size={20} className="text-amber-500" />
            최고 기록
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full space-y-3"
        >
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Settings2 size={18} />
            <span className="font-semibold uppercase text-xs tracking-wider">난이도 선택</span>
          </div>
          {difficulties.map((diff) => (
            <button
              key={diff.value}
              onClick={() => onStart(diff.value)}
              className="w-full py-4 px-6 border-2 border-border rounded-xl font-bold text-left hover:border-foreground/50 hover:bg-secondary transition-all active:scale-98 flex justify-between items-center group"
            >
              <span>{diff.label}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </button>
          ))}
          <button
            onClick={() => setShowDifficulty(false)}
            className="w-full py-3 text-muted-foreground font-medium hover:text-foreground transition-colors mt-2"
          >
            뒤로가기
          </button>
        </motion.div>
      )}

    </div>
  );
}
