import React, { useState, useEffect, useCallback, useRef } from "react";
import { getSudoku } from "sudoku-gen";
import { Difficulty } from "../App";
import { ChevronLeft, RotateCcw, Lightbulb, Trophy, Clock, Play, Pause, Eraser } from "lucide-react";
import { formatTime, saveScore, getBestTime } from "../lib/utils";
import {createBoard,enterNumber,eraseCell,hintCell,isComplete,cellLabel,type Cell} from "../lib/sudoku";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface GameProps {
  difficulty: Difficulty;
  onBack: () => void;
}

export function Game({ difficulty, onBack }: GameProps) {
  const [gameId,setGameId] = useState(0);
  const [generationError,setGenerationError] = useState('');
  const savedGame = useRef(false);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [mode, setMode] = useState<"input" | "note">("input");

  const bestTime = getBestTime(difficulty);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getLibDifficulty = (diff: Difficulty) => {
    if (diff === "master") return "expert";
    return diff;
  };

  const initGame = useCallback(() => {
    try {
      const sudoku = getSudoku(getLibDifficulty(difficulty));
      setGrid(createBoard(sudoku.puzzle,sudoku.solution));
      setGenerationError('');
    } catch {
      setGrid([]);
      setGenerationError('퍼즐을 만들지 못했습니다. 다시 시작해 주세요.');
    }
    savedGame.current=false;
    setGameId(id=>id+1);
    setIsPaused(false);
    setMode('input');
    setTimer(0);
    setMistakes(0);
    setIsWon(false);
    setSelected(null);
  }, [difficulty]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (grid.length === 9 && !isWon && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isWon, isPaused, grid.length, gameId]);

  const finishIfComplete = (board:Cell[][]) => {
    if (!isComplete(board) || savedGame.current) return;
    savedGame.current=true;
    setIsWon(true);
    const saved=saveScore(difficulty,timer);
    if(saved)toast.success('스도쿠를 완성했습니다.');
    else toast.info('스도쿠를 완성했습니다. 브라우저에 기록을 저장하지 못했습니다.');
  };

  const handleInput = (num:number) => {
    if(!selected || isWon || isPaused)return;
    const result=enterNumber(grid,selected,num,mode);
    if(result.mistake){setMistakes(value=>value+1);toast.error('틀린 숫자입니다.',{duration:1500});return;}
    setGrid(result.board);
    if(mode==='input')finishIfComplete(result.board);
  };

  const handleErase = () => {
    if(!selected || isWon || isPaused)return;
    setGrid(eraseCell(grid,selected));
  };

  const handleHint = () => {
    if(!selected || isWon || isPaused)return;
    const next=hintCell(grid,selected);
    setGrid(next);
    finishIfComplete(next);
  };

  const handleSelect = (pos: [number, number]) => {
    if(isWon || isPaused)return;
    if (selected && selected[0] === pos[0] && selected[1] === pos[1]) {
      setSelected(null);
    } else {
      setSelected(pos);
    }
  };

  const handleInputRef = useRef(handleInput);
  const handleEraseRef = useRef(handleErase);

  useEffect(() => {
    handleInputRef.current = handleInput;
    handleEraseRef.current = handleErase;
  }, [handleInput, handleErase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWon || isPaused || !selected) return;

      if (e.key >= "1" && e.key <= "9") {
        handleInputRef.current(parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleEraseRef.current();
      } else if (e.key === "n" || e.key === "N") {
        setMode(prev => prev === "input" ? "note" : "input");
      } else if (e.key === "ArrowUp") {
        setSelected(prev => prev ? [Math.max(0, prev[0] - 1), prev[1]] : [0, 0]);
      } else if (e.key === "ArrowDown") {
        setSelected(prev => prev ? [Math.min(8, prev[0] + 1), prev[1]] : [0, 0]);
      } else if (e.key === "ArrowLeft") {
        setSelected(prev => prev ? [prev[0], Math.max(0, prev[1] - 1)] : [0, 0]);
      } else if (e.key === "ArrowRight") {
        setSelected(prev => prev ? [prev[0], Math.min(8, prev[1] + 1)] : [0, 0]);
      } else if (e.key === "Escape") {
        setSelected(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, isWon, isPaused, mode]); // Add mode to dependencies to ensure handleInput uses correct mode

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 select-none bg-white">
      <header className="flex items-center justify-between">
        <button aria-label="메인 화면으로" onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
          <ChevronLeft size={24} className="text-slate-600" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{{easy:'쉬움',medium:'보통',hard:'어려움',expert:'전문가',master:'전문가(이전 마스터)'}[difficulty]}</span>
          <div className="flex items-center gap-1.5 font-mono text-xl font-bold tabular-nums text-slate-800">
            <Clock size={16} className="text-slate-400" />
            {formatTime(timer)}
          </div>
        </div>
        <button aria-label="새 퍼즐로 다시 시작" onClick={() => { if(confirm("다시 시작하시겠습니까?")) initGame() }} className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-90">
          <RotateCcw size={20} className="text-slate-600" />
        </button>
      </header>

      <div className="flex justify-between text-[11px] font-bold px-1">
        <div className="flex gap-4">
          <span className="text-slate-400 uppercase tracking-wider">실수: <span className={mistakes > 2 ? "text-red-500" : "text-slate-800"}>{mistakes}회</span></span>
        </div>
        <div className="text-slate-400 uppercase tracking-wider">최고 기록: {bestTime !== null ? formatTime(bestTime) : "--:--"}</div>
      </div>

      {generationError && <p role="alert">{generationError}</p>}
      <div className="aspect-square w-full max-w-md mx-auto relative">
         <SudokuGrid 
            grid={grid} 
            selected={selected} 
            onSelect={handleSelect} 
            isWon={isWon || isPaused}
         />
         {isWon && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl z-20 border-2 border-slate-200 "
           >
             <Trophy size={80} className="text-yellow-500 mb-4" />
             <h2 className="text-4xl font-bold mb-1 text-slate-900">완료</h2>
             <p className="text-slate-500 font-mono text-2xl mb-8">{formatTime(timer)}</p>
             <button 
                onClick={onBack}
                className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
             >
                메인 화면으로
             </button>
           </motion.div>
         )}
      </div>

      <div className="flex-1 flex flex-col justify-end space-y-6 max-w-md mx-auto w-full pb-4">
        {/* Actions */}
        <div className="grid grid-cols-4 gap-4">
          <button 
            disabled={isWon || isPaused}
            onClick={handleErase}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-14 h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center group-active:scale-90 transition-all group-hover:bg-slate-50 text-slate-600">
              <Eraser size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">지우기</span>
          </button>
          <button 
            disabled={isWon || isPaused}
            onClick={() => setMode(mode === "input" ? "note" : "input")}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center group-active:scale-90 transition-all ${mode === "note" ? "bg-slate-900 text-white border-slate-900 shadow-inner" : "border-slate-100 group-hover:bg-slate-50 text-slate-600"}`}>
              <span className="text-xl font-bold">1/2</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">{mode === "note" ? "메모 켬" : "메모 끔"}</span>
          </button>
          <button 
            disabled={isWon || isPaused}
            onClick={handleHint}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-14 h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center group-active:scale-90 transition-all group-hover:bg-slate-50 text-slate-600">
              <Lightbulb size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">힌트</span>
          </button>
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="w-14 h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center group-active:scale-90 transition-all group-hover:bg-slate-50 text-slate-600">
              {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">{isPaused ? "계속하기" : "일시정지"}</span>
          </button>
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-9 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              disabled={isWon || isPaused}
              onClick={() => handleInput(num)}
              className="aspect-[3/4] flex items-center justify-center bg-slate-100 rounded-xl text-2xl font-bold text-slate-800 hover:bg-slate-900 hover:text-white transition-all active:scale-90 shadow-sm"
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isPaused && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 z-50 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="mb-12">
                <Pause size={64} className="mx-auto text-slate-300 mb-4 opacity-50" />
                <h2 className="text-5xl font-bold tracking-tighter text-slate-900">일시정지</h2>
                <p className="text-slate-500 font-medium mt-2">{formatTime(timer)} 경과됨</p>
            </div>
            <div className="w-full max-w-xs space-y-4">
                <button 
                onClick={() => setIsPaused(false)}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-bold text-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                <Play size={24} fill="currentColor" />
                계속하기
                </button>
                <button 
                onClick={onBack}
                className="w-full py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors"
                >
                메인 화면으로
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SudokuGridProps {
  grid: Cell[][];
  selected: [number, number] | null;
  onSelect: (pos: [number, number]) => void;
  isWon: boolean;
}

function SudokuGrid({ grid, selected, onSelect, isWon }: SudokuGridProps) {
  if (grid.length === 0) return <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse" />;

  const [selR, selC] = selected || [-1, -1];
  const selectedCell = selected ? grid[selR][selC] : null;

  return (
    <div className="w-full h-full grid grid-cols-9 border-2 border-slate-900 rounded-xl overflow-hidden bg-slate-900 gap-[1px] shadow-xl">
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isSelected = selR === r && selC === c;
          const isRelated = selR === r || selC === c || (Math.floor(selR / 3) === Math.floor(r / 3) && Math.floor(selC / 3) === Math.floor(c / 3));
          const isSameValue = selectedCell?.value !== null && cell.value === selectedCell?.value;
          
          let bgColor = "bg-white";
          // Fix: Selection color should be light and not hide the text
          if (isSelected) bgColor = "bg-blue-100"; 
          else if (isSameValue) bgColor = "bg-blue-50";
          else if (isRelated) bgColor = "bg-slate-50";

          const borderRight = (c + 1) % 3 === 0 && c !== 8 ? "border-r-[1.5px] border-r-slate-900/20" : "";
          const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? "border-b-[1.5px] border-b-slate-900/20" : "";

          return (
            <button
              type="button"
              disabled={isWon}
              data-row={r}
              data-col={c}
              data-initial={cell.initial}
              aria-label={cellLabel(cell,[r,c])}
              aria-pressed={isSelected}
              key={`${r}-${c}`}
              onClick={() => onSelect([r, c])}
              className={`relative aspect-square flex items-center justify-center cursor-pointer transition-colors ${bgColor} ${borderRight} ${borderBottom} group`}
            >
              {cell.value ? (
                <span className={`text-2xl sm:text-3xl font-bold ${cell.initial ? "text-slate-900" : "text-blue-600"} ${isWon ? "!text-green-600" : ""} tabular-nums`}>
                  {cell.value}
                </span>
              ) : (
                <div className="grid grid-cols-3 w-full h-full p-1 pointer-events-none opacity-80">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div key={n} className="flex items-center justify-center text-[9px] sm:text-[11px] font-bold leading-none text-slate-400">
                      {cell.notes.includes(n) ? n : ""}
                    </div>
                  ))}
                </div>
              )}
              {/* Highlight 3x3 boundaries more clearly */}
              {(c + 1) % 3 === 0 && c !== 8 && <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-slate-900/20" />}
              {(r + 1) % 3 === 0 && r !== 8 && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-900/20" />}
            </button>
          );
        })
      )}
    </div>
  );
}
