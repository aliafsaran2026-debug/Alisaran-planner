const KEY="aliSaranPlanner_v1";
let data=JSON.parse(localStorage.getItem(KEY))||{
 tasks:[], goals:[], habits:[], challenge:Array(90).fill(false), startDate:null
};
if(!data.startDate)data.startDate=new Date().toISOString().slice(0,10);

const $=id=>document.getElementById(id);
const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));render()};
const uid=()=>Date.now()+Math.random().toString(16).slice(2);

function formatDate(){
 const d=new Date();
 return d.toLocaleDateString("fa-AF",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
}
$("todayDate").textContent=formatDate();

function showPage(page){
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 $(page).classList.add("active");
 document.querySelectorAll(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.page===page));
 const titles={dashboard:"داشبورد",tasks:"کارها",goals:"اهداف",habits:"عادت‌ها",challenge:"چالش ۹۰ روزه"};
 $("pageTitle").textContent=titles[page];
 document.querySelector(".sidebar").classList.remove("open");
}
window.showPage=showPage;

document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
$("menuBtn").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");

function openModal(id){$(id).classList.add("open")}
function closeModal(id){$(id).classList.remove("open")}
window.openModal=openModal;window.closeModal=closeModal;

document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("open")}));

function addTask(){
 const title=$("taskTitle").value.trim(); if(!title)return;
 data.tasks.push({id:uid(),title,priority:$("taskPriority").value,done:false});
 $("taskTitle").value="";closeModal("taskModal");toast("کار اضافه شد");save();
}
window.addTask=addTask;

function toggleTask(id){const t=data.tasks.find(x=>x.id===id);if(t)t.done=!t.done;save()}
function deleteTask(id){data.tasks=data.tasks.filter(x=>x.id!==id);save()}

function addGoal(){
 const title=$("goalTitle").value.trim();if(!title)return;
 data.goals.push({id:uid(),title,deadline:$("goalDeadline").value,progress:0});
 $("goalTitle").value="";$("goalDeadline").value="";closeModal("goalModal");toast("هدف اضافه شد");save();
}
window.addGoal=addGoal;
function changeGoal(id,val){const g=data.goals.find(x=>x.id===id);if(g)g.progress=+val;save()}
function deleteGoal(id){data.goals=data.goals.filter(x=>x.id!==id);save()}

function addHabit(){
 const title=$("habitTitle").value.trim();if(!title)return;
 data.habits.push({id:uid(),title,done:false});
 $("habitTitle").value="";closeModal("habitModal");toast("عادت اضافه شد");save();
}
window.addHabit=addHabit;
function toggleHabit(id){const h=data.habits.find(x=>x.id===id);if(h)h.done=!h.done;save()}
function deleteHabit(id){data.habits=data.habits.filter(x=>x.id!==id);save()}

function currentDay(){
 const start=new Date(data.startDate+"T00:00:00"),now=new Date();
 const diff=Math.floor((new Date(now.toDateString())-start)/86400000)+1;
 return Math.min(90,Math.max(1,diff));
}
function challengeProgress(){return data.challenge.filter(Boolean).length}
function completeToday(){
 const d=currentDay();data.challenge[d-1]=true;toast("امروز ثبت شد ✓");save();
}
$("completeDay").onclick=completeToday;

function renderTasks(){
 const html=(limit=false)=>data.tasks.slice(limit?0:0,limit?5:999).map(t=>`
 <div class="item">
   <button class="check ${t.done?"done":""}" onclick="toggleTask('${t.id}')">${t.done?"✓":""}</button>
   <span class="item-title ${t.done?"done-text":""}">${esc(t.title)}</span>
   <span class="priority ${t.priority}">${t.priority==="high"?"مهم":t.priority==="medium"?"متوسط":"کم"}</span>
   ${!limit?`<button class="delete" onclick="deleteTask('${t.id}')">×</button>`:""}
 </div>`).join("")||`<p class="muted">هنوز کاری اضافه نشده.</p>`;
 $("dashboardTasks").innerHTML=html(true);$("allTasks").innerHTML=html(false);
}
function renderHabits(){
 const html=data.habits.map(h=>`
 <div class="habit">
   <button class="check ${h.done?"done":""}" onclick="toggleHabit('${h.id}')">${h.done?"✓":""}</button>
   <span class="habit-name">${esc(h.title)}</span>
   <button class="delete" onclick="deleteHabit('${h.id}')">×</button>
 </div>`).join("")||`<p class="muted">هنوز عادتی اضافه نشده.</p>`;
 $("dashboardHabits").innerHTML=data.habits.slice(0,5).map(h=>`
 <div class="item"><button class="check ${h.done?"done":""}" onclick="toggleHabit('${h.id}')">${h.done?"✓":""}</button><span class="item-title ${h.done?"done-text":""}">${esc(h.title)}</span></div>`).join("")||`<p class="muted">هنوز عادتی اضافه نشده.</p>`;
 $("allHabits").innerHTML=html;
}
function renderGoals(){
 $("allGoals").innerHTML=data.goals.map(g=>`
 <div class="goal">
  <div class="goal-title">${esc(g.title)}</div>
  <div class="goal-date">${g.deadline?"تا "+new Date(g.deadline+"T00:00:00").toLocaleDateString("fa-AF"):"بدون مهلت"}</div>
  <div class="goal-controls"><input type="range" min="0" max="100" value="${g.progress}" oninput="changeGoal('${g.id}',this.value)"><span class="goal-percent">${g.progress}%</span><button class="delete" onclick="deleteGoal('${g.id}')">×</button></div>
 </div>`).join("")||`<div class="card"><p class="muted">هنوز هدف اضافه نشده.</p></div>`;
}
function renderChallenge(){
 const done=challengeProgress(),p=Math.round(done/90*100),day=currentDay();
 $("dayNumber").textContent=String(day).padStart(2,"0");
 $("challengePercent").textContent=p+"%";$("challengeBar").style.width=p+"%";
 $("challengeBar2").style.width=p+"%";$("challengeDayBig").textContent=day+" / 90";
 $("challengeText").textContent=done?`${done} روز از ۹۰ روز ثبت شده است.`:"هنوز روزی ثبت نشده است.";
 $("daysGrid").innerHTML=data.challenge.map((x,i)=>`<div class="day ${x?"completed":""} ${i+1===day?"current":""}" title="روز ${i+1}">${i+1}</div>`).join("");
}
function render(){
 renderTasks();renderGoals();renderHabits();renderChallenge();
 $("taskCount").textContent=data.tasks.length;
 $("doneCount").textContent=data.tasks.filter(x=>x.done).length;
 $("goalCount").textContent=data.goals.length;
 $("habitDone").textContent=data.habits.filter(x=>x.done).length;
}
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),1800)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}

$("clearData").onclick=()=>{
 if(confirm("همه اطلاعات Planner حذف شود؟")){
  localStorage.removeItem(KEY);location.reload();
 }
};
window.toggleTask=toggleTask;window.deleteTask=deleteTask;window.changeGoal=changeGoal;window.deleteGoal=deleteGoal;window.toggleHabit=toggleHabit;window.deleteHabit=deleteHabit;
render();
