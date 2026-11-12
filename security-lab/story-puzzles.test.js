'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const puzzles=require('../story-interior-puzzles.js');
const routes={beta:[0,1,5,6,10,14,15],alfa:[0,4,8,9,5,6,7,11,15],gamma:[0,1,2,6,5,9,10,11,15]};
const direction=(a,b)=>b===a+1?2:b===a-1?8:b===a+4?4:1;
function connect(board,path){path.forEach((cell,i)=>{board.tiles[cell].mask=(i?direction(cell,path[i-1]):8)|(i===path.length-1?2:direction(cell,path[i+1]))})}
for(const [id,path] of Object.entries(routes)){
  test(`${id}: a scrambled board requires repair and can carry current through every fuse`,()=>{
    const board=puzzles.createCircuit(id);assert.equal(puzzles.inspectCircuit(board).solved,false);
    connect(board,path);const state=puzzles.inspectCircuit(board);assert.equal(state.solved,true);assert.equal(state.checked,state.total);assert.deepEqual(state.leaks,[]);
    board.tiles[path[2]].mask=puzzles.rotate(board.tiles[path[2]].mask);assert.equal(puzzles.inspectCircuit(board).solved,false,'a broken in-path connection must not complete the relay');
  });
}
test('a source-to-exit shortcut cannot skip the safety fuse',()=>{
  const board=puzzles.createCircuit('beta');connect(board,[0,1,2,3,7,11,15]);
  const state=puzzles.inspectCircuit(board);assert.equal(state.reached,true);assert.equal(state.checked,0);assert.equal(state.solved,false);
});
test('an energized unconnected branch is a leak even when the exit is powered',()=>{
  const board=puzzles.createCircuit('beta');connect(board,routes.beta);board.tiles[1].mask|=1;
  assert.equal(puzzles.inspectCircuit(board).reached,true);assert.equal(puzzles.inspectCircuit(board).solved,false);
});
test('clockwise rotation wraps all four directions without losing ports',()=>{assert.equal(puzzles.rotate(1),2);assert.equal(puzzles.rotate(8),1);assert.equal(puzzles.rotate(6,4),6)});
test('chronology needs both the ordered timeline and the matching contradictory pair',()=>{
  const board=puzzles.createChronology();assert.equal(puzzles.inspectChronology(board).solved,false);
  board.selected=['signature','order'];assert.equal(puzzles.inspectChronology(board).solved,false);
  board.order=['signature','closure','awakening','order'];assert.equal(puzzles.inspectChronology(board).solved,true);
  board.selected=['closure','awakening'];assert.equal(puzzles.inspectChronology(board).solved,false);
  board.order=['signature','signature','awakening','order'];assert.equal(puzzles.inspectChronology(board).sorted,false);
});
