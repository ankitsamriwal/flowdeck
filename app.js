/* FlowDeck v2 — local-first project management. No dependencies, no backend, no tracking. */
(()=>{'use strict';
const KEY='flowdeck.v2',OLD='flowdeck.v1';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const screen=$('#screen'),toastEl=$('#toast');
const MEMBERS=[{i:'AS',n:'You',c:'#6b6a66'},{i:'MK',n:'Maya',c:'#b4552d'},{i:'LJ',n:'Leo',c:'#b9842a'},{i:'RT',n:'Rita',c:'#4f7a6a'}];
const COLORS=['#2a2926','#ee6c2b','#4f7a6a','#d49a3a','#6a5acd','#c2416b','#2f6fb3'];
const STATUS=[['todo','To do'],['doing','In progress'],['review','Review'],['done','Done']];
const SKEYS=STATUS.map(s=>s[0]);
const PRI=['Low','Medium','High'];
const RECUR={daily:'Every day',weekdays:'Every weekday',weekly:'Every week'};
const WORK=[9*60,18*60];
const DRE=/^\d{4}-\d{2}-\d{2}$/,TRE=/^\d{2}:\d{2}$/;

/* ---------- utils ---------- */
const pad=n=>(n<10?'0':'')+n;
const ds=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const pd=s=>{const p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const today=()=>ds(new Date());
const uid=()=>Math.random().toString(36).slice(2,10);
const mins=t=>{const p=t.split(':');return +p[0]*60+ +p[1]};
const hm=m=>{m=Math.max(0,Math.min(1439,Math.round(m)));return pad(Math.floor(m/60))+':'+pad(m%60)};
const dur=t=>Math.max(0,mins(t.end)-mins(t.start));
const fmtT=t=>{const h=+t.slice(0,2),m=t.slice(3);return (h%12||12)+(m==='00'?'':':'+m)+(h<12?'am':'pm')};
const fmtDur=m=>{m=Math.round(m);const h=Math.floor(m/60);return h?h+'h'+(m%60?' '+pad(m%60)+'m':''):m+'m'};
const fmtD=(s,o)=>pd(s).toLocaleDateString('en',o||{month:'short',day:'numeric'});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeColor=c=>/^#[0-9a-f]{3,8}$/i.test(c||'')?c:'#8d8a84';
const cut=(s,n)=>String(s==null?'':s).slice(0,n);
const nowMins=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
const isMac=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent);

const I={
search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
back:'<path d="M15 5l-7 7 7 7"/>',fwd:'<path d="M9 5l7 7-7 7"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="M5 12l5 5 9-10"/>',
flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
sub:'<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
repeat:'<path d="M17 2l3 3-3 3M3 11V9a4 4 0 0 1 4-4h13M7 22l-3-3 3-3M21 13v2a4 4 0 0 1-4 4H4"/>',
spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
play:'<path d="M7 4l13 8-13 8z"/>',pause:'<path d="M8 5v14M16 5v14"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>',
moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
edit:'<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
grip:'<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
x:'<path d="M6 6l12 12M18 6L6 18"/>',
kb:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
board:'<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/>',
pie:'<path d="M12 3v9h9a9 9 0 1 1-9-9z"/>',layers:'<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'
};
const ic=(n,c)=>'<svg viewBox="0 0 24 24" aria-hidden="true"'+(c?' class="'+c+'"':'')+'>'+I[n]+'</svg>';

/* ---------- data model + migration + sanitisation ---------- */
function normProj(p,i){return {id:cut(p.id||uid(),40),name:cut(p.name||'Untitled',60),desc:cut(p.desc||'',160),icon:cut(p.icon||'📌',8),color:safeColor(p.color||COLORS[(i||0)%COLORS.length])}}
function normTask(t){
  const st=SKEYS.includes(t.status)?t.status:(t.done?'done':'todo');
  const start=TRE.test(t.start)&&mins(t.start)<1410?t.start:'09:00';
  let end=TRE.test(t.end)?t.end:hm(mins(start)+60);
  if(mins(end)<=mins(start))end=hm(mins(start)+30);
  const id=cut(t.id||uid(),40),date=DRE.test(t.date)?t.date:'';
  return {id,title:cut(t.title||'Untitled',200),notes:cut(t.notes,5000),project:cut(t.project,40),status:st,done:st==='done',
    priority:PRI.includes(t.priority)?t.priority:'Medium',date,start,end,
    members:(Array.isArray(t.members)?t.members:[0]).map(Number).filter((m,i,a)=>m>=0&&m<MEMBERS.length&&a.indexOf(m)===i),
    tags:(Array.isArray(t.tags)?t.tags:[]).map(x=>String(x).toLowerCase().replace(/[^\w-]/g,'').slice(0,24)).filter((x,i,a)=>x&&a.indexOf(x)===i).slice(0,8),
    subtasks:(Array.isArray(t.subtasks)?t.subtasks:[]).filter(x=>x&&x.t).slice(0,50).map(x=>({id:cut(x.id||uid(),40),t:cut(x.t,200),done:!!x.done})),
    recur:['daily','weekdays','weekly'].includes(t.recur)?t.recur:null,series:cut(t.series||id,40),draft:!!t.draft,
    doneOn:st==='done'?(DRE.test(t.doneOn)?t.doneOn:(date||today())):null,
    order:Number.isFinite(+t.order)?+t.order:0,created:DRE.test(t.created)?t.created:(date||today())};
}
function normTimer(t){return t&&typeof t==='object'&&t.task?{task:cut(t.task,40),len:Math.max(1,Math.min(180,+t.len||25)),endsAt:+t.endsAt||0,left:Math.max(0,+t.left||0)}:null}
function normState(s){
  return {v:2,name:cut(s.name||'You',40),sound:s.sound!==false,theme:['auto','light','dark'].includes(s.theme)?s.theme:'auto',notify:!!s.notify,
    projects:(Array.isArray(s.projects)?s.projects:[]).filter(p=>p&&typeof p==='object').map(normProj),
    tasks:(Array.isArray(s.tasks)?s.tasks:[]).filter(t=>t&&typeof t==='object').map(normTask),
    sessions:(Array.isArray(s.sessions)?s.sessions:[]).filter(x=>x&&DRE.test(x.date)).slice(-5000).map(x=>({task:cut(x.task,40),date:x.date,mins:Math.max(0,Math.min(600,Math.round(+x.mins||0)))})),
    timer:normTimer(s.timer)};
}
function seed(){
  const t=new Date(),P=[
    {id:'p1',name:'Decision making',desc:'Analysing drop-off rates and metrics.',icon:'🌿',color:COLORS[0]},
    {id:'p2',name:'Design system',desc:'Wing peppers, tokens and Bianca green.',icon:'🍎',color:COLORS[1]},
    {id:'p3',name:'Exploration phase',desc:'Early concepts and user interviews.',icon:'💡',color:COLORS[2]}];
  const T=[],defs=[
    ['Website design development','p1',0,'10:15','11:15','Medium','doing',{subtasks:['Hero section','Pricing page','Footer links'],tags:['web']}],
    ['Client reviews and feedback','p1',0,'12:00','13:00','Low','done'],
    ['Wireframing and brainstorming','p3',0,'09:15','10:15','Medium','review'],
    ['Design system planning','p2',0,'14:00','15:30','High','todo',{notes:'Agree token naming before we build components.',tags:['tokens']}],
    ['User interview synthesis','p1',0,'16:00','17:00','Medium','todo'],
    ['Daily standup','p3',0,'09:00','09:15','Low','todo',{recur:'weekdays'}],
    ['Drop-off funnel dashboard','p1',2,'10:00','12:00','High','todo'],
    ['Stakeholder readout','p1',4,'15:00','16:00','Medium','todo'],
    ['Design style finalization','p2',1,'19:00','20:00','Low','todo'],
    ['Audit icon set','p2',-2,'11:00','12:00','Medium','todo'],
    ['Competitor teardown','p3',null,'09:00','10:30','Medium','todo',{tags:['research']}],
    ['Accessibility checklist','p2',null,'09:00','10:00','High','todo']];
  defs.forEach((d,i)=>{const x=d[7]||{};T.push(normTask({title:d[0],project:d[1],date:d[2]==null?'':ds(addDays(t,d[2])),start:d[3],end:d[4],priority:d[5],status:d[6],members:[0,1,2].slice(0,1+i%3),order:i,doneOn:d[6]==='done'?today():null,notes:x.notes,tags:x.tags,recur:x.recur,subtasks:(x.subtasks||[]).map((s,j)=>({t:s,done:j===0}))}))});
  const names=['Review mocks','Sprint planning','Research notes','Prototype pass','QA walkthrough'];
  for(let i=1;i<=60;i++){
    if(Math.random()<.25)continue;
    const n=1+Math.floor(Math.random()*3);
    for(let k=0;k<n;k++){const sh=9+k*3,len=1+Math.floor(Math.random()*2),dd=ds(addDays(t,-i));
      T.push(normTask({title:names[Math.floor(Math.random()*5)],project:P[Math.floor(Math.random()*3)].id,date:dd,start:pad(sh)+':00',end:pad(sh+len)+':00',status:'done',doneOn:dd,members:[0]}))}
  }
  return normState({name:'Salung',sound:true,projects:P,tasks:T,sessions:[]});
}
function load(){
  let s=null;
  try{s=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(!s){try{const o=JSON.parse(localStorage.getItem(OLD));if(o&&o.tasks)s=o}catch(e){}}
  return s&&Array.isArray(s.tasks)?normState(s):seed();
}
let S=load(),DM=null;
function save(){DM=null;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Storage is full — export your data')}}
save();
const ui={tab:'home',detail:null,from:'home',schedDate:today(),statRange:'Month',boardProj:'',detailMode:'list',allDone:false};

/* ---------- sound + toast + undo ---------- */
let AC;
function beep(f,d,v){
  if(!S.sound)return;
  try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();
    o.type='sine';o.frequency.value=f;g.gain.value=v||.04;g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);
    o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}
}
const snd={tap:()=>beep(520,.07),tab:()=>beep(660,.09),ok:()=>{beep(784,.09);setTimeout(()=>beep(1046,.14),80)},open:()=>beep(440,.12),
  bell:()=>{beep(880,.2,.06);setTimeout(()=>beep(660,.2,.06),220);setTimeout(()=>beep(990,.35,.06),440)}};
let undoFn=null;
function toast(m,undo){
  toastEl.innerHTML='<span>'+esc(m)+'</span>'+(undo?'<button type="button" data-undo>Undo</button>':'');
  undoFn=undo||null;toastEl.classList.toggle('act',!!undo);toastEl.classList.add('show');
  clearTimeout(toast.t);toast.t=setTimeout(()=>{toastEl.classList.remove('show','act');undoFn=null},undo?5000:2000);
}
function snapshot(){const s=JSON.stringify(S);return ()=>{S=normState(JSON.parse(s));save();applyTheme();renderTimer();render(true);toast('Undone')}}

/* ---------- data helpers ---------- */
const proj=id=>S.projects.find(p=>p.id===id)||{id:'',name:'No project',icon:'•',color:'#8d8a84',desc:''};
const live=()=>S.tasks.filter(t=>!t.draft);
const ptasks=id=>live().filter(t=>t.project===id);
const taskById=id=>S.tasks.find(t=>t.id===id);
const maxOrder=()=>S.tasks.reduce((a,t)=>Math.max(a,t.order),0);
function pct(id){const a=ptasks(id);return a.length?Math.round(a.filter(t=>t.done).length/a.length*100):0}
/* focus minutes per day = logged focus sessions + planned length of completed tasks that had no session (no double count) */
function dayMap(){
  if(DM)return DM;const m={},logged=new Set();
  S.sessions.forEach(x=>{m[x.date]=(m[x.date]||0)+x.mins;logged.add(x.task)});
  S.tasks.forEach(t=>{if(t.done&&t.doneOn&&!logged.has(t.id))m[t.doneOn]=(m[t.doneOn]||0)+dur(t)});
  return DM=m;
}
const doneMins=d=>dayMap()[d]||0;
function projMins(pid,set){
  const tp={},logged=new Set();S.tasks.forEach(t=>tp[t.id]=t.project);
  let m=0;S.sessions.forEach(x=>{logged.add(x.task);if(tp[x.task]===pid&&set.has(x.date))m+=x.mins});
  S.tasks.forEach(t=>{if(t.project===pid&&t.done&&set.has(t.doneOn)&&!logged.has(t.id))m+=dur(t)});
  return m;
}
function lastDays(n,from){const o=[];for(let i=n-1;i>=0;i--)o.push(ds(addDays(from||new Date(),-i)));return o}
const sortT=a=>a.slice().sort((x,y)=>((x.date||'9999')+x.start).localeCompare((y.date||'9999')+y.start));
const isOverdue=t=>!t.done&&!t.draft&&!!t.date&&t.date<today();
function whenLabel(t,short){
  if(!t.date)return 'No date';
  const tm=short?'':' · '+fmtT(t.start);
  if(t.date===today())return 'Today'+tm;
  if(t.date===ds(addDays(new Date(),1)))return 'Tomorrow'+tm;
  if(t.date===ds(addDays(new Date(),-1)))return 'Yesterday'+tm;
  return fmtD(t.date)+tm;
}
function statusLabel(t){
  if(t.draft)return 'Draft';if(t.done)return 'Completed';if(!t.date)return 'Backlog';if(isOverdue(t))return 'Overdue';
  if(t.status==='todo')return t.date===today()?'Upcoming':'Scheduled';
  return STATUS.find(x=>x[0]===t.status)[1];
}
function avatars(t){return '<div class="av">'+t.members.map(i=>{const m=MEMBERS[i];return '<span style="background:'+m.c+'" title="'+esc(m.n)+'">'+m.i+'</span>'}).join('')+'</div>'}
function setStatus(t,st){
  const was=t.status;t.status=st;t.done=st==='done';
  if(st==='done'&&was!=='done'){t.doneOn=today();spawnNext(t)}
  if(st!=='done')t.doneOn=null;
}
function spawnNext(t){
  if(!t.recur||!t.date)return;
  let d=pd(t.date);
  do{d=addDays(d,t.recur==='weekly'?7:1)}while(t.recur==='weekdays'&&(d.getDay()===0||d.getDay()===6));
  const nd=ds(d);
  if(S.tasks.some(x=>x.series===t.series&&x.date===nd))return;
  S.tasks.push(normTask(Object.assign({},t,{id:uid(),status:'todo',done:false,doneOn:null,date:nd,order:maxOrder()+1,created:today(),subtasks:t.subtasks.map(s=>({t:s.t,done:false}))})));
}

/* ---------- scheduling intelligence ---------- */
function findSlot(date,len,ignoreId){
  const busy=live().filter(t=>t.date===date&&!t.done&&t.id!==ignoreId).map(t=>[mins(t.start),mins(t.end)]);
  let from=WORK[0];
  if(date===today())from=Math.max(from,Math.ceil((nowMins()+5)/15)*15);
  const lim=from+len>WORK[1]?21*60:WORK[1];
  for(let st=from;st+len<=lim;st+=15){if(busy.every(b=>st+len<=b[0]||st>=b[1]))return hm(st)}
  return null;
}
function planDay(){
  const td=today(),undo=snapshot(),rank={High:0,Medium:1,Low:2};
  const cand=live().filter(t=>!t.done&&(!t.date||t.date<td)).sort((a,b)=>rank[a.priority]-rank[b.priority]||(a.date?0:1)-(b.date?0:1)||a.date.localeCompare(b.date));
  if(!cand.length){toast('Nothing to plan — overdue and backlog are clear');return}
  let n=0,skip=0;
  cand.forEach(t=>{const len=dur(t)||60,s=findSlot(td,len,t.id);if(s){t.date=td;t.start=s;t.end=hm(mins(s)+len);n++}else skip++});
  if(!n){toast('No free time left today for '+cand.length+' task'+(cand.length>1?'s':''));return}
  save();snd.ok();ui.tab='schedule';ui.detail=null;ui.schedDate=td;render();
  toast('Planned '+n+' task'+(n>1?'s':'')+' into today'+(skip?' · '+skip+' didn’t fit':''),undo);
}

/* ---------- natural-language quick add ---------- */
const WD=['sun','mon','tue','wed','thu','fri','sat'];
const MON=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const MONRE='(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const DAYFULL='(monday|tuesday|wednesday|thursday|friday|saturday|sunday)';
const DAYABBR='(mon|tues?|wed|thur?s?|fri|sat|sun)';
function to24(h,m,ap){
  h=+h;const hasM=m!=null&&m!=='';m=+(m||0);
  if(ap){ap=ap.toLowerCase();if(h<1||h>12)return null;if(ap==='pm'&&h<12)h+=12;if(ap==='am'&&h===12)h=0}
  else if(!hasM&&h>=1&&h<=7)h+=12;
  return h>23||m>59?null:h*60+m;
}
function nextWd(i,base,incToday){let d=new Date(base);if(!incToday)d=addDays(d,1);while(d.getDay()!==i)d=addDays(d,1);return ds(d)}
function mdDate(mo,day,base){
  let y=base.getFullYear();const valid=(yy)=>new Date(yy,mo,day).getMonth()===mo;
  if(!valid(y))return '';let d=new Date(y,mo,day);if(d<base){y++;if(!valid(y))return '';d=new Date(y,mo,day)}return ds(d);
}
function matchProj(n){
  const k=String(n).toLowerCase().replace(/[^a-z0-9]/g,'');if(!k)return null;
  const nm=p=>p.name.toLowerCase().replace(/[^a-z0-9]/g,'');
  return S.projects.find(p=>nm(p)===k)||S.projects.find(p=>nm(p).startsWith(k))||S.projects.find(p=>nm(p).includes(k))||
    S.projects.find(p=>p.name.toLowerCase().split(/\s+/).map(w=>w[0]).join('')===k)||null;
}
function matchMember(n){n=n.toLowerCase();return MEMBERS.findIndex(m=>m.i.toLowerCase()===n||m.n.toLowerCase()===n||(n==='me'&&m.n==='You'))}
function parseQuick(raw){
  let s=' '+String(raw).replace(/\s+/g,' ')+' ';
  const o={title:'',date:'',start:'',end:'',len:0,priority:'',project:'',members:[],tags:[],recur:null};
  const base=new Date();base.setHours(0,0,0,0);
  const take=(re,fn)=>{s=s.replace(re,function(){const r=fn.apply(null,arguments);return r===false?arguments[0]:' '})};
  take(new RegExp('\\s(?:every\\s+(day|weekday|week|'+DAYFULL.slice(1,-1)+'|'+DAYABBR.slice(1,-1)+')|(daily|weekly))(?=\\s)','i'),(m,a,b)=>{
    const w=(a||b).toLowerCase();
    if(w==='day'||w==='daily')o.recur='daily';else if(w==='weekday')o.recur='weekdays';else if(w==='week'||w==='weekly')o.recur='weekly';
    else{o.recur='weekly';o.date=nextWd(WD.indexOf(w.slice(0,3)),base,true)}
  });
  take(/\sfor\s+(\d+(?:\.\d+)?)\s*(h|hrs?|hours?|m|mins?|minutes?)(?=\s)/i,(m,n,u)=>{const v=Math.round(/^h/i.test(u)?n*60:+n);if(v<5||v>720)return false;o.len=v});
  take(/\sin\s+(\d{1,3})\s+(days?|weeks?)(?=\s)/i,(m,n,u)=>{o.date=ds(addDays(base,/^w/i.test(u)?n*7:+n))});
  take(/\snext\s+week(?=\s)/i,()=>{o.date=nextWd(1,base,false)});
  take(/\s(?:on\s+)?(\d{4}-\d{2}-\d{2})(?=\s)/,(m,d)=>{if(isNaN(pd(d))||ds(pd(d))!==d)return false;o.date=d});
  take(new RegExp('\\s(?:on\\s+)?(\\d{1,2})(?:st|nd|rd|th)?\\s+'+MONRE+'(?=\\s)','i'),(m,d,mo)=>{const v=mdDate(MON.indexOf(mo.slice(0,3).toLowerCase()),+d,base);if(!v)return false;o.date=v});
  take(new RegExp('\\s(?:on\\s+)?'+MONRE+'\\s+(\\d{1,2})(?:st|nd|rd|th)?(?=\\s)','i'),(m,mo,d)=>{const v=mdDate(MON.indexOf(mo.slice(0,3).toLowerCase()),+d,base);if(!v)return false;o.date=v});
  take(/\s(?:at\s+|from\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?(?=\s)/i,(m,h1,m1,a1,h2,m2,a2)=>{
    if(!a1&&!a2&&m1==null&&m2==null&&!/^\s(at|from)\s/i.test(m))return false;
    a1=a1&&a1.toLowerCase();a2=a2&&a2.toLowerCase();
    const e=to24(h2,m2,a2);let st=to24(h1,m1,a1||a2);
    if(st!=null&&e!=null&&!a1&&a2&&st>=e)st=to24(h1,m1,a2==='pm'?'am':'pm');
    if(st==null||e==null||e<=st)return false;
    o.start=hm(st);o.end=hm(e);
  });
  if(!o.start)take(/\s(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)(?=\s)/i,(m,h,mi,ap)=>{const v=to24(h,mi,ap);if(v==null)return false;o.start=hm(v)});
  if(!o.start)take(/\s(?:at\s+)?(\d{1,2}):(\d{2})(?=\s)/,(m,h,mi)=>{const v=to24(h,mi);if(v==null)return false;o.start=hm(v)});
  if(!o.start)take(/\sat\s+(\d{1,2})(?=\s)/i,(m,h)=>{const v=to24(h);if(v==null)return false;o.start=hm(v)});
  take(/\s(?:at\s+)?(noon|midday)(?=\s)/i,()=>{if(o.start)return false;o.start='12:00'});
  take(/\stonight(?=\s)/i,()=>{o.date=o.date||ds(base);if(!o.start)o.start='19:00'});
  take(/\s(?:on\s+)?(today|tod|tomorrow|tmrw?|tmr)(?=\s)/i,(m,w)=>{o.date=ds(addDays(base,/^tod/i.test(w)?0:1))});
  take(new RegExp('\\s(?:on\\s+|next\\s+|this\\s+)?'+DAYFULL+'(?=\\s)','i'),(m,w)=>{o.date=nextWd(WD.indexOf(w.slice(0,3).toLowerCase()),base,false)});
  take(/\s(?:(?:on|next|this)\s+)?(mon|tues?|wed|thur?s?|fri)(?=\s)/i,(m,w)=>{o.date=nextWd(WD.indexOf(w.slice(0,3).toLowerCase()),base,false)});
  take(new RegExp('\\s(?:on|next|this)\\s+'+DAYABBR+'(?=\\s)','i'),(m,w)=>{o.date=nextWd(WD.indexOf(w.slice(0,3).toLowerCase()),base,false)});
  take(/\s(!{1,3}|!(?:high|hi|h|urgent|med|medium|m|low|lo|l)|p[1-3])(?=\s)/i,(m,v)=>{v=v.toLowerCase();
    o.priority=/^(!m|!med|!medium|p2)$/.test(v)?'Medium':/^(!l|!lo|!low|p3)$/.test(v)?'Low':'High'});
  take(/\s#([\w-]+)/g,(m,n)=>{const p=matchProj(n);if(p)o.project=p.id;else o.tags.push(n.toLowerCase())});
  take(/\s\+([\w-]+)/g,(m,n)=>{o.tags.push(n.toLowerCase())});
  take(/\s@([a-z]{2,12})(?=\s)/gi,(m,n)=>{const i=matchMember(n);if(i<0)return false;if(!o.members.includes(i))o.members.push(i)});
  o.title=s.replace(/\s+/g,' ').trim();
  if(o.start&&!o.end&&o.len)o.end=hm(mins(o.start)+o.len);
  return o;
}
function fromQuick(pq){
  let date=pq.date,start=pq.start,len=pq.len||(pq.start&&pq.end?mins(pq.end)-mins(pq.start):60),auto=false;
  if(!date&&start)date=today();
  if(date&&!start){const s=findSlot(date,len);start=s||'09:00';auto=!!s}
  if(!start)start='09:00';
  let end=pq.end||hm(mins(start)+len);if(mins(end)<=mins(start))end=hm(mins(start)+30);
  return {auto,task:{title:pq.title,project:pq.project||ui.detail||ui.boardProj||'',date,start,end,priority:pq.priority||'Medium',
    members:pq.members.length?pq.members:[0],tags:pq.tags,recur:pq.recur,status:'todo'}};
}
function quickMeta(pq){
  const r=fromQuick(pq),t=r.task,c=[];
  c.push(t.date?whenLabel(t,true)+' '+fmtT(t.start)+'–'+fmtT(t.end)+(r.auto?' (auto)':''):'Backlog');
  if(t.project)c.push(proj(t.project).name);
  if(pq.priority)c.push(pq.priority+' priority');
  if(t.recur)c.push(RECUR[t.recur]);
  pq.members.forEach(i=>c.push('@'+MEMBERS[i].n));
  t.tags.forEach(x=>c.push('+'+x));
  return c;
}
function quickCreate(pq){
  const undo=snapshot(),r=fromQuick(pq),t=normTask(Object.assign({},r.task,{id:uid(),order:maxOrder()+1}));
  S.tasks.push(t);save();closePal();snd.ok();render(true);
  toast(t.date?(r.auto?'Auto-scheduled · ':'Added · ')+whenLabel(t):'Added to backlog',undo);
}

/* ---------- task cards ---------- */
function pills(t){
  let h='';
  if(t.priority==='High'&&!t.done)h+='<span class="pill hi">'+ic('flag')+'High</span>';
  if(t.subtasks.length)h+='<span class="pill">'+ic('sub')+t.subtasks.filter(s=>s.done).length+'/'+t.subtasks.length+'</span>';
  if(t.recur)h+='<span class="pill" title="'+RECUR[t.recur]+'">'+ic('repeat')+'</span>';
  if(S.timer&&S.timer.task===t.id)h+='<span class="pill acc">'+ic('clock')+'Focus</span>';
  return h;
}
function taskHTML(t){
  const p=proj(t.project);
  return '<div class="card task'+(t.done?' done':'')+(isOverdue(t)?' over':'')+'" data-edit="'+t.id+'" role="button" tabindex="0"><span class="stripe" style="background:'+(t.done?'var(--line)':p.color)+'"></span><div class="body"><p class="t">'+esc(t.title)+'</p><p class="s">'+statusLabel(t)+' &middot; '+esc(p.name)+'</p><div class="meta">'+avatars(t)+'<span class="pills">'+pills(t)+'<span>'+whenLabel(t)+'</span></span></div></div><button class="chk" data-toggle="'+t.id+'" aria-label="'+(t.done?'Mark not done':'Mark done')+'" aria-pressed="'+t.done+'">'+ic('check')+'</button></div>';
}
function bcardHTML(t){
  const p=proj(t.project);
  return '<article class="bcard'+(isOverdue(t)?' over':'')+(t.done?' done':'')+'" data-edit="'+t.id+'" data-id="'+t.id+'" tabindex="0"><div class="bc-top"><span class="pdot" style="background:'+p.color+'"></span><small>'+esc(p.name)+'</small><span class="grip" title="Drag to move">'+ic('grip')+'</span></div><p>'+esc(t.title)+'</p><div class="bc-meta"><span class="pills">'+pills(t)+'<span class="when">'+(isOverdue(t)?'Overdue · ':'')+whenLabel(t,true)+'</span></span>'+avatars(t)+'</div></article>';
}
function boardHTML(pid){
  const L=live().filter(t=>!pid||t.project===pid),cutoff=ds(addDays(new Date(),-14));
  return '<div class="board" id="board">'+STATUS.map(([k,n])=>{
    let c=L.filter(t=>t.status===k).sort((a,b)=>a.order-b.order||((a.date||'9999')+a.start).localeCompare((b.date||'9999')+b.start));
    let hidden=0;
    if(k==='done'){const all=c.length;c=c.filter(t=>t.doneOn>=cutoff).sort((a,b)=>b.doneOn.localeCompare(a.doneOn));hidden=all-c.length}
    return '<section class="col" data-col="'+k+'"><header><span class="dot s-'+k+'"></span>'+n+'<em>'+c.length+'</em><button class="ib sm" data-addcol="'+k+'" aria-label="Add to '+n+'">'+ic('plus')+'</button></header><div class="cards">'+c.map(bcardHTML).join('')+'<div class="empty sm">Drop tasks here</div></div>'+(hidden?'<p class="more">'+hidden+' completed more than 2 weeks ago</p>':'')+'</section>';
  }).join('')+'</div>';
}

/* ---------- views ---------- */
function heatCells(days){return days.map(d=>{const m=doneMins(d),l=m===0?'':m<60?'l1':m<150?'l2':m<240?'l3':'l4';return '<i class="'+l+'" title="'+fmtD(d)+': '+fmtDur(m)+'"></i>'}).join('')}
function miniBars(id){
  const vals=lastDays(7).map(d=>S.tasks.reduce((a,t)=>a+(t.project===id&&t.done&&t.doneOn===d?1:0),0)),mx=Math.max(1,...vals),top=vals.indexOf(Math.max(...vals));
  return vals.map((v,i)=>'<i class="'+(i===top&&v?'on':'')+'" style="height:'+(18+v/mx*70)+'%"></i>').join('');
}
function greeting(){const h=new Date().getHours();return h<5?'Good night':h<12?'Good morning':h<17?'Good afternoon':'Good evening'}
function darkNow(){return S.theme==='dark'||(S.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches)}
function homeView(){
  const td=today(),L=live(),tdy=sortT(L.filter(t=>t.date===td)),over=sortT(L.filter(isOverdue)),back=L.filter(t=>!t.date&&!t.done);
  const planned=tdy.filter(t=>!t.done).reduce((a,t)=>a+dur(t),0),doneT=tdy.filter(t=>t.done).length,cap=WORK[1]-WORK[0],load=Math.round(planned/cap*100);
  let a=0,b=0;lastDays(7).forEach(d=>a+=doneMins(d));lastDays(7,addDays(new Date(),-7)).forEach(d=>b+=doneMins(d));
  const ch=b?Math.round((a-b)/b*100):(a?100:0);
  const atRisk=S.projects.filter(p=>{const o=ptasks(p.id).filter(t=>!t.done&&t.date&&t.date<=ds(addDays(new Date(),3)));return o.length>=2&&pct(p.id)<50});
  return '<div class="view home"><div class="hdr"><div><h1>'+greeting()+', '+esc(S.name)+'</h1><p class="date">'+new Date().toLocaleDateString('en',{weekday:'long',day:'numeric',month:'long'})+'</p></div><div class="ic"><button class="ib" data-themetoggle aria-label="Toggle dark mode">'+ic(darkNow()?'sun':'moon')+'</button><button class="ib" data-go="schedule" aria-label="Schedule">'+ic('cal')+'</button></div></div>'+
  '<button class="search" data-palette>'+ic('search')+'<span>Search, or type a task like “Review deck tomorrow 3pm #design”</span><kbd>'+(isMac?'⌘':'Ctrl ')+'K</kbd></button>'+
  '<div class="hgrid"><div class="card perf" data-go="stats" role="button" tabindex="0"><div><b>Your focus<br>this week</b><span class="btn">See performance</span></div><div class="heat">'+heatCells(lastDays(42))+'<span class="badge'+(ch<0?' neg':'')+'">'+(ch>=0?'+':'')+ch+'%</span></div></div>'+
  '<div class="card glance"><div class="gl-top"><b>Today</b><span>'+doneT+'/'+tdy.length+' done</span></div><div class="meter"><span class="'+(load>100?'over':'')+'" style="width:'+Math.min(100,load)+'%"></span></div><p>'+fmtDur(planned)+' left of a '+fmtDur(cap)+' day'+(load>100?' — overbooked':'')+'</p><div class="chips">'+
  (over.length?'<span class="chip warn">'+over.length+' overdue</span>':'')+(back.length?'<button class="chip" data-go="board">'+back.length+' in backlog</button>':'')+
  atRisk.map(p=>'<button class="chip warn" data-proj="'+p.id+'">'+esc(p.name)+' at risk</button>').join('')+
  '<button class="chip dark" data-plan>'+ic('spark')+'Plan my day</button></div></div></div>'+
  '<div class="sec"><h2>Projects</h2><a data-go="projects">See all</a></div><div class="hscroll">'+
  S.projects.map(p=>'<button class="card pcard" data-proj="'+p.id+'"><div class="viz"><div class="bars">'+miniBars(p.id)+'</div></div><h3><span>'+esc(p.icon)+'</span> '+esc(p.name)+'</h3><p>'+esc(p.desc)+'</p><div class="prog"><div class="bar"><span style="width:'+pct(p.id)+'%;background:'+p.color+'"></span></div>'+pct(p.id)+'%</div></button>').join('')+
  '<button class="card pcard new" data-newproj>'+ic('plus')+'<span>New project</span></button></div>'+
  '<div class="lists">'+(over.length?'<div><div class="sec"><h2>Overdue</h2><a data-plan>Reschedule into today</a></div>'+over.map(taskHTML).join('')+'</div>':'')+
  '<div><div class="sec"><h2>Today’s tasks</h2><a data-go="schedule">Timeline</a></div>'+(tdy.map(taskHTML).join('')||'<div class="empty">A clear day. Press <kbd>N</kbd> or tap + to add a task.</div>')+'</div>'+
  (back.length?'<div><div class="sec"><h2>Backlog</h2><a data-go="board">Open board</a></div>'+back.slice(0,4).map(taskHTML).join('')+(back.length>4?'<p class="more">+'+(back.length-4)+' more on the board</p>':'')+'</div>':'')+'</div></div>';
}
function boardView(){
  return '<div class="view wide"><div class="hdr"><h1>Board</h1><div class="ic"><button class="ib" data-plan aria-label="Plan my day" title="Plan my day">'+ic('spark')+'</button></div></div>'+
  '<div class="fchips"><button class="chip'+(ui.boardProj?'':' on')+'" data-bproj="">All projects</button>'+S.projects.map(p=>'<button class="chip'+(ui.boardProj===p.id?' on':'')+'" data-bproj="'+p.id+'"><span class="pdot" style="background:'+p.color+'"></span>'+esc(p.name)+'</button>').join('')+'</div>'+
  boardHTML(ui.boardProj)+'<p class="hint">Drag cards between columns'+('ontouchstart' in window?' using the ⋮⋮ handle':'')+'. Completed recurring tasks create their next occurrence.</p></div>';
}
function detailView(){
  const p=proj(ui.detail);if(!p.id){ui.detail=null;return homeView()}
  const ts=sortT(ptasks(p.id)),done=ts.filter(t=>t.done).length,drafts=S.tasks.filter(t=>t.draft&&t.project===p.id);
  const vals=lastDays(7).map(d=>ts.filter(t=>t.done&&t.doneOn===d).length),mx=Math.max(1,...vals),top=vals.indexOf(Math.max(...vals));
  const due=ts.filter(t=>!t.done&&t.date).map(t=>t.date).sort().pop();
  const labels=lastDays(7).map(d=>pd(d).toLocaleDateString('en',{weekday:'narrow'}));
  const bars=vals.map((v,i)=>'<i class="'+(i===top&&v?'on':'')+'" style="height:'+(14+v/mx*80)+'%">'+(v?'<em>'+v+'</em>':'')+'<u>'+labels[i]+'</u></i>').join('');
  let body;
  if(ui.detailMode==='board')body=boardHTML(p.id);
  else{
    body=STATUS.map(([k,n])=>{let g=ts.filter(t=>t.status===k);if(!g.length)return '';const total=g.length;
      if(k==='done'){g=g.slice().sort((x,y)=>(y.doneOn||'').localeCompare(x.doneOn||''));if(!ui.allDone)g=g.slice(0,5)}
      return '<div class="sec"><h2>'+n+' <em class="cnt">'+total+'</em></h2>'+(k==='done'&&total>5?'<a data-alldone>'+(ui.allDone?'Show recent':'Show all')+'</a>':'')+'</div>'+g.map(taskHTML).join('')}).join('');
    if(drafts.length)body+='<div class="sec"><h2>Drafts <em class="cnt">'+drafts.length+'</em></h2></div>'+drafts.map(taskHTML).join('');
    if(!body)body='<div class="empty">No tasks yet.</div>';
  }
  return '<div class="view'+(ui.detailMode==='board'?' wide':'')+'"><div class="hdr"><button class="back" data-back aria-label="Back">'+ic('back')+'</button><h1>'+esc(p.icon)+' '+esc(p.name)+'</h1><div class="ic"><button class="ib" data-editproj="'+p.id+'" aria-label="Edit project">'+ic('edit')+'</button><button class="ib" data-delproj="'+p.id+'" aria-label="Delete project">'+ic('trash')+'</button></div></div>'+
  '<div class="dgrid"><div class="card"><div class="bars lbl" style="height:110px;padding:16px 0 18px">'+bars+'</div><h3 class="wk">Completed this week</h3><p class="desc">'+esc(p.desc)+'</p><div class="prog"><div class="bar"><span style="width:'+pct(p.id)+'%;background:'+p.color+'"></span></div>'+pct(p.id)+'%</div></div>'+
  '<div class="stats3"><div class="card"><small>Tasks</small><b>'+ts.length+'</b></div><div class="card"><small>Completed</small><b>'+done+'</b></div><div class="card"><small>Final due</small><b>'+(due?fmtD(due):'–')+'</b></div></div></div>'+
  '<div class="sec"><div class="seg sm">'+[['list','List'],['board','Board']].map(([k,n])=>'<button data-dmode="'+k+'" class="'+(ui.detailMode===k?'on':'')+'">'+n+'</button>').join('')+'</div><a data-newin="'+p.id+'">+ Add task</a></div>'+body+'</div>';
}
function statsView(){
  const n=ui.statRange==='Week'?7:ui.statRange==='Month'?30:365,cur=lastDays(n),prev=lastDays(n,addDays(new Date(),-n));
  const sum=arr=>arr.reduce((x,d)=>x+doneMins(d),0),a=sum(cur),b=sum(prev),ch=b?Math.round((a-b)/b*100):(a?100:0),set=new Set(cur);
  let chart;
  if(n===7){const v=cur.map(doneMins),mx=Math.max(60,...v);
    chart='<div class="bars lbl week">'+v.map((m,i)=>'<i class="'+(cur[i]===today()?'on':'')+'" style="height:'+(6+m/mx*86)+'%">'+(m?'<em>'+fmtDur(m)+'</em>':'')+'<u>'+pd(cur[i]).toLocaleDateString('en',{weekday:'short'})+'</u></i>').join('')+'</div>';}
  else if(n===30)chart='<div class="heat month">'+heatCells(cur)+'</div>';
  else{const dow=(new Date().getDay()+6)%7;chart='<div class="heat year">'+heatCells(lastDays(7*51+dow+1))+'</div>'}
  const byP=S.projects.map(p=>({p,m:projMins(p.id,set)})).sort((x,y)=>y.m-x.m),tot=a||1;
  const doneN=S.tasks.filter(t=>t.done&&set.has(t.doneOn)).length,openPast=live().filter(t=>!t.done&&t.date&&set.has(t.date)&&t.date<=today()).length;
  const rate=doneN+openPast?Math.round(doneN/(doneN+openPast)*100):0;
  let streak=0,d=new Date();if(!doneMins(ds(d)))d=addDays(d,-1);while(doneMins(ds(d))>0&&streak<3650){streak++;d=addDays(d,-1)}
  const wk=[0,0,0,0,0,0,0];cur.forEach(x=>wk[pd(x).getDay()]+=doneMins(x));const best=wk.indexOf(Math.max(...wk));
  return '<div class="view"><div class="hdr"><h1>Performance</h1></div><div class="seg">'+['Week','Month','Year'].map(r=>'<button data-range="'+r+'" class="'+(r===ui.statRange?'on':'')+'">'+r+'</button>').join('')+'</div>'+
  '<div class="card"><small class="lab">Focused time</small><div class="big">'+fmtDur(a)+' <small class="'+(ch<0?'neg':'pos')+'">'+(ch>=0?'+':'')+ch+'% vs previous '+ui.statRange.toLowerCase()+'</small></div>'+chart+(n===7?'':'<div class="legend"><span>Less</span><i></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><span>More</span></div>')+'</div>'+
  '<div class="four"><div class="card"><small>Tasks done</small><b>'+doneN+'</b></div><div class="card"><small>Completion</small><b>'+rate+'%</b></div><div class="card"><small>Streak</small><b>'+streak+' day'+(streak===1?'':'s')+'</b></div><div class="card"><small>Avg. daily focus</small><b>'+fmtDur(a/n)+'</b></div></div>'+
  '<div class="sec"><h2>Time by project</h2><a data-go="projects">See all</a></div>'+
  byP.map(x=>'<button class="card tp" data-proj="'+x.p.id+'"><div class="em">'+esc(x.p.icon)+'</div><div class="m"><b>'+esc(x.p.name)+'<span>'+fmtDur(x.m)+' &middot; '+Math.round(x.m/tot*100)+'%</span></b><div class="bar"><span style="width:'+Math.round(x.m/tot*100)+'%;background:'+x.p.color+'"></span></div></div></button>').join('')+
  (a?'<p class="hint">Your most productive day is usually <b>'+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][best]+'</b>. Focus sessions count exactly; completed tasks without a session count their planned length.</p>':'')+'</div>';
}
function schedView(){
  const sel=pd(ui.schedDate),mon=addDays(sel,-((sel.getDay()+6)%7)),td=today(),isT=ui.schedDate===td;
  const strip=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((nm,i)=>{const d=addDays(mon,i),k=ds(d),c=live().filter(t=>t.date===k&&!t.done).length;
    return '<button data-day="'+k+'" class="'+(k===ui.schedDate?'on ':'')+(k===td?'td':'')+'">'+nm+'<b>'+d.getDate()+'</b><i>'+(c?'•'.repeat(Math.min(3,c)):'')+'</i></button>'}).join('');
  const ev=sortT(live().filter(t=>t.date===ui.schedDate));
  const busy=ev.filter(t=>!t.done).reduce((a,t)=>a+dur(t),0);
  const nm=nowMins();let rows='';
  for(let h=7;h<=22;h++){
    const here=ev.filter(t=>{const sh=+t.start.slice(0,2);return sh===h||(h===7&&sh<7)||(h===22&&sh>22)});
    const now=isT&&Math.floor(nm/60)===h?'<span class="now" style="top:'+(nm%60/60*100)+'%"></span>':'';
    rows+='<div class="row"><div class="hr">'+((h%12||12)+(h<12?' AM':' PM'))+'</div><div class="slot" data-slot="'+h+'">'+now+here.map(t=>'<button class="ev'+(t.done?' done':'')+(t.priority==='High'&&!t.done?' hi':'')+'" data-edit="'+t.id+'" style="border-left-color:'+proj(t.project).color+';min-height:'+Math.max(40,Math.min(150,dur(t)*.8))+'px"><b>'+esc(t.title)+'</b><small>'+fmtT(t.start)+' – '+fmtT(t.end)+' &middot; '+fmtDur(dur(t))+' &middot; '+esc(proj(t.project).name)+'</small></button>').join('')+'</div></div>';
  }
  return '<div class="view"><div class="hdr"><button class="back" data-shift="-7" aria-label="Previous week">'+ic('back')+'</button><h1>Schedule</h1><button class="back" data-shift="7" aria-label="Next week">'+ic('fwd')+'</button></div>'+
  '<div class="subhdr"><span>'+sel.toLocaleDateString('en',{month:'long',year:'numeric'})+'</span>'+(isT?'':'<a data-day="'+td+'">Today</a>')+'</div><div class="strip">'+strip+'</div>'+
  '<div class="dayinfo"><span>'+(ev.length?ev.length+' task'+(ev.length>1?'s':'')+' · '+fmtDur(busy)+' booked':'No events this day')+'</span>'+(isT?'<button class="chip dark" data-plan>'+ic('spark')+'Plan my day</button>':'')+'</div>'+
  '<div class="tl">'+rows+'</div><p class="hint">Tap an empty hour to add a task there.</p></div>';
}
function projectsView(){
  const th=S.theme;
  return '<div class="view"><div class="hdr"><h1>Projects</h1><button class="ib" data-newproj aria-label="New project">'+ic('plus')+'</button></div>'+
  S.projects.map(p=>{const o=ptasks(p.id).filter(t=>!t.done).length;return '<button class="card tp" data-proj="'+p.id+'"><div class="em">'+esc(p.icon)+'</div><div class="m"><b>'+esc(p.name)+'<span>'+o+' open · '+pct(p.id)+'%</span></b><div class="bar"><span style="width:'+pct(p.id)+'%;background:'+p.color+'"></span></div></div></button>'}).join('')+
  (S.projects.length?'':'<div class="empty">No projects yet.</div>')+
  '<div class="sec" style="margin-top:22px"><h2>You</h2></div><div class="me"><div class="ph">'+esc((S.name||'?').charAt(0).toUpperCase())+'</div><div class="field grow"><label for="nm">Your name</label><input id="nm" value="'+esc(S.name)+'" maxlength="40"></div></div>'+
  '<div class="field"><label>Appearance</label><div class="seg">'+[['auto','Auto'],['light','Light'],['dark','Dark']].map(([k,n])=>'<button data-themeset="'+k+'" class="'+(th===k?'on':'')+'">'+n+'</button>').join('')+'</div></div>'+
  '<button class="lbtn" data-sound>Sound effects <b>'+(S.sound?'On':'Off')+'</b></button>'+
  '<button class="lbtn" data-notify>Start-time reminders <b>'+(S.notify?'On':'Off')+'</b></button>'+
  '<button class="lbtn" data-help>Keyboard shortcuts & quick-add syntax <b>?</b></button>'+
  '<button class="lbtn" data-export>Export data (JSON)</button>'+
  '<button class="lbtn" data-import>Import data (JSON)</button>'+
  '<button class="lbtn danger" data-reset>Reset to sample data</button>'+
  '<p class="hint">Everything is stored on this device only (localStorage). Nothing is sent to a server. Export regularly if this data matters — clearing browser data erases it.</p></div>';
}
function render(keep){
  const y=screen.scrollTop,b=$('#board'),bl=b?b.scrollLeft:0;
  const v=ui.detail?detailView():({home:homeView,board:boardView,schedule:schedView,stats:statsView,projects:projectsView}[ui.tab]||homeView)();
  screen.innerHTML=v;
  if(keep){screen.scrollTop=y;const nb=$('#board');if(nb)nb.scrollLeft=bl;const vw=screen.firstElementChild;if(vw)vw.style.animation='none'}else screen.scrollTop=0;
  const act=ui.detail?ui.from:ui.tab;
  $$('#tabbar [data-tab]').forEach(x=>{const on=x.dataset.tab===act;x.classList.toggle('on',on);x.setAttribute('aria-current',on?'page':'false')});
}
function go(tab){ui.tab=tab;ui.detail=null;render()}
function openProj(id){ui.from=ui.detail?ui.from:ui.tab;ui.detail=id;ui.detailMode='list';ui.allDone=false;render()}

/* ---------- sheets ---------- */
const wrap=$('#sheetWrap'),sheet=$('#sheet');
function openSheet(html){sheet.innerHTML=html;wrap.hidden=false;snd.open()}
function closeSheet(){wrap.hidden=true;sheet.innerHTML='';sheet.removeAttribute('data-kind')}
let draft=null;
function subsHTML(){return draft.subs.map(s=>'<div class="subrow'+(s.done?' done':'')+'"><button type="button" class="chk sm" data-subtog="'+s.id+'" aria-label="Toggle subtask">'+ic('check')+'</button><span>'+esc(s.t)+'</span><button type="button" class="subx" data-subdel="'+s.id+'" aria-label="Remove subtask">'+ic('x')+'</button></div>').join('')}
function taskSheet(t,preset){
  if(typeof t==='string')t=taskById(t);
  const edit=!!t;
  if(!edit){
    t=Object.assign({title:'',notes:'',project:ui.detail||ui.boardProj||(S.projects[0]?S.projects[0].id:''),date:ui.tab==='schedule'&&!ui.detail?ui.schedDate:today(),start:'',end:'',priority:'Medium',status:'todo',members:[0],tags:[],subtasks:[],recur:null},preset||{});
    if(!t.start){const s=t.date?findSlot(t.date,60):null;t.start=s||'14:00';t.end=hm(mins(t.start)+60)}
    if(!t.end)t.end=hm(mins(t.start)+60);
  }
  draft={members:t.members.slice(),priority:t.priority,status:t.status,subs:t.subtasks.map(s=>({id:s.id||uid(),t:s.t,done:!!s.done}))};
  const opt=(v,l,sel)=>'<option value="'+esc(v)+'"'+(v===sel?' selected':'')+'>'+esc(l)+'</option>';
  openSheet('<button type="button" class="x" data-close aria-label="Close">'+ic('x')+'</button><h3>'+(edit?'Edit task':'New task')+'</h3><p class="sub">'+(edit?'Created '+fmtD(t.created)+(t.done&&t.doneOn?' · completed '+fmtD(t.doneOn):''):'Tip: '+(isMac?'⌘':'Ctrl+')+'K quick-adds from one line of text.')+'</p>'+
  '<input class="title" name="title" placeholder="Task title" value="'+esc(t.title)+'" required maxlength="200" aria-label="Task title">'+
  '<textarea name="notes" rows="2" maxlength="5000" placeholder="Notes, links, acceptance criteria…" aria-label="Notes">'+esc(t.notes)+'</textarea>'+
  '<div class="field"><label>Status</label><div class="seg st" id="stseg">'+STATUS.map(([k,n])=>'<button type="button" data-st="'+k+'" class="'+(k===draft.status?'on':'')+'"><span class="dot s-'+k+'"></span>'+n+'</button>').join('')+'</div></div>'+
  '<div class="field"><label>Project</label><select name="project">'+opt('','No project',t.project)+S.projects.map(p=>opt(p.id,p.icon+' '+p.name,t.project)).join('')+'</select></div>'+
  '<div class="g2"><div class="field"><label>Date <a data-nodate>clear</a></label><input type="date" name="date" value="'+t.date+'"></div><div class="field"><label>Repeat</label><select name="recur">'+opt('','Does not repeat',t.recur||'')+Object.keys(RECUR).map(k=>opt(k,RECUR[k],t.recur||'')).join('')+'</select></div></div>'+
  '<div class="field"><label>Time</label><div class="g2"><input type="time" name="start" value="'+t.start+'" required aria-label="Start time"><input type="time" name="end" value="'+t.end+'" required aria-label="End time"></div></div>'+
  '<div class="g2"><div class="field"><label>Priority</label><div class="pri" id="pri">'+PRI.map(p=>'<button type="button" data-pri="'+p+'" class="'+(p===draft.priority?'on':'')+'">'+p+'</button>').join('')+'</div></div>'+
  '<div class="field"><label>Members</label><div class="mem" id="mem">'+MEMBERS.map((m,i)=>'<button type="button" data-mem="'+i+'" title="'+esc(m.n)+'" aria-pressed="'+(draft.members.includes(i))+'" style="background:'+m.c+'" class="'+(draft.members.includes(i)?'on':'')+'">'+m.i+'</button>').join('')+'</div></div></div>'+
  '<div class="field"><label>Tags</label><input name="tags" value="'+esc(t.tags.join(', '))+'" placeholder="design, research" maxlength="200"></div>'+
  '<div class="field"><label>Subtasks</label><div id="subs">'+subsHTML()+'</div><input class="subadd" placeholder="Add a subtask and press Enter" maxlength="200" aria-label="New subtask"></div>'+
  (edit&&!t.done?'<div class="field"><label>Focus</label><div class="fbtns">'+[25,50].map(m=>'<button type="button" data-focus="'+m+'">'+ic('play')+m+'m</button>').join('')+'<button type="button" data-focus="task">'+ic('play')+'Task length ('+fmtDur(dur(t))+')</button></div></div>':'')+
  '<div class="acts">'+(edit?'<button type="button" class="ghostb" data-deltask="'+t.id+'" aria-label="Delete task">'+ic('trash')+'</button><button type="button" class="ghostb" data-duptask="'+t.id+'" aria-label="Duplicate task">'+ic('copy')+'</button>':'<button type="button" data-save="draft">Save draft</button>')+'<button type="submit" class="pri-b" data-id="'+(edit?t.id:'')+'">'+(edit?'Save changes':'Create task')+'</button></div>');
  sheet.dataset.kind='task';
  setTimeout(()=>{const i=sheet.querySelector('.title');if(i&&!edit)i.focus()},300);
}
function collectSub(){const i=sheet.querySelector('.subadd');if(i&&i.value.trim()){draft.subs.push({id:uid(),t:i.value.trim().slice(0,200),done:false});i.value='';return true}return false}
function saveTask(f,id,asDraft){
  const title=(f.get('title')||'').trim();if(!title){toast('Add a title');sheet.querySelector('.title').focus();return}
  const s=f.get('start')||'09:00',en=f.get('end')||hm(mins(s)+60);
  if(mins(en)<=mins(s)){toast('End time must be after start');return}
  collectSub();
  const undo=snapshot();
  const data={title,notes:(f.get('notes')||'').trim(),project:f.get('project')||'',date:f.get('date')||'',start:s,end:en,priority:draft.priority,
    members:draft.members.length?draft.members:[0],tags:String(f.get('tags')||'').split(/[,\s]+/),subtasks:draft.subs,recur:f.get('recur')||null,draft:asDraft};
  let t;
  if(id){t=taskById(id);if(!t)return;const was=t.status;Object.assign(t,normTask(Object.assign({},t,data,{status:was})));if(draft.status!==was)setStatus(t,draft.status)}
  else{t=normTask(Object.assign({},data,{id:uid(),status:'todo',order:maxOrder()+1}));S.tasks.push(t);if(draft.status!=='todo')setStatus(t,draft.status)}
  save();closeSheet();snd.ok();
  toast(asDraft?'Draft saved':id?'Task updated':'Task created',undo);
  if(!asDraft&&!id&&t.date&&t.date!==today()&&ui.tab==='home'&&!ui.detail){ui.tab='schedule';ui.schedDate=t.date;render();return}
  render(true);
}
let pcolor=COLORS[0];
function projSheet(p){
  const edit=!!p;p=p||{name:'',desc:'',icon:'📌',color:COLORS[S.projects.length%COLORS.length]};pcolor=p.color;
  openSheet('<button type="button" class="x" data-close aria-label="Close">'+ic('x')+'</button><h3>'+(edit?'Edit project':'New project')+'</h3><p class="sub">Give it a name, a short description and a colour.</p><input class="title" name="pname" placeholder="Project name" required maxlength="60" value="'+esc(p.name)+'" aria-label="Project name"><div class="field"><label>Description</label><input name="pdesc" maxlength="160" placeholder="What is this about?" value="'+esc(p.desc)+'"></div><div class="g2"><div class="field"><label>Icon (emoji)</label><input name="picon" maxlength="8" value="'+esc(p.icon)+'"></div><div class="field"><label>Colour</label><div class="swatches">'+COLORS.map(c=>'<button type="button" data-color="'+c+'" style="background:'+c+'" class="'+(c===pcolor?'on':'')+'" aria-label="Colour '+c+'"></button>').join('')+'</div></div></div><div class="acts"><button type="submit" class="pri-b" data-pid="'+(edit?p.id:'')+'">'+(edit?'Save project':'Create project')+'</button></div>');
  sheet.dataset.kind='proj';
  setTimeout(()=>{const i=sheet.querySelector('.title');if(i&&!edit)i.focus()},300);
}
function helpSheet(){
  const k=isMac?'⌘':'Ctrl';
  const rows=[[k+' K','Command palette & quick add'],['/','Command palette'],['N','New task (full form)'],['P','Plan my day'],['1 – 5','Home, Board, Schedule, Performance, Projects'],['T','Toggle dark mode'],['F','Pause / resume focus'],['?','This help'],['Esc','Close']];
  const q=[['tomorrow 3pm','date + time (also today, fri, next monday, 24 oct, in 3 days, 2026-11-02)'],['2-4pm / 14:00-15:30','time range'],['for 45m / for 2h','duration'],['#design','project (fuzzy: #ds, #design)'],['!high  !!  p1 / !low','priority'],['@mk  @me','assign people'],['+research','tag'],['every weekday / daily / every fri','repeat']];
  openSheet('<button type="button" class="x" data-close aria-label="Close">'+ic('x')+'</button><h3>Shortcuts & quick add</h3><p class="sub">Type one line in the palette — FlowDeck works out the rest and finds a free slot when you give a date but no time.</p><div class="klist">'+rows.map(r=>'<div><kbd>'+r[0]+'</kbd><span>'+r[1]+'</span></div>').join('')+'</div><h3 style="margin-top:18px">Quick-add syntax</h3><div class="klist">'+q.map(r=>'<div><code>'+esc(r[0])+'</code><span>'+esc(r[1])+'</span></div>').join('')+'</div><p class="sub" style="margin-top:14px">Example: <code>Ship pricing page fri 2-4pm #design !high @mk +launch</code></p>');
}
sheet.addEventListener('submit',e=>{
  e.preventDefault();
  const f=new FormData(sheet);
  if(sheet.dataset.kind==='proj'){
    const n=(f.get('pname')||'').trim();if(!n)return;const btn=sheet.querySelector('[data-pid]'),pid=btn&&btn.dataset.pid;
    const data={name:n,desc:(f.get('pdesc')||'').trim()||'No description yet.',icon:(f.get('picon')||'').trim()||'📌',color:pcolor};
    if(pid){const p=S.projects.find(x=>x.id===pid);Object.assign(p,normProj(Object.assign({},p,data)))}
    else S.projects.push(normProj(Object.assign({id:uid()},data)));
    save();closeSheet();snd.ok();toast(pid?'Project updated':'Project created');render(true);return;
  }
  if(sheet.dataset.kind==='task'){const b=sheet.querySelector('[data-id]');saveTask(f,b&&b.dataset.id,false)}
});
sheet.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&e.target.classList.contains('subadd')){e.preventDefault();if(collectSub()){$('#subs').innerHTML=subsHTML();snd.tap()}}
  if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)&&sheet.dataset.kind){e.preventDefault();sheet.requestSubmit()}
});

