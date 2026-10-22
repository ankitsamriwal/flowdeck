(function(){
'use strict';
var KEY='flowdeck.v1';
var $=function(s,r){return (r||document).querySelector(s)};
var screen=$('#screen'),toastEl=$('#toast');
var MEMBERS=[{i:'AS',c:'#6b6a66'},{i:'MK',c:'#b4552d'},{i:'LJ',c:'#d49a3a'},{i:'RT',c:'#4f7a6a'}];
var COLORS=['#2a2926','#ee6c2b','#4f7a6a','#d49a3a','#6a5acd'];
function pad(n){return n<10?'0'+n:''+n}
function ds(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function pd(s){var p=s.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x}
function today(){return ds(new Date())}
function uid(){return Math.random().toString(36).slice(2,9)}
function mins(t){var p=t.split(':');return +p[0]*60+ +p[1]}
function dur(t){return Math.max(0,mins(t.end)-mins(t.start))}
function fmtT(t){var h=+t.split(':')[0],m=t.split(':')[1];return (h%12||12)+':'+m+(h<12?'am':'pm')}
function fmtDur(m){return Math.floor(m/60)+'h '+pad(m%60)+'m'}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

function seed(){
  var t=new Date(),P=[
    {id:'p1',name:'Decision making',desc:'Analysing drop-off rates and metrics.',icon:'\uD83C\uDF3F',color:COLORS[0]},
    {id:'p2',name:'Design system',desc:'Wing peppers, tokens and Bianca green.',icon:'\uD83C\uDF4E',color:COLORS[1]},
    {id:'p3',name:'Exploration phase',desc:'Early concepts and user interviews.',icon:'\uD83D\uDCA1',color:COLORS[2]}
  ];
  var T=[],defs=[
    ['Website design development','p1',0,'10:15','11:15','Medium',0],
    ['Client reviews and feedback','p1',0,'12:00','13:00','Low',1],
    ['Wireframing and brainstorming','p3',0,'09:15','10:15','Medium',0],
    ['Design system planning','p2',0,'14:00','15:30','High',0],
    ['User interview synthesis','p1',0,'16:00','17:00','Medium',0],
    ['Drop-off funnel dashboard','p1',2,'10:00','12:00','High',0],
    ['Stakeholder readout','p1',4,'15:00','16:00','Medium',0],
    ['Design style finalization','p2',1,'19:00','20:00','Low',0]
  ];
  defs.forEach(function(d){T.push({id:uid(),title:d[0],project:d[1],date:ds(addDays(t,d[2])),start:d[3],end:d[4],priority:d[5],done:!!d[6],members:[0,1,2].slice(0,1+Math.floor(Math.random()*3)),draft:false,doneOn:d[6]?ds(t):null})});
  for(var i=1;i<=40;i++){
    if(Math.random()<.2)continue;
    var n=1+Math.floor(Math.random()*3);
    for(var k=0;k<n;k++){
      var pr=P[Math.floor(Math.random()*P.length)].id,sh=9+k*3,len=1+Math.floor(Math.random()*2);
      var dd=ds(addDays(t,-i));
      T.push({id:uid(),title:['Review mocks','Sprint planning','Research notes','Prototype pass','QA walkthrough'][Math.floor(Math.random()*5)],project:pr,date:dd,start:pad(sh)+':00',end:pad(sh+len)+':00',priority:'Medium',done:true,members:[0],draft:false,doneOn:dd});
    }
  }
  return {name:'Salung',sound:true,projects:P,tasks:T};
}
var S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.tasks)S=seed();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
save();

var ui={tab:'home',detail:null,schedDate:today(),statRange:'Month',filter:''};

/* sound */
var AC;
function beep(f,d,v){
  if(!S.sound)return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    var o=AC.createOscillator(),g=AC.createGain();
    o.type='sine';o.frequency.value=f;g.gain.value=v||.04;
    g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);
    o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d);
  }catch(e){}
}
var snd={tap:function(){beep(520,.07)},tab:function(){beep(660,.09)},ok:function(){beep(784,.09);setTimeout(function(){beep(1046,.14)},80)},open:function(){beep(440,.12)}};
function toast(m){toastEl.textContent=m;toastEl.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){toastEl.classList.remove('show')},1800)}

