'use strict';
const $=id=>document.getElementById(id), canvas=$('preview'), ctx=canvas.getContext('2d');
const state={photo:null,style:'campaign',zoom:1,x:0,y:0,view:'circle'};
const N=1080,C=540;
const logo = new Image();
const squareLogo = new Image();
const frame = new Image();

function isReady(image) {
  return image.complete && image.naturalWidth > 0;
}

function updateDownload() {
  const artworkReady = state.style === 'logo' ? isReady(squareLogo)
    : isReady(logo) && isReady(frame);
  $('download').disabled = !artworkReady || (!state.photo && state.style !== 'logo');
}

function loadArtwork(image, source, fallback) {
  image.onload = () => {
    draw();
    updateDownload();
  };
  image.onerror = () => {
    if (fallback) {
      loadArtwork(image, fallback);
      return;
    }
    updateDownload();
    notify('디자인 이미지를 불러오지 못했습니다. 페이지를 새로고침해 주세요.', true);
  };
  image.src = source;
}

const downloadPanel = document.querySelector('.logo-downloads');
downloadPanel.addEventListener('toggle', () => {
  if (!downloadPanel.open) return;
  for (const image of downloadPanel.querySelectorAll('[data-src]')) {
    image.src = image.dataset.src;
    delete image.dataset.src;
  }
});
function circle(x,y,r,fill,stroke,width=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function photoGeometry(){return state.style==='campaign'?{x:270,y:152,w:482,h:405}:{x:120,y:160,w:760,h:650};}
function photo(){const box=photoGeometry();ctx.save();ctx.beginPath();ctx.ellipse(box.x+box.w/2,box.y+box.h/2,box.w/2,box.h/2,0,0,Math.PI*2);ctx.clip();if(state.photo){const p=state.photo,scale=Math.max(box.w/p.width,box.h/p.height)*state.zoom,w=p.width*scale,h=p.height*scale;const dx=state.x*((w-box.w)/2+box.w*.32),dy=state.y*((h-box.h)/2+box.h*.32);ctx.fillStyle='#fff';ctx.fillRect(box.x,box.y,box.w,box.h);ctx.drawImage(p,box.x+(box.w-w)/2+dx,box.y+(box.h-h)/2+dy,w,h);}else{ctx.fillStyle='#f3f3ed';ctx.fillRect(box.x,box.y,box.w,box.h);circle(box.x+box.w/2,box.y+box.h*.36,box.w*.17,'#c6c8bc');ctx.beginPath();ctx.ellipse(box.x+box.w/2,box.y+box.h*.95,box.w*.4,box.h*.4,0,0,Math.PI*2);ctx.fillStyle='#c6c8bc';ctx.fill();}ctx.restore();}
function badge(x,y,r){circle(x,y,r,'#fff','#1b1b17',5);if(logo.complete&&logo.naturalWidth){ctx.save();ctx.beginPath();ctx.arc(x,y,r-9,0,Math.PI*2);ctx.clip();if (logo.naturalWidth === 452) {
    ctx.drawImage(logo,x-r+10,y-r+10,(r-10)*2,(r-10)*2);
  } else {
    ctx.drawImage(logo,398,202,452,465,x-r+10,y-r+10,(r-10)*2,(r-10)*2);
  }ctx.restore();}}
function drawCompactPlacard() {
  // Reuse the title and the three-line artwork from the approved frame.
  const unit = frame.naturalWidth / N;
  ctx.drawImage(frame, 265 * unit, 80 * unit, 550 * unit, 84 * unit, 265, 80, 550, 84);
  const scale = 0.58;
  ctx.save();
  ctx.translate(C * (1 - scale), 422);
  ctx.scale(scale, scale);

  // The full-size frame includes the outer yellow ring. Clip it away before
  // copying the lettering so the smaller sign has a clean edge of its own.
  ctx.beginPath();
  ctx.roundRect(107, 529, 866, 600, 60);
  ctx.fillStyle = '#ffdd00';
  ctx.fill();
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 12;
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(136, 551, 808, 470);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(C, C, 504, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(frame, 0, 0, N, N);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, N, N);
  ctx.fillStyle = '#fffbed';
  ctx.fillRect(0, 0, N, N);
  circle(C, C, 538, '#fff');
  if (state.style === 'logo') {
    if (isReady(squareLogo)) ctx.drawImage(squareLogo, 110, 110, 860, 860);
    circle(C, C, 521, 'transparent', '#ffd600', 28);
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(C, C, 538, 0, Math.PI * 2);
  ctx.clip();
  if (state.style === 'campaign' && isReady(frame)) {
    ctx.drawImage(frame, 0, 0, N, N);
    photo();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 528, N, N - 528);
    ctx.clip();
    ctx.drawImage(frame, 0, 0, N, N);
    ctx.restore();
    badge(850, 338, 106);
  } else {
    photo();
    if (state.style === 'badge' && isReady(frame)) drawCompactPlacard();
    badge(866, 313, 95);
    circle(C, C, 521, 'transparent', '#ffd600', 28);
  }
  ctx.restore();
}
function notify(s,error=false){$('status').textContent=s;$('status').classList.toggle('error',error);}
function reset(){state.zoom=1;state.x=0;state.y=0;$('zoom').value=100;$('panX').value=0;$('panY').value=0;$('zoomValue').value='100%';draw();}
let uploadSequence=0;
async function loadFile(file){const sequence=++uploadSequence;if(!file)return;if(!/^image\/(jpeg|png|webp)$/.test(file.type)){notify('JPG, PNG 또는 WebP 사진을 선택해 주세요.',true);return;}if(file.size>20*1024*1024){notify('20MB 이하의 사진을 선택해 주세요.',true);return;}notify('사진을 불러오는 중입니다.');const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();if(sequence!==uploadSequence)return;if(img.naturalWidth<1)throw Error('empty');state.photo=img;reset();updateDownload();$('uploadLabel').textContent='다른 사진 선택';notify('사진을 드래그하거나 조절 막대로 위치를 맞춰주세요.');}catch(e){if(sequence===uploadSequence)notify('사진을 열 수 없습니다. 다른 사진으로 다시 시도해 주세요.',true);}finally{URL.revokeObjectURL(url);$('photoInput').value='';}}
$('photoInput').addEventListener('change',e=>loadFile(e.target.files[0]));
const zone=$('dropzone');['dragenter','dragover'].forEach(name=>zone.addEventListener(name,e=>{e.preventDefault();zone.classList.add('over');}));['dragleave','drop'].forEach(name=>zone.addEventListener(name,e=>{e.preventDefault();zone.classList.remove('over');}));zone.addEventListener('drop',e=>loadFile(e.dataTransfer.files[0]));
$('zoom').addEventListener('input',e=>{state.zoom=Number(e.target.value)/100;$('zoomValue').value=`${e.target.value}%`;draw();});
['panX','panY'].forEach((id,i)=>$(id).addEventListener('input',e=>{state[i?'y':'x']=Number(e.target.value)/100;draw();}));$('reset').addEventListener('click',reset);
document.querySelectorAll('[data-style]').forEach(b=>b.addEventListener('click',()=>{state.style=b.dataset.style;if(state.style==='logo'&&!squareLogo.getAttribute('src'))loadArtwork(squareLogo,'assets/alliance-logo.png');updateDownload();$('adjustments').hidden=state.style==='logo';$('previewHelp').textContent=state.style==='logo'?'사진 없이 주주연대 로고 프로필을 저장할 수 있습니다.':'사진을 올린 후 드래그해서 위치를 맞춰보세요.';notify(state.style==='logo'?'로고 프로필을 저장할 수 있습니다.':state.photo?'사진을 드래그하거나 조절 막대로 위치를 맞춰주세요.':'사진을 선택하면 저장할 수 있습니다.');document.querySelectorAll('[data-style]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});draw();}));
function setView(view){state.view=view;canvas.classList.toggle('square',view==='square');['circle','square'].forEach(x=>{$(x+'View').classList.toggle('active',view===x);$(x+'View').setAttribute('aria-pressed',String(view===x));});}
$('circleView').addEventListener('click',()=>setView('circle'));$('squareView').addEventListener('click',()=>setView('square'));
let drag=null;canvas.addEventListener('pointerdown',e=>{if(!state.photo)return;drag={x:e.clientX,y:e.clientY,px:state.x,py:state.y};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});canvas.addEventListener('pointermove',e=>{if(!drag)return;const p=state.photo,box=photoGeometry(),s=Math.max(box.w/p.width,box.h/p.height)*state.zoom,ratio=N/canvas.getBoundingClientRect().width;state.x=Math.max(-1,Math.min(1,drag.px+(e.clientX-drag.x)*ratio/((p.width*s-box.w)/2+box.w*.32)));state.y=Math.max(-1,Math.min(1,drag.py+(e.clientY-drag.y)*ratio/((p.height*s-box.h)/2+box.h*.32)));$('panX').value=Math.round(state.x*100);$('panY').value=Math.round(state.y*100);draw();});function stopDrag(){drag=null;canvas.classList.remove('dragging');}canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);canvas.addEventListener('lostpointercapture',stopDrag);
$('download').addEventListener('click',()=>{if($('download').disabled)return;draw();canvas.toBlob(blob=>{if(!blob){notify('저장에 실패했습니다. 다시 시도해 주세요.',true);return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='카카오_인적분할_부결_프로필.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);notify('이미지를 저장했습니다. SNS 프로필 사진으로 설정해 주세요.');},'image/png');});
draw();

loadArtwork(logo, 'assets/alliance-symbol.webp', 'assets/alliance-circle.png');
loadArtwork(frame, 'assets/campaign-frame-lossless.webp', 'assets/campaign-frame.png');