/* ---------- command palette ---------- */
const palWrap=$('#palWrap'),palIn=$('#palIn'),palList=$('#palList');
let palItems=[],palSel=0;
function openPal(pre){palWrap.hidden=false;palIn.value=pre||'';palUpdate();setTimeout(()=>palIn.focus(),20);snd.open()}
function closePal(){palWrap.hidden=true}
function commands(){return [
  ['Go to Home',ic('home'),()=>go('home')],['Go to Board',ic('board'),()=>go('board')],['Go to Schedule',ic('cal'),()=>go('schedule')],
  ['Go to Performance',ic('pie'),()=>go('stats')],['Go to Projects & settings',ic('layers'),()=>go('projects')],
  ['Plan my day — auto-schedule overdue & backlog',ic('spark'),planDay],['New task (full form)',ic('plus'),()=>taskSheet()],['New project',ic('layers'),()=>projSheet()],
  [S.timer?'Stop focus session':'Start focus on next task',ic('clock'),()=>S.timer?stopFocus():focusNext()],
  ['Toggle dark mode',ic('moon'),toggleTheme],['Keyboard shortcuts & syntax',ic('kb'),helpSheet],['Export data',ic('copy'),exportData],['Import data',ic('copy'),importData]]}
function palUpdate(){
  const q=palIn.value.trim(),ql=q.toLowerCase(),out=[];
  const cmd=commands().filter(c=>!q||c[0].toLowerCase().includes(ql)).map(c=>({sec:'Commands',label:c[0],icon:c[1],run:c[2]}));
  const pq=q?parseQuick(q):null,hasMeta=pq&&(pq.date||pq.start||pq.project||pq.priority||pq.tags.length||pq.members.length||pq.recur);
  const create=pq&&pq.title?[{sec:'Create',label:'Create “'+pq.title+'”',icon:ic('plus'),meta:quickMeta(pq),run:()=>quickCreate(pq),alt:()=>{closePal();taskSheet(null,fromQuick(pq).task)}}]:[];
  const tasks=(q?S.tasks.filter(t=>(t.title+' '+t.notes+' '+t.tags.join(' ')).toLowerCase().includes(ql)).slice(0,8):sortT(live().filter(t=>!t.done&&t.date===today())).slice(0,5))
    .map(t=>({sec:q?'Tasks':'Today',label:t.title,icon:'<span class="pdot" style="background:'+proj(t.project).color+'"></span>',meta:[statusLabel(t),whenLabel(t)],run:()=>{closePal();taskSheet(t)}}));
  const projs=(q?S.projects.filter(p=>p.name.toLowerCase().includes(ql)):[]).map(p=>({sec:'Projects',label:p.icon+' '+p.name,icon:ic('layers'),run:()=>{closePal();openProj(p.id)}}));
  if(hasMeta||!cmd.length)out.push(...create,...tasks,...projs,...cmd);else out.push(...cmd,...create,...tasks,...projs);
  palItems=out;palSel=0;
  let last='';
  palList.innerHTML=out.map((it,i)=>{const h=it.sec!==last?'<div class="pal-sec">'+it.sec+'</div>':'';last=it.sec;
    return h+'<button type="button" class="pal-it'+(i===0?' on':'')+'" data-pi="'+i+'" role="option">'+it.icon+'<span class="pl">'+esc(it.label)+(it.meta?'<small>'+it.meta.map(esc).join(' · ')+'</small>':'')+'</span>'+(it.alt?'<kbd title="Shift+Enter">⇧↵ details</kbd>':'')+'</button>'}).join('')||'<div class="empty">No matches</div>';
}
function palMove(d){if(!palItems.length)return;palSel=(palSel+d+palItems.length)%palItems.length;$$('.pal-it',palList).forEach((b,i)=>b.classList.toggle('on',i===palSel));const on=$('.pal-it.on',palList);if(on)on.scrollIntoView({block:'nearest'})}
function palRun(i,alt){const it=palItems[i];if(!it)return;if(alt&&it.alt){it.alt();return}if(it.sec!=='Create'&&it.sec!=='Tasks'&&it.sec!=='Today'&&it.sec!=='Projects')closePal();it.run()}
palIn.addEventListener('input',palUpdate);
palIn.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){e.preventDefault();palMove(1)}else if(e.key==='ArrowUp'){e.preventDefault();palMove(-1)}
  else if(e.key==='Enter'){e.preventDefault();palRun(palSel,e.shiftKey)}else if(e.key==='Escape'){e.preventDefault();closePal()}
});

