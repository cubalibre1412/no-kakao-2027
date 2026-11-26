'use strict';
const $=id=>document.getElementById(id), canvas=$('preview'), ctx=canvas.getContext('2d');
const state={photo:null,style:'campaign',zoom:1,x:0,y:0,view:'circle'};
const logo=new Image();logo.src='assets/alliance-circle.png';logo.onload=draw;
const squareLogo=new Image();squareLogo.src='assets/alliance-logo.png';squareLogo.onload=draw;
const frame=new Image();frame.src='assets/campaign-frame.png';frame.onload=draw;
const N=1080,C=540;
function circle(x,y,r,fill,stroke,width=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function text(s,x,y,size,color,max=960){ctx.font=`900 ${size}px "Arial", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeStyle=color;ctx.lineWidth=size*.022;ctx.lineJoin='round';ctx.strokeText(s,x,y,max);ctx.fillText(s,x,y,max);}
function photoGeometry(){return state.style==='campaign'?{x:270,y:152,w:482,h:405}:{x:120,y:160,w:760,h:650};}
function photo(){const box=photoGeometry();ctx.save();ctx.beginPath();ctx.ellipse(box.x+box.w/2,box.y+box.h/2,box.w/2,box.h/2,0,0,Math.PI*2);ctx.clip();if(state.photo){const p=state.photo,scale=Math.max(box.w/p.width,box.h/p.height)*state.zoom,w=p.width*scale,h=p.height*scale;const dx=state.x*((w-box.w)/2+box.w*.32),dy=state.y*((h-box.h)/2+box.h*.32);ctx.fillStyle='#fff';ctx.fillRect(box.x,box.y,box.w,box.h);ctx.drawImage(p,box.x+(box.w-w)/2+dx,box.y+(box.h-h)/2+dy,w,h);}else{ctx.fillStyle='#f3f3ed';ctx.fillRect(box.x,box.y,box.w,box.h);circle(box.x+box.w/2,box.y+box.h*.36,box.w*.17,'#c6c8bc');ctx.beginPath();ctx.ellipse(box.x+box.w/2,box.y+box.h*.95,box.w*.4,box.h*.4,0,0,Math.PI*2);ctx.fillStyle='#c6c8bc';ctx.fill();}ctx.restore();}
function badge(x,y,r){circle(x,y,r,'#fff','#1b1b17',5);if(logo.complete&&logo.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(x,y,r-9,0,Math.PI*2);ctx.clip();ctx.drawImage(logo,398,202,452,465,x-r+10,y-r+10,(r-10)*2,(r-10)*2);ctx.restore();}}
function burst(x,y,color,rotation=0,scale=1){ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(scale,scale);ctx.fillStyle=color;for(const [angle,length] of [[-.6,62],[0,75],[.6,62]]){ctx.save();ctx.rotate(angle);ctx.beginPath();ctx.moveTo(38,-5);ctx.lineTo(length,-12);ctx.lineTo(length,12);ctx.lineTo(38,5);ctx.closePath();ctx.fill();ctx.restore();}ctx.restore();}
function roundedRect(x,y,w,h,r,fill,stroke,line=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}}
function draw(){ctx.clearRect(0,0,N,N);ctx.fillStyle='#fffbed';ctx.fillRect(0,0,N,N);circle(C,C,538,'#fff');
if(state.style==='logo'){if(squareLogo.complete&&squareLogo.naturalWidth){ctx.drawImage(squareLogo,110,110,860,860);}circle(C,C,521,'transparent','#ffd600',28);return;}
ctx.save();ctx.beginPath();ctx.arc(C,C,538,0,Math.PI*2);ctx.clip();
if(state.style==='campaign'&&frame.complete&&frame.naturalWidth){
// Fixed artwork preserves the example lettering and placard on every device.
ctx.drawImage(frame,0,0,N,N);photo();
// The placard sits in front of the uploaded portrait.
ctx.save();ctx.beginPath();ctx.rect(0,528,N,N-528);ctx.clip();ctx.drawImage(frame,0,0,N,N);ctx.restore();
// Keep the previously approved symbol from the supplied circular source file.
badge(850,338,106);
}else{photo();text('카카오 주주연대',540,112,58,'#080808',650);badge(866,313,95);roundedRect(106,777,868,330,44,'#ffe000','#080808',11);text('카카오 인적분할',540,842,82,'#000',825);text('부결',540,970,151,'#e21b0c',470);circle(C,C,521,'transparent','#ffd600',28);}
ctx.restore();}
function notify(s,error=false){$('status').textContent=s;$('status').classList.toggle('error',error);}
function reset(){state.zoom=1;state.x=0;state.y=0;$('zoom').value=100;$('panX').value=0;$('panY').value=0;$('zoomValue').value='100%';draw();}
let uploadSequence=0;
async function loadFile(file){const sequence=++uploadSequence;if(!file)return;if(!/^image\/(jpeg|png|webp)$/.test(file.type)){notify('JPG, PNG 또는 WebP 사진을 선택해 주세요.',true);return;}if(file.size>20*1024*1024){notify('20MB 이하의 사진을 선택해 주세요.',true);return;}notify('사진을 불러오는 중입니다.');const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();if(sequence!==uploadSequence)return;if(img.naturalWidth<1)throw Error('empty');state.photo=img;reset();$('download').disabled=false;$('uploadLabel').textContent='다른 사진 선택';notify('사진을 드래그하거나 조절 막대로 위치를 맞춰주세요.');}catch(e){if(sequence===uploadSequence)notify('사진을 열 수 없습니다. 다른 사진으로 다시 시도해 주세요.',true);}finally{URL.revokeObjectURL(url);$('photoInput').value='';}}
$('photoInput').addEventListener('change',e=>loadFile(e.target.files[0]));
const zone=$('dropzone');['dragenter','dragover'].forEach(name=>zone.addEventListener(name,e=>{e.preventDefault();zone.classList.add('over');}));['dragleave','drop'].forEach(name=>zone.addEventListener(name,e=>{e.preventDefault();zone.classList.remove('over');}));zone.addEventListener('drop',e=>loadFile(e.dataTransfer.files[0]));
$('zoom').addEventListener('input',e=>{state.zoom=Number(e.target.value)/100;$('zoomValue').value=`${e.target.value}%`;draw();});
['panX','panY'].forEach((id,i)=>$(id).addEventListener('input',e=>{state[i?'y':'x']=Number(e.target.value)/100;draw();}));$('reset').addEventListener('click',reset);
document.querySelectorAll('[data-style]').forEach(b=>b.addEventListener('click',()=>{state.style=b.dataset.style;$('download').disabled=!state.photo&&state.style!=='logo';$('adjustments').hidden=state.style==='logo';$('previewHelp').textContent=state.style==='logo'?'사진 없이 주주연대 로고 프로필을 저장할 수 있습니다.':'사진을 올린 후 드래그해서 위치를 맞춰보세요.';notify(state.style==='logo'?'로고 프로필을 저장할 수 있습니다.':state.photo?'사진을 드래그하거나 조절 막대로 위치를 맞춰주세요.':'사진을 선택하면 저장할 수 있습니다.');document.querySelectorAll('[data-style]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});draw();}));
function setView(view){state.view=view;canvas.classList.toggle('square',view==='square');['circle','square'].forEach(x=>{$(x+'View').classList.toggle('active',view===x);$(x+'View').setAttribute('aria-pressed',String(view===x));});}
$('circleView').addEventListener('click',()=>setView('circle'));$('squareView').addEventListener('click',()=>setView('square'));
let drag=null;canvas.addEventListener('pointerdown',e=>{if(!state.photo)return;drag={x:e.clientX,y:e.clientY,px:state.x,py:state.y};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});canvas.addEventListener('pointermove',e=>{if(!drag)return;const p=state.photo,box=photoGeometry(),s=Math.max(box.w/p.width,box.h/p.height)*state.zoom,ratio=N/canvas.getBoundingClientRect().width;state.x=Math.max(-1,Math.min(1,drag.px+(e.clientX-drag.x)*ratio/((p.width*s-box.w)/2+box.w*.32)));state.y=Math.max(-1,Math.min(1,drag.py+(e.clientY-drag.y)*ratio/((p.height*s-box.h)/2+box.h*.32)));$('panX').value=Math.round(state.x*100);$('panY').value=Math.round(state.y*100);draw();});function stopDrag(){drag=null;canvas.classList.remove('dragging');}canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);canvas.addEventListener('lostpointercapture',stopDrag);
$('download').addEventListener('click',()=>{if(!state.photo&&state.style!=='logo')return;draw();canvas.toBlob(blob=>{if(!blob){notify('저장에 실패했습니다. 다시 시도해 주세요.',true);return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='카카오_인적분할_부결_프로필.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notify('이미지를 저장했습니다. SNS 프로필 사진으로 설정해 주세요.');},'image/png');});
draw();
