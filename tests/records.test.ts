import test from 'node:test';import assert from 'node:assert/strict';
import {getHighScores,getBestTime,saveScore} from '../src/app/lib/utils.ts';

test('records reject malformed, negative and invalid-date rows and select actual minimum',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');let raw='';
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>raw,setItem:(_:string,value:string)=>{raw=value;}}});
 try{
  for(const malformed of ['null','{}','not-json']){raw=malformed;assert.deepEqual(getHighScores(),[]);}
  raw=JSON.stringify([{difficulty:'easy',time:90,date:'2026-01-01T00:00:00Z'},{difficulty:'easy',time:30,date:'2026-01-02T00:00:00Z'},{difficulty:'hard',time:-1,date:'bad'}]);
  assert.equal(getBestTime('easy'),30);assert.equal(getHighScores().length,2);
  saveScore('easy',-2);assert.equal(getHighScores().length,2);
 }finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else Reflect.deleteProperty(globalThis,'localStorage');}
});

test('storage denial is nonfatal for score read/write',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');Object.defineProperty(globalThis,'localStorage',{configurable:true,get:()=>{throw Error('denied')}});
 try{assert.deepEqual(getHighScores(),[]);assert.doesNotThrow(()=>saveScore('easy',20));}
 finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else Reflect.deleteProperty(globalThis,'localStorage');}
});

test('corrupt or read-denied data is preserved even when writes would succeed',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 try{for(const raw of ['null','bad-json','[{"difficulty":"easy","time":-1,"date":"bad"}]','read-denied']){
  let writes=0;
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:()=>{if(raw==='read-denied')throw Error('read denied');return raw;},setItem:()=>{writes++;}}});
  const saved=saveScore('easy',10);assert.equal(writes,0);assert.equal(saved,false);
 }}finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else Reflect.deleteProperty(globalThis,'localStorage');}
});
