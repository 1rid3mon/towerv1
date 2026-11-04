'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.join(__dirname,'..'), window = {};
vm.runInNewContext(fs.readFileSync(path.join(root,'station-navigation-v16.js'),'utf8'),{window});
const findPath = window.TowerStationNavigationV16.findPath;
const grid = ['##########','#B...H...#','#..##....#','#Q......L#','#....##..#','#A....O..#','##########'];
const start = {x:1,y:1}, end={x:8,y:5};
let pathResult = findPath(grid,start,end,(ch)=>!/[BHQ LAO]/.test(ch)); // no door transit
assert.ok(Array.isArray(pathResult) && pathResult.length > 0);
let previous=start;
for(const pos of pathResult) {
 assert.equal(Math.abs(previous.x-pos.x)+Math.abs(previous.y-pos.y),1,'steps must be adjacent');
 assert.notEqual(grid[pos.y][pos.x],'#','route may not cross walls');
 assert.equal(grid[pos.y][pos.x],'.','route may not enter unrelated doors');
 previous=pos;
}
assert.deepEqual([previous.x,previous.y],[end.x,end.y]);
assert.equal(findPath(grid,start,start).length,0);
assert.equal(findPath(grid,start,{x:0,y:0}),null);
assert.equal(findPath(grid,start,{x:20,y:20}),null);
assert.equal(findPath(grid,start,{x:5.5,y:1}),null);
assert.equal(findPath(grid,start,{x:5,y:1},()=>false),null,'locked door is unreachable');
pathResult=findPath(grid,start,{x:5,y:1},(ch,x,y)=>ch==='.'||(x===5&&y===1));
assert.ok(pathResult&&pathResult.length>0,'unlocked target door is reachable');
assert.deepEqual([pathResult.at(-1).x,pathResult.at(-1).y],[5,1]);
assert.equal(findPath(['..','##'],{x:0,y:0},{x:0,y:1}),null);
assert.equal(findPath(['#'],{x:0,y:0},{x:0,y:0}),null);
assert.equal(findPath(Array(65).fill('..'),{x:0,y:0},{x:1,y:0}),null);
const source=fs.readFileSync(path.join(root,'station-director-v14.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(html.indexOf('station-navigation-v16.js') < html.indexOf('station-director-v14.js'));
assert.match(source,/function navigateTo\(x,y\)/);
assert.match(source,/cancelRoute\(\);isOpen=false/);
assert.match(source,/navigateTo\(v\[0\],v\[1\]\)/);
assert.match(source,/data-v14-tile/);
console.log('PASS V16 bounded corridor routing, locked rooms, tap controls, keyboard override and safe teardown');