/* helpers on data */
function proj(id){return S.projects.filter(function(p){return p.id===id})[0]||{name:'None',icon:'\u2022',color:'#999'}}
function ptasks(id){return S.tasks.filter(function(t){return t.project===id&&!t.draft})}
function pct(id){var a=ptasks(id);if(!a.length)return 0;return Math.round(a.filter(function(t){return t.done}).length/a.length*100)}
function doneMins(day){return S.tasks.reduce(function(a,t){return a+(t.done&&t.doneOn===day?dur(t):0)},0)}
function lastDays(n,from){var o=[];for(var i=n-1;i>=0;i--)o.push(ds(addDays(from||new Date(),-i)));return o}
function sortT(a){return a.slice().sort(function(x,y){return (x.date+x.start).localeCompare(y.date+y.start)})}
function whenLabel(t){var td=today();if(t.date===td)return 'Today: '+fmtT(t.start);var d=pd(t.date);return d.toLocaleDateString('en',{month:'short',day:'numeric'})+', '+fmtT(t.start)}
function statusLabel(t){return t.done?'Completed':t.draft?'Draft':(t.date<today()?'Overdue':t.date===today()?'Upcoming':'Scheduled')}
function avatars(t){return '<div class="av">'+(t.members||[]).map(function(i){var m=MEMBERS[i]||MEMBERS[0];return '<span style="background:'+m.c+'">'+m.i+'</span>'}).join('')+'</div>'}

function taskHTML(t,showDel){
  return '<div class="card task'+(t.done?' done':'')+'" data-edit="'+t.id+'"><span class="stripe"></span><div class="body"><p class="t">'+esc(t.title)+'</p><p class="s">'+statusLabel(t)+' &middot; '+esc(proj(t.project).name)+'</p><div class="meta">'+avatars(t)+'<span>'+whenLabel(t)+'</span></div></div><button class="chk" data-toggle="'+t.id+'" aria-label="Toggle done"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></button></div>';
}

