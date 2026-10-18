// ==========================================
// BÖLÜM: RENDER, SKİN VE MOBİL OPTİMİZASYON
// ==========================================

function renderItemIconHTML(item, sizeClass = 'w-9 h-9 sm:w-11 sm:h-11') {
    if (!item) return '';
    const art = item.customArt || item.id;
    let svgContent = '';

    switch (art) {
        case 'void_rope':
            svgContent = `<svg viewBox="0 0 64 64" class="w-full h-full">
                <rect width="64" height="64" rx="12" fill="#f8fafc"/>
                <ellipse cx="32" cy="54" rx="22" ry="6.5" fill="#090d16" stroke="#0f172a" stroke-width="2"/>
                <ellipse cx="32" cy="54" rx="18" ry="4.5" fill="none" stroke="#ffffff" stroke-width="1.5"/>
                <line x1="33" y1="2" x2="33" y2="48" stroke="#9a5b32" stroke-width="3.2" stroke-dasharray="3,1"/>
                <path d="M22 24 L32 18 L38 28 L34 40 L25 36 Z" fill="#0f172a"/>
                <circle cx="25" cy="15" r="5.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8"/>
                <path d="M20 13 Q24 8 29 12" fill="#0f172a"/>
                <circle cx="33" cy="10" r="2.6" fill="#ffffff" stroke="#0f172a" stroke-width="1.4"/>
                <circle cx="33" cy="23" r="2.6" fill="#ffffff" stroke="#0f172a" stroke-width="1.4"/>
            </svg>`;
            break;
        case 'footsteps':
            svgContent = `<svg viewBox="0 0 64 64" class="w-full h-full">
                <rect width="64" height="64" rx="12" fill="#f8fafc"/>
                <g transform="rotate(-25 32 32)">
                    <ellipse cx="24" cy="48" rx="4.5" ry="7" fill="#334155"/>
                    <ellipse cx="34" cy="40" rx="4.5" ry="7" fill="#334155"/>
                    <ellipse cx="24" cy="28" rx="4.5" ry="7" fill="#7c4a2d"/>
                    <ellipse cx="34" cy="20" rx="4.5" ry="7" fill="#7c4a2d"/>
                    <ellipse cx="25" cy="9" rx="4" ry="6" fill="#334155"/>
                </g>
            </svg>`;
            break;
        case 'future_letter':
            svgContent = `<svg viewBox="0 0 64 64" class="w-full h-full">
                <rect width="64" height="64" rx="12" fill="#f8fafc"/>
                <rect x="12" y="10" width="38" height="44" transform="rotate(-8 31 32)" fill="#bfa06d" stroke="#1e293b" stroke-width="1.3"/>
                <path d="M14 12 L50 12 L52 52 L34 52 L32 35 L29 52 L13 52 Z" fill="#ffffff" stroke="#0f172a" stroke-width="1.8"/>
                <path d="M21 21 Q27 16 32 21 T43 20" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round"/>
                <line x1="19" y1="29" x2="45" y2="29" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="4,2"/>
                <line x1="19" y1="35" x2="44" y2="35" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="3,2"/>
                <line x1="19" y1="41" x2="42" y2="41" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="5,2"/>
                <circle cx="24" cy="33" r="2.2" fill="#64748b" opacity="0.6"/>
            </svg>`;
            break;
        case 'typewriter':
            svgContent = `<svg viewBox="0 0 64 64" class="w-full h-full">
                <rect width="64" height="64" rx="12" fill="#f8fafc"/>
                <polygon points="6,36 48,20 58,42 22,58" fill="#e2e8f0" stroke="#1e293b" stroke-width="1.5"/>
                <rect x="23" y="12" width="18" height="16" transform="rotate(-15 32 20)" fill="#ffffff" stroke="#0f172a" stroke-width="1.4"/>
                <rect x="18" y="25" width="28" height="20" rx="4" transform="rotate(-15 32 35)" fill="#286656" stroke="#0f172a" stroke-width="1.6"/>
                <circle cx="26" cy="36" r="1.5" fill="#ffffff"/><circle cx="31" cy="35" r="1.5" fill="#ffffff"/><circle cx="36" cy="34" r="1.5" fill="#ffffff"/>
                <circle cx="28" cy="40" r="1.5" fill="#ffffff"/><circle cx="33" cy="39" r="1.5" fill="#ffffff"/><circle cx="38" cy="38" r="1.5" fill="#ffffff"/>
            </svg>`;
            break;
        case 'archer':
            svgContent = `<svg viewBox="0 0 64 64" class="w-full h-full">
                <rect width="64" height="64" rx="12" fill="#f8fafc"/>
                <path d="M22 6 C10 22 10 42 22 56" fill="none" stroke="#881313" stroke-width="3" stroke-linecap="round"/>
                <line x1="12" y1="28" x2="36" y2="28" stroke="#0f172a" stroke-width="1.5"/>
                <circle cx="36" cy="24" r="4.5" fill="#0f172a"/>
                <path d="M28 28 L44 27 L40 42 L32 42 Z" fill="#0f172a"/>
                <line x1="26" y1="44" x2="46" y2="33" stroke="#0f172a" stroke-width="4" stroke-linecap="round"/>
                <line x1="35" y1="42" x2="35" y2="58" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>
            </svg>`;
            break;
        case 'crimson_hourglass':
            svgContent = `<svg viewBox="0 0 64 64" class="w-full h-full">
                <rect width="64" height="64" rx="12" fill="#f8fafc"/>
                <ellipse cx="32" cy="10" rx="17" ry="4" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>
                <ellipse cx="32" cy="54" rx="17" ry="4" fill="#e2e8f0" stroke="#0f172a" stroke-width="1.8"/>
                <line x1="17" y1="12" x2="17" y2="52" stroke="#334155" stroke-width="2"/>
                <line x1="47" y1="12" x2="47" y2="52" stroke="#334155" stroke-width="2"/>
                <path d="M19 13 C19 26 30 30 32 32 C34 30 45 26 45 13 Z" fill="none" stroke="#0f172a" stroke-width="1.6"/>
                <path d="M21 19 C22 26 30 29 32 32 C34 29 42 26 43 19 Z" fill="#650614"/>
                <path d="M19 51 C19 38 30 34 32 32 C34 34 45 38 45 51 Z" fill="none" stroke="#0f172a" stroke-width="1.6"/>
                <line x1="32" y1="32" x2="32" y2="48" stroke="#650614" stroke-width="1.6" stroke-dasharray="2,1"/>
                <path d="M20 51 Q26 47 32 51 Q38 47 44 51 Z" fill="#650614"/>
            </svg>`;
            break;
        case 'sisyphus':
            svgContent = `<svg viewBox="0 0 64 64" class="w-full h-full">
                <rect width="64" height="64" rx="12" fill="#f8fafc"/>
                <line x1="8" y1="36" x2="56" y2="58" stroke="#334155" stroke-width="1.8" stroke-dasharray="4,2"/>
                <circle cx="26" cy="26" r="15" fill="#cbd5e1" stroke="#0f172a" stroke-width="2"/>
                <path d="M15 22 L35 30 M18 35 L33 15 M20 14 L36 26" stroke="#1e293b" stroke-width="1.2"/>
                <circle cx="43" cy="31" r="3" fill="#0f172a"/>
                <path d="M36 32 L43 35 L39 44 L46 51" fill="none" stroke="#0f172a" stroke-width="2.8" stroke-linecap="round"/>
            </svg>`;
            break;
        case 'masks':
            svgContent = `<svg viewBox="0 0 64 64" class="w-full h-full">
                <rect width="64" height="64" rx="12" fill="#f8fafc"/>
                <path d="M12 16 Q24 12 34 16 Q35 36 23 48 Q12 36 12 16 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2.4"/>
                <path d="M17 25 Q20 22 22 25 M26 25 Q29 22 31 25" stroke="#0f172a" stroke-width="2" fill="none"/>
                <path d="M19 39 Q23 33 28 39" stroke="#0f172a" stroke-width="2.4" fill="none"/>
                <path d="M29 14 Q42 12 53 18 Q52 40 38 52 Q26 38 29 14 Z" fill="#ffffff" stroke="#0f172a" stroke-width="2.6"/>
                <path d="M34 26 Q37 22 40 26 M43 27 Q46 23 49 27" stroke="#0f172a" stroke-width="2.2" fill="none"/>
                <path d="M33 34 Q40 45 47 36 Z" fill="#0f172a"/>
            </svg>`;
            break;
        default: {
            const palette = {
                legendary: { bg: '#422006', border: '#facc15', fg: '#fde047' },
                mythic: { bg: '#500724', border: '#f472b6', fg: '#fbcfe8' },
                epic: { bg: '#3b0764', border: '#c084fc', fg: '#e9d5ff' },
                super_rare: { bg: '#083344', border: '#22d3ee', fg: '#cffafe' },
                rare: { bg: '#172554', border: '#60a5fa', fg: '#dbeafe' }
            }[item.rarity] || { bg: '#1e293b', border: '#60a5fa', fg: '#ffffff' };

            return `<div class="${sizeClass} rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden shadow-inner" style="background: radial-gradient(circle at 30% 30%, ${palette.border}33, ${palette.bg}); border: 1.5px solid ${palette.border};">
                <i class="${item.icon} text-sm sm:text-lg drop-shadow" style="color: ${palette.fg}"></i>
            </div>`;
        }
    }

    return `<div class="${sizeClass} rounded-xl overflow-hidden shrink-0 border-2 border-white/20 shadow-md bg-white flex items-center justify-center">${svgContent}</div>`;
}