/* ---------- focus timer ---------- */
const timerEl=$('#timer');let tick=null;
const timerLeft=()=>{const T=S.timer;if(!T)return 0;return T.endsAt?Math.max(0,T.endsAt-Date.now()):T.left};
function startFocus(id,len){
  const t=taskById(id);if(!t)return;
  if(S.timer)stopFocus(true);
  len=len==='task'?Math.max(5,Math.min(180,dur(t))):+len||25;
  if(t.status==='todo'){t.status='doing'}
  S.timer={task:id,len,endsAt:Date.now()+len*60000,left:0};save();closeSheet();renderTimer();render(true);snd.ok();toast('Focus started · '+fmtDur(len));
}
function focusNext(){const n=sortT(live().filter(t=>!t.done&&t.date===today()&&mins(t.end)>nowMins()))[0]||sortT(live().filter(t=>!t.done&&t.status==='doing'))[0];if(!n){toast('No open task to focus on today');return}startFocus(n.id,25)}
function pauseFocus(){const T=S.timer;if(!T)return;if(T.endsAt){T.left=timerLeft();T.endsAt=0}else{T.endsAt=Date.now()+T.left;T.left=0}save();renderTimer();snd.tap()}
function stopFocus(silent,complete){
  const T=S.timer;if(!T)return;
  const spent=complete?T.len:Math.min(T.len,Math.round((T.len*60000-timerLeft())/60000));
  if(spent>=1)S.sessions.push({task:T.task,date:today(),mins:spent});
  S.timer=null;save();renderTimer();
  if(!silent){toast(spent>=1?'Logged '+fmtDur(spent)+' of focus':'Focus cancelled');render(true)}
}
function renderTimer(){
  const T=S.timer;
  if(!T){timerEl.hidden=true;clearInterval(tick);tick=null;return}
  const t=taskById(T.task);if(!t){S.timer=null;save();return renderTimer()}
  timerEl.hidden=false;
  const left=timerLeft(),sec=Math.ceil(left/1000),p=100-left/(T.len*60000)*100;
  $('#tmClock').textContent=Math.floor(sec/60)+':'+pad(sec%60);$('#tmTask').textContent=t.title;
  timerEl.style.setProperty('--p',p.toFixed(1)+'%');timerEl.classList.toggle('paused',!T.endsAt);
  $('[data-tpause]',timerEl).innerHTML=ic(T.endsAt?'pause':'play');$('[data-tpause]',timerEl).setAttribute('aria-label',T.endsAt?'Pause focus':'Resume focus');
  if(T.endsAt&&left<=0){const title=t.title,len=T.len;stopFocus(true,true);snd.bell();toast('Focus complete — '+fmtDur(len)+' logged');notify('Focus session complete',title);render(true);return}
  if(!tick)tick=setInterval(renderTimer,1000);
}