/* views */
function heatHTML(){
  var days=lastDays(42);
  var cells=days.map(function(d){var m=doneMins(d);var l=m===0?'':m<90?'l1':m<180?'l2':'l3';return '<i class="'+l+'"></i>'}).join('');
  var a=0,b=0;lastDays(7).forEach(function(d){a+=doneMins(d)});lastDays(7,addDays(new Date(),-7)).forEach(function(d){b+=doneMins(d)});
  var ch=b?Math.round((a-b)/b*100):(a?100:0);
  return '<div class="heat">'+cells+'<span class="badge">'+(ch>=0?'+':'')+ch+'%</span></div>';
}
function miniBars(id){
  var days=lastDays(7),vals=days.map(function(d){return S.tasks.reduce(function(a,t){return a+(t.project===id&&t.done&&t.doneOn===d?1:0)},0)});
  var mx=Math.max.apply(null,vals.concat([1]));
  return vals.map(function(v,i){return '<i class="'+(i===vals.indexOf(mx)?'on':'')+'" style="height:'+(18+v/mx*70)+'%"></i>'}).join('');
}
function homeView(){
  var q=ui.filter.toLowerCase();
  var ps=S.projects.filter(function(p){return !q||p.name.toLowerCase().indexOf(q)>-1});
  var ts=sortT(S.tasks.filter(function(t){return !t.draft&&(q?(t.title.toLowerCase().indexOf(q)>-1):t.date===today())}));
  return '<div class="view"><div class="hdr"><h1>Welcome, '+esc(S.name)+'</h1><div class="ic"><button class="ib" data-go="schedule" aria-label="Notifications"><svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/></svg></button><button class="ib" data-go="schedule" aria-label="Calendar"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18"/></svg></button></div></div>'+
  '<div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="q" placeholder="Search project, task, event..." value="'+esc(ui.filter)+'"></div>'+
  '<div class="card perf" data-go="stats"><div><b>See your<br>performance</b><span class="btn">Check now</span></div>'+heatHTML()+'</div>'+
  '<div class="sec"><h2>Projects</h2><a data-go="projects">See all</a></div><div class="hscroll">'+
  (ps.map(function(p){return '<button class="card pcard" data-proj="'+p.id+'"><div class="viz"><div class="bars">'+miniBars(p.id)+'</div></div><h3>'+esc(p.name)+'</h3><p>'+esc(p.desc)+'</p><div class="prog"><div class="bar"><span style="width:'+pct(p.id)+'%"></span></div>'+pct(p.id)+'%</div></button>'}).join('')||'<div class="empty">No projects match.</div>')+'</div>'+
  '<div class="sec"><h2>'+(q?'Matching tasks':'Today\u2019s tasks')+'</h2><a data-go="schedule">See all</a></div><div id="tasklist">'+
  (ts.map(function(t){return taskHTML(t)}).join('')||'<div class="empty">Nothing here. Tap + to add a task.</div>')+'</div></div>';
}
function detailView(){
  var p=proj(ui.detail),ts=sortT(ptasks(p.id)),done=ts.filter(function(t){return t.done}).length;
  var days=lastDays(7),vals=days.map(function(d){return S.tasks.reduce(function(a,t){return a+(t.project===p.id&&t.done&&t.doneOn===d?1:0)},0)});
  var mx=Math.max.apply(null,vals.concat([1])),top=vals.indexOf(mx);
  var due=ts.filter(function(t){return !t.done}).map(function(t){return t.date}).sort().pop();
  var bars=vals.map(function(v,i){return '<i class="'+(i===top?'on':'')+'" style="height:'+(14+v/mx*80)+'%">'+(v?'<em>'+v+'</em>':'')+'</i>'}).join('');
  return '<div class="view"><div class="hdr"><button class="back" data-go="home" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><h1>'+esc(p.name)+'</h1><button class="ib" data-delproj="'+p.id+'" aria-label="Delete project"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div>'+
  '<div class="card"><div class="bars" style="height:100px;padding:16px 0 0">'+bars+'</div><h3 style="margin:12px 0 3px;font-size:13px">Weekly progress</h3><p style="margin:0 0 9px;font-size:11px;color:var(--mute)">'+esc(p.desc)+'</p><div class="prog"><div class="bar"><span style="width:'+pct(p.id)+'%"></span></div>'+pct(p.id)+'%</div></div>'+
  '<div class="stats3"><div class="card"><small>Tasks</small><b>'+ts.length+'</b></div><div class="card"><small>Completed</small><b>'+done+'</b></div><div class="card"><small>Due date</small><b>'+(due?pd(due).toLocaleDateString('en',{month:'short',day:'numeric'}):'-')+'</b></div></div>'+
  '<div class="sec"><h2>Project tasks</h2></div>'+(ts.map(function(t){return taskHTML(t)}).join('')||'<div class="empty">No tasks yet.</div>')+'</div>';
}
function rangeDays(){return ui.statRange==='Week'?7:ui.statRange==='Month'?30:365}
function statsView(){
  var n=rangeDays(),cur=lastDays(n),prev=lastDays(n,addDays(new Date(),-n));
  var sum=function(arr){return arr.reduce(function(a,d){return a+doneMins(d)},0)};
  var a=sum(cur),b=sum(prev),ch=b?Math.round((a-b)/b*100):(a?100:0);
  var curSet={};cur.forEach(function(d){curSet[d]=1});
  var cols=n===365?52:n===30?30:7,sz=n===7?7:n===30?30:cur.slice(-84);
  var heatDays=n===365?lastDays(84):cur;
  var heat=heatDays.map(function(d){var m=doneMins(d);var l=m===0?'':m<90?'l1':m<180?'l2':'l3';return '<i class="'+l+'"></i>'}).join('');
  var gcols=n===7?7:n===30?15:14;
  var byP=S.projects.map(function(p){var m=S.tasks.reduce(function(x,t){return x+(t.project===p.id&&t.done&&curSet[t.doneOn]?dur(t):0)},0);return {p:p,m:m}}).sort(function(x,y){return y.m-x.m});
  var tot=a||1;
  var doneN=S.tasks.filter(function(t){return t.done&&curSet[t.doneOn]}).length;
  var avg=Math.round(a/n);
  return '<div class="view"><div class="hdr"><h1>Performance</h1></div><div class="seg">'+['Week','Month','Year'].map(function(r){return '<button data-range="'+r+'" class="'+(r===ui.statRange?'on':'')+'">'+r+'</button>'}).join('')+'</div>'+
  '<div class="card"><small style="font-size:11px;color:var(--mute)">Focused time</small><div class="big">'+fmtDur(a)+' <small>'+(ch>=0?'+':'')+ch+'% vs previous</small></div><div class="heat" style="max-width:none;margin-top:12px;grid-template-columns:repeat('+gcols+',1fr)">'+heat+'</div></div>'+
  '<div class="sec" style="margin-top:16px"><h2>Time by project</h2><a data-go="projects">See all</a></div>'+
  byP.map(function(x){return '<div class="card tp"><div class="em">'+x.p.icon+'</div><div class="m"><b>'+esc(x.p.name)+'<span>'+fmtDur(x.m)+' &middot; '+Math.round(x.m/tot*100)+'%</span></b><div class="bar"><span style="width:'+Math.round(x.m/tot*100)+'%;background:'+x.p.color+'"></span></div></div></div>'}).join('')+
  '<div class="two"><div class="card"><small>Tasks done</small><b>'+doneN+'</b></div><div class="card"><small>Avg. daily focus</small><b>'+fmtDur(avg)+'</b></div></div></div>';
}
function schedView(){
  var sel=pd(ui.schedDate),mon=addDays(sel,-((sel.getDay()+6)%7));
  var names=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var strip=names.map(function(nm,i){var d=addDays(mon,i),k=ds(d);return '<button data-day="'+k+'" class="'+(k===ui.schedDate?'on':'')+'">'+nm+'<b>'+d.getDate()+'</b></button>'}).join('');
  var ev=sortT(S.tasks.filter(function(t){return t.date===ui.schedDate&&!t.draft}));
  var rows='';
  for(var h=8;h<=21;h++){
    var here=ev.filter(function(t){return +t.start.split(':')[0]===h||(h===8&&+t.start.split(':')[0]<8)});
    rows+='<div class="row"><div class="hr">'+((h%12||12)+(h<12?' AM':' PM'))+'</div><div class="slot">'+here.map(function(t){return '<button class="ev'+(t.done?' done':'')+'" data-edit="'+t.id+'" style="border-left-color:'+proj(t.project).color+'"><b>'+esc(t.title)+'</b><small>'+fmtT(t.start)+' - '+fmtT(t.end)+' &middot; '+esc(proj(t.project).name)+'</small></button>'}).join('')+'</div></div>';
  }
  return '<div class="view"><div class="hdr"><button class="back" data-shift="-7" aria-label="Previous week"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><h1>Schedule</h1><button class="back" data-shift="7" aria-label="Next week"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>'+
  '<div style="font-size:12px;color:var(--mute);margin:-4px 0 10px;display:flex;justify-content:space-between"><span>'+sel.toLocaleDateString('en',{month:'long',year:'numeric'})+'</span><a data-day="'+today()+'" style="cursor:pointer;color:var(--ink)">Today</a></div><div class="strip">'+strip+'</div>'+
  (ev.length?'':'<div class="empty">No events this day.</div>')+'<div class="tl">'+rows+'</div></div>';
}
function projectsView(){
  return '<div class="view"><div class="hdr"><h1>Projects</h1><button class="ib" data-newproj aria-label="New project"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button></div>'+
  S.projects.map(function(p){return '<button class="card tp" style="width:100%;text-align:left" data-proj="'+p.id+'"><div class="em">'+p.icon+'</div><div class="m"><b>'+esc(p.name)+'<span>'+pct(p.id)+'%</span></b><div class="bar"><span style="width:'+pct(p.id)+'%;background:'+p.color+'"></span></div></div></button>'}).join('')+
  '<div class="sec" style="margin-top:18px"><h2>Profile</h2></div><div class="ph">'+esc((S.name||'?').charAt(0).toUpperCase())+'</div>'+
  '<div class="field"><label>Your name</label><input id="nm" value="'+esc(S.name)+'"></div>'+
  '<button class="lbtn" data-sound>Sound effects: <b>'+(S.sound?'On':'Off')+'</b></button>'+
  '<button class="lbtn" data-export>Export data (JSON)</button>'+
  '<button class="lbtn danger" data-reset>Reset to sample data</button>'+
  '<p class="soundtog">Everything is stored on this device only (localStorage).</p></div>';
}
function render(keepScroll){
  var y=screen.scrollTop;
  var v=ui.detail?detailView():ui.tab==='home'?homeView():ui.tab==='stats'?statsView():ui.tab==='schedule'?schedView():projectsView();
  screen.innerHTML=v;
  if(keepScroll)screen.scrollTop=y;else screen.scrollTop=0;
  document.querySelectorAll('#tabbar [data-tab]').forEach(function(b){b.classList.toggle('on',!ui.detail&&b.dataset.tab===ui.tab)});
  if(ui.detail)document.querySelectorAll('#tabbar [data-tab]').forEach(function(b){b.classList.toggle('on',b.dataset.tab==='home')});
}
function go(tab){ui.tab=tab;ui.detail=null;render()}

