export function seed() {
 return [
  {id:'demo-1',text:'Review the fictional project brief',importance:5,dueAt:null,recurring:'none',done:false,reminders:0},
  {id:'demo-2',text:'Prepare a demo planning checklist',importance:3,dueAt:null,recurring:'daily',done:false,reminders:0},
  {id:'demo-3',text:'Take a short break',importance:2,dueAt:null,recurring:'none',done:true,reminders:0}
 ];
}
export function addTask(tasks,{text,importance,recurring,dueAt},id) {
 if(typeof text!=='string'||!text.trim()||text.length>200)throw Error('Use 1–200 characters.');
 if(!Number.isInteger(importance)||importance<1||importance>5)throw Error('Choose importance 1–5.');
 if(!['none','daily','weekly'].includes(recurring))throw Error('Invalid recurrence.');
 if(dueAt!==null&&(!Number.isFinite(dueAt)||dueAt<0))throw Error('Invalid due date.');
 if(tasks.length>=100)throw Error('This demo is limited to 100 tasks.');
 return [...tasks,{id,text:text.trim(),importance,recurring,dueAt,done:false,reminders:0}];
}
export function complete(tasks,id,nextId) {
 const task=tasks.find(t=>t.id===id);if(!task||task.done)return tasks;
 const next=tasks.map(t=>t.id===id?{...t,done:true}:t);
 if(task.recurring!=='none'&&task.dueAt!==null&&tasks.length<100)next.push({...task,id:nextId,dueAt:task.dueAt+(task.recurring==='daily'?1:7)*86400000,done:false,reminders:0});
 return next;
}
export function remind(task) {
 if(task.done)return {task,message:'This task is already complete.'};
 const reminders=Math.min(task.reminders+1,4);
 return {task:{...task,reminders},message:['Gentle nudge: choose a first step.','A small step still counts. Ready to begin?','This needs your attention. Complete it or reschedule.','Four reminders reached. Review this task when ready.'][reminders-1]};
}
