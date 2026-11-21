/* Original Lost Signal inventory miniatures. Pure SVG art, no game state or assets. */
(function(root,factory){
    'use strict';
    const api=factory();
    if(typeof module==='object'&&module.exports)module.exports=api;
    if(root)root.StationArt=api;
})(typeof window!=='undefined'?window:globalThis,function(){
    'use strict';
    let serial=0;
    const hues={damage:'#fb6557',attackSpeed:'#ff9b50',range:'#55aaf4',critChance:'#b981ff',critMult:'#ef77d2',multishot:'#67d9ed',bounce:'#9b8aff',knockback:'#5de2c7',maxHp:'#62dc99',hpRegen:'#6df0a4',armor:'#8cc8b1',shield:'#59dcf2',lifesteal:'#e76189',thorns:'#e68c93',goldBonus:'#f4bd55',waveGold:'#ffe077',crystalChance:'#62e4ee',interest:'#e4ba67',part:'#d7a46e',crystal:'#69e4f2',credits:'#f5c561',crate:'#b6dded',ark:'#82c9ff',slow:'#91dbff',emp:'#b18bff',overload:'#ff9d5e',signal:'#f4dc8c'};
    const rare=['#a6bcc8','#66d19a','#6ab5ff','#bc8bff','#ffb765','#7ceee0','#ff8176','#ffe496'];
    const keys=Object.freeze([...Object.keys(hues),...Array.from({length:16},(_,i)=>'weapon_'+i)]);
    function svg(key,options={}){
        const weapon=/^weapon_(\d+)$/.exec(String(key));
        const number=weapon?Math.min(15,Math.max(0,Number(weapon[1]))):0;
        const color=/^#[\da-f]{6}$/i.test(options?.color)?options.color:(weapon?rare[Math.floor(number/2)]:(Object.prototype.hasOwnProperty.call(hues,key)?hues[key]:hues.crate));
        const id='lsa'+(++serial),m=`url(#${id}m)`,dark=`url(#${id}d)`,glow=`url(#${id}g)`,light=`url(#${id}l)`;
        const p=(d,fill=m,stroke='#111c2a',width=1.4)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
        const rect=(x,y,w,h,fill=m,r=2)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="#162434" stroke-width="1.2"/>`;
        const circle=(x,y,r,fill=glow,stroke='#c0dce7',width=1.3)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
        const line=(d,stroke='#b7ced9',width=1.4)=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
        const bolts=(points)=>points.map(([x,y])=>circle(x,y,1.5,'#c9d8dd','#324858',.7)).join('');
        const vents=(x,y,count=4)=>Array.from({length:count},(_,i)=>rect(x+i*5,y,2.5,9,'#0b1827',.6)).join('');
        const pad=()=>p('M26 70L48 60L72 71L67 80L45 87L23 78Z',dark)+p('M26 70L48 60L72 71L46 81L23 74Z',m)+line('M26 75L45 82L67 75',color,2);
        let art='';
        function cannon(index){
            const family=Math.floor(index/2),odd=index%2;
            const body=p(odd?'M16 55L26 37L51 32L70 47L64 66L40 78L19 68Z':'M18 52L29 39L56 36L72 50L61 70L36 77L18 66Z',m)+p('M19 61L38 68L62 58L61 70L36 77L19 68Z',dark)+rect(27,49,17,13,glow,3)+bolts([[24,57],[52,43],[56,66]]);
            let barrel='';
            if(family===0)barrel=p(odd?'M43 43L63 17L73 20L78 31L57 55Z':'M43 44L66 16L77 20L82 29L58 56Z',m)+p('M59 29L67 19L76 23L69 33Z',dark)+p('M47 44L63 25L67 29L52 49Z',color)+line('M63 18L76 22L81 29','#e2e7df',2)+rect(25,66,7,14,dark);
            if(family===1)barrel=p('M38 45L52 15L60 14L60 34L72 14L81 17L66 52Z',dark)+p('M43 42L55 18L58 19L52 41L75 20L78 22L61 49Z',light)+line('M54 22L58 32L67 25L71 33',color,3)+circle(52,48,6,glow);
            if(family===2)barrel=p('M40 46L63 18L76 20L83 30L62 58Z',dark)+p('M47 44L66 22L75 25L77 30L58 52Z',m)+[0,1,2].map(i=>line(`M${49+i*6} ${43-i*7}L${60+i*6} ${48-i*7}`,color,3)).join('')+p(odd?'M26 37L23 22L39 30L43 40Z':'M24 40L16 29L34 31L41 40Z',m);
            if(family===3)barrel=p('M39 46Q28 20 47 13L56 17Q40 27 49 40L64 43Q79 30 69 19L77 15Q96 33 68 57Z',m)+line('M43 18Q33 33 45 45M76 21Q85 37 66 50',color,3)+p('M45 46L64 23L69 28L58 52Z',light)+circle(54,48,6,glow);
            if(family===4)barrel=p('M37 45L50 23L73 16L84 29L77 46L59 60Z',dark)+p('M45 42L55 28L71 24L77 32L69 45L55 52Z',m)+circle(61,37,10,dark)+circle(61,37,6,glow)+[0,1,2].map(i=>line(`M${36+i*5} ${51+i*4}L${46+i*5} ${39+i*4}`,color,2.5)).join('');
            if(family===5)barrel=p('M36 49L37 25L48 29L52 12L62 24L76 15L75 31L87 33L73 48L60 61Z',m)+p('M44 43L54 23L61 31L73 26L69 40L77 37L59 53Z',light)+circle(57,42,8,glow)+line('M42 28L45 39M76 20L70 32',color,2);
            if(family===6)barrel=p('M38 47L52 17L72 12L83 22L81 38L68 46L70 31L64 25L56 36L57 55Z',m)+p('M53 20L71 16L78 23L76 32L68 29L64 22L59 31Z',color)+circle(49,48,9,dark)+circle(49,48,5,glow)+line('M29 58L39 54L44 60L54 56',color,2);
            if(family===7)barrel=p('M32 42L38 25L47 29L57 10L67 23L80 20L85 36L68 59L48 63Z',dark)+p('M42 41L48 30L57 17L62 30L75 26L78 35L62 51Z',m)+p('M53 30L58 20L62 34L74 31L63 42L63 51L55 45L46 46Z',light)+line('M37 43L43 49L37 57M71 45L66 53L71 58',color,3)+circle(58,38,4,'#faffff');
            const detail=odd?line('M22 62L29 65M23 67L28 69',color,2)+p('M35 74L38 85L47 82L46 72Z',dark):rect(19,53,7,8,dark);
            return body+barrel+detail;
        }
        if(weapon)art=cannon(number);
        else switch(key){
            case 'damage':art=cannon(4);break;
            case 'attackSpeed':art=p('M21 57L33 41L64 39L76 55L63 74L35 79L19 69Z',m)+p('M31 48L47 15L58 18L43 55Z',m)+p('M48 52L66 18L77 23L60 61Z',m)+p('M47 15L58 18L55 26L44 22Z',dark)+p('M66 18L77 23L73 30L63 25Z',dark)+line('M36 44L43 29M54 49L62 34',color,4)+vents(32,61,5)+line('M19 43L25 35M15 36L21 28',color,2);break;
            case 'range':case 'signal':art=pad()+p('M43 70L44 48L53 44L56 70Z',m)+p('M23 25Q16 54 52 60Q80 48 74 22L49 43Z',m)+p('M23 25Q41 60 74 22Q53 15 23 25Z',dark)+line('M25 27Q48 47 71 24M30 26L50 39L65 24','#7595a6',1.5)+p('M47 41L51 14L56 17L53 43Z',light)+circle(53,16,3,light)+line('M64 9Q82 15 84 34M65 16Q76 20 77 32',color,2);break;
            case 'critChance':art=p('M24 28L56 20L78 41L71 70L40 82L19 58Z',m)+p('M24 43L41 30L66 36L72 54L59 72L37 74L24 59Z',dark)+circle(48,51,20,'#142232','#96abc0',2)+circle(48,51,15,glow)+circle(48,51,7,'#231f3a',color,2)+line('M48 30V39M48 63V72M27 51H36M60 51H69','#f6dfff',2)+bolts([[29,31],[68,40],[37,76]]);break;
            case 'critMult':art=p('M20 34L34 20L66 20L79 35L73 65L50 83L27 66Z',m)+p('M29 37L42 29L64 34L67 56L51 70L35 57Z',dark)+p('M50 26L40 49L50 48L43 68L65 42L54 43L62 26Z',light)+line('M24 36L29 57M72 35L69 54',color,3)+bolts([[35,24],[66,25],[50,77]]);break;
            case 'multishot':art=pad()+circle(48,55,22,m)+[[-20,0],[0,-10],[20,0]].map(([x,y])=>`<g transform="translate(${x} ${y})">${p('M42 49L42 23L54 23L56 49Z',m)}${rect(44,20,9,9,dark)}${line('M47 31V43',color,3)}</g>`).join('')+p('M32 55L48 44L64 55L61 69L48 76L35 69Z',dark)+circle(48,59,7,glow);break;
            case 'bounce':case 'ark':art=p('M22 62L37 41L64 39L76 60L62 76L36 81Z',m)+p('M32 47L30 22L40 17L44 40L57 40L61 17L72 22L68 48Z',m)+line('M38 25L47 33L53 23L62 32',color,4)+circle(48,58,11,dark)+circle(48,58,6,glow)+bolts([[27,65],[66,65]]);break;
            case 'knockback':case 'emp':art=pad()+p('M33 64L31 35L40 25L62 27L69 41L65 66Z',m)+circle(48,46,18,dark)+circle(48,46,12,glow)+circle(48,46,6,'#e1ffff')+line('M22 24Q6 45 22 65M76 24Q91 45 76 65',color,3)+line('M28 31Q17 45 28 59M70 31Q80 45 70 59',color,1.7);break;
            case 'maxHp':art=pad()+p('M31 22L62 22L73 35L73 61L61 73L34 73L22 61L22 35Z',m)+p('M32 29L61 29L66 38L66 58L58 65L37 65L29 57L29 38Z',dark)+rect(35,33,26,28,glow,5)+line('M48 39V55M40 47H56','#e6fff1',5)+p('M23 36L15 39L15 59L23 62Z',m)+p('M72 36L80 39L80 59L72 62Z',m)+bolts([[31,27],[63,27],[30,65],[64,65]])+line('M38 22H56','#f1fff7',2);break;
            case 'armor':art=p('M19 30L34 16L48 23L62 16L78 30L72 68L49 84L25 68Z',m)+p('M25 34L39 28L48 33L58 28L71 34L66 60L48 73L31 61Z',dark)+p('M30 35L40 31L48 36L56 31L66 35L60 52L48 60L36 52Z',glow)+p('M29 63L48 74L67 63L64 69L49 79L32 70Z','#465e67')+line('M23 33L27 55M73 33L69 55','#deedf0',2)+bolts([[28,29],[68,29],[49,77]]);break;
            case 'hpRegen':art=pad()+`<g transform="rotate(28 48 43)">${rect(36,21,25,43,m,5)}${rect(39,30,19,22,glow,2)}${rect(33,19,31,8,dark)}${rect(40,59,17,9,dark)}${p('M45 68L52 68L50 83L47 83Z','#c6dbe1')}${line('M44 34V48M41 41H55','#effff8',4)}${line('M38 27V53','#e2fff4',2)}</g>`+circle(69,66,9,glow)+line('M69 61V71M64 66H74','#effff7',2);break;
            case 'shield':art=pad()+p('M27 27L48 17L70 27L67 58L48 75L30 59Z',m)+p('M33 31L48 24L64 31L61 54L48 65L36 55Z',glow)+p('M48 25L48 63L36 54L33 32Z','#d1f9ff33','none')+p('M39 40L48 35L57 40L56 51L48 58L40 51Z',dark)+circle(48,46,5,light)+line('M21 28L19 48L25 65M76 29L78 49L71 65',color,2);break;
            case 'lifesteal':art=pad()+p('M35 21L61 21L69 36L65 65L48 76L31 65L27 37Z',m)+p('M38 29L58 29L62 39L58 61L48 68L38 61L34 40Z',dark)+p('M48 31C43 40 38 45 39 51C40 64 59 64 59 51C59 45 53 38 48 31Z',glow)+line('M43 48Q41 55 47 57','#ffe0e9',2)+p('M27 37L16 35L17 54L31 57Z',m)+p('M68 37L80 35L79 54L65 57Z',m);break;
            case 'thorns':art=p('M16 23L34 29L47 12L59 28L80 23L73 43L85 55L69 61L64 78L48 73L31 80L27 61L12 54L23 43Z',m)+p('M32 32L48 26L65 34L62 57L48 68L33 57Z',dark)+p('M37 38L48 33L59 39L56 54L48 59L40 53Z',glow)+line('M47 15L48 24M17 25L28 33M79 25L68 34','#e7cace',2);break;
            case 'goldBonus':case 'credits':art=[0,1,2].map(i=>`<g transform="translate(${i*9} ${-i*11})">${p('M18 57L40 48L62 57L62 68L40 78L18 68Z',dark)}${p('M18 57L40 48L62 57L40 68Z',glow)}${line('M22 58L40 65L57 58','#ffeac4',1.3)}${p('M34 56L40 53L47 56L40 59Z','#fff3bb')}</g>`).join('');break;
            case 'waveGold':art=pad()+p('M31 29L47 17L66 29L65 57L48 69L31 57Z',m)+p('M36 33L48 25L60 33L59 53L48 61L37 53Z',glow)+p('M48 30L51 39L61 40L54 46L56 56L48 51L41 56L43 46L36 40L45 39Z','#fff0b3')+p('M31 53L22 77L37 72L42 81L47 68Z',dark)+p('M64 53L73 76L58 72L55 81L49 68Z',dark);break;
            case 'crystalChance':art=pad()+p('M26 33L37 21L61 21L74 33L67 47L32 47Z',m)+p('M39 44L60 44L56 69L48 82L42 69Z',dark)+[0,1,2].map(i=>line(`M${40+i} ${48+i*7}L${58-i} ${43+i*7}`,color,4)).join('')+rect(36,26,26,10,glow)+bolts([[30,36],[68,36]])+p('M74 60L85 54L89 67L80 80L70 71Z',glow);break;
            case 'interest':art=p('M20 30L37 19L73 24L79 36L76 69L59 81L22 74Z',dark)+p('M22 30L58 35L58 80L22 74Z',m)+p('M59 35L76 27L76 68L59 80Z','#38505d')+rect(27,39,26,28,dark)+circle(40,53,9,glow)+line('M40 47V59M34 53H46','#fff0c1',2)+rect(63,40,7,18,glow)+bolts([[27,34],[52,37],[27,70],[52,74]]);break;
            case 'crystal':art=p('M45 10L70 29L78 55L52 86L26 70L19 42Z',dark)+p('M45 10L55 37L70 29Z','#e3fcff')+p('M45 10L55 37L32 44L19 42Z',light)+p('M55 37L78 55L52 86Z',glow)+p('M55 37L32 44L26 70L52 86Z',color)+p('M19 42L32 44L26 70Z','#27738f')+line('M45 13L54 37L74 54M54 37L51 81','#e9ffff',1.4);break;
            case 'part':art=p('M30 19L60 16L78 34L80 61L60 81L33 80L15 61L16 36Z',dark)+p('M30 15L60 12L78 30L79 56L60 75L33 75L15 56L16 31Z',m)+p('M31 21L58 18L71 32L72 53L57 67L35 67L22 53L23 34Z',glow)+p('M39 31L55 30L64 42L60 56L44 61L32 49L32 38Z',dark)+p('M40 35L52 34L59 43L56 53L45 56L36 47L36 40Z','#081421')+line('M19 32L31 19L59 16','#e0d3c3',2)+bolts([[28,29],[66,31],[29,59],[63,59]]);break;
            case 'slow':art=pad()+p('M34 20L62 20L68 30L61 45L68 61L61 71L35 71L28 61L36 45L28 30Z',m)+p('M37 29L59 29L50 44L59 61L37 61L46 44Z',glow)+line('M35 25H62M34 66H62','#d7f7ff',2)+line('M18 32L13 43L18 54M78 32L83 43L78 54',color,2);break;
            case 'overload':art=pad()+p('M28 29L40 18L63 22L74 36L65 67L43 76L26 59Z',m)+p('M37 32L58 28L66 39L59 59L44 65L35 54Z',dark)+p('M51 24L39 47L50 45L44 67L66 39L54 42L62 24Z',light)+vents(30,61,3)+line('M25 20L20 14M73 24L80 19M78 53L86 56',color,3);break;
            default:art=p('M18 31L47 17L78 30L78 66L49 82L18 67Z',dark)+p('M18 31L47 17L78 30L49 46Z',m)+p('M18 34L48 48L48 79L18 65Z',m)+p('M50 48L78 33L78 65L50 79Z','#385363')+p('M29 25L58 39L58 72L65 68L65 36L37 21Z',glow)+rect(29,49,11,13,dark)+line('M21 37L21 62L43 73','#809ba7',1.5)+bolts([[23,43],[42,53],[23,60],[42,69]]);break;
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" aria-hidden="true" focusable="false" data-station-art="${keys.includes(key)?key:'crate'}"><defs><linearGradient id="${id}m" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#a3b6c0"/><stop offset=".24" stop-color="#657d8a"/><stop offset=".55" stop-color="#354d60"/><stop offset="1" stop-color="#1b2d40"/></linearGradient><linearGradient id="${id}d" x2=".7" y2="1"><stop stop-color="#24364a"/><stop offset="1" stop-color="#091524"/></linearGradient><linearGradient id="${id}g" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#f0fcff"/><stop offset=".22" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity=".35"/></linearGradient><linearGradient id="${id}l" x2=".6" y2="1"><stop stop-color="#fffce4"/><stop offset=".4" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity=".55"/></linearGradient><radialGradient id="${id}a"><stop stop-color="${color}" stop-opacity=".2"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><circle cx="48" cy="48" r="45" fill="url(#${id}a)"/><ellipse cx="48" cy="82" rx="30" ry="7" fill="#030b15" opacity=".6"/>${art}</svg>`;
    }
    const sprites = Object.freeze({
        damage: 'plasma',
        maxHp: 'hull',
        range: 'radar',
        part: 'salvage'
    });

    function markup(key, options) {
        if (!Object.hasOwn(sprites, key)) return svg(key, options);
        return `<img class="station-sprite" data-station-art="${key}" src="assets/station/foundry/${sprites[key]}.webp" alt="" width="192" height="192" decoding="async" draggable="false">`;
    }

    return Object.freeze({svg, keys, markup});
});
