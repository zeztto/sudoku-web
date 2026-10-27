import React from "react";
import { ChevronLeft, Trophy, Calendar } from "lucide-react";
import { readScores, formatTime, Difficulty, clearScores } from "../lib/utils";
import {toast} from "sonner";
import { motion } from "motion/react";

interface HighScoresProps {
  onBack: () => void;
}

const difficultyLabels: Record<Difficulty, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
  expert: "전문가",
  master: "마스터(이전 전문가 기록)",
};

export function HighScores({ onBack }: HighScoresProps) {
  const {scores,writable} = readScores();

  return (
    <div className="flex-1 flex flex-col p-6">
      <header className="flex items-center justify-between mb-8">
        <button 
          aria-label="메인 화면으로"
          onClick={onBack}
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">최고 기록</h2>
        <div className="w-10" />
      </header>

      {!writable && <p role="status" className="text-sm mb-4">저장된 기록을 읽지 못했습니다. 원본 데이터는 변경하지 않습니다.</p>}
      <div className="flex-1 overflow-y-auto space-y-4">
        {Object.entries(difficultyLabels).map(([key, label]) => {
          const diffScores = scores.filter(s => s.difficulty === key).sort((a, b) => a.time - b.time);
          const best = diffScores[0];

          return (
            <motion.div 
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 border border-border rounded-2xl bg-secondary/30"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-muted-foreground uppercase tracking-widest">{label}</span>
                {best && <Trophy size={16} className="text-amber-500" />}
              </div>
              {best ? (
                <div className="flex justify-between items-end">
                  <div className="text-3xl font-black tabular-nums">{formatTime(best.time)}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Calendar size={12} />
                    {new Date(best.date).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm italic">아직 기록이 없습니다</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {scores.length > 0 && (
        <button
          onClick={() => {
            if (confirm("모든 기록을 삭제할까요?")) {
              if(clearScores()) window.location.reload();
              else toast.error("브라우저 권한 때문에 기록을 삭제하지 못했습니다.");
            }
          }}
          className="mt-6 text-xs text-muted-foreground hover:text-destructive transition-colors text-center w-full"
        >
          기록 전체 초기화
        </button>
      )}
    </div>
  );
}
