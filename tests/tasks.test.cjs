'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
test('task lifecycle, validation, recurrence and bounded escalation',async()=>{
 const {seed,addTask,complete,remind}=await import('../public/tasks.mjs');
 const initial=seed();const tasks=addTask(initial,{text:'Fictional daily review',importance:4,recurring:'daily',dueAt:1000},'new');
 assert.equal(initial.length,3);assert.equal(tasks.length,4);
 const finished=complete(tasks,'new','next');assert.equal(finished.length,5);assert.equal(finished.at(-1).dueAt,86401000);
 assert.deepEqual(complete(finished,'new','duplicate'),finished);
 assert.throws(()=>addTask(tasks,{text:' ',importance:3,recurring:'none',dueAt:null},'bad'));
 assert.throws(()=>addTask(tasks,{text:'a',importance:9,recurring:'none',dueAt:null},'bad'));
 let task=tasks[0];for(let i=0;i<10;i++)task=remind(task).task;assert.equal(task.reminders,4);
 assert.equal(remind({...task,done:true}).task.reminders,4);
});