/* sheet */
var wrap=$('#sheetWrap'),sheet=$('#sheet');
function openSheet(html){sheet.innerHTML=html;wrap.hidden=false;snd.open()}
function closeSheet(){wrap.hidden=true;sheet.innerHTML=''}
var draftMembers=[0],draftPri='Medium';
function taskSheet(t){
  var edit=!!t;t=t||{title:'',project:ui.detail||S.projects[0]&&S.projects[0].id,date:ui.tab==='schedule'?ui.schedDate:today(),start:'14:00',end:'15:30',priority:'Medium',members:[0]};
  draftMembers=(t.members||[0]).slice();draftPri=t.priority;
  if(!S.projects.length){toast('Create a project first');return}
  openSheet('<button type="button" class="x" data-close>&#10005;</button><h3>'+(edit?'Edit task':'New task')+'</h3><p class="sub">Map the steps and flag what matters.</p>'+
  '<input class="title" name="title" placeholder="Task title" value="'+esc(t.title)+'" required maxlength="80">'+
  '<div class="field"><label>Project</label><select name="project">'+S.projects.map(function(p){return '<option value="'+p.id+'"'+(p.id===t.project?' selected':'')+'>'+p.icon+' '+esc(p.name)+'</option>'}).join('')+'</select></div>'+
  '<div class="g2"><div class="field"><label>Date</label><input type="date" name="date" value="'+t.date+'" required></div><div class="field"><label>Time</label><div class="g2"><input type="time" name="start" value="'+t.start+'" required><input type="time" name="end" value="'+t.end+'" required></div></div></div>'+
  '<div class="field"><label>Members</label><div class="av" id="mem" style="gap:10px">'+MEMBERS.map(function(m,i){return '<button type="button" data-mem="'+i+'" style="width:34px;height:34px;border-radius:50%;background:'+m.c+';color:#fff;font-size:11px;font-weight:700;opacity:'+(draftMembers.indexOf(i)>-1?1:.3)+'">'+m.i+'</button>'}).join('')+'</div></div>'+
  '<div class="field"><label>Priority</label><div class="pri" id="pri">'+['Low','Medium','High'].map(function(p){return '<button type="button" data-pri="'+p+'" class="'+(p===t.priority?'on':'')+'">'+p+'</button>'}).join('')+'</div></div>'+
  '<div class="acts">'+(edit?'<button type="button" data-deltask="'+t.id+'">Delete</button>':'<button type="button" data-save="draft">Save draft</button>')+'<button type="submit" class="pri-b" data-save="create" data-id="'+(edit?t.id:'')+'">'+(edit?'Save changes':'Create task')+'</button></div>');
  setTimeout(function(){var i=sheet.querySelector('.title');if(i&&!edit)i.focus()},350);
}
function projSheet(){
  openSheet('<button type="button" class="x" data-close>&#10005;</button><h3>New project</h3><p class="sub">Give it a name and a short description.</p><input class="title" name="pname" placeholder="Project name" required maxlength="40"><div class="field"><label>Description</label><input name="pdesc" maxlength="80" placeholder="What is this about?"></div><div class="field"><label>Icon</label><input name="picon" maxlength="2" value="\uD83D\uDCCC"></div><div class="acts"><button type="submit" class="pri-b" data-save="proj">Create project</button></div>');
}
sheet.addEventListener('submit',function(e){
  e.preventDefault();
  var f=new FormData(sheet),btn=e.submitter||sheet.querySelector('[data-save]');
  if(f.get('pname')!==null&&f.has('pname')){
    var n=f.get('pname').trim();if(!n)return;
    S.projects.push({id:uid(),name:n,desc:(f.get('pdesc')||'').trim()||'No description yet.',icon:f.get('picon')||'\uD83D\uDCCC',color:COLORS[S.projects.length%COLORS.length]});
    save();closeSheet();snd.ok();toast('Project created');render(true);return;
  }
  saveTask(f,btn&&btn.dataset.id,false);
});
function saveTask(f,id,draft){
  var title=(f.get('title')||'').trim();if(!title){toast('Add a title');return}
  var s=f.get('start'),en=f.get('end');
  if(mins(en)<=mins(s)){toast('End must be after start');return}
  var data={title:title,project:f.get('project'),date:f.get('date'),start:s,end:en,priority:draftPri,members:draftMembers.length?draftMembers:[0],draft:draft};
  if(id){S.tasks.forEach(function(t){if(t.id===id){Object.assign(t,data)}})}
  else S.tasks.push(Object.assign({id:uid(),done:false,doneOn:null},data));
  save();closeSheet();snd.ok();toast(draft?'Draft saved':id?'Task updated':'Task created');
  if(!draft&&!id&&data.date!==today()&&ui.tab==='home'&&!ui.detail){ui.tab='schedule';ui.schedDate=data.date}
  render(true);
}