/* ---------- reminders ---------- */
const reminded=new Set();
function notify(title,body){
  if(!S.notify||!('Notification' in window)||Notification.permission!=='granted')return;
  const opts={body,icon:'icon.svg',tag:title+'|'+body};
  if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.ready.then(r=>r.showNotification(title,opts)).catch(()=>{});
  else{try{new Notification(title,opts)}catch(e){}}
}
function checkReminders(){
  if(!S.notify)return;const td=today(),nm=nowMins();
  live().forEach(t=>{if(t.done||t.date!==td)return;const d=mins(t.start)-nm,k=t.id+t.date+t.start;
    if(d>=0&&d<=5&&!reminded.has(k)){reminded.add(k);toast((d?'In '+d+' min: ':'Now: ')+t.title);snd.bell();notify(d?'Starts in '+d+' min':'Starting now',t.title)}});
}
setInterval(checkReminders,30000);

/* ---------- settings actions ---------- */
function applyTheme(){
  const r=document.documentElement;if(S.theme==='auto')r.removeAttribute('data-theme');else r.dataset.theme=S.theme;
  const m=$('meta[name=theme-color]');if(m)m.content=darkNow()?'#151413':'#eeece8';
}
function toggleTheme(){S.theme=darkNow()?'light':'dark';save();applyTheme();render(true)}
function exportData(){const b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='flowdeck-'+today()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Exported')}
function importData(){
  const inp=document.createElement('input');inp.type='file';inp.accept='application/json,.json';
  inp.onchange=()=>{const f=inp.files[0];if(!f)return;if(f.size>5e6){toast('File is larger than 5 MB');return}
    f.text().then(txt=>{let d;try{d=JSON.parse(txt)}catch(e){toast('That file is not valid JSON');return}
      if(!d||!Array.isArray(d.tasks)||!Array.isArray(d.projects)){toast('Not a FlowDeck export');return}
      const undo=snapshot();S=normState(d);S.timer=null;save();applyTheme();renderTimer();ui.detail=null;render();toast('Imported '+S.tasks.length+' tasks',undo)})};
  inp.click();
}
function toggleNotify(){
  if(S.notify){S.notify=false;save();render(true);return}
  const on=()=>{S.notify=true;save();render(true)};
  if(!('Notification' in window)){on();toast('Reminders will show in-app while FlowDeck is open');return}
  if(Notification.permission==='granted'){on();toast('Reminders on');return}
  Notification.requestPermission().then(p=>{on();toast(p==='granted'?'Reminders on':'Browser notifications blocked — in-app reminders only')});
}

/* ---------- board drag & drop ---------- */
let drag=null,suppress=false;
screen.addEventListener('pointerdown',e=>{
  const card=e.target.closest('.bcard');if(!card||e.button>0)return;
  const grip=!!e.target.closest('.grip');
  if(e.pointerType!=='mouse'&&!grip)return;
  drag={id:card.dataset.id,el:card,x0:e.clientX,y0:e.clientY,on:false,pid:e.pointerId};
  if(grip)e.preventDefault();
});
document.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.pid)return;
  if(!drag.on){if(Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<6)return;beginDrag(e)}
  e.preventDefault();moveDrag(e);
},{passive:false});
document.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.pid)return;if(drag.on)endDrag();drag=null});
document.addEventListener('pointercancel',()=>{if(drag&&drag.on)endDrag(true);drag=null});
function beginDrag(e){
  const r=drag.el.getBoundingClientRect(),g=drag.el.cloneNode(true);
  g.classList.add('ghost');g.style.width=r.width+'px';g.removeAttribute('data-edit');document.body.appendChild(g);
  drag.g=g;drag.ox=e.clientX-r.left;drag.oy=e.clientY-r.top;drag.on=true;drag.origin=drag.el.closest('.col').dataset.col;
  drag.el.classList.add('placeholder');document.body.classList.add('dragging');snd.tap();
}
function moveDrag(e){
  drag.g.style.transform='translate('+(e.clientX-drag.ox)+'px,'+(e.clientY-drag.oy)+'px) rotate(2deg)';
  const under=document.elementFromPoint(e.clientX,e.clientY),col=under&&under.closest('.col');
  $$('.col.over').forEach(c=>c!==col&&c.classList.remove('over'));
  if(col){col.classList.add('over');const box=$('.cards',col),cards=$$('.bcard:not(.placeholder)',box),before=cards.find(c=>{const r=c.getBoundingClientRect();return e.clientY<r.top+r.height/2});
    box.insertBefore(drag.el,before||$('.empty',box))}
  const b=$('#board');if(b){const br=b.getBoundingClientRect();if(e.clientX<br.left+40)b.scrollLeft-=14;else if(e.clientX>br.right-40)b.scrollLeft+=14}
  const sr=screen.getBoundingClientRect();if(e.clientY<sr.top+60)screen.scrollTop-=12;else if(e.clientY>sr.bottom-100)screen.scrollTop+=12;
}
function endDrag(cancel){
  drag.g.remove();document.body.classList.remove('dragging');$$('.col.over').forEach(c=>c.classList.remove('over'));
  suppress=true;setTimeout(()=>suppress=false,80);
  if(cancel){render(true);return}
  const col=drag.el.closest('.col'),st=col.dataset.col,t=taskById(drag.id),undo=snapshot();
  $$('.bcard',col).forEach((c,i)=>{const x=taskById(c.dataset.id);if(x)x.order=i});
  let msg='';
  if(t&&t.status!==st){setStatus(t,st);msg='Moved to '+STATUS.find(s=>s[0]===st)[1];if(st==='done')snd.ok();else snd.tap()}
  save();render(true);if(msg)toast(msg,undo);
}

