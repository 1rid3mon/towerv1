/* Presentation settings reuse existing controls and preserve the battle's pause state. */
(function () {
    'use strict';
    let modal, panel, returnFocus, resume = false, pushing = false;
    const t = key => window.MetaStrings[key] || key;
    function node(tag, cls, label) {
        const el = document.createElement(tag); el.className = cls;
        if (label) el.textContent = label;
        return el;
    }
    function section(key, open = false) {
        const details = node('details', 'signal-settings-section'); details.open = open;
        details.append(node('summary', '', t(key)));
        details.addEventListener('toggle', () => {
            if (details.open) panel.querySelectorAll('details').forEach(other => { if (other !== details) other.open = false; });
        });
        panel.append(details); return details;
    }
    function toggle(host, key, read, action) {
        const row = node('div', 'signal-settings-row'), label = node('span', '', t(key));
        const button = node('button', 'signal-switch'); button.type = 'button';
        button.setAttribute('role', 'switch'); button.setAttribute('aria-label', t(key));
        const sync = () => { button.setAttribute('aria-checked', String(read())); button.textContent = read() ? t('on') : t('off'); };
        button.onclick = () => { action(); sync(); }; button.sync = sync; sync();
        row.append(label, button); host.append(row);
    }
    function select(host, key, values, read, action) {
        const row = node('label', 'signal-settings-row', t(key)), input = node('select', '');
        for (const [value,label] of values) { const option = node('option', '', label); option.value = value; input.append(option); }
        input.value = read(); input.onchange = () => action(input.value); row.append(input); host.append(row);
    }
    function mount() {
        modal = document.getElementById('settings-modal'); if (!modal) return;
        const language = document.getElementById('language-select');
        // Move the radio control rather than duplicate its event listener/state.
        const radio = document.getElementById('ls-sound-toggle');
        const consoleButton = document.getElementById('ls-sound-optin');
        modal.replaceChildren(); modal.className = 'hidden signal-settings';
        modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'signal-settings-title');
        const shell = node('div', 'signal-settings-shell');
        const header = node('header', 'signal-settings-header');
        const title = node('h2', '', t('settings')); title.id = 'signal-settings-title';
        const closeButton = node('button', '', '×'); closeButton.type = 'button'; closeButton.setAttribute('aria-label', t('close')); closeButton.onclick = () => close();
        header.append(title,closeButton); panel = node('div', 'signal-settings-scroll'); shell.append(header,panel); modal.append(shell);
        const sound = section('soundSection',true);
        toggle(sound,'effects',()=>battleSfxEnabled,()=>toggleBattleSfx());
        if (radio) { radio.className = 'signal-existing-toggle'; sound.append(radio); }
        if (consoleButton) {
            consoleButton.className = 'signal-existing-toggle'; sound.append(consoleButton);
            let enabled = false; try { enabled = localStorage.getItem('lostSignal:console') === 'on'; } catch {}
            TowerCommandSounds.setEnabled(enabled); consoleButton.setAttribute('aria-pressed',String(enabled));
            consoleButton.textContent = t('consoleSound')+' · '+t(enabled?'on':'off');
            consoleButton.addEventListener('click',()=> { try { localStorage.setItem('lostSignal:console',TowerCommandSounds.isEnabled()?'on':'off'); } catch {} });
        }
        const feel = section('feelSection');
        toggle(feel,'vibration',()=>Fx.settings().vibration,()=>Fx.configure({vibration:!Fx.settings().vibration}));
        toggle(feel,'reduceMotion',()=>Fx.settings().reducedMotion,()=>Fx.configure({reducedMotion:!Fx.settings().reducedMotion}));
        select(feel,'intensity',['auto','low','medium','high'].map(k=>[k,t(k==='auto'?'automatic':k)]),()=>Fx.settings().intensity,value=>Fx.configure({intensity:value}));
        const device = section('deviceSection');
        if (language) { for (const option of language.options) option.textContent = ({tr:'TR · Türkçe',en:'EN · English',es:'ES · Español',de:'DE · Deutsch'})[option.value] || option.value; device.append(language); }
        select(device,'deviceMode',['auto','phone','tablet','pc'].map(k=>[k,t(k==='auto'?'automatic':k)]),()=>game.deviceMode||'auto',setDeviceMode);
        const account = section('accountSection');
        const signIn = node('button','signal-existing-toggle',t('accountOpen')); signIn.onclick=()=>{close(); if(typeof openAuthModal==='function')openAuthModal();};account.append(signIn);
        const reset = node('button','signal-existing-toggle',t('resetGame')); reset.onclick=()=>{close();openHardResetConfirm();};account.append(reset);
        const stats = section('statsSection');
        for (const [key,id] of [['totalKills','stat-total-kills'],['bossKills','stat-boss-kills'],['highestWave','stat-max-wave']]) { const row=node('div','signal-settings-row',t(key)), value=node('strong','');value.id=id;row.append(value);stats.append(row); }
        panel.append(node('small','signal-settings-version','LOST SIGNAL · v2'));
        modal.addEventListener('click', e=> { if(e.target===modal)close(); });
        let startX=0,startY=0;
        shell.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY;},{passive:true});
        shell.addEventListener('pointerup',e=>{if(e.clientX-startX>80&&Math.abs(e.clientY-startY)<45&&!e.target.closest('select,input'))close();},{passive:true});
        modal.addEventListener('keydown',e=>{
            if(e.key==='Escape'){e.preventDefault();close();}
            if(e.key!=='Tab')return;
            const focus=[...modal.querySelectorAll('button,select,summary')].filter(el=>el.getClientRects().length),first=focus[0],last=focus.at(-1);
            if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
            if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
        });
        addEventListener('popstate',()=>{if(!modal.classList.contains('hidden'))close(true);});
        addEventListener('resize',()=>{if(game.deviceMode==='auto')applyBodyClasses();});
    }
    function open() {
        if(!modal)mount(); if(!modal||!modal.classList.contains('hidden'))return;
        returnFocus=document.activeElement; resume=!isPaused; if(resume)togglePause();
        setElText('stat-total-kills',formatNumber(game.stats.totalKills));setElText('stat-boss-kills',formatNumber(game.stats.bossKills));setElText('stat-max-wave',game.highestWave);
        modal.classList.remove('hidden'); document.body.classList.add('signal-settings-open');
        modal.querySelectorAll('.signal-switch').forEach(button=>button.sync());
        history.pushState({...history.state,signalSettings:true},'');pushing=true;
        modal.querySelector('header button').focus();
    }
    function close(fromHistory=false) {
        if(!modal||modal.classList.contains('hidden'))return;
        modal.classList.add('hidden');document.body.classList.remove('signal-settings-open');
        if(resume&&isPaused&&!isDefeated&&document.getElementById('mode-main-menu')?.classList.contains('menu-hidden'))togglePause();
        resume=false;if(pushing&&!fromHistory&&history.state?.signalSettings)history.back();pushing=false;
        if(returnFocus?.isConnected)returnFocus.focus();
    }
    window.SignalSettings={open,close};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
