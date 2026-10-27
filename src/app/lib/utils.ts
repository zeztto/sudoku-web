export type Difficulty='easy'|'medium'|'hard'|'expert'|'master';
export interface Score {difficulty:Difficulty;time:number;date:string;}
const isDifficulty=(value:unknown):value is Difficulty=>['easy','medium','hard','expert','master'].includes(value as string);
function isScore(item:unknown):item is Score {
 if(!item||typeof item!=='object')return false;
 const row=item as Record<string,unknown>;
 return isDifficulty(row.difficulty)&&typeof row.time==='number'&&Number.isInteger(row.time)&&row.time>=0&&typeof row.date==='string'&&Number.isFinite(Date.parse(row.date));
}
export function readScores():{scores:Score[];writable:boolean} {
 try{
  const raw=localStorage.getItem('sudoku_high_scores');
  if(raw===null)return {scores:[],writable:true};
  const value:unknown=JSON.parse(raw);
  if(!Array.isArray(value))return {scores:[],writable:false};
  return {scores:value.filter(isScore),writable:value.every(isScore)};
 }catch{return {scores:[],writable:false};}
}
export const formatTime=(seconds:number):string=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;
export const getHighScores=():Score[]=>readScores().scores;
export function saveScore(difficulty:Difficulty,time:number):boolean {
 if(!isDifficulty(difficulty)||!Number.isInteger(time)||time<0)return false;
 const previous=readScores();if(!previous.writable)return false;
 const next=[...previous.scores,{difficulty,time,date:new Date().toISOString()}].sort((a,b)=>a.time-b.time);
 try{localStorage.setItem('sudoku_high_scores',JSON.stringify(next));return true;}catch{return false;}
}
export function getBestTime(difficulty:Difficulty):number|null {
 const times=getHighScores().filter(score=>score.difficulty===difficulty).map(score=>score.time);
 return times.length?Math.min(...times):null;
}
export function clearScores():boolean {
 if(!readScores().writable)return false;
 try{localStorage.removeItem('sudoku_high_scores');return true;}catch{return false;}
}
