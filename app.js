'use strict';
const $ = (selector) => document.querySelector(selector);
const escapeText = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const steps = [
  {name:'Интересы',title:'Начать с простого',desc:'Выбрать от 1 до 5 интересов. Минимум один — рабочая гипотеза; ответы можно скрыть.',required:true,cr:99,why:'H01. Узнаваемые интересы позволяют начать с легкого выбора. Ограничение в пять ответов помогает расставить приоритеты и дает собеседнику темы для первого сообщения.',risk:'H02. Проверить, дает ли обязательный один интерес достаточно пользы по сравнению с вариантом «Пропустить».',states:['Пусто','Выбрано','Лимит','Скрыто']},
  {name:'Жизнь и привычки',title:'Показать свой ритм жизни',desc:'От 3 до 6 ответов суммарно во вкладках «Образ жизни» и «Привычки». Не нужно отвечать на каждый вопрос.',required:true,cr:96,why:'H03–H05. Короткие варианты вместо ручного ввода снижают усилие. Общий счетчик и сохранение выбора между вкладками делают объем работы понятным.',risk:'Минимум три ответа может увеличить уходы. Сравнить с минимумом один и необязательным шагом; измерять также полезность данных.',states:['Пусто','Частично','Можно дальше','Лимит','Привычки','Скрыто']},
  {name:'Цели и намерения',title:'Уточнить ожидания',desc:'Необязательные планы: дети, свадьба, путешествие, совместная жизнь и другие. Формат отношений задается отдельно.',required:false,cr:98.5,why:'H06–H07. Уточнение планов после выбора серьезных отношений помогает выразить личные ожидания. Пропуск сохраняет путь для тех, кто пока не определился.',risk:'Совпавшие планы не доказывают совместимость. Не превращать отмеченные желания в жесткий фильтр и не считать пропуск отрицательным ответом.',states:['Пусто','Выбрано','Скрыто']},
  {name:'Расстояние',title:'Расширить возможности по желанию',desc:'Три отдельных вопроса: отношения на расстоянии, поездки и возможный переезд. Можно ответить частично или пропустить.',required:false,cr:99,why:'H08–H09. Добровольный выбор географии помогает найти людей с совместимыми возможностями встреч. Раздельные вопросы не приравнивают поездки к готовности переехать.',risk:'Проверить ценность этого шага до первой подборки. Альтернатива — задавать вопрос только при недостатке анкет рядом.',states:['Пусто','Выбрано','Скрыто']},
  {name:'Вопрос для знакомства',title:'Дать повод написать',desc:'Необязательное окно с коротким личным вопросом. Вопрос можно заменить, пропустить или отключить будущие предложения.',required:false,cr:99,why:'H10–H11. Конкретная история добавляет индивидуальность и дает зацепку для сообщения. Выбор вопроса и простой отказ уменьшают давление свободного ввода.',risk:'Лимит 2 000 символов; подсказка предлагает пару фраз. Проверить само окно против обычного экрана. Подбор по смыслу или стилю ответов — отдельная гипотеза.',states:['Пусто','Ответ','Другой вопрос','Скрыто']},
  {name:'Предложение подписки',title:'Объяснить дополнительную пользу',desc:'Анкета сохранена. Предложение возможностей подписки без искусственного «низкого потенциала». Доступен бесплатный путь.',required:false,cr:null,why:'H12. Конкретные возможности после заполнения помогают понять пользу подписки в контексте задачи. H13. Прозрачное бесплатное продолжение поддерживает доверие.',risk:'Цена и функции демонстрационные. Реальной оплаты нет. Экран не обещает гарантированных отношений или увеличения шансов в процентах.',states:['Предложение','После покупки','Бесплатно']}
];
const interests = ['🎬 Кино','🎵 Музыка','✈️ Путешествия','🍳 Готовка','📚 Книги','🐕 Животные','🎮 Видеоигры','🌿 Природа','🏃 Спорт','🎨 Искусство','☕ Кофе','🎌 Аниме','🎭 Театр','💃 Танцы','📷 Фотография','🧩 Настолки'];
const lifeOptions = ['Прогулки без спешки','Активные выходные','Домашний уют','Спонтанные планы','Все планирую','Часто путешествую','Люблю гостей','Ценю личное время','Рано встаю','Поздно ложусь'];
const habitGroups = [
  {id:'smoking',title:'Курение',options:['Не курю','Курю иногда','Курю']},
  {id:'alcohol',title:'Алкоголь',options:['Не пью','По особым случаям','Иногда']},
  {id:'sport',title:'Спорт',options:['Регулярно','Время от времени','Сейчас без спорта']}
];
const plans = ['Завести детей','Сыграть свадьбу','Поехать в путешествие','Съехаться','Провести Новый год вместе','Узнать друг друга без спешки'];
const distanceGroups = [
  {id:'distance',title:'Отношения на расстоянии',options:['Готов(а) попробовать','Только рядом','Пока не знаю']},
  {id:'visits',title:'Поездки друг к другу',options:['Готов(а) приезжать','Пока не могу','Обсудим при знакомстве']},
  {id:'move',title:'Переезд в другой город',options:['Рассматриваю','Не планирую','Зависит от обстоятельств']}
];
const questions=['Что вас недавно приятно удивило?','О чем вы можете говорить часами?','Какой маленький ритуал делает ваш день лучше?','Какое аниме, кино или книга вас зацепили — и почему?'];
let step=0,tab='life',stateName='',endMode='',toastTimer;
let data;
function freshData(){return {interests:[],life:[],habits:{},plans:[],format:'',distance:{},answer:'',question:0,hidden:{},questionsOff:false};}
data=freshData();
function lifeCount(){return data.life.length+Object.keys(data.habits).length;}
function canContinue(){return step===0?data.interests.length>=1:step===1?lifeCount()>=3:step===4?data.answer.trim().length>0:true;}
function chip(label,selected,action,disabled=false){return `<button class="chip" aria-pressed="${selected}" data-action="${action}" data-value="${escapeText(label)}" ${disabled?'disabled':''}>${escapeText(label)}</button>`;}
function visibility(){return `<label class="visibility"><input id="hide-answer" type="checkbox" ${data.hidden[step]?'checked':''}>Скрыть ответы из публичной анкеты</label>`;}
function showToast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>{$('#toast').hidden=true;},4000);}
function selectScreen(index){step=index;stateName='';endMode='';render();}
function mobileTop(){return `<div class="mobile-top"><button class="icon-button" data-action="back" aria-label="Назад">‹</button><div class="progress" aria-label="Шаг ${Math.min(step+1,5)} из 5">${Array.from({length:5},(_,i)=>`<i class="${i<=step?'filled':''}"></i>`).join('')}</div><button class="icon-button" data-action="close" aria-label="К началу прототипа">×</button></div>`;}
function footer(){const optional=!steps[step].required;return `<div class="mobile-bottom">${visibility()}<button class="primary" data-action="next" ${canContinue()?'':'disabled'}>Продолжить <span>→</span></button>${optional?'<button class="skip" data-action="skip">Пропустить</button>':''}</div>`;}
function groupMarkup(group,values,action){return `<section class="group"><h2 class="group-title">${group.title}</h2><div class="chips">${group.options.map(option=>chip(option,values[group.id]===option,`${action}:${group.id}`)).join('')}</div></section>`;}
function bodyMarkup(){
  if(step===0)return `<div class="step-label">1 из 5 · Начнем с близкого</div><h1>Что вас<br>увлекает?</h1><p class="screen-desc">Выберите от 1 до 5 интересов.<br>Они могут стать началом разговора.</p><div class="chips">${interests.map(x=>chip(x,data.interests.includes(x),'interest',data.interests.length===5&&!data.interests.includes(x))).join('')}</div><p class="count">Выбрано ${data.interests.length} из 5</p>`;
  if(step===1)return `<div class="step-label">2 из 5 · Повседневная жизнь</div><h1>Что важно знать<br>о вашей жизни?</h1><p class="screen-desc">Выберите от 3 до 6 ответов в любых вкладках. Расскажите то, что вам комфортно.</p><div class="tabs" role="tablist" aria-label="Разделы о жизни"><button role="tab" aria-selected="${tab==='life'}" class="tab ${tab==='life'?'active':''}" data-action="tab-life">Образ жизни${data.life.length?' · '+data.life.length:''}</button><button role="tab" aria-selected="${tab==='habits'}" class="tab ${tab==='habits'?'active':''}" data-action="tab-habits">Привычки${Object.keys(data.habits).length?' · '+Object.keys(data.habits).length:''}</button></div>${tab==='life'?`<div class="chips">${lifeOptions.map(x=>chip(x,data.life.includes(x),'life',lifeCount()>=6&&!data.life.includes(x))).join('')}</div>`:habitGroups.map(g=>groupMarkup(g,data.habits,'habit')).join('')}<div class="counter"><p class="count" aria-live="polite">Выбрано ${lifeCount()} из 6</p><p class="count">${lifeCount()<3?'Еще '+(3-lifeCount())+' до продолжения':'Можно продолжать'}</p></div>`;
  if(step===2)return `<div class="step-label">3 из 5 · Можно пропустить</div><h1>Что хотелось бы<br>разделить вдвоем?</h1><p class="screen-desc">Серьезные отношения у каждого свои.<br>Отметьте близкие вам планы.</p><div class="chips">${plans.map(x=>chip(x,data.plans.includes(x),'plan')).join('')}</div><div class="group" style="margin-top:24px"><label class="group-title" for="format">Какой формат отношений вам близок?</label><select class="select" id="format"><option value="">Можно не указывать</option>${['Моногамные отношения','Немоногамные отношения по согласию','Хочу обсудить лично','Пока не определился(-ась)'].map(x=>`<option ${data.format===x?'selected':''}>${escapeText(x)}</option>`).join('')}</select></div><p class="optional-note">Планы могут меняться. Вы сможете изменить ответы в любой момент.</p>`;
  if(step===3)return `<div class="step-label">4 из 5 · Можно пропустить</div><h1>Если ваш человек<br>в другом городе?</h1><p class="screen-desc">Поездки, переезд и отношения на расстоянии — разные решения.</p>${distanceGroups.map(g=>groupMarkup(g,data.distance,'geo')).join('')}<p class="optional-note">Ответы не меняют географию поиска автоматически.</p>`;
  return '';
}
function promptMarkup(){return `<div class="modal-background" aria-hidden="true"><span class="step-label">Анкета почти готова</span><div class="blur-block"></div><div class="blur-block"></div><div class="blur-block"></div></div><div class="sheet-layer"><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="prompt-title"><div class="sheet-handle"></div><div class="sheet-top"><span>5 ИЗ 5 · НЕОБЯЗАТЕЛЬНО</span><button class="icon-button" data-action="skip" aria-label="Пропустить вопрос">×</button></div><h1 id="prompt-title">Есть история,<br>с которой все начнется?</h1><p>Пара фраз о вас — повод написать что-то интереснее, чем «Привет».</p><div class="prompt-card"><strong>${questions[data.question]}</strong><button data-action="question">Другой вопрос ↻</button></div><label class="group-title" for="answer">Ваш ответ</label><textarea id="answer" class="answer" maxlength="2000" placeholder="Расскажите своими словами…">${escapeText(data.answer)}</textarea><p id="answer-count" class="count">${data.answer.length} / 2 000</p>${visibility()}<button class="primary" id="answer-next" data-action="next" ${canContinue()?'':'disabled'}>Сохранить и продолжить →</button><button class="skip" data-action="skip">Сейчас пропущу</button><button class="skip" data-action="questions-off">Не предлагать такие вопросы</button></section></div>`;}
function paywallMarkup(){return `${mobileTop()}<div class="screen-scroll"><div class="premium-art" aria-hidden="true"><span class="heart">♥</span><span class="orbit"></span><span class="spark">✦</span></div><span class="save-note">✓ Ответы сохранены в этой сессии</span><h1>Больше способов<br>найти взаимность</h1><p class="screen-desc">Попробуйте дополнительные возможности знакомства с подпиской.</p><div class="benefits"><div class="benefit"><span>♡</span><div><strong>Видеть, кому вы понравились</strong><p>Выбирайте среди тех, кто уже проявил интерес.</p></div></div><div class="benefit"><span>⌕</span><div><strong>Больше настроек поиска</strong><p>Уточняйте предпочтения по образу жизни и планам.</p></div></div><div class="benefit"><span>✦</span><div><strong>Тематические подборки</strong><p>Находите новые поводы начать разговор.</p></div></div></div><div class="price-card"><span>Подписка на месяц</span><strong>399 ₽</strong></div><p class="legal">Демонстрационные цена и возможности.</p></div><div class="mobile-bottom"><button class="primary" data-action="subscribe">Попробовать за 399 ₽</button><p class="legal">В реальном продукте: 399 ₽ в месяц с автопродлением.<br>Здесь оплата не производится.</p><button class="skip" data-action="free">Продолжить бесплатно</button></div>`;}
function endMarkup(){return `<div class="end-content"><span class="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span><h1>${endMode==='paid'?'Демонстрация подписки':'Можно знакомиться'}</h1><p>${endMode==='paid'?'Здесь завершился бы выбор подписки. Деньги не списывались, подписка не оформлена.':'Вы выбрали бесплатное продолжение. Просмотр анкет находится за пределами этого фрагмента.'}</p><button class="primary" data-action="paywall">Вернуться к предложению</button><button class="skip" data-action="restart">Пройти заново</button></div>`;}
function render(){
  const s=steps[step];
  $('#screen-nav').innerHTML=steps.map((x,i)=>`<button class="nav-button ${i===step?'active':''}" data-screen="${i}" ${i===step?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${x.name}</button>`).join('');
  $('#preview-step').textContent=step<5?`${step+1} / 5`:'Финал';
  $('#phone-content').innerHTML=endMode?endMarkup():step===5?paywallMarkup():step===4?promptMarkup():`${mobileTop()}<div class="screen-scroll">${bodyMarkup()}</div>${footer()}`;
  $('#notes').innerHTML=`<section class="note-card"><div class="note-index">ЭКРАН ${String(step+1).padStart(2,'0')}</div><h2>${s.title}</h2><div class="specs"><span>${step===5?'Можно отказаться':s.required?'Обязательный шаг':'Можно пропустить'}</span>${step<5?'<span>Можно скрыть ответы</span>':''}</div><p>${s.desc}</p><h3>Состояния для просмотра</h3><div class="state-list">${s.states.map(x=>`<button class="state-button ${x===stateName?'active':''}" data-state="${x}">${x}</button>`).join('')}</div></section><section class="note-card"><div class="cr-row"><h3>${s.cr?'CR в следующий шаг':'CR до предложения'}</h3><span class="cr-badge">Модель, не замер</span></div><strong class="cr-value">${s.cr?String(s.cr).replace('.',','):'91,8'}%</strong><p>${s.cr?'Экспертное допущение для проверки. Прохождение включает пропуск на необязательных шагах.':'99% × 96% × 98,5% × 99% × 99%. Оплата в эту метрику не входит.'}</p></section><section class="note-card"><h3>Гипотеза и обоснование</h3><p>${s.why}</p><h3>Что проверить</h3><p>${s.risk}</p></section>`;
  if(step===4&&!endMode)$('#answer').addEventListener('input',event=>{data.answer=event.target.value;stateName='';$('#answer-count').textContent=`${data.answer.length} / 2 000`;$('#answer-next').disabled=!canContinue();});
  if(step===2)$('#format').addEventListener('change',event=>{data.format=event.target.value;stateName='';});
  if($('#hide-answer'))$('#hide-answer').addEventListener('change',event=>{data.hidden[step]=event.target.checked;stateName='';});
}
function toggleList(list,value,max=Infinity){const index=list.indexOf(value);if(index>=0)list.splice(index,1);else if(list.length<max)list.push(value);else showToast(`Можно выбрать не больше ${max}`);}
function sampleState(name){
  stateName=name;endMode='';
  if(step===0){data.interests=name==='Пусто'?[]:interests.slice(0,name==='Лимит'?5:3);data.hidden[0]=name==='Скрыто';}
  if(step===1){tab=name==='Привычки'?'habits':'life';data.life=name==='Пусто'?[]:lifeOptions.slice(0,name==='Частично'?2:name==='Лимит'?6:3);data.habits={};data.hidden[1]=name==='Скрыто';}
  if(step===2){data.plans=name==='Пусто'?[]:[plans[1],plans[2]];data.format='';data.hidden[2]=name==='Скрыто';}
  if(step===3){data.distance=name==='Пусто'?{}:{distance:'Готов(а) попробовать',visits:'Готов(а) приезжать',move:'Зависит от обстоятельств'};data.hidden[3]=name==='Скрыто';}
  if(step===4){data.answer=name==='Ответ'||name==='Скрыто'?'Недавно случайно попал(а) на маленький джазовый концерт во дворе. Теперь ищу такие места в своем городе.':'';data.question=name==='Другой вопрос'?1:0;data.hidden[4]=name==='Скрыто';}
  if(step===5)endMode=name==='После покупки'?'paid':name==='Бесплатно'?'free':'';
  render();
}
document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-screen]');if(nav){selectScreen(Number(nav.dataset.screen));return;}
  const state=event.target.closest('[data-state]');if(state){sampleState(state.dataset.state);return;}
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const action=button.dataset.action,value=button.dataset.value;stateName='';
  if(action==='interest')toggleList(data.interests,value,5);
  else if(action==='life'){if(data.life.includes(value))toggleList(data.life,value);else if(lifeCount()<6)data.life.push(value);else showToast('Можно выбрать до 6 ответов в двух вкладках');}
  else if(action.startsWith('habit:')){const group=action.split(':')[1];if(data.habits[group]===value)delete data.habits[group];else if(data.habits[group]||lifeCount()<6)data.habits[group]=value;else showToast('Уже выбрано 6 ответов. Уберите один, чтобы добавить привычку.');}
  else if(action==='plan')toggleList(data.plans,value);
  else if(action.startsWith('geo:')){const group=action.split(':')[1];if(data.distance[group]===value)delete data.distance[group];else data.distance[group]=value;}
  else if(action==='tab-life')tab='life';
  else if(action==='tab-habits')tab='habits';
  else if(action==='back'){if(step>0)step--;else{$('#workspace').hidden=true;$('#welcome').hidden=false;return;}}
  else if(action==='close'){$('#workspace').hidden=true;$('#welcome').hidden=false;return;}
  else if(action==='question'){if(data.answer.trim()){showToast('Сначала уберите ответ, чтобы сменить вопрос');return;}data.question=(data.question+1)%questions.length;}
  else if(action==='next'){if(!canContinue())return;step=Math.min(5,step+1);if(step===4&&data.questionsOff)step=5;}
  else if(action==='skip'){if(steps[step].required)return;if(step===2){data.plans=[];data.format='';}if(step===3)data.distance={};if(step===4)data.answer='';step=Math.min(5,step+1);if(step===4&&data.questionsOff)step=5;}
  else if(action==='questions-off'){data.questionsOff=true;data.answer='';step=5;showToast('В этой сессии вопросы больше не предлагаем');}
  else if(action==='subscribe')endMode='paid';
  else if(action==='free')endMode='free';
  else if(action==='paywall')endMode='';
  else if(action==='restart'){data=freshData();step=0;tab='life';endMode='';}
  render();
});
$('#start').addEventListener('click',()=>{$('#welcome').hidden=true;$('#workspace').hidden=false;render();});
$('#reset').addEventListener('click',()=>{data=freshData();selectScreen(0);tab='life';render();showToast('Ответы сброшены');});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&step===4&&!$('#workspace').hidden){data.answer='';selectScreen(5);}});
render();
