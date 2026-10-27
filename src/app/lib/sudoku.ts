export interface Cell { value:number|null; initial:boolean; notes:number[]; solution:number; }
export type Board=Cell[][];
export type Position=[number,number];
export function createBoard(puzzle:string,solution:string):Board {
 if(!/^[1-9-]{81}$/.test(puzzle)||!/^[1-9]{81}$/.test(solution))throw Error('잘못된 퍼즐 형식입니다.');
 const values=solution.split('').map(Number);
 for(let i=0;i<9;i++){
  const row=values.slice(i*9,i*9+9),col=values.filter((_,index)=>index%9===i);
  const box=Array.from({length:9},(_,j)=>values[(Math.floor(i/3)*3+Math.floor(j/3))*9+(i%3)*3+j%3]);
  if([row,col,box].some(unit=>new Set(unit).size!==9))throw Error('잘못된 정답입니다.');
 }
 return Array.from({length:9},(_,r)=>Array.from({length:9},(_,c)=>{
  const i=r*9+c;if(puzzle[i]!=='-'&&Number(puzzle[i])!==values[i])throw Error('주어진 숫자와 정답이 다릅니다.');
  return {value:puzzle[i]==='-'?null:Number(puzzle[i]),initial:puzzle[i]!=='-',notes:[],solution:values[i]};
 }));
}
function updateCell(board:Board,[r,c]:Position,patch:Partial<Cell>):Board {
 return board.map((row,ri)=>ri===r?row.map((cell,ci)=>ci===c?{...cell,...patch}:cell):row);
}
export function isComplete(board:Board):boolean {return board.length===9&&board.every(row=>row.length===9&&row.every(cell=>cell.value===cell.solution));}
export function enterNumber(board:Board,pos:Position,num:number,mode:'input'|'note'):{board:Board;mistake:boolean} {
 const cell=board[pos[0]]?.[pos[1]];
 if(!cell||cell.initial||!Number.isInteger(num)||num<1||num>9)return {board,mistake:false};
 if(mode==='note'){
  if(cell.value!==null)return {board,mistake:false};
  const notes=cell.notes.includes(num)?cell.notes.filter(n=>n!==num):[...cell.notes,num].sort((a,b)=>a-b);
  return {board:updateCell(board,pos,{notes}),mistake:false};
 }
 if(cell.value===num)return {board:updateCell(board,pos,{value:null}),mistake:false};
 if(num!==cell.solution)return {board,mistake:true};
 return {board:updateCell(board,pos,{value:num,notes:[]}),mistake:false};
}
export function eraseCell(board:Board,pos:Position):Board {
 const cell=board[pos[0]]?.[pos[1]];return !cell||cell.initial?board:updateCell(board,pos,{value:null,notes:[]});
}
export function hintCell(board:Board,pos:Position):Board {
 const cell=board[pos[0]]?.[pos[1]];return !cell||cell.value===cell.solution?board:updateCell(board,pos,{value:cell.solution,initial:true,notes:[]});
}

export function cellLabel(cell:Cell,[row,col]:Position):string {
 const content=cell.value===null ? `빈칸${cell.notes.length ? `, 메모 ${cell.notes.join(', ')}` : ''}` : `${cell.initial?'고정':'입력'} ${cell.value}`;
 return `${row+1}행 ${col+1}열, ${content}`;
}