function drawCustomTowerSkin(c, skinId, angle, recoil, barrelCount, nowTime) {
    function drawBarrels(fillCol, strokeCol, muzzleCol, length = 19, thickness = 7, shape = 'rect') {
        c.save();
        c.rotate(angle);
        for (let i = 0; i < barrelCount; i++) {
            const norm = i - (barrelCount - 1) / 2;
            let yOff = 0, angOff = 0, lenExtra = 0;
            if (barrelCount === 2) { yOff = norm * 9.5; }
            else if (barrelCount === 3) { yOff = norm * 6.5; angOff = norm * 0.12; lenExtra = i === 1 ? 2.5 : 0; }
            else if (barrelCount >= 4) { yOff = norm * 4.8; angOff = norm * 0.13; lenExtra = Math.abs(norm) < 0.6 ? 2.5 : 0; }
            const bH = barrelCount >= 4 ? Math.max(4.5, thickness - 1.5) : (barrelCount >= 2 ? Math.max(5.5, thickness - 1) : thickness);
            const bLen = length + lenExtra;
            const startX = 6 - recoil;

            c.save();
            c.translate(0, yOff);
            c.rotate(angOff);
            c.fillStyle = fillCol;
            c.strokeStyle = strokeCol;
            c.lineWidth = 1.4;

            if (shape === 'cone') {
                c.beginPath();
                c.moveTo(startX, -bH / 2);
                c.lineTo(startX + bLen, -bH / 4);
                c.lineTo(startX + bLen, bH / 4);
                c.lineTo(startX, bH / 2);
                c.closePath();
                c.fill(); c.stroke();
            } else if (shape === 'banana') {
                c.beginPath();
                c.ellipse(startX + bLen * 0.5, 0, bLen * 0.55, bH * 0.5, 0, 0, Math.PI * 2);
                c.fill(); c.stroke();
                c.fillStyle = '#713f12';
                c.fillRect(startX + bLen - 2, -2, 3, 4);
            } else {
                c.fillRect(startX, -bH / 2, bLen, bH);
                c.strokeRect(startX, -bH / 2, bLen, bH);
                c.fillStyle = muzzleCol;
                c.fillRect(startX + bLen - 3.5, -bH / 2 - 0.8, 3.5, bH + 1.6);
            }
            c.restore();
        }
        c.restore();
    }

    c.shadowColor = 'rgba(0,0,0,0.45)';
    c.shadowBlur = 8;
    c.shadowOffsetY = 3;

    switch (skinId) {
        case 'kurt_kaan': {
            const wolfAura = 24 + Math.sin(nowTime * 0.007) * 3;
            c.beginPath(); c.arc(0, 0, wolfAura, 0, Math.PI * 2);
            c.fillStyle = 'rgba(56, 189, 248, 0.22)'; c.fill();
            c.strokeStyle = 'rgba(250, 204, 21, 0.5)'; c.lineWidth = 1.5; c.stroke();

            drawBarrels('#0284c7', '#facc15', '#e0f2fe', 22, 8, 'cone');

            c.save(); c.rotate(angle);
            c.fillStyle = '#334155'; c.strokeStyle = '#94a3b8'; c.lineWidth = 1.8;
            c.beginPath();
            for (let i = 0; i < 20; i++) {
                const a = (i * Math.PI) / 10;
                const r = i % 2 === 0 ? 21 : 15;
                const px = Math.cos(a) * r, py = Math.sin(a) * r;
                if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
            }
            c.closePath(); c.fill(); c.stroke();

            c.fillStyle = '#475569'; c.strokeStyle = '#e2e8f0'; c.lineWidth = 1.6;
            c.beginPath(); c.moveTo(-2, -10); c.lineTo(-16, -20); c.lineTo(-12, -5); c.closePath(); c.fill(); c.stroke();
            c.beginPath(); c.moveTo(-2, 10); c.lineTo(-16, 20); c.lineTo(-12, 5); c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#facc15';
            c.beginPath(); c.moveTo(-5, -10); c.lineTo(-13, -16); c.lineTo(-10, -7); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(-5, 10); c.lineTo(-13, 16); c.lineTo(-10, 7); c.closePath(); c.fill();

            const wolfGrad = c.createRadialGradient(0, 0, 2, 0, 0, 17);
            wolfGrad.addColorStop(0, '#cbd5e1'); wolfGrad.addColorStop(0.6, '#64748b'); wolfGrad.addColorStop(1, '#1e293b');
            c.fillStyle = wolfGrad; c.strokeStyle = '#38bdf8'; c.lineWidth = 1.8;
            c.beginPath();
            c.moveTo(18, 0); c.lineTo(6, -12); c.lineTo(-12, -13); c.lineTo(-15, 0); c.lineTo(-12, 13); c.lineTo(6, 12);
            c.closePath(); c.fill(); c.stroke();

            c.fillStyle = '#0f172a';
            c.beginPath(); c.arc(15, 0, 3.2, 0, Math.PI * 2); c.fill();

            c.fillStyle = '#38bdf8';
            c.beginPath(); c.moveTo(5, -4); c.lineTo(0, -9); c.lineTo(-2, -4); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(5, 4); c.lineTo(0, 9); c.lineTo(-2, 4); c.closePath(); c.fill();

            c.strokeStyle = '#facc15'; c.lineWidth = 2;
            c.beginPath(); c.arc(-5, 0, 4.5, -Math.PI * 0.65, Math.PI * 0.65); c.stroke();
            c.restore();

            c.font = "bold 6.5px 'Rajdhani', sans-serif"; c.fillStyle = '#fef08a'; c.textAlign = 'center'; c.fillText('KAAN', 0, 24);
            break;
        }
        case 'bubblegum': {
            drawBarrels('#ec4899', '#fbcfe8', '#ffffff', 19, 7.5);
            c.fillStyle = '#db2777'; c.strokeStyle = '#fbcfe8'; c.lineWidth = 2;
            c.beginPath(); c.arc(0, 0, 19, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = 'rgba(253, 242, 248, 0.25)';
            c.beginPath(); c.arc(0, 0, 15, 0, Math.PI * 2); c.fill();
            const gumColors = [['#f472b6', -6, -6], ['#38bdf8', 6, -5], ['#facc15', -5, 6], ['#4ade80', 6, 6], ['#c084fc', 0, -8], ['#fb7185', 0, 8]];
            for (const [col, gx, gy] of gumColors) {
                c.fillStyle = col; c.beginPath(); c.arc(gx, gy, 3.8, 0, Math.PI * 2); c.fill();
            }
            const bubbleR = 11 + Math.sin(nowTime * 0.007) * 3.5;
            const bGrad = c.createRadialGradient(-3, -3, 1, 0, 0, bubbleR);
            bGrad.addColorStop(0, '#fce7f3'); bGrad.addColorStop(0.5, '#f472b6'); bGrad.addColorStop(1, '#be185d');
            c.fillStyle = bGrad; c.strokeStyle = '#fbcfe8'; c.lineWidth = 1.5;
            c.beginPath(); c.arc(0, 0, bubbleR, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = 'rgba(255, 255, 255, 0.75)';
            c.beginPath(); c.ellipse(-bubbleR * 0.35, -bubbleR * 0.35, bubbleR * 0.28, bubbleR * 0.15, -0.6, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'fighter_jet': {
            drawBarrels('#334155', '#38bdf8', '#f97316', 23, 6);
            c.save(); c.rotate(angle);
            const jetFlame = 9 + Math.sin(nowTime * 0.03) * 3.5;
            c.fillStyle = '#38bdf8';
            c.beginPath(); c.moveTo(-15, -6); c.lineTo(-15 - jetFlame, -4); c.lineTo(-15, -2); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(-15, 2); c.lineTo(-15 - jetFlame, 4); c.lineTo(-15, 6); c.closePath(); c.fill();
            c.fillStyle = '#f43f5e';
            c.fillRect(-4, -21, 10, 2.5); c.fillRect(-4, 18.5, 10, 2.5);
            c.fillStyle = '#475569'; c.strokeStyle = '#94a3b8'; c.lineWidth = 1.8;
            c.beginPath();
            c.moveTo(22, 0); c.lineTo(5, -5); c.lineTo(-6, -22); c.lineTo(-13, -20);
            c.lineTo(-10, -7); c.lineTo(-17, -11); c.lineTo(-16, 0); c.lineTo(-17, 11);
            c.lineTo(-10, 7); c.lineTo(-13, 20); c.lineTo(-6, 22); c.lineTo(5, 5);
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#fbbf24'; c.strokeStyle = '#fef08a'; c.lineWidth = 1;
            c.beginPath(); c.ellipse(4, 0, 7.5, 3, 0, 0, Math.PI * 2); c.fill(); c.stroke();
            c.restore();
            break;
        }
        case 'cyber_samurai': {
            drawBarrels('#e2e8f0', '#ef4444', '#facc15', 22, 6, 'cone');
            c.save(); c.rotate(angle);
            c.fillStyle = '#18181b'; c.strokeStyle = '#dc2626'; c.lineWidth = 2;
            c.beginPath();
            c.arc(0, 0, 18, 0.35 * Math.PI, 1.65 * Math.PI);
            c.lineTo(6, -13); c.lineTo(6, 13); c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#991b1b'; c.strokeStyle = '#f87171'; c.lineWidth = 1.8;
            c.beginPath(); c.arc(0, 0, 14, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = '#fef08a';
            c.fillRect(5, -8, 4, 5); c.fillRect(5, 3, 4, 5);
            c.strokeStyle = '#facc15'; c.lineWidth = 2.8;
            c.beginPath(); c.moveTo(8, 0); c.lineTo(17, -14); c.moveTo(8, 0); c.lineTo(17, 14); c.stroke();
            c.restore();
            break;
        }
        case 'black_hole': {
            c.save();
            c.rotate(nowTime * 0.003);
            const diskGrad = c.createRadialGradient(0, 0, 8, 0, 0, 24);
            diskGrad.addColorStop(0, '#020617');
            diskGrad.addColorStop(0.45, '#f43f5e');
            diskGrad.addColorStop(0.7, '#a855f7');
            diskGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
            c.fillStyle = diskGrad;
            c.beginPath(); c.arc(0, 0, 24, 0, Math.PI * 2); c.fill();

            c.strokeStyle = '#e879f9'; c.lineWidth = 1.8;
            for (let i = 0; i < 4; i++) {
                const a = (i * Math.PI) / 2;
                c.beginPath(); c.arc(0, 0, 16, a, a + 1.1); c.stroke();
            }
            c.restore();

            drawBarrels('#3b0764', '#e879f9', '#38bdf8', 20, 6.5, 'cone');

            c.fillStyle = '#020617'; c.strokeStyle = '#f0abfc'; c.lineWidth = 2.2;
            c.beginPath(); c.arc(0, 0, 12, 0, Math.PI * 2); c.fill(); c.stroke();
            c.strokeStyle = '#38bdf8'; c.lineWidth = 1;
            c.beginPath(); c.arc(0, 0, 9, 0, Math.PI * 2); c.stroke();
            break;
        }
        case 'dgdvrn': {
            const pulseGlow = 23 + Math.sin(nowTime * 0.006) * 3;
            c.beginPath(); c.arc(0, 0, pulseGlow, 0, Math.PI * 2);
            c.fillStyle = 'rgba(250, 204, 21, 0.22)'; c.fill();
            drawBarrels('#ca8a04', '#fef08a', '#fef9c3', 21, 8.5);
            c.beginPath();
            for (let i = 0; i < 16; i++) {
                const a = (i * Math.PI) / 8 + nowTime * 0.0005;
                const r = i % 2 === 0 ? 21 : 16;
                const px = Math.cos(a) * r, py = Math.sin(a) * r;
                if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
            }
            c.closePath();
            const goldGrad = c.createRadialGradient(-5, -5, 2, 0, 0, 21);
            goldGrad.addColorStop(0, '#fef9c3'); goldGrad.addColorStop(0.5, '#eab308'); goldGrad.addColorStop(1, '#854d0e');
            c.fillStyle = goldGrad; c.strokeStyle = '#fef08a'; c.lineWidth = 2; c.fill(); c.stroke();
            c.beginPath(); c.arc(0, 0, 11, 0, Math.PI * 2); c.fillStyle = '#422006'; c.fill(); c.strokeStyle = '#facc15'; c.lineWidth = 2; c.stroke();
            c.font = "bold 6.5px 'Rajdhani', sans-serif"; c.fillStyle = '#fef08a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DGDVRN', 0, 0);
            break;
        }
        case 'snowman': {
            drawBarrels('#38bdf8', '#e0f2fe', '#f97316', 18, 6.5);
            c.fillStyle = '#f8fafc'; c.strokeStyle = '#38bdf8'; c.lineWidth = 2;
            c.beginPath(); c.arc(0, 5, 17, 0, Math.PI * 2); c.fill(); c.stroke();
            c.beginPath(); c.arc(0, -4, 12.5, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = '#ef4444'; c.fillRect(-10, -7, 20, 4); c.fillRect(4, -5, 4, 9);
            c.fillStyle = '#0f172a'; c.beginPath(); c.arc(0, 2, 1.8, 0, Math.PI * 2); c.arc(0, 8, 1.8, 0, Math.PI * 2); c.fill();
            c.save(); c.rotate(angle);
            c.fillStyle = '#ffffff'; c.strokeStyle = '#38bdf8'; c.lineWidth = 1.8;
            c.beginPath(); c.arc(0, 0, 9, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = '#f97316'; c.beginPath(); c.moveTo(5, -3); c.lineTo(18, 0); c.lineTo(5, 3); c.closePath(); c.fill();
            c.restore();
            break;
        }
        case 'star_cruiser': {
            drawBarrels('#0284c7', '#e0f2fe', '#f43f5e', 22, 6);
            c.save(); c.rotate(angle);
            const flame = 8 + Math.sin(nowTime * 0.02) * 3;
            c.fillStyle = '#f97316'; c.beginPath(); c.moveTo(-14, -6); c.lineTo(-14 - flame, 0); c.lineTo(-14, 6); c.closePath(); c.fill();
            c.fillStyle = '#1e293b'; c.strokeStyle = '#38bdf8'; c.lineWidth = 2;
            c.beginPath();
            c.moveTo(18, 0); c.lineTo(-12, -18); c.lineTo(-8, -6); c.lineTo(-15, 0); c.lineTo(-8, 6); c.lineTo(-12, 18);
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#38bdf8'; c.beginPath(); c.ellipse(2, 0, 7, 3.5, 0, 0, Math.PI * 2); c.fill();
            c.restore();
            break;
        }
        case 'lion': {
            drawBarrels('#d97706', '#fef08a', '#f59e0b', 19, 7.5);
            c.fillStyle = '#9a3412'; c.strokeStyle = '#f59e0b'; c.lineWidth = 2;
            c.beginPath();
            for (let i = 0; i < 24; i++) {
                const a = (i * Math.PI) / 12;
                const r = i % 2 === 0 ? 22 : 16;
                const px = Math.cos(a) * r, py = Math.sin(a) * r;
                if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
            }
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#fbbf24'; c.beginPath(); c.arc(0, 0, 13, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#d97706'; c.beginPath(); c.arc(-9, -9, 4, 0, Math.PI * 2); c.arc(9, -9, 4, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#78350f'; c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, 0); c.lineTo(0, 4); c.closePath(); c.fill();
            c.fillStyle = '#1e293b'; c.beginPath(); c.arc(-4.5, -3.5, 1.8, 0, Math.PI * 2); c.arc(4.5, -3.5, 1.8, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'tiger': {
            drawBarrels('#ea580c', '#fed7aa', '#1e293b', 20, 7.5);
            c.fillStyle = '#f97316'; c.strokeStyle = '#fff7ed'; c.lineWidth = 2;
            c.beginPath(); c.arc(-11, -11, 5, 0, Math.PI * 2); c.arc(11, -11, 5, 0, Math.PI * 2); c.fill(); c.stroke();
            c.beginPath(); c.arc(0, 0, 18, 0, Math.PI * 2); c.fill(); c.stroke();
            c.strokeStyle = '#0f172a'; c.lineWidth = 2.5;
            c.beginPath();
            c.moveTo(-16, -5); c.lineTo(-9, -3);
            c.moveTo(-16, 4); c.lineTo(-9, 2);
            c.moveTo(16, -5); c.lineTo(9, -3);
            c.moveTo(16, 4); c.lineTo(9, 2);
            c.moveTo(0, -17); c.lineTo(0, -10);
            c.stroke();
            c.fillStyle = '#fef08a'; c.beginPath(); c.arc(-5, -3, 2.2, 0, Math.PI * 2); c.arc(5, -3, 2.2, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#f43f5e'; c.beginPath(); c.arc(0, 2, 2.5, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'bird': {
            drawBarrels('#eab308', '#fef08a', '#ca8a04', 20, 7, 'cone');
            c.save(); c.rotate(angle);
            c.fillStyle = '#0284c7'; c.strokeStyle = '#bae6fd'; c.lineWidth = 1.8;
            c.beginPath();
            c.moveTo(4, -8); c.lineTo(-8, -22); c.lineTo(-14, -8);
            c.moveTo(4, 8); c.lineTo(-8, 22); c.lineTo(-14, 8);
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#0369a1';
            c.beginPath(); c.moveTo(-10, 0); c.lineTo(-20, -6); c.lineTo(-20, 6); c.closePath(); c.fill();
            c.fillStyle = '#38bdf8'; c.beginPath(); c.arc(0, 0, 14, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = '#f8fafc'; c.beginPath(); c.arc(3, 0, 8, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#0f172a'; c.beginPath(); c.arc(5, -5, 2, 0, Math.PI * 2); c.arc(5, 5, 2, 0, Math.PI * 2); c.fill();
            c.restore();
            break;
        }
        case 'car': {
            drawBarrels('#475569', '#cbd5e1', '#ef4444', 20, 6.5);
            c.save(); c.rotate(angle);
            c.fillStyle = '#0f172a';
            c.fillRect(-13, -16, 9, 4); c.fillRect(5, -16, 9, 4);
            c.fillRect(-13, 12, 9, 4); c.fillRect(5, 12, 9, 4);
            c.fillStyle = '#dc2626'; c.strokeStyle = '#fca5a5'; c.lineWidth = 1.8;
            c.beginPath(); c.roundRect(-16, -12, 32, 24, 6); c.fill(); c.stroke();
            c.fillStyle = '#f8fafc';
            c.fillRect(-15, -3.5, 30, 2.5); c.fillRect(-15, 1, 30, 2.5);
            c.fillStyle = '#1e293b'; c.beginPath(); c.roundRect(-7, -8, 14, 16, 3); c.fill();
            c.fillStyle = '#fde047'; c.fillRect(14, -10, 2.5, 4); c.fillRect(14, 6, 2.5, 4);
            c.restore();
            break;
        }
        case 'monkey': {
            drawBarrels('#facc15', '#fef08a', '#713f12', 20, 7.5, 'banana');
            c.fillStyle = '#78350f'; c.strokeStyle = '#b45309'; c.lineWidth = 2;
            c.beginPath(); c.arc(-16, 0, 6, 0, Math.PI * 2); c.arc(16, 0, 6, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = '#fde68a'; c.beginPath(); c.arc(-16, 0, 3, 0, Math.PI * 2); c.arc(16, 0, 3, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#78350f'; c.beginPath(); c.arc(0, 0, 16, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = '#fcd34d'; c.beginPath(); c.arc(-4, -3, 6, 0, Math.PI * 2); c.arc(4, -3, 6, 0, Math.PI * 2); c.arc(0, 4, 8, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#0f172a'; c.beginPath(); c.arc(-4.5, -3.5, 2, 0, Math.PI * 2); c.arc(4.5, -3.5, 2, 0, Math.PI * 2); c.fill();
            c.strokeStyle = '#451a03'; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 4, 4, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
            break;
        }
        case 'water_bottle': {
            drawBarrels('#0284c7', '#bae6fd', '#ffffff', 19, 7);
            c.fillStyle = 'rgba(56, 189, 248, 0.3)'; c.strokeStyle = '#bae6fd'; c.lineWidth = 2;
            c.beginPath(); c.arc(0, 0, 18, 0, Math.PI * 2); c.fill(); c.stroke();
            const waveOff = Math.sin(nowTime * 0.005) * 2;
            c.fillStyle = '#0ea5e9';
            c.beginPath(); c.arc(0, waveOff, 14, 0, Math.PI * 2); c.fill();
            c.strokeStyle = '#ffffff'; c.lineWidth = 3.5;
            c.beginPath(); c.arc(0, 0, 10, 0, Math.PI * 2); c.stroke();
            c.fillStyle = '#1d4ed8'; c.beginPath(); c.arc(0, 0, 6.5, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'chair': {
            drawBarrels('#e11d48', '#fda4af', '#22d3ee', 19, 7);
            c.save(); c.rotate(angle);
            c.strokeStyle = '#475569'; c.lineWidth = 3;
            for (let i = 0; i < 5; i++) {
                const a = (i * Math.PI * 2) / 5;
                c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 21, Math.sin(a) * 21); c.stroke();
            }
            c.fillStyle = '#1e293b'; c.strokeStyle = '#e11d48'; c.lineWidth = 2;
            c.beginPath(); c.roundRect(-12, -14, 24, 28, 5); c.fill(); c.stroke();
            c.fillStyle = '#e11d48'; c.fillRect(-10, -11, 20, 4); c.fillRect(-10, 7, 20, 4);
            c.fillStyle = '#0f172a'; c.strokeStyle = '#22d3ee'; c.lineWidth = 1.5;
            c.beginPath(); c.roundRect(-15, -12, 6, 24, 3); c.fill(); c.stroke();
            c.fillStyle = '#334155'; c.fillRect(-5, -17, 12, 3); c.fillRect(-5, 14, 12, 3);
            c.restore();
            break;
        }
        case 'tree': {
            drawBarrels('#78350f', '#a16207', '#4ade80', 20, 7);
            c.strokeStyle = '#78350f'; c.lineWidth = 4;
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); c.stroke();
            }
            c.fillStyle = '#15803d'; c.strokeStyle = '#4ade80'; c.lineWidth = 1.8;
            const leafPos = [[-8, -8], [8, -8], [-8, 8], [8, 8], [0, -11], [0, 11], [-11, 0], [11, 0]];
            for (const [lx, ly] of leafPos) {
                c.beginPath(); c.arc(lx, ly, 8, 0, Math.PI * 2); c.fill(); c.stroke();
            }
            c.fillStyle = '#22c55e'; c.beginPath(); c.arc(0, 0, 11, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#78350f'; c.beginPath(); c.arc(0, 0, 5, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'table': {
            drawBarrels('#92400e', '#fde68a', '#b45309', 19, 7.5);
            c.fillStyle = '#451a03';
            c.fillRect(-17, -17, 6, 6); c.fillRect(11, -17, 6, 6);
            c.fillRect(-17, 11, 6, 6); c.fillRect(11, 11, 6, 6);
            c.fillStyle = '#b45309'; c.strokeStyle = '#fde68a'; c.lineWidth = 2;
            c.beginPath(); c.roundRect(-15, -15, 30, 30, 4); c.fill(); c.stroke();
            c.strokeStyle = '#78350f'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(-12, -6); c.lineTo(12, -6); c.moveTo(-12, 6); c.lineTo(12, 6); c.stroke();
            c.fillStyle = '#fef3c7'; c.fillRect(-7, -7, 14, 14);
            c.strokeStyle = '#ef4444'; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(-4, -4); c.lineTo(4, 4); c.moveTo(4, -4); c.lineTo(-4, 4); c.stroke();
            break;
        }
        case 'sofa': {
            drawBarrels('#7e22ce', '#facc15', '#fef08a', 19, 7.5);
            c.save(); c.rotate(angle);
            c.fillStyle = '#6b21a8'; c.strokeStyle = '#facc15'; c.lineWidth = 2;
            c.beginPath(); c.roundRect(-12, -16, 22, 32, 6); c.fill(); c.stroke();
            c.fillStyle = '#581c87';
            c.beginPath(); c.roundRect(-16, -18, 8, 36, 4); c.fill(); c.stroke();
            c.beginPath(); c.roundRect(-12, -19, 20, 6, 3); c.fill(); c.stroke();
            c.beginPath(); c.roundRect(-12, 13, 20, 6, 3); c.fill(); c.stroke();
            c.fillStyle = '#facc15';
            c.beginPath(); c.arc(-2, -6, 2, 0, Math.PI * 2); c.arc(-2, 6, 2, 0, Math.PI * 2); c.fill();
            c.restore();
            break;
        }
        case 'sleep_emoji': {
            drawBarrels('#6366f1', '#e0e7ff', '#fde047', 19, 7);
            const grad = c.createRadialGradient(-4, -4, 2, 0, 0, 18);
            grad.addColorStop(0, '#fef08a'); grad.addColorStop(1, '#eab308');
            c.fillStyle = grad; c.strokeStyle = '#ca8a04'; c.lineWidth = 2;
            c.beginPath(); c.arc(0, 0, 18, 0, Math.PI * 2); c.fill(); c.stroke();
            c.strokeStyle = '#422006'; c.lineWidth = 2.2;
            c.beginPath(); c.arc(-6, -2, 4, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
            c.beginPath(); c.arc(6, -2, 4, 0.1 * Math.PI, 0.9 * Math.PI); c.stroke();
            c.fillStyle = '#422006'; c.beginPath(); c.arc(0, 7, 3, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#38bdf8'; c.beginPath(); c.arc(5, 5, 3.5, 0, Math.PI * 2); c.fill();
            c.font = "bold 9px 'Rajdhani', sans-serif"; c.fillStyle = '#93c5fd';
            c.fillText('Zzz', 10, -12 - Math.sin(nowTime * 0.005) * 2);
            break;
        }
        case 'dragon': {
            drawBarrels('#991b1b', '#fca5a5', '#f97316', 21, 8, 'cone');
            c.save(); c.rotate(angle);
            c.fillStyle = '#7f1d1d'; c.strokeStyle = '#ef4444'; c.lineWidth = 1.8;
            c.beginPath();
            c.moveTo(0, -10); c.lineTo(-10, -25); c.lineTo(-16, -15); c.lineTo(-12, -8);
            c.moveTo(0, 10); c.lineTo(-10, 25); c.lineTo(-16, 15); c.lineTo(-12, 8);
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#dc2626'; c.beginPath(); c.arc(0, 0, 16, 0, Math.PI * 2); c.fill(); c.stroke();
            c.strokeStyle = '#fde047'; c.lineWidth = 3;
            c.beginPath(); c.moveTo(-2, -8); c.lineTo(-14, -13); c.moveTo(-2, 8); c.lineTo(-14, 13); c.stroke();
            c.fillStyle = '#fef08a'; c.beginPath(); c.arc(6, -5, 2.5, 0, Math.PI * 2); c.arc(6, 5, 2.5, 0, Math.PI * 2); c.fill();
            c.restore();
            break;
        }
        case 'robot': {
            drawBarrels('#334155', '#94a3b8', '#ef4444', 20, 8);
            c.strokeStyle = '#94a3b8'; c.lineWidth = 2;
            c.beginPath(); c.moveTo(-14, -14); c.lineTo(-20, -20); c.moveTo(14, -14); c.lineTo(20, -20); c.stroke();
            c.fillStyle = '#ef4444'; c.beginPath(); c.arc(-20, -20, 2.5, 0, Math.PI * 2); c.arc(20, -20, 2.5, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#475569'; c.strokeStyle = '#cbd5e1'; c.lineWidth = 2;
            c.beginPath(); c.roundRect(-16, -16, 32, 32, 5); c.fill(); c.stroke();
            c.save(); c.rotate(angle);
            c.fillStyle = '#0f172a'; c.fillRect(0, -11, 10, 22);
            c.fillStyle = '#ef4444'; c.fillRect(3, -8, 5, 16);
            c.restore();
            break;
        }
        case 'alien': {
            drawBarrels('#16a34a', '#86efac', '#22d3ee', 20, 6.5);
            c.fillStyle = '#334155'; c.strokeStyle = '#4ade80'; c.lineWidth = 2;
            c.beginPath(); c.arc(0, 0, 20, 0, Math.PI * 2); c.fill(); c.stroke();
            for (let i = 0; i < 8; i++) {
                const a = (i * Math.PI) / 4 + nowTime * 0.002;
                c.fillStyle = i % 2 === 0 ? '#4ade80' : '#22d3ee';
                c.beginPath(); c.arc(Math.cos(a) * 16, Math.sin(a) * 16, 2, 0, Math.PI * 2); c.fill();
            }
            c.fillStyle = '#4ade80'; c.beginPath(); c.arc(0, 0, 11, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#0f172a';
            c.beginPath(); c.ellipse(-4, -1, 3.5, 2, 0.4, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.ellipse(4, -1, 3.5, 2, -0.4, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'pizza': {
            drawBarrels('#ea580c', '#fef08a', '#dc2626', 19, 7);
            c.fillStyle = '#d97706'; c.strokeStyle = '#fef3c7'; c.lineWidth = 1.8;
            c.beginPath(); c.arc(0, 0, 19, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = '#facc15'; c.beginPath(); c.arc(0, 0, 15, 0, Math.PI * 2); c.fill();
            c.strokeStyle = '#ca8a04'; c.lineWidth = 1;
            c.beginPath(); c.moveTo(-15, 0); c.lineTo(15, 0); c.moveTo(0, -15); c.lineTo(0, 15); c.stroke();
            c.fillStyle = '#dc2626';
            const pep = [[-6, -6], [6, -6], [-6, 6], [6, 6], [0, 0]];
            for (const [px, py] of pep) { c.beginPath(); c.arc(px, py, 3.2, 0, Math.PI * 2); c.fill(); }
            break;
        }
        case 'toilet': {
            drawBarrels('#e2e8f0', '#94a3b8', '#38bdf8', 19, 7.5);
            c.save(); c.rotate(angle);
            c.fillStyle = '#f8fafc'; c.strokeStyle = '#cbd5e1'; c.lineWidth = 2;
            c.beginPath(); c.roundRect(-18, -13, 9, 26, 3); c.fill(); c.stroke();
            c.fillStyle = '#eab308'; c.fillRect(-16, 13, 4, 4);
            c.fillStyle = '#ffffff'; c.strokeStyle = '#eab308'; c.lineWidth = 2;
            c.beginPath(); c.arc(2, 0, 14, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = '#38bdf8'; c.beginPath(); c.arc(2, 0, 9, 0, Math.PI * 2); c.fill();
            c.strokeStyle = '#e0f2fe'; c.lineWidth = 1.5;
            c.beginPath(); c.arc(2, 0, 5, nowTime * 0.008, nowTime * 0.008 + Math.PI * 1.3); c.stroke();
            c.restore();
            break;
        }
        case 'fire_demon': {
            const aura = 21 + Math.sin(nowTime * 0.008) * 2.5;
            c.fillStyle = 'rgba(239, 68, 68, 0.25)'; c.beginPath(); c.arc(0, 0, aura, 0, Math.PI * 2); c.fill();
            drawBarrels('#7f1d1d', '#f97316', '#fef08a', 20, 8, 'cone');
            c.fillStyle = '#991b1b'; c.strokeStyle = '#f97316'; c.lineWidth = 2;
            c.beginPath(); c.arc(0, 0, 17, 0, Math.PI * 2); c.fill(); c.stroke();
            c.fillStyle = '#18181b'; c.strokeStyle = '#fb923c'; c.lineWidth = 1.5;
            c.beginPath(); c.moveTo(-8, -12); c.lineTo(-19, -22); c.lineTo(-3, -16); c.closePath(); c.fill(); c.stroke();
            c.beginPath(); c.moveTo(8, -12); c.lineTo(19, -22); c.lineTo(3, -16); c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#fef08a';
            c.beginPath(); c.moveTo(-8, -4); c.lineTo(-2, -1); c.lineTo(-7, 2); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(8, -4); c.lineTo(2, -1); c.lineTo(7, 2); c.closePath(); c.fill();
            break;
        }
        case 'default_cyber':
        default: {
            drawBarrels('#818cf8', '#e0e7ff', '#fbcfe8', 19, 7.5);
            c.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i * Math.PI) / 4;
                const px = Math.cos(a) * 18, py = Math.sin(a) * 18;
                if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
            }
            c.closePath();
            const grad = c.createRadialGradient(-4, -4, 2, 0, 0, 18);
            grad.addColorStop(0, '#4b4d6a'); grad.addColorStop(1, '#2b2d42');
            c.fillStyle = grad; c.strokeStyle = '#a5b4fc'; c.lineWidth = 2.5;
            c.fill(); c.stroke();
            c.beginPath(); c.arc(0, 0, 9, 0, Math.PI * 2);
            c.fillStyle = '#a5b4fc'; c.fill();
            c.strokeStyle = '#f5f3ff'; c.lineWidth = 1.5; c.stroke();
            break;
        }
    }
}

function drawCustomCompanionSkin(c, skinId, compKey, star, angle, nowTime) {
    const colorMap = {
        laserDrone: '#fda4af',
        frostOrb: '#7dd3fc',
        missileBot: '#fdba74',
        repairDrone: '#6ee7b7',
        plasmaSatellite: '#d8b4fe'
    };
    const accent = colorMap[compKey] || '#38bdf8';
    const scale = 0.88 + star * 0.05;

    c.save();
    c.scale(scale, scale);

    if (star >= 4) {
        c.save();
        c.strokeStyle = star === 5 ? 'rgba(250, 204, 21, 0.45)' : 'rgba(255, 255, 255, 0.25)';
        c.lineWidth = 1.2;
        c.setLineDash([4, 4]);
        c.rotate(nowTime * 0.002);
        c.beginPath(); c.arc(0, 0, 12.5, 0, Math.PI * 2); c.stroke();
        c.restore();
    }

    switch (skinId) {
        case 'origami_crane': {
            c.rotate(angle + Math.PI / 2);
            c.fillStyle = '#f8fafc'; c.strokeStyle = accent; c.lineWidth = 1.4;
            c.beginPath(); c.moveTo(0, -2); c.lineTo(-12, -5); c.lineTo(-4, 4); c.closePath(); c.fill(); c.stroke();
            c.beginPath(); c.moveTo(0, -2); c.lineTo(12, -5); c.lineTo(4, 4); c.closePath(); c.fill(); c.stroke();
            c.beginPath(); c.moveTo(0, -10); c.lineTo(3.5, 2); c.lineTo(0, 9); c.lineTo(-3.5, 2); c.closePath(); c.fill(); c.stroke();
            break;
        }
        case 'cyber_prism': {
            c.rotate(nowTime * 0.0025);
            c.fillStyle = '#0f172a'; c.strokeStyle = accent; c.lineWidth = 1.8;
            c.beginPath();
            c.moveTo(0, -10); c.lineTo(9, 0); c.lineTo(0, 10); c.lineTo(-9, 0);
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = accent;
            c.beginPath(); c.arc(0, 0, 3.2, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'ghost_wisp': {
            const pulse = Math.sin(nowTime * 0.005) * 1.2;
            c.fillStyle = 'rgba(192, 132, 252, 0.22)';
            c.beginPath(); c.arc(0, 0, 10 + pulse, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#e0e7ff'; c.strokeStyle = accent; c.lineWidth = 1.5;
            c.beginPath(); c.arc(0, -1, 6.5, Math.PI, 0);
            c.lineTo(6.5, 6); c.lineTo(3, 3.5); c.lineTo(0, 6.5); c.lineTo(-3, 3.5); c.lineTo(-6.5, 6);
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#0f172a';
            c.beginPath(); c.arc(-2.2, -1, 1.2, 0, Math.PI * 2); c.arc(2.2, -1, 1.2, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'shadow_kunai': {
            c.rotate(nowTime * 0.006);
            c.fillStyle = '#1e293b'; c.strokeStyle = accent; c.lineWidth = 1.4;
            for (let i = 0; i < 4; i++) {
                c.rotate(Math.PI / 2);
                c.beginPath(); c.moveTo(0, -2); c.lineTo(3, -10); c.lineTo(0, -7); c.lineTo(-3, -10); c.closePath(); c.fill(); c.stroke();
            }
            c.fillStyle = '#f8fafc';
            c.beginPath(); c.arc(0, 0, 2.5, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'crimson_sand': {
            c.rotate(angle * 0.25);
            c.fillStyle = '#1e293b'; c.strokeStyle = '#cbd5e1'; c.lineWidth = 1.4;
            c.beginPath();
            c.moveTo(-6, -8); c.lineTo(6, -8); c.lineTo(1, 0); c.lineTo(6, 8); c.lineTo(-6, 8); c.lineTo(-1, 0);
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#dc2626';
            c.beginPath(); c.moveTo(-4, -5); c.lineTo(4, -5); c.lineTo(0, 0); c.closePath(); c.fill();
            c.beginPath(); c.moveTo(-4, 7); c.lineTo(4, 7); c.lineTo(0, 3); c.closePath(); c.fill();
            break;
        }
        case 'drama_mask': {
            c.fillStyle = '#ffffff'; c.strokeStyle = '#0f172a'; c.lineWidth = 1.6;
            c.beginPath();
            c.moveTo(-6, -7); c.quadraticCurveTo(0, -9, 6, -7);
            c.quadraticCurveTo(7, 3, 0, 9);
            c.quadraticCurveTo(-7, 3, -6, -7);
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#0f172a';
            c.beginPath(); c.arc(-2.3, -2, 1.2, 0, Math.PI * 2); c.arc(2.3, -2, 1.2, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(0, 2, 3, 0, Math.PI); c.stroke();
            break;
        }
        case 'valkyrie_halo': {
            c.rotate(angle + Math.PI / 2);
            c.fillStyle = '#f8fafc'; c.strokeStyle = '#fbbf24'; c.lineWidth = 1.3;
            c.beginPath(); c.moveTo(-2, 0); c.quadraticCurveTo(-11, -6, -9, 5); c.quadraticCurveTo(-5, 4, -2, 2); c.closePath(); c.fill(); c.stroke();
            c.beginPath(); c.moveTo(2, 0); c.quadraticCurveTo(11, -6, 9, 5); c.quadraticCurveTo(5, 4, 2, 2); c.closePath(); c.fill(); c.stroke();
            c.fillStyle = accent; c.beginPath(); c.arc(0, 0, 4.2, 0, Math.PI * 2); c.fill();
            c.strokeStyle = '#fef08a'; c.lineWidth = 1.2; c.beginPath(); c.arc(0, -6, 3.2, 0, Math.PI * 2); c.stroke();
            break;
        }
        case 'eclipse_crescent': {
            c.rotate(angle);
            c.fillStyle = '#fbbf24';
            c.beginPath(); c.arc(0, 0, 8.5, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#0f172a';
            c.beginPath(); c.arc(3, -1, 7, 0, Math.PI * 2); c.fill();
            c.fillStyle = accent;
            c.beginPath(); c.arc(4, 0, 2.2, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'kurt_spirit': {
            c.rotate(angle + Math.PI / 2);
            c.fillStyle = '#1e293b'; c.strokeStyle = '#38bdf8'; c.lineWidth = 1.5;
            c.beginPath();
            c.moveTo(0, -10); c.lineTo(6, -2); c.lineTo(7, -8); c.lineTo(8, 3); c.lineTo(0, 8);
            c.lineTo(-8, 3); c.lineTo(-7, -8); c.lineTo(-6, -2);
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = '#facc15';
            c.beginPath(); c.arc(-2.5, -1, 1.3, 0, Math.PI * 2); c.arc(2.5, -1, 1.3, 0, Math.PI * 2); c.fill();
            break;
        }
        case 'default_tech':
        default: {
            c.rotate(angle + Math.PI / 2);
            c.fillStyle = '#1e293b'; c.strokeStyle = accent; c.lineWidth = 1.5;
            c.beginPath();
            c.moveTo(0, -9); c.lineTo(9, 3); c.lineTo(4, 5); c.lineTo(0, 2); c.lineTo(-4, 5); c.lineTo(-9, 3);
            c.closePath(); c.fill(); c.stroke();
            c.fillStyle = accent;
            c.beginPath(); c.arc(0, -1, 3, 0, Math.PI * 2); c.fill();
            break;
        }
    }
    c.restore();
}

function adjustColorBrightness(col, amt) {
    let usePound = false;
    if (col[0] === "#") { col = col.slice(1); usePound = true; }
    let num = parseInt(col, 16);
    let r = (num >> 16) + amt; if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt; if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt; if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}

function renderGame() {
    if (!canvas || !ctx) return;

    // Tablet/Full ekran geçişlerinde canvas boyutu 0 olursa otomatik kurtar
    if (canvas.width <= 0 || canvas.height <= 0) {
        const parent = canvas.parentElement;
        canvas.width = (parent && parent.clientWidth > 0) ? parent.clientWidth : window.innerWidth;
        canvas.height = (parent && parent.clientHeight > 0) ? parent.clientHeight : window.innerHeight;
        if (typeof tower !== 'undefined' && tower) {
            tower.x = canvas.width / 2;
            tower.y = canvas.height / 2;
        }
    }

    const tx = (typeof tower !== 'undefined' && Number.isFinite(tower.x) && tower.x > 0) ? tower.x : canvas.width / 2;
    const ty = (typeof tower !== 'undefined' && Number.isFinite(tower.y) && tower.y > 0) ? tower.y : canvas.height / 2;
    const maxDim = Math.max(canvas.width, canvas.height, 100);

    const theme = game.settings.activeTheme || 'cyber';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (theme === 'snow') {
        const grad = ctx.createRadialGradient(tx, ty, 40, tx, ty, maxDim * 0.75);
        grad.addColorStop(0, '#232d3f'); grad.addColorStop(0.6, '#1a2230'); grad.addColorStop(1, '#131822');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.05)'; ctx.lineWidth = 1.5;
        for (let r = 80; r < 500; r += 90) { ctx.beginPath(); ctx.arc(tx, ty, r, 0, Math.PI * 2); ctx.stroke(); }
        for (const sf of snowFlakes) { ctx.fillStyle = `rgba(241, 245, 249, ${sf.alpha})`; ctx.beginPath(); ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2); ctx.fill(); }
    } else if (theme === 'space') {
        const grad = ctx.createRadialGradient(tx, ty, 20, tx, ty, maxDim * 0.8);
        grad.addColorStop(0, '#2a2438'); grad.addColorStop(0.5, '#1f1b2c'); grad.addColorStop(1, '#15121e');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (const st of bgStars) {
            const sx = st.x % canvas.width, sy = st.y % canvas.height;
            ctx.fillStyle = '#ddd6fe'; ctx.globalAlpha = st.alpha * 0.7;
            ctx.beginPath(); ctx.arc(sx, sy, st.size * 1.1, 0, Math.PI * 2); ctx.fill();
        } ctx.globalAlpha = 1;
    } else {
        const grad = ctx.createRadialGradient(tx, ty, 30, tx, ty, maxDim * 0.8);
        grad.addColorStop(0, '#222436'); grad.addColorStop(0.6, '#191b29'); grad.addColorStop(1, '#131420');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.04)'; ctx.lineWidth = 1;
        for (let r = 90; r < 550; r += 90) { ctx.beginPath(); ctx.arc(tx, ty, r, 0, Math.PI * 2); ctx.stroke(); }
        for (const st of bgStars) {
            const sx = st.x % canvas.width, sy = st.y % canvas.height;
            ctx.fillStyle = `rgba(203, 213, 225, ${st.alpha * 0.55})`;
            ctx.beginPath(); ctx.arc(sx, sy, st.size, 0, Math.PI * 2); ctx.fill();
        }
    }

    if (game.settings.showRange) {
        const r = getTowerRange(); ctx.beginPath(); ctx.arc(tx, ty, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(199, 210, 254, 0.25)';
        ctx.lineWidth = 1.5; ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(199, 210, 254, 0.025)'; ctx.fill();
    }

    for (const p of projectiles) {
        if (p.history && p.history.length > 1) {
            ctx.save(); ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            for (let i = 0; i < p.history.length; i++) ctx.lineTo(p.history[i].x, p.history[i].y);
            ctx.strokeStyle = p.color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.lineWidth = p.radius * 1.5;
            ctx.globalAlpha = 0.4;
            ctx.stroke(); ctx.restore();
        }
        ctx.save(); ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 8;
        ctx.fill(); ctx.restore();
    }

    for (const r of rings) {
        ctx.save(); ctx.beginPath(); ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color; ctx.globalAlpha = Math.max(0, r.life);
        ctx.lineWidth = 1 + r.life * 3;
        ctx.shadowColor = r.color; ctx.shadowBlur = 10;
        ctx.stroke(); ctx.restore();
    }

    const activeCompSkin = game.activeCompanionSkin || 'default_tech';
    const nowCompTime = performance.now();
    for (const [key, st] of Object.entries(game.companions)) {
        if (!st.unlocked || !st.x) continue;
        const star = Math.min(5, Math.max(1, st.level || 1));
        ctx.save();
        ctx.translate(st.x, st.y);
        drawCustomCompanionSkin(ctx, activeCompSkin, key, star, st.angle || 0, nowCompTime);
        ctx.restore();
    }

    for (const b of lightningBeams) { ctx.save(); ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.strokeStyle = b.color; ctx.lineWidth = 2.5; ctx.stroke(); ctx.restore(); }

    ctx.save(); ctx.translate(tx, ty);
    if (tower.shield > 0) {
        ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)'; ctx.lineWidth = 2; ctx.setLineDash([10, 5]);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.09)'; ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    }

    const skinId = game.activeSkin || 'default_cyber';
    const barrelCount = Math.min(7, Math.max(1, getEffectiveMultishot()));
    drawCustomTowerSkin(ctx, skinId, tower.angle, tower.recoil, barrelCount, nowCompTime);
    ctx.restore();

    for (const e of enemies) {
        ctx.save(); ctx.translate(e.x, e.y);
        if (e.slowTimer > 0) { ctx.beginPath(); ctx.arc(0, 0, e.radius + 4, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)'; ctx.lineWidth = 1.5; ctx.stroke(); }

        ctx.save(); ctx.rotate(e.rot);
        let fillStyle = e.color;
        if (e.hitFlash <= 0) {
            const darkColor = adjustColorBrightness(e.color, -50);
            const eGrad = ctx.createRadialGradient(-e.radius * 0.3, -e.radius * 0.3, e.radius * 0.1, 0, 0, e.radius);
            eGrad.addColorStop(0, '#ffffff');
            eGrad.addColorStop(0.2, e.color);
            eGrad.addColorStop(1, darkColor);
            fillStyle = eGrad;
            ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
        }

        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : fillStyle;
        ctx.strokeStyle = e.secColor || '#ffffff'; ctx.lineWidth = e.type === 'boss' ? 3 : 1.5;

        if (e.type === 'boss') {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const r = i % 2 === 0 ? e.radius : e.radius * 0.75;
                const px = Math.cos(a) * r, py = Math.sin(a) * r;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
        } else if (e.isTeleporter) {
            ctx.beginPath(); ctx.moveTo(0, -e.radius); ctx.lineTo(e.radius, 0); ctx.lineTo(0, e.radius); ctx.lineTo(-e.radius, 0); ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
        } else if (e.isRanged) {
            ctx.beginPath(); ctx.moveTo(e.radius, 0); ctx.lineTo(-e.radius * 0.8, -e.radius * 0.85); ctx.lineTo(-e.radius * 0.4, 0); ctx.lineTo(-e.radius * 0.8, e.radius * 0.85); ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
        } else {
            ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
        }
        ctx.restore();

        if (e.hp < e.maxHp || e.type === 'boss') {
            const barW = e.radius * 2; const pct = Math.max(0, e.hp / e.maxHp);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; ctx.fillRect(-barW / 2, -e.radius - 11, barW, 3.5);
            ctx.fillStyle = e.type === 'boss' ? '#d8b4fe' : '#86efac';
            ctx.fillRect(-barW / 2, -e.radius - 11, barW * pct, 3.5);
        }
        ctx.restore();
    }

    for (const pt of particles) { ctx.save(); ctx.globalAlpha = pt.alpha; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2); ctx.fillStyle = pt.color; ctx.fill(); ctx.restore(); }
    for (const ft of floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `bold ${ft.size}px 'Rajdhani', sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    }
}

// =======================================================
// OTOMATİK MOBİL OPTİMİZASYON (DİREKT GENİŞ PANEL & HUD)
// =======================================================
(function initMobileOptimizer() {
    function injectMobileStylesAndFixes() {
        if (document.getElementById('mobile-auto-optimizer-style')) return;

        const style = document.createElement('style');
        style.id = 'mobile-auto-optimizer-style';
        style.textContent = `
            @media (max-width: 768px) {
                /* Üst HUD (Can ve Dalga kutuları) telefonda kuleyi kapatmasın diye küçültülür */
                .mobile-hud-compact {
                    transform: scale(0.80) !important;
                    padding: 4px 8px !important;
                    opacity: 0.92;
                }

                /* Yükseltme paneli doğrudan 2. fotoğraftaki geniş boyutta (65dvh) açılır */
                .mobile-upgrade-scrollable {
                    max-height: 65dvh !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    -webkit-overflow-scrolling: touch !important;
                    touch-action: pan-y !important;
                    overscroll-behavior: contain !important;
                    padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 56px) !important;
                    transition: max-height 0.22s ease, opacity 0.18s ease !important;
                }

                /* Paneli Gizle'ye basıldığında tamamen kapanır */
                .mobile-upgrade-scrollable.mobile-panel-collapsed {
                    max-height: 0px !important;
                    padding-top: 0 !important;
                    padding-bottom: 0 !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }

                /* Sağ alt hızlı Aç / Gizle butonu */
                #mobilePanelToggleBtn {
                    position: fixed;
                    right: 12px;
                    bottom: calc(env(safe-area-inset-bottom, 8px) + 10px);
                    z-index: 9999;
                    background: rgba(15, 23, 42, 0.94);
                    border: 1.5px solid #38bdf8;
                    color: #e0f2fe;
                    font-family: 'Rajdhani', sans-serif;
                    font-weight: 700;
                    font-size: 12.5px;
                    padding: 7px 13px;
                    border-radius: 999px;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.65);
                    backdrop-filter: blur(6px);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                }
            }

            @media (min-width: 769px) {
                #mobilePanelToggleBtn {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
        scanAndTagMobileElements();
    }

    function scanAndTagMobileElements() {
        if (window.innerWidth > 768) return;

        const allDivs = Array.from(document.querySelectorAll('div, section, aside'));

        // 1. Üstteki Can ve Dalga kutularını bul ve telefonda küçült
        for (const el of allDivs) {
            if (el.querySelector('canvas')) continue;
            const rect = el.getBoundingClientRect();
            const text = (el.innerText || '').toLowerCase();
            if (rect.top >= 0 && rect.top < 140 && rect.height > 40 && rect.height < 160 && rect.width < window.innerWidth * 0.85) {
                if (text.includes('can') || text.includes('dalga') || text.includes('aktif düşman')) {
                    el.classList.add('mobile-hud-compact');
                }
            }
        }

        // 2. Yükseltme listesini bul ve doğrudan 2. fotoğraftaki geniş kaydırılabilir hale getir
        let upgradeContainer = document.querySelector('#upgradePanel, #upgrades, #upgradeList, [id*="upgrade" i]');
        if (!upgradeContainer) {
            const candidates = allDivs.filter(el => {
                if (el.querySelector('canvas')) return false;
                const rect = el.getBoundingClientRect();
                const btnCount = el.querySelectorAll('button').length;
                return rect.height >= 60 && btnCount >= 3 && (el.innerText || '').includes('Sv.');
            });
            if (candidates.length > 0) {
                upgradeContainer = candidates.sort((a, b) => a.querySelectorAll('button').length - b.querySelectorAll('button').length)[0];
            }
        }

        if (upgradeContainer && !upgradeContainer.classList.contains('mobile-upgrade-scrollable')) {
            upgradeContainer.classList.add('mobile-upgrade-scrollable');
        }

        // 3. Tek tıkla Aç / Kapat butonu (Ara küçük mod kaldırıldı, direkt geniş açılır ve kapanır)
        if (!document.getElementById('mobilePanelToggleBtn')) {
            const btn = document.createElement('button');
            btn.id = 'mobilePanelToggleBtn';
            let isCollapsed = false;
            btn.innerHTML = '🔽 Paneli Gizle';

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                scanAndTagMobileElements();
                const panel = document.querySelector('.mobile-upgrade-scrollable');
                if (!panel) return;

                isCollapsed = !isCollapsed;
                if (isCollapsed) {
                    panel.classList.add('mobile-panel-collapsed');
                    btn.innerHTML = '🔼 Yükseltmeleri Aç';
                } else {
                    panel.classList.remove('mobile-panel-collapsed');
                    btn.innerHTML = '🔽 Paneli Gizle';
                }
            });

            document.body.appendChild(btn);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectMobileStylesAndFixes);
    } else {
        injectMobileStylesAndFixes();
    }

    window.addEventListener('resize', () => {
        scanAndTagMobileElements();
        if (typeof resizeCanvas === 'function') resizeCanvas();
    });
    document.addEventListener('fullscreenchange', () => {
        setTimeout(() => {
            if (typeof resizeCanvas === 'function') resizeCanvas();
        }, 150);
    });
    setInterval(scanAndTagMobileElements, 1200);
})();
