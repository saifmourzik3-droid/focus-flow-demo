import {seed,addTask,complete,remind} from './tasks.mjs';
const $=id=>document.getElementById(id), el=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
let tasks=seed(), recorder, stream, timer, memoCount=0;const urls=new Set();
const status=text=>{$('status').textContent=text;};
function render(){
 const filter=$('filter').value;const visible=tasks.filter(t=>filter==='all'||(filter==='done'?t.done:!t.done)).sort((a,b)=>b.importance-a.importance);
 $('count').textContent=tasks.filter(t=>!t.done).length;$('tasks').replaceChildren();
 if(!visible.length)$('tasks').append(el('p','A little breathing room. No tasks in this view.'));
 for(const task of visible){
  const card=el('article');card.className='task '+(task.importance>=4?'high ':'')+(task.done?'done':'');const check=el('input');check.type='checkbox';check.checked=task.done;check.disabled=task.done;check.setAttribute('aria-label','Complete '+task.text);check.addEventListener('change',()=>{tasks=complete(tasks,task.id,crypto.randomUUID());status('One small step, done.');render();});
  const text=el('div');text.className='text';text.append(el('h3',task.text),el('p','Importance '+task.importance+' / '+(task.dueAt?new Date(task.dueAt).toLocaleString():'Unscheduled')+' / '+task.recurring));
  const nudge=el('button','Simulate reminder');nudge.className='quiet';nudge.disabled=task.done;nudge.addEventListener('click',()=>{const next=remind(task);tasks=tasks.map(t=>t.id===task.id?next.task:t);status(next.message+' (Local simulation; no notification sent.)');render();});
  const remove=el('button','Remove');remove.className='quiet';remove.setAttribute('aria-label','Remove '+task.text);remove.addEventListener('click',()=>{tasks=tasks.filter(t=>t.id!==task.id);render();});
  card.append(check,text,nudge,remove);$('tasks').append(card);
 }
}
$('capture').addEventListener('submit',event=>{event.preventDefault();try{tasks=addTask(tasks,{text:$('text').value,importance:Number($('importance').value),recurring:$('recurring').value,dueAt:$('when').value==='none'?null:Date.now()+Number($('when').value)*60000},crypto.randomUUID());$('text').value='';status('Captured. Everything stays in this tab.');render();}catch(e){status(e.message);}});
$('filter').addEventListener('change',render);
$('reset').addEventListener('click',()=>{if(recorder?.state==='recording'){status('Stop the recording before resetting.');return;}tasks=seed();for(const url of urls)URL.revokeObjectURL(url);urls.clear();memoCount=0;$('memos').replaceChildren();status('Fictional scenario restored.');render();});
$('record').addEventListener('click',async()=>{
 if(recorder?.state==='recording'){recorder.stop();return;}
 if(memoCount>=3){status('This demo allows three short memos. Reset to clear them.');return;}
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status('Recording is unavailable in this browser. Use a task instead.');return;}
 $('record').disabled=true;
 try{stream=await navigator.mediaDevices.getUserMedia({audio:true});const chunks=[];recorder=new MediaRecorder(stream);
 recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 recorder.onstop=()=>{clearTimeout(timer);stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:recorder.mimeType});const url=URL.createObjectURL(blob);urls.add(url);memoCount++;const box=el('div');box.className='memo';const player=el('audio');player.controls=true;player.src=url;box.append(el('span','Local memo '+memoCount),player);$('memos').append(box);$('record').textContent='Record a memo';status('Voice memo kept in this tab only. No transcription performed.');};
 recorder.start();$('record').textContent='Stop recording';status('Recording locally — maximum 60 seconds.');timer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},60000);
 }catch{stream?.getTracks().forEach(t=>t.stop());status('Microphone unavailable or permission declined. You can still type a task.');}finally{$('record').disabled=false;}
});
window.addEventListener('pagehide',()=>{clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());for(const url of urls)URL.revokeObjectURL(url);});render();