/* events */
document.addEventListener('pointerdown',function(e){
  var d=$('#device');if(!d.contains(e.target))return;
  var r=d.getBoundingClientRect(),el=document.createElement('span');el.className='ripple';
  el.style.left=(e.clientX-r.left-10)+'px';el.style.top=(e.clientY-r.top-10)+'px';d.appendChild(el);setTimeout(function(){el.remove()},520);
});
document.addEventListener('click',function(e){
  var t=e.target.closest('#scrim,button,[data-go],[data-proj],[data-edit],a[data-day]');if(!t)return;
  var D=t.dataset;
  if(D.close!==undefined||t.id==='scrim'){closeSheet();return}
  if(D.tab){snd.tab();go(D.tab);return}
  if(t.id==='fab'){snd.tap();taskSheet();return}
  if(D.toggle){e.stopPropagation();var id=D.toggle;S.tasks.forEach(function(k){if(k.id===id){k.done=!k.done;k.doneOn=k.done?today():null;if(k.done){snd.ok();toast('Task completed')}else snd.tap()}});save();render(true);return}
  if(D.mem!==undefined){var i=+D.mem,x=draftMembers.indexOf(i);if(x>-1)draftMembers.splice(x,1);else draftMembers.push(i);t.style.opacity=x>-1?.3:1;snd.tap();return}
  if(D.pri){draftPri=D.pri;sheet.querySelectorAll('[data-pri]').forEach(function(b){b.classList.toggle('on',b.dataset.pri===draftPri)});snd.tap();return}
  if(D.save==='draft'){saveTask(new FormData(sheet),null,true);return}
  if(D.deltask){S.tasks=S.tasks.filter(function(k){return k.id!==D.deltask});save();closeSheet();toast('Task deleted');render(true);return}
  if(D.range){ui.statRange=D.range;snd.tap();render(true);return}
  if(D.day){ui.schedDate=D.day;ui.tab='schedule';ui.detail=null;snd.tap();render(true);return}
  if(D.shift){ui.schedDate=ds(addDays(pd(ui.schedDate),+D.shift));snd.tap();render(true);return}
  if(D.newproj!==undefined){projSheet();return}
  if(D.delproj){if(confirm('Delete this project and its tasks?')){S.projects=S.projects.filter(function(p){return p.id!==D.delproj});S.tasks=S.tasks.filter(function(k){return k.project!==D.delproj});save();ui.detail=null;ui.tab='home';render();toast('Project deleted')}return}
  if(D.sound!==undefined){S.sound=!S.sound;save();snd.tap();render(true);return}
  if(D.export!==undefined){var b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='flowdeck-data.json';a.click();return}
  if(D.reset!==undefined){if(confirm('Replace all data with sample data?')){S=seed();save();ui.detail=null;render();toast('Data reset')}return}
  if(D.go){snd.tap();go(D.go);return}
  if(D.proj){snd.tap();ui.detail=D.proj;render();return}
  if(D.edit){var tk=S.tasks.filter(function(k){return k.id===D.edit})[0];if(tk)taskSheet(tk);return}
});
document.addEventListener('click',function(e){var c=e.target.closest('[data-go],[data-edit]');if(c&&c.dataset.go&&c.classList.contains('perf')){}});
screen.addEventListener('input',function(e){
  if(e.target.id==='q'){ui.filter=e.target.value;var pos=e.target.selectionStart;render(true);var q=$('#q');q.focus();q.setSelectionRange(pos,pos)}
  if(e.target.id==='nm'){S.name=e.target.value.trim()||'You';save()}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet()});
render();
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){navigator.serviceWorker.register('sw.js').catch(function(){})}
})();
