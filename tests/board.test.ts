import test from 'node:test';import assert from 'node:assert/strict';import {getSudoku} from 'sudoku-gen';
import {createBoard,enterNumber,eraseCell,hintCell,isComplete,cellLabel} from '../src/app/lib/sudoku.ts';
const solution='534678912672195348198342567859761423426853791713924856961537284287419635345286179';
const puzzle='-'+solution.slice(1);
test('actual library generates valid boards and matching solutions for all four distinct levels',()=>{
 for(const difficulty of ['easy','medium','hard','expert'] as const){const generated=getSudoku(difficulty);const board=createBoard(generated.puzzle,generated.solution);assert.equal(board.length,9);assert.ok(board.flat().some(c=>c.value===null));assert.ok(board.flat().filter(c=>c.initial).every(c=>c.value===c.solution));}
});
test('invalid board/solution cannot enter game state',()=>{
 assert.throws(()=>createBoard('bad',solution));assert.throws(()=>createBoard(puzzle,'1'.repeat(81)));assert.throws(()=>createBoard('1'+solution.slice(1),solution));
});
test('notes/input/erase/hint preserve prior board and initial clues',()=>{
 const original=createBoard(puzzle,solution);const note=enterNumber(original,[0,0],5,'note').board;
 assert.deepEqual(original[0][0].notes,[]);assert.deepEqual(note[0][0].notes,[5]);
 const unnote=enterNumber(note,[0,0],5,'note').board;assert.deepEqual(unnote[0][0].notes,[]);
 const wrong=enterNumber(original,[0,0],1,'input');assert.equal(wrong.mistake,true);assert.equal(wrong.board,original);
 const input=enterNumber(note,[0,0],5,'input').board;assert.equal(original[0][0].value,null);assert.equal(input[0][0].value,5);assert.deepEqual(input[0][0].notes,[]);assert.equal(isComplete(input),true);
 const erased=eraseCell(input,[0,0]);assert.equal(erased[0][0].value,null);assert.equal(input[0][0].value,5);
 assert.equal(enterNumber(original,[0,1],2,'input').board,original);
 const hinted=hintCell(note,[0,0]);assert.equal(hinted[0][0].initial,true);assert.deepEqual(hinted[0][0].notes,[]);assert.equal(isComplete(hinted),true);assert.equal(eraseCell(hinted,[0,0]),hinted);
});

test('cell accessible name includes visible notes while preserving fixed/input labels',()=>{
 const board=createBoard(puzzle,solution);const noted=enterNumber(board,[0,0],1,'note').board;
 assert.match(cellLabel(noted[0][0],[0,0]),/1행 1열, 빈칸, 메모 1/);
 const fixed=cellLabel(board[0][1],[0,1]);assert.match(fixed,/고정 3/);assert.doesNotMatch(fixed,/메모/);
 const input=enterNumber(board,[0,0],5,'input').board;assert.match(cellLabel(input[0][0],[0,0]),/입력 5/);
});
