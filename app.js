const ortho = document.getElementById('ortho');
const aux = document.getElementById('aux');
const octx = ortho.getContext('2d');
const actx = aux.getContext('2d');
const state = { mode:'lamina', spectator:{source:'plan', x:510, y:620}, dragging:false, showProjectors:true, showFold:true, showLabels:true, showTrue:true };
const cases = {
  lamina:{title:'Lamina', info:'A single triangular lamina is shown in plan and elevation. Move the spectator to create an auxiliary projection. When the view direction is parallel to the plane, the auxiliary view becomes an edge view; when viewed normal to the plane, the true shape is seen.'},
  intersecting:{title:'Intersecting planes', info:'Two laminae intersect along a common line. Use the auxiliary view to inspect the line of intersection and compare apparent shapes with true shapes.'},
  tetra:{title:'Tetrahedron', info:'A tetrahedron is projected into plan and elevation. Auxiliary views reveal true lengths of edges and point-view conditions when an edge is viewed end-on.'},
  line:{title:'Lamina + line', info:'A line is added to the lamina. The auxiliary view helps test line-plane relationships, shortest distance behaviour, and true length of the line.'}
};
function resize(){
  const r=ortho.getBoundingClientRect(); ortho.width=r.width*devicePixelRatio; ortho.height=r.height*devicePixelRatio; octx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  const a=aux.getBoundingClientRect(); aux.width=a.width*devicePixelRatio; aux.height=a.height*devicePixelRatio; actx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); draw();
}
window.addEventListener('resize', resize);
function W(){return ortho.getBoundingClientRect().width} function H(){return ortho.getBoundingClientRect().height} function AW(){return aux.getBoundingClientRect().width} function AH(){return aux.getBoundingClientRect().height}
function mid(){return H()/2}
function grid(ctx,w,h){ctx.fillStyle='#081017';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#1d2a38';ctx.lineWidth=1;for(let x=0;x<w;x+=34){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=34){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}for(let x=0;x<w;x+=170){ctx.strokeStyle='#263545';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=170){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}}
function pts3(){
 const base=[[-90,-60,0],[95,-35,0],[35,85,0]];
 let t=Date.now()*0; return base.map(([x,y,z])=>({x:x+W()/2,y,z:z}));
}
function elevP(p){return {x:p.x,y:mid()-120 - p.z - p.y*.28}} function planP(p){return {x:p.x,y:mid()+130 + p.y}}
function poly(ctx,pts,fill,stroke){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
function line(ctx,a,b,c='#d7e2ee',w=1){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
function label(ctx,t,p,c='#bcd0e4'){if(!state.showLabels)return;ctx.fillStyle=c;ctx.font='13px ui-monospace,Consolas';ctx.fillText(t,p.x+7,p.y-7)}
function shapeDraw(ctx, proj){
 const p=pts3(); const ep=p.map(elevP), pp=p.map(planP);
 const main = proj==='elev'?ep:pp;
 poly(ctx,main,'rgba(104,185,255,.13)','#e5eef7');
 if(state.mode==='intersecting'){let q=main.map((v,i)=>({x:v.x+(i==0?35:-25),y:v.y+(i==2?-65:45)})); poly(ctx,q,'rgba(255,173,84,.12)','#ffad54'); line(ctx,main[0],q[2],'#78d99a',2)}
 if(state.mode==='tetra'){const apex=proj==='elev'?{x:W()/2+10,y:mid()-230}:{x:W()/2+10,y:mid()+130}; main.forEach(v=>line(ctx,v,apex,'#d7e2ee',1.5)); ctx.fillStyle='#e8d65f';ctx.beginPath();ctx.arc(apex.x,apex.y,3,0,7);ctx.fill();}
 if(state.mode==='line'){let a={x:main[0].x-45,y:main[0].y+40}, b={x:main[1].x+55,y:main[1].y-75}; line(ctx,a,b,'#ff6464',3); label(ctx,'line',b,'#ff8b8b')}
 main.forEach((v,i)=>{ctx.fillStyle='#dfe9f4';ctx.beginPath();ctx.arc(v.x,v.y,3.3,0,7);ctx.fill();label(ctx,String.fromCharCode(65+i)+(proj==='elev'?"'":''),v)})
}
function spectator(){const s=state.spectator; return s}
function drawSpectator(ctx){const s=spectator(); ctx.fillStyle='#ffad54'; ctx.beginPath(); ctx.arc(s.x,s.y,8,0,7); ctx.fill(); ctx.strokeStyle='#ffe3bf';ctx.lineWidth=2;ctx.stroke(); label(ctx,s.source==='plan'?'SP plan':'SP elev',{x:s.x,y:s.y},'#ffbd70');}
function drawOrtho(){const w=W(), h=H(), m=mid(); grid(octx,w,h); if(state.showFold){line(octx,{x:0,y:m},{x:w,y:m},'#e8d65f',2); octx.fillStyle='#e8d65f'; octx.font='14px ui-monospace'; octx.fillText('XY reference / folding line',18,m-8)}
 octx.fillStyle='#dce7f4'; octx.font='20px ui-monospace'; octx.fillText('ELEVATION',24,60); octx.fillText('PLAN',24,m+60);
 shapeDraw(octx,'elev'); shapeDraw(octx,'plan'); drawSpectator(octx);
 const target={x:W()/2,y: state.spectator.source==='plan'?mid()+130:mid()-120}; let vec={x:target.x-state.spectator.x,y:target.y-state.spectator.y}; let ang=Math.atan2(vec.y,vec.x); document.getElementById('angleReadout').textContent=Math.round(ang*180/Math.PI)+'°'; document.getElementById('sourceReadout').textContent=state.spectator.source.toUpperCase();
 if(state.showProjectors){const points=pts3().map(state.spectator.source==='plan'?planP:elevP); points.forEach(p=>line(octx,state.spectator,p,'rgba(104,185,255,.65)',1));}
}
function drawAux(){const w=AW(),h=AH(); grid(actx,w,h); actx.fillStyle='#dce7f4';actx.font='18px ui-monospace'; actx.fillText('AUXILIARY',18,62); const source=state.spectator.source; const p=pts3(); let base=p.map(source==='plan'?planP:elevP); const cen={x:base.reduce((s,p)=>s+p.x,0)/base.length,y:base.reduce((s,p)=>s+p.y,0)/base.length}; const dir=Math.atan2(cen.y-state.spectator.y,cen.x-state.spectator.x); const ca=Math.cos(-dir), sa=Math.sin(-dir); let projected=base.map(pt=>{let x=pt.x-cen.x,y=pt.y-cen.y; return {x:w/2 + x*ca-y*sa, y:h/2 + x*sa+y*ca};});
 // squash to show edge / point view when spectator aligns with a principal direction
 const edgeFactor=Math.abs(Math.sin(dir)); let edge=edgeFactor<.18; if(edge){projected=projected.map(p=>({x:p.x,y:h/2+(p.y-h/2)*.12}));}
 poly(actx,projected, edge?'rgba(120,217,154,.18)':'rgba(104,185,255,.14)', edge?'#78d99a':'#e5eef7');
 if(state.mode==='intersecting'){let q=projected.map((v,i)=>({x:v.x+(i==0?30:-20),y:v.y+(i==2?-55:38)}));poly(actx,q,'rgba(255,173,84,.12)','#ffad54');line(actx,projected[0],q[2],'#78d99a',2)}
 if(state.mode==='tetra'){let apex={x:w/2+5,y:edge?h/2:h/2-115}; projected.forEach(v=>line(actx,v,apex,'#d7e2ee',1.5)); actx.fillStyle='#e8d65f'; actx.beginPath();actx.arc(apex.x,apex.y,3,0,7);actx.fill();}
 if(state.mode==='line'){line(actx,{x:w/2-110,y:h/2+65},{x:w/2+120,y:h/2-85},'#ff6464',3)}
 if(state.showProjectors){projected.forEach((p,i)=>line(actx,{x:18,y:120+i*26},p,'rgba(104,185,255,.34)',1));}
 projected.forEach((v,i)=>{actx.fillStyle='#dfe9f4';actx.beginPath();actx.arc(v.x,v.y,3.4,0,7);actx.fill();label(actx,String.fromCharCode(65+i)+'a',v)})
 let res=edge?'EDGE VIEW CONDITION':'AUXILIARY TRUE-SHAPE VIEW'; document.getElementById('resultReadout').textContent=edge?'Edge view detected':'Auxiliary view';
 if(state.showTrue){actx.fillStyle=edge?'#78d99a':'#e8d65f';actx.font='14px ui-monospace';actx.fillText(res,18,h-52);actx.fillStyle='#9fb0c4';actx.fillText(edge?'The lamina is being viewed nearly edge-on.':'View is generated perpendicular to the chosen direction.',18,h-30)}
}
function draw(){drawOrtho();drawAux()}
ortho.addEventListener('pointerdown',e=>{const r=ortho.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top; const d=Math.hypot(x-state.spectator.x,y-state.spectator.y); if(d<22){state.dragging=true;ortho.setPointerCapture(e.pointerId)}});
ortho.addEventListener('pointermove',e=>{if(!state.dragging)return;const r=ortho.getBoundingClientRect();state.spectator.x=e.clientX-r.left; state.spectator.y=e.clientY-r.top; state.spectator.source=state.spectator.y>mid()?'plan':'elev'; draw();});
ortho.addEventListener('pointerup',()=>state.dragging=false);
document.querySelectorAll('#caseTabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#caseTabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.mode=b.dataset.case;document.getElementById('infoTitle').textContent=cases[state.mode].title;document.getElementById('infoText').textContent=cases[state.mode].info;draw();});
['showProjectors','showFold','showLabels','showTrue'].forEach(id=>document.getElementById(id).onchange=e=>{state[id]=e.target.checked;draw()});
document.getElementById('resetBtn').onclick=()=>{state.spectator={source:'plan',x:510,y:620};draw()};
document.getElementById('infoTitle').textContent=cases.lamina.title;document.getElementById('infoText').textContent=cases.lamina.info;resize();