/* ---------- events ---------- */
document.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse')return;const d=$('#device');if(!d.contains(e.target))return;
  const r=d.getBoundingClientRect(),el=document.createElement('span');el.className='ripple';
  el.style.left=(e.clientX-r.left)+'px';el.style.top=(e.clientY-r.top)+'px';d.appendChild(el);setTimeout(()=>el.remove(),520);
});
document.addEventListener('click',e=>{
  if(suppress){e.preventDefault();e.stopPropagation();return}
  const t=e.target.closest('button,a,[data-edit],[data-go],[data-proj],[data-slot],.scrim,[data-palclose]');if(!t)return;
  const D=t.dataset;
  if(t.id==='scrim'||D.close!==undefined){closeSheet();return}
  if(D.palclose!==undefined){closePal();return}
  if(D.pi!==undefined){palRun(+D.pi,e.shiftKey);return}
  if(D.undo!==undefined){if(undoFn){const f=undoFn;undoFn=null;f()}return}
  if(D.tab){snd.tab();go(D.tab);return}
  if(t.id==='fab'){snd.tap();taskSheet();return}
  if(D.palette!==undefined){openPal();return}
  if(D.toggle){e.stopPropagation();const k=taskById(D.toggle);if(k){const undo=snapshot();setStatus(k,k.done?'todo':'done');save();render(true);if(k.done){snd.ok();toast(k.recur?'Done — next one scheduled':'Task completed',undo)}else snd.tap()}return}
  if(D.mem!==undefined){const i=+D.mem,x=draft.members.indexOf(i);if(x>-1)draft.members.splice(x,1);else draft.members.push(i);t.classList.toggle('on',x<0);t.setAttribute('aria-pressed',x<0);snd.tap();return}
  if(D.pri){draft.priority=D.pri;$$('[data-pri]',sheet).forEach(b=>b.classList.toggle('on',b.dataset.pri===draft.priority));snd.tap();return}
  if(D.st){draft.status=D.st;$$('[data-st]',sheet).forEach(b=>b.classList.toggle('on',b.dataset.st===draft.status));snd.tap();return}
  if(D.subtog){const s=draft.subs.find(x=>x.id===D.subtog);if(s){s.done=!s.done;$('#subs').innerHTML=subsHTML();snd.tap()}return}
  if(D.subdel){draft.subs=draft.subs.filter(x=>x.id!==D.subdel);$('#subs').innerHTML=subsHTML();return}
  if(D.nodate!==undefined){e.preventDefault();const i=sheet.querySelector('[name=date]');if(i)i.value='';return}
  if(D.color){pcolor=safeColor(D.color);$$('[data-color]',sheet).forEach(b=>b.classList.toggle('on',b.dataset.color===pcolor));return}
  if(D.save==='draft'){saveTask(new FormData(sheet),null,true);return}
  if(D.deltask){const undo=snapshot();if(S.timer&&S.timer.task===D.deltask)stopFocus(true);S.tasks=S.tasks.filter(k=>k.id!==D.deltask);save();closeSheet();render(true);toast('Task deleted',undo);return}
  if(D.duptask){const k=taskById(D.duptask);if(k){const undo=snapshot(),c=normTask(Object.assign({},k,{id:uid(),series:'',title:k.title+' (copy)',status:'todo',done:false,doneOn:null,order:maxOrder()+1,created:today(),subtasks:k.subtasks.map(s=>({t:s.t,done:false}))}));c.series=c.id;S.tasks.push(c);save();closeSheet();render(true);toast('Duplicated',undo)}return}
  if(D.focus){const b=sheet.querySelector('[data-id]');if(b&&b.dataset.id)startFocus(b.dataset.id,D.focus);return}
  if(D.tpause!==undefined){pauseFocus();return}
  if(D.tstop!==undefined){stopFocus();return}
  if(D.topen!==undefined){if(S.timer)taskSheet(S.timer.task);return}
  if(D.plan!==undefined){planDay();return}
  if(D.range){ui.statRange=D.range;snd.tap();render(true);return}
  if(D.day){ui.schedDate=D.day;ui.tab='schedule';ui.detail=null;snd.tap();render(true);return}
  if(D.shift){ui.schedDate=ds(addDays(pd(ui.schedDate),+D.shift));snd.tap();render(true);return}
  if(D.slot!==undefined){const h=+D.slot;taskSheet(null,{date:ui.schedDate,start:pad(h)+':00',end:pad(Math.min(23,h+1))+':00'});return}
  if(D.newproj!==undefined){projSheet();return}
  if(D.editproj){projSheet(S.projects.find(p=>p.id===D.editproj));return}
  if(D.newin){taskSheet(null,{project:D.newin});return}
  if(D.addcol){taskSheet(null,{status:D.addcol,project:ui.detail||ui.boardProj||(S.projects[0]?S.projects[0].id:'')});return}
  if(D.delproj){const undo=snapshot(),n=S.tasks.filter(k=>k.project===D.delproj).length;S.projects=S.projects.filter(p=>p.id!==D.delproj);S.tasks=S.tasks.filter(k=>k.project!==D.delproj);if(S.timer&&!taskById(S.timer.task)){S.timer=null;renderTimer()}save();ui.detail=null;render();toast('Project and '+n+' tasks deleted',undo);return}
  if(D.back!==undefined){ui.detail=null;ui.tab=ui.from||'home';render();return}
  if(D.dmode){ui.detailMode=D.dmode;snd.tap();render(true);return}
  if(D.alldone!==undefined){ui.allDone=!ui.allDone;render(true);return}
  if(D.bproj!==undefined){ui.boardProj=D.bproj;snd.tap();render(true);return}
  if(D.sound!==undefined){S.sound=!S.sound;save();snd.tap();render(true);return}
  if(D.notify!==undefined){toggleNotify();return}
  if(D.help!==undefined){helpSheet();return}
  if(D.themeset){S.theme=D.themeset;save();applyTheme();render(true);return}
  if(D.themetoggle!==undefined){toggleTheme();return}
  if(D.export!==undefined){exportData();return}
  if(D.import!==undefined){importData();return}
  if(D.reset!==undefined){if(confirm('Replace all data with sample data?')){const undo=snapshot();S=seed();save();applyTheme();renderTimer();ui.detail=null;render();toast('Data reset',undo)}return}
  if(D.go){snd.tap();go(D.go);return}
  if(D.proj){snd.tap();openProj(D.proj);return}
  if(D.edit){const k=taskById(D.edit);if(k)taskSheet(k);return}
});
screen.addEventListener('input',e=>{if(e.target.id==='nm'){S.name=e.target.value.trim()||'You';save()}});
document.addEventListener('keydown',e=>{
  const tag=e.target.tagName,typing=/^(INPUT|TEXTAREA|SELECT)$/.test(tag)||e.target.isContentEditable;
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(palWrap.hidden){closeSheet();openPal()}else closePal();return}
  if(e.key==='Escape'){if(!palWrap.hidden)closePal();else closeSheet();return}
  if(typing||e.metaKey||e.ctrlKey||e.altKey||!palWrap.hidden||!wrap.hidden)return;
  const k=e.key;
  if(k==='Enter'&&e.target.dataset&&e.target.dataset.edit){e.preventDefault();taskSheet(e.target.dataset.edit);return}
  if(k==='/'||k==='k'){e.preventDefault();openPal()}
  else if(k==='n'){e.preventDefault();taskSheet()}
  else if(k.length===1&&'12345'.includes(k)){snd.tab();go(['home','board','schedule','stats','projects'][+k-1])}
  else if(k==='p')planDay();else if(k==='?')helpSheet();else if(k==='t')toggleTheme();else if(k==='f'&&S.timer)pauseFocus();
});
window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){S=load();DM=null;applyTheme();renderTimer();render(true)}});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(S.theme==='auto'){applyTheme();render(true)}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){DM=null;render(true);renderTimer()}});

applyTheme();render();renderTimer();checkReminders();
if(new URLSearchParams(location.search).get('quick')!==null)setTimeout(()=>openPal(),200);
if('serviceWorker' in navigator&&location.protocol==='https:'||location.hostname==='localhost')navigator.serviceWorker&&navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__flowdeck={parseQuick,findSlot,fromQuick,state:()=>S};
})();
