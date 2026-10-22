(()=>{
const $=id=>document.getElementById(id),root=$('ht-live'),panels=$('ht-panels'),control=$('ht-playground');
const names=['Все','Запланированные','Без даты','В работе','На проверке','Завершённые','Архив','Личные','Команда','Другое'];
const items=names.map((label,i)=>({label,count:String([24,18,6,8,3,12,56,4,9,2][i]),disabled:false}));let selected=0,editing=0;
const count=()=>Number($('ht-count').value),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function syncEdit(){editing=Math.min(editing,count()-1);$('ht-edit').innerHTML=items.slice(0,count()).map((_,i)=>'<option value="'+i+'">Таб '+(i+1)+'</option>').join('');$('ht-edit').value=editing;$('ht-label').value=items[editing].label;$('ht-number').value=items[editing].count;$('ht-disabled').checked=items[editing].disabled;}
function select(i,focus=false){if(items[i].disabled)return;selected=i;render();if(focus){const t=$('ht-tab-'+i);t.focus();t.scrollIntoView({block:'nearest',inline:'nearest'});}}
function render(){const size=$('ht-size').value,n=count();root.dataset.size=size;if(selected>=n)selected=0;root.innerHTML='';panels.innerHTML='';
const enabled=items.slice(0,n).map((x,i)=>!x.disabled?i:-1).filter(i=>i>=0),focusIndex=items[selected].disabled?(enabled[0]??-1):selected;
items.slice(0,n).forEach((item,i)=>{const active=i===selected,palette=item.disabled?'neutral':active?'blue':'slate',t=document.createElement('button');t.type='button';t.className='sura-htab';t.id='ht-tab-'+i;t.setAttribute('role','tab');t.setAttribute('aria-selected',String(active));t.setAttribute('aria-controls','ht-panel-'+i);t.dataset.active=active?'Yes':'No';t.dataset.disabled=item.disabled?'Yes':'No';t.disabled=item.disabled;t.tabIndex=i===focusIndex?0:-1;
t.innerHTML=($('ht-icons').checked?'<svg class="sura-htab__icon" width="16" height="16" aria-hidden="true"><use href="#sura-target-16"></use></svg>':'')+'<span class="sura-htab__label">'+esc(item.label)+'</span>'+($('ht-counts').checked?'<span class="focal-tag focal-tag--'+(size==='32'?'16':'24')+' focal-tag--'+palette+' focal-tag--bright"><span class="focal-tag__label">'+esc(item.count)+'</span></span>':'');
t.addEventListener('click',()=>select(i,true));t.addEventListener('keydown',e=>{let next,at=enabled.indexOf(i);if(e.key==='ArrowRight')next=enabled[(at+1)%enabled.length];else if(e.key==='ArrowLeft')next=enabled[(at+enabled.length-1)%enabled.length];else if(e.key==='Home')next=enabled[0];else if(e.key==='End')next=enabled.at(-1);else return;e.preventDefault();if(next!==undefined)select(next,true);});root.append(t);
const panel=document.createElement('div');panel.id='ht-panel-'+i;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',t.id);panel.tabIndex=0;panel.hidden=!active;panel.textContent=item.label+' · '+item.count+' объектов'+(item.disabled?' · Disable: Yes':'');panels.append(panel);});}
for(const id of ['ht-size','ht-icons','ht-counts'])$(id).addEventListener('change',render);
$('ht-count').addEventListener('change',()=>{syncEdit();render()});$('ht-edit').addEventListener('change',()=>{editing=Number($('ht-edit').value);syncEdit()});
for(const [id,key]of [['ht-label','label'],['ht-number','count']])$(id).addEventListener('input',()=>{items[editing][key]=$(id).value;render()});
$('ht-disabled').addEventListener('change',()=>{items[editing].disabled=$('ht-disabled').checked;render()});syncEdit();render();
})();
