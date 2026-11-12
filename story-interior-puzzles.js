(function (root) {
  'use strict';
  const N=1,E=2,S=4,W=8;
  const directions=[{bit:N,opposite:S,dx:0,dy:-1,name:'kuzey'},{bit:E,opposite:W,dx:1,dy:0,name:'doğu'},{bit:S,opposite:N,dx:0,dy:1,name:'güney'},{bit:W,opposite:E,dx:-1,dy:0,name:'batı'}];
  const layouts={
    beta:{title:'BETA · BESLEME HATTI',path:[0,1,5,6,10,14,15],required:[6],seed:1},
    alfa:{title:'ALFA · AKIM KÖPRÜSÜ',path:[0,4,8,9,5,6,7,11,15],required:[9,7],seed:2},
    gamma:{title:'GAMA · ARŞİV ÇIKIŞI',path:[0,1,2,6,5,9,10,11,15],required:[5,10],seed:3}
  };
  function rotate(mask,turns=1){for(let i=0;i<(turns%4+4)%4;i++)mask=((mask<<1)&15)|(mask>>3);return mask}
  function port(from,to){const dx=to%4-from%4,dy=Math.floor(to/4)-Math.floor(from/4);return dx===1?E:dx===-1?W:dy===1?S:N}
  function createCircuit(id){
    const layout=layouts[id];if(!layout)throw Error('Unknown circuit');
    const tiles=Array.from({length:16},(_,i)=>({mask:i%2?N|S:N|E,fixed:i===0||i===15}));
    layout.path.forEach((cell,i)=>{const before=i?port(cell,layout.path[i-1]):W,after=i===layout.path.length-1?E:port(cell,layout.path[i+1]);tiles[cell].mask=before|after});
    tiles.forEach((tile,i)=>{if(!tile.fixed)tile.mask=rotate(tile.mask,(i+layout.seed)%3+1)});
    return {id,tiles};
  }
  function inspectCircuit(board){
    const visited=new Set(),queue=[],leaks=[];let reached=false;
    if(board.tiles[0].mask&W)queue.push(0);else leaks.push(0);
    while(queue.length){const cell=queue.shift();if(visited.has(cell))continue;visited.add(cell);
      for(const d of directions){if(!(board.tiles[cell].mask&d.bit))continue;
        if(cell===0&&d.bit===W)continue;
        if(cell===15&&d.bit===E){reached=true;continue}
        const x=cell%4+d.dx,y=Math.floor(cell/4)+d.dy;
        if(x<0||x>3||y<0||y>3){leaks.push(cell);continue}
        const next=y*4+x;if(!(board.tiles[next].mask&d.opposite)){leaks.push(cell);continue}
        if(!visited.has(next))queue.push(next);
      }
    }
    const required=layouts[board.id].required,checked=required.filter(i=>visited.has(i)).length;
    return {visited:[...visited],leaks:[...new Set(leaks)],reached,checked,total:required.length,solved:reached&&leaks.length===0&&checked===required.length};
  }
  function ensureStyles(){if(document.getElementById('story-puzzle-style'))return;const style=document.createElement('style');style.id='story-puzzle-style';style.textContent=`
    .signal-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;width:min(100%,352px);margin:14px auto}
    #panel .signal-tile{position:relative;aspect-ratio:1;min-width:0;min-height:48px;margin:0;padding:5px;background:#122c3c;border:2px solid #668a9b;border-radius:8px}
    .signal-tile svg{display:block;width:100%;height:100%;max-height:72px;pointer-events:none}
    #panel .signal-tile[data-powered="true"]{background:#1d4852;border-color:#97e9d6}
    #panel .signal-tile[data-leak="true"]{border-color:#ffae8f}
    #panel .signal-tile:disabled{opacity:1;cursor:default}
    .signal-tile .fuse-label{position:absolute;right:4px;top:1px;color:#ffe4a3;font-size:12px;font-weight:bold}
    .puzzle-status{min-height:3em;line-height:1.5;color:#f4d4a0}
    .puzzle-legend{font-size:13px;line-height:1.5}
    #panel .puzzle-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    #panel .puzzle-actions button{margin:0;min-height:48px}
    .archive-list{list-style:none;margin:12px 0;padding:0;display:grid;gap:8px}
    .archive-row{display:grid;grid-template-columns:minmax(0,1fr) 48px 48px;gap:5px}
    #panel .archive-row button{margin:0;min-width:0;min-height:48px;padding:8px;overflow-wrap:anywhere}
    #panel .archive-card{text-align:left;border:2px solid #587d96}
    #panel .archive-card[aria-pressed="true"]{border-color:#f2c986;background:#3c3540}
    .archive-card strong,.archive-card span{display:block}
    .archive-card span{font-size:12px;line-height:1.4;margin-top:3px}
    #panel button:focus-visible{outline:3px solid #ffe4a3;outline-offset:2px}
  `;document.head.appendChild(style)}
  function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;return b}
  function base(container,title,instructions,onClose){ensureStyles();container.replaceChildren();const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=instructions;container.append(h,p);const status=document.createElement('div');status.className='puzzle-status';status.id='puzzle-feedback';status.setAttribute('role','status');const actions=document.createElement('div');actions.className='puzzle-actions';const close=button('KAPAT',onClose);close.id='puzzle-close';return{status,actions,close}}
  function mountCircuit(container,board,onSolved,onClose){
    const layout=layouts[board.id],ui=base(container,layout.title,'Parçaya dokunarak saat yönünde döndür. Sol üstteki beslemeyi sağ alttaki çıkışa bağla. Hat, ★ sigortalarının tümünden geçmeli ve açık uç bırakmamalı.',onClose);
    const legend=document.createElement('div');legend.className='puzzle-legend';legend.textContent='GİRİŞ: sol üst ← · ÇIKIŞ: sağ alt → · ★ zorunlu sigorta';
    const grid=document.createElement('div');grid.className='signal-board';grid.setAttribute('aria-label','Döndürülebilir röle devresi');
    const tiles=board.tiles.map((tile,i)=>{const b=button('',()=>{tile.mask=rotate(tile.mask);redraw();ui.status.textContent='Bağlantı değişti. Enerjiyi sınayarak hattı doğrula.'});b.className='signal-tile';b.dataset.cell=String(i);b.disabled=tile.fixed;grid.appendChild(b);return b});
    function redraw(){const state=inspectCircuit(board);tiles.forEach((b,i)=>{const tile=board.tiles[i];b.dataset.powered=String(state.visited.includes(i));b.dataset.leak=String(state.leaks.includes(i));b.dataset.ports=String(tile.mask);b.setAttribute('aria-label',`${Math.floor(i/4)+1}. satır ${i%4+1}. sütun; ${directions.filter(d=>tile.mask&d.bit).map(d=>d.name).join(', ')}; ${tile.fixed?'sabit uç':'döndür'}`);
      const ends={1:'30 0',2:'60 30',4:'30 60',8:'0 30'};const paths=directions.filter(d=>tile.mask&d.bit).map(d=>`<path d="M30 30 L${ends[d.bit]}"/>`).join('');
      b.innerHTML=`<svg aria-hidden="true" viewBox="0 0 60 60"><g stroke="${state.visited.includes(i)?'#b4f5dc':'#b7ccd6'}" stroke-width="9" fill="none">${paths}</g><circle cx="30" cy="30" r="8" fill="#172c3c" stroke="#d0e5eb" stroke-width="3"/></svg>${layout.required.includes(i)?'<span class="fuse-label">★</span>':''}`;
    })}
    const check=button('ENERJİYİ SINA',()=>{const state=inspectCircuit(board);redraw();if(state.solved){onSolved();return}ui.status.textContent=`Hat tamamlanmadı. Sigorta ${state.checked}/${state.total}; açık bağlantı ${state.leaks.length}; çıkış ${state.reached?'bağlı':'kesik'}. Aydınlanan hattın kesildiği parçayı incele.`});check.id='circuit-check';ui.actions.append(check,ui.close);container.append(legend,grid,ui.status,ui.actions);redraw();
  }
  const archiveCards={signature:{time:242,label:'İMZA',detail:'04:02 · Tahliye emrine ait imza'},closure:{time:250,label:'KAPANIŞ',detail:'04:10 · İstasyon kapıları mühürlendi'},awakening:{time:261,label:'UYANIŞ',detail:'04:21 · Uyanış kaydı açıldı'},order:{time:310,label:'TAHLİYE EMRİ',detail:'05:10 · İmzalanan komutun üretimi'}};
  function createChronology(){return{order:['awakening','order','closure','signature'],selected:[]}}
  function inspectChronology(board){const sorted=board.order.length===4&&new Set(board.order).size===4&&board.order.every((id,i)=>archiveCards[id]&&(!i||archiveCards[board.order[i-1]].time<=archiveCards[id].time));const pair=board.selected.length===2&&board.selected.includes('signature')&&board.selected.includes('order');return{sorted,pair,solved:sorted&&pair}}
  function mountChronology(container,board,onSolved,onClose){
    const ui=base(container,'KRONOLOJİ · KANIT PANOSU','Dört kaydı damga saatine göre erkenden geçe sırala. Sonra aynı emrin üretilmesi ile imzalanması arasındaki çelişkiyi gösteren iki kaydı seç. Tarih sırası tek başına olayın nedenini açıklamaz.',onClose);
    const list=document.createElement('ol');list.className='archive-list';
    function draw(focusId){list.replaceChildren();board.order.forEach((id,index)=>{const data=archiveCards[id],row=document.createElement('li');row.className='archive-row';row.dataset.record=id;
      const card=button('',()=>{if(board.selected.includes(id))board.selected=board.selected.filter(x=>x!==id);else if(board.selected.length<2)board.selected.push(id);else{ui.status.textContent='İki kayıt seçili. Başka birini seçmeden önce bir seçimi kaldır.';return}draw(id+'-card')});card.className='archive-card';card.id=id+'-card';card.setAttribute('aria-pressed',String(board.selected.includes(id)));card.innerHTML='<strong>'+data.label+'</strong><span>'+data.detail+'</span>';
      const move=(delta)=>{const dest=index+delta;if(dest<0||dest>=board.order.length)return;[board.order[index],board.order[dest]]=[board.order[dest],board.order[index]];draw(id+(delta<0?'-up':'-down'))};const up=button('↑',()=>move(-1)),down=button('↓',()=>move(1));up.id=id+'-up';down.id=id+'-down';up.disabled=index===0;down.disabled=index===3;up.setAttribute('aria-label',data.label+' kaydını yukarı taşı');down.setAttribute('aria-label',data.label+' kaydını aşağı taşı');row.append(card,up,down);list.appendChild(row);
    });if(focusId){const el=document.getElementById(focusId);if(el&&!el.disabled)el.focus()}}
    const check=button('KANITLARI KARŞILAŞTIR',()=>{const state=inspectChronology(board);if(!state.sorted){ui.status.textContent='Önce kayıtları damga saatlerine göre erkenden geçe sırala.';return}if(!state.pair){ui.status.textContent='Sıra doğru. Aynı komutun imzası ile üretim kaydını birlikte seç.';return}onSolved()});check.id='chronology-check';ui.actions.append(check,ui.close);container.append(list,ui.status,ui.actions);draw();
  }
  const api={rotate,createCircuit,inspectCircuit,mountCircuit,createChronology,inspectChronology,mountChronology};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.StoryInteriorPuzzles=api;
})(typeof globalThis!=='undefined'?globalThis:this);
