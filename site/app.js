/* Public content is rendered as text. Private file access is enforced by database/storage policies. */
const P=window.PORTFOLIO,C=window.PORTFOLIO_CONFIG||{};
C.supabaseUrl=String(C.supabaseUrl||'').trim().replace(/\/+$/,'');
C.publishableKey=String(C.publishableKey||'').trim();
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={design:'설계',fluid:'해석 · 유동',solid:'해석 · 고체 / FEM',ai:'AI 활용'};
let session=null,admin=false,approved=false,selectedCategory=null,verifiedEmail='';
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',5000);}
function art(index,category){const illustrations=[`<g transform="translate(210 100) rotate(-25)" fill="none" stroke="#5b8299"><path d="M-100-40Q0-90 100-40V40Q0 90-100 40Z" fill="#ccdee6" stroke-width="2"/><ellipse rx="41" ry="53" stroke-width="15" stroke="#8aabbc" fill="#e8eff2"/><path d="M-80-50V50M80-50V50M-100 0H-45M45 0H100"/></g>`,`<g fill="none" stroke="#7c9374"><path d="M85 150H350M85 150V32"/><path d="M85 150L130 98Q145 91 160 93T220 65T300 50L330 74" stroke-width="3"/><path d="M130 98V150M220 65V150M300 50V150" stroke-dasharray="3 5" opacity=".5"/></g><text x="343" y="170" fill="#75856d" font-size="13">ε</text><text x="67" y="35" fill="#75856d" font-size="13">σ</text>`,`<g stroke="#a28e70" fill="none"><path d="M100 155H330M210 40V155" stroke-width="2"/><circle cx="210" cy="40" r="5" fill="#a28e70"/><path d="M210 40L290 115" stroke-width="5"/><path d="M290 115A110 110 0 0 1 130 115" stroke-dasharray="4 5"/><rect x="277" y="105" width="25" height="28" rx="3" fill="#cbb99b" transform="rotate(-45 290 115)"/><path d="M185 150V135H232V150" stroke-width="3"/></g>`,`<g fill="none" stroke="#6b8d88" transform="translate(110 28)"><path d="M0 0H200V128H0Z"/><path d="M0 0L200 128M40 0L200 102M80 0L200 77M120 0L200 51M160 0L200 26M0 26L160 128M0 51L120 128M0 77L80 128M0 102L40 128M200 0L0 128M160 0L0 102M120 0L0 77M80 0L0 51M40 0L0 26M200 26L40 128M200 51L80 128M200 77L120 128M200 102L160 128" opacity=".6"/></g>`];const extra={fluid:'<g fill="none" stroke="#6b98b1" stroke-width="2"><path d="M45 55H375M45 85Q180 85 240 65T375 45M45 115Q200 115 265 95T375 75M45 145Q200 145 270 125T375 105"/><path d="M90 160L330 160L330 120Z" fill="#aec7d6" stroke="#66879a"/></g>',design:'<g fill="#cededb" stroke="#6d918a" stroke-width="2"><path d="M120 45L250 25L325 65V140L195 165L120 120Z"/><path d="M120 45L195 85L325 65M195 85V165" fill="none"/><ellipse cx="258" cy="110" rx="27" ry="30" fill="#eef3f0"/><path d="M130 125V173M305 146V178M195 165V185"/><path d="M250 25V8M135 45V22"/></g>',ai:'<g fill="#e5e7f2" stroke="#8790b2" stroke-width="2"><rect x="55" y="68" width="75" height="65" rx="10"/><rect x="174" y="45" width="80" height="105" rx="14"/><circle cx="330" cy="100" r="36"/><path d="M130 100H174M254 100H294"/><path d="M214 64V131M191 84H238M191 112H238"/><path d="M330 100Q300 75 330 72Q360 75 330 100Q350 130 365 107Q365 83 330 100Q295 100 309 126Q330 142 330 100" fill="#bcc7dc"/></g>'};return `<svg viewBox="0 0 420 200" aria-hidden="true">${extra[category]||illustrations[index%4]}</svg>`;}
function projectMeta(p){return `<div class="project-meta"><span>${esc(p.organization||'교과목·기관 추후 입력')}</span><span>${esc(p.period||'진행 연월 추후 입력')}</span></div>`;}
function completionButton(p){return p.completionLabel?`<button class="small-button" data-library="${esc(p.id)}-completion">${esc(p.completionLabel)} ↗</button>`:'';}
function renderProjects(filter='all'){$('#project-grid').innerHTML=P.projects.filter(p=>filter==='all'||p.category===filter).map(p=>{const i=P.projects.indexOf(p);return `<article class="project-card"><div class="project-visual"><span class="number">PROJECT ${String(i+1).padStart(2,'0')}</span><span class="concept">개념 일러스트</span>${art(i,p.category)}<span class="visual-caption">${esc(p.tools[0]||'ENGINEERING STUDY')}</span></div><div class="tags">${p.tools.map(t=>`<span>${esc(t)}</span>`).join('')}</div><h3>${esc(p.title)}</h3>${projectMeta(p)}<p>${esc(p.summary)}</p><div class="card-bottom"><span class="category-label">${esc(names[p.category])}</span><button class="detail-button" data-project="${esc(p.id)}">STAR로 살펴보기 ↗</button></div>${completionButton(p)}</article>`;}).join('')||`<div class="empty"><p class="eyebrow">WORK IN PROGRESS</p><h3>${esc(names[filter])} 프로젝트를 준비하고 있습니다.</h3><p>관련 경험이 추가되면 과정과 결과를 이곳에서 소개합니다.</p></div>`;}
$('#headline').textContent=P.profile.headline;$('#intro').textContent=P.profile.intro;
$('.brand>span:last-child').innerHTML=`${esc(P.profile.name)} <small>PORTFOLIO</small>`;
document.title=`${P.profile.name} | Mechanical Engineering Portfolio`;
$('#profile-details').innerHTML=[['이름',P.profile.name],['성별',P.profile.gender],['거주지',P.profile.location],['연락처',P.profile.phone],['이메일',P.profile.email]].map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v||'미등록')}</dd></div>`).join('');
$('#contact-link').href=`mailto:${P.profile.email}`;
if(P.profile.photo&&/^(assets\/|data:image\/(png|jpeg|webp);base64,)/.test(P.profile.photo)){const img=document.createElement('img');img.src=P.profile.photo;img.alt=`${P.profile.name} 프로필 사진`;$('#portrait').replaceChildren(img);}
$('#education-list').innerHTML=P.education.map(e=>`<article class="education-item"><span class="date">${esc(e.date)} · ${esc(e.status)}</span><h3>${esc(e.school)}</h3><p>${esc(e.major)}</p><button class="small-button" data-library="${esc(e.id)}">증명서 ↗</button></article>`).join('');
$('#certificate-list').innerHTML=P.certificates.map(c=>`<article class="language-item"><div><h3>${esc(c.name)}</h3><small>${c.date?esc(c.date)+' 응시':'응시일 미등록'}</small></div><div class="score">${esc(c.score||'—')}<small>${esc(c.unit)}</small></div><button class="small-button" data-library="${esc(c.id)}">성적표 ↗</button></article>`).join('');
$('#project-count').textContent=P.projects.length;
renderProjects();
const categories=[...P.education.map(e=>[e.id,e.school+' 증명서']),...P.certificates.map(c=>[c.id,c.name+' 성적표']),...P.projects.map(p=>[p.id,p.title+' 원본']),...P.projects.filter(p=>p.completionLabel).map(p=>[p.id+'-completion',p.title+' · '+p.completionLabel])];
$('#file-category').innerHTML=categories.map(([id,title])=>`<option value="${esc(id)}">${esc(title)}</option>`).join('');
document.addEventListener('click',async e=>{
 const filter=e.target.closest('[data-filter]');if(filter){$$('[data-filter]').forEach(b=>{b.classList.toggle('active',b===filter);b.setAttribute('aria-pressed',b===filter?'true':'false');});renderProjects(filter.dataset.filter);}
 const project=e.target.closest('[data-project]');if(project){const p=P.projects.find(p=>p.id===project.dataset.project);$('#project-detail').innerHTML=`<p class="eyebrow">${esc(names[p.category])} / PROJECT STORY</p><h2>${esc(p.title)}</h2><p>${esc(p.subtitle)}</p>${projectMeta(p)}<div class="tags">${p.tools.map(t=>`<span>${esc(t)}</span>`).join('')}</div><div class="star-list">${[['S','Situation · 상황','s'],['T','Task · 과제','t'],['A','Action · 행동','a'],['R','Result · 결과','r']].map(([letter,title,key])=>`<div class="star-item"><span class="star-letter">${letter}</span><div><h3>${title}</h3><p>${esc(p[key])}</p></div></div>`).join('')}</div><p class="note">${esc(p.sourceNote||"제공된 경험 자료를 바탕으로 정리했습니다.")}</p><button class="button primary" data-library="${esc(p.id)}">프로젝트 원본 자료 ↗</button> ${completionButton(p)}`;$('#project-dialog').showModal();}
 if(e.target.closest('[data-close]'))e.target.closest('dialog').close();
 const lib=e.target.closest('[data-library]');if(lib||e.target.closest('[data-login]')){selectedCategory=lib?.dataset.library||null;$('#project-dialog').close();$('#library-dialog').showModal();await loadLibrary();}
});
function configured(){return /^https:\/\/[a-z0-9.-]+$/.test(C.supabaseUrl)&&Boolean(C.publishableKey);}
function status(message){$('#library-status').textContent=message;}
async function api(path,{method='GET',body,raw=false}={}){
 if(!configured())throw Error('자료실 연결 준비 중입니다. 관리자가 연결을 마치면 이용할 수 있습니다.');
 const headers={apikey:C.publishableKey};if(session)headers.Authorization=`Bearer ${session.access_token}`;
 if(body!==undefined)headers['Content-Type']=raw?(body.type||'application/octet-stream'):'application/json';
 const response=await fetch(C.supabaseUrl+path,{method,headers,body:body===undefined?undefined:raw?body:JSON.stringify(body),cache:'no-store'});
 if(!response.ok){let err;try{err=await response.json();}catch{}if(response.status===401)throw Error('인증이 만료되었거나 유효하지 않습니다. 로그아웃 후 다시 인증해 주세요.');if(response.status===403)throw Error('이 작업에 대한 권한이 없습니다. 관리자 승인을 확인해 주세요.');throw Error(err?.msg||err?.message||err?.error_description||'요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');}
 if(raw&&method==='GET')return response.blob();const text=await response.text();return text?JSON.parse(text):null;
}
async function busy(form,action){const button=form.querySelector('button');button.disabled=true;try{await action();}catch(err){status(err.message);}finally{button.disabled=false;}}
$('#email-form').addEventListener('submit',e=>{e.preventDefault();busy(e.target,async()=>{
 verifiedEmail=$('#login-email').value.trim().toLowerCase();
 const redirect=new URL('./',location.href);redirect.search='';redirect.hash='';
 await api('/auth/v1/otp?redirect_to='+encodeURIComponent(redirect.href),{method:'POST',body:{email:verifiedEmail,create_user:true}});
 status('로그인 링크를 보냈습니다. 메일의 링크를 클릭하면 이메일 확인 후 접근 요청이 등록됩니다. 이미 승인된 계정은 바로 자료실을 이용할 수 있습니다.');
});});
$('#logout').onclick=async()=>{try{await api('/auth/v1/logout',{method:'POST'});}catch{}session=null;admin=false;approved=false;$('#library-files').replaceChildren();$('#requests').replaceChildren();$('#admin-panel').hidden=true;await loadLibrary();};
async function loadLibrary(){
 $('#login-panel').hidden=!!session;$('#member-panel').hidden=!session;$('#admin-panel').hidden=true;$('#request-access').hidden=true;$('#library-files').replaceChildren();
 if(!configured()){status('자료실 연결 준비 중 · 증명서와 원본 파일은 아직 등록되지 않았습니다.');$('#email-form button').disabled=true;return;}
 $('#email-form button').disabled=false;
 if(!session){status('메일의 로그인 링크로 이메일을 확인해 주세요.');return;}
 $('#member-email').textContent=session.user.email;
 try{
  admin=await api('/rest/v1/rpc/is_portfolio_admin',{method:'POST',body:{}});approved=await api('/rest/v1/rpc/can_download_portfolio',{method:'POST',body:{}});
  $('#admin-panel').hidden=!admin;
  if(!approved){const requests=await api('/rest/v1/access_requests?select=status');status(requests.length?'다운로드 권한 승인 대기 중입니다. 관리자가 승인한 후 자료실을 다시 열어 주세요.':'아직 다운로드 권한이 없습니다. 아래 버튼으로 관리자에게 승인을 요청하세요.');$('#request-access').hidden=false;$('#request-access').textContent=requests.length?'관리자에게 알림 다시 보내기':'다운로드 권한 요청';return;}
  status(admin?'관리자 계정입니다. 자료 등록과 이메일 승인·회수를 관리할 수 있습니다.':'승인된 계정입니다. 등록된 자료를 다운로드할 수 있습니다.');
  const files=await api('/rest/v1/portfolio_files?select=*&order=created_at.desc');const shown=selectedCategory?files.filter(f=>f.category===selectedCategory):files;
  if(selectedCategory){const showAll=document.createElement('button');showAll.className='small-button';showAll.textContent='전체 자료 보기';showAll.onclick=()=>{selectedCategory=null;loadLibrary();};$('#library-files').append(showAll);}
  if(!shown.length){const p=document.createElement('p');p.textContent='이 위치에 등록된 자료가 없습니다.';$('#library-files').append(p);}
  for(const file of shown){const row=document.createElement('div');row.className='file-row';const label=document.createElement('span');label.textContent=file.title;const actions=document.createElement('div');const download=document.createElement('button');download.className='small-button';download.textContent='다운로드 ↓';download.onclick=async()=>{download.disabled=true;try{const blob=await api('/storage/v1/object/authenticated/portfolio-private/'+file.object_path.split('/').map(encodeURIComponent).join('/'),{raw:true});saveBlob(blob,file.original_name);}catch(err){status(err.message);}finally{download.disabled=false;}};actions.append(download);if(admin){const del=document.createElement('button');del.className='small-button';del.textContent='삭제';del.onclick=async()=>{if(!confirm('이 파일을 삭제할까요?'))return;try{await api('/storage/v1/object/portfolio-private',{method:'DELETE',body:{prefixes:[file.object_path]}});await api('/rest/v1/portfolio_files?id=eq.'+encodeURIComponent(file.id),{method:'DELETE'});await loadLibrary();}catch(err){status(err.message);}};actions.append(del);}row.append(label,actions);$('#library-files').append(row);}
  if(admin)await loadRequests();
 }catch(err){status(err.message);}
}
async function submitAccessRequest(){
 const result=await api('/functions/v1/request-access',{method:'POST',body:{}});
 await loadLibrary();
 status(result.notification==='sent'?'접근 요청이 등록되었고 관리자에게 알림 메일을 보냈습니다. 승인 후 자료실을 다시 열어 주세요.':result.notification==='already_sent'?'이미 관리자에게 알림을 보냈습니다. 승인 후 자료실을 다시 열어 주세요.':result.notification==='approved'?'승인된 계정입니다. 자료를 다운로드할 수 있습니다.':'요청은 저장되었습니다. 관리자 알림 메일을 보내지 못했습니다. 잠시 후 알림 다시 보내기를 눌러 주세요.');
}
$('#request-access').onclick=async()=>{const button=$('#request-access');button.disabled=true;try{await submitAccessRequest();}catch(err){status(err.message);}finally{button.disabled=false;}};
async function loadRequests(){const requests=await api('/rest/v1/access_requests?select=*&order=created_at.desc');$('#requests').replaceChildren();if(!requests.length)$('#requests').textContent='아직 승인 요청이 없습니다.';for(const request of requests){const row=document.createElement('div');row.className='request-row';const label=document.createElement('span');label.textContent=request.email+' · '+(request.status==='approved'?'승인됨':'대기 중');const button=document.createElement('button');button.className='small-button';button.textContent=request.status==='approved'?'승인 회수':'승인';button.onclick=async()=>{button.disabled=true;try{await api('/rest/v1/access_requests?user_id=eq.'+encodeURIComponent(request.user_id),{method:'PATCH',body:{status:request.status==='approved'?'pending':'approved'}});await loadRequests();}catch(err){status(err.message);}finally{button.disabled=false;}};row.append(label,button);$('#requests').append(row);}}
$('#upload-form').addEventListener('submit',e=>{e.preventDefault();busy(e.target,async()=>{const file=$('#private-file').files[0];if(!file)return;if(file.size>50*1024*1024)throw Error('50MB 이하의 파일을 선택해 주세요. 큰 프로젝트는 분할 압축해 등록할 수 있습니다.');const object_path=crypto.randomUUID()+'/'+file.name.replace(/[^a-zA-Z0-9._-]/g,'_');await api('/storage/v1/object/portfolio-private/'+object_path,{method:'POST',body:file,raw:true});try{await api('/rest/v1/portfolio_files',{method:'POST',body:{title:$('#file-title').value.trim(),category:$('#file-category').value,object_path,original_name:file.name}});}catch(err){try{await api('/storage/v1/object/portfolio-private',{method:'DELETE',body:{prefixes:[object_path]}});}catch{}throw err;}e.target.reset();await loadLibrary();status('비공개 파일이 등록되었습니다. 승인된 계정만 다운로드할 수 있습니다.');});});
function saveBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}

// Supabase's default ConfirmationURL returns an implicit-flow session in the fragment.
async function receiveEmailLink(){
 const params=new URLSearchParams(location.hash.slice(1));
 if(!params.has('access_token')&&!params.has('error')&&!params.has('error_description'))return;
 const token=params.get('access_token');
 history.replaceState(null,'',location.pathname+location.search);
 $('#library-dialog').showModal();
 if(!token){status('로그인 링크가 만료되었거나 사용할 수 없습니다. 이메일을 입력해 새 링크를 요청해 주세요.');return;}
 try{
  // Do not trust the fragment's user identity: validate the bearer token with Auth.
  session={access_token:token};
  const user=await api('/auth/v1/user');
  if(!user.id||!user.email||!user.email_confirmed_at)throw Error('이메일 확인을 완료하지 못했습니다. 새 로그인 링크를 요청해 주세요.');
  session.user=user;
  await loadLibrary();
  if(!admin&&!approved)await submitAccessRequest();
 }catch(err){
  if(!session?.user){session=null;await loadLibrary();}
  status(err.message);
 }
}
receiveEmailLink();
