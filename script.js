document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════
    // TAB NAVIGATION
    // ═══════════════════════════════════════════
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabs = document.querySelectorAll('.tab');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.section;
            navBtns.forEach(b => b.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(target)?.classList.add('active');
        });
    });

    // ═══════════════════════════════════════════
    // INTERACTIVE SIGNAL VISUALIZER
    // ═══════════════════════════════════════════
    const canvas = document.getElementById('sigCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sigType   = document.getElementById('sigType');
    const ampSlider = document.getElementById('amp');
    const freqSlider= document.getElementById('freq');
    const phaseSlider=document.getElementById('phase');
    const decaySlider=document.getElementById('decay');
    const decayCtrl = document.getElementById('decayCtrl');

    const ampVal    = document.getElementById('ampVal');
    const freqVal   = document.getElementById('freqVal');
    const phaseVal  = document.getElementById('phaseVal');
    const decayVal  = document.getElementById('decayVal');
    const formulaDisplay = document.getElementById('sigFormula');

    const propE    = document.getElementById('propE');
    const propP    = document.getElementById('propP');
    const propType = document.getElementById('propType');
    const propT    = document.getElementById('propT');
    const propSym  = document.getElementById('propSym');
    const propDC   = document.getElementById('propDC');

    function updateLabels() {
        const A   = parseFloat(ampSlider.value);
        const f   = parseFloat(freqSlider.value);
        const phi = parseFloat(phaseSlider.value);
        const a   = parseFloat(decaySlider.value);
        const type= sigType.value;

        ampVal.textContent   = A.toFixed(1);
        freqVal.textContent  = f.toFixed(1);
        phaseVal.textContent = phi.toFixed(2);
        decayVal.textContent = a.toFixed(1);

        decayCtrl.style.display = (type === 'exp') ? 'flex' : 'none';

        const formulas = {
            sine:   `x(t) = ${A.toFixed(1)} · sin(2π · ${f.toFixed(1)} · t + ${phi.toFixed(2)})`,
            cosine: `x(t) = ${A.toFixed(1)} · cos(2π · ${f.toFixed(1)} · t + ${phi.toFixed(2)})`,
            rect:   `x(t) = ${A.toFixed(1)} · rect(t / ${(1/f).toFixed(2)})`,
            exp:    `x(t) = ${A.toFixed(1)} · e^(−${a.toFixed(1)}·t) · u(t)`,
            tri:    `x(t) = ${A.toFixed(1)} · tri(t / ${(1/f).toFixed(2)})`,
            step:   `x(t) = ${A.toFixed(1)} · u(t)`,
            sum:    `x(t) = sin(2π·t) + 0.5·sin(2π·3t) + 0.33·sin(2π·5t)  [Square wave approx]`
        };
        formulaDisplay.textContent = formulas[type] || '';
        updateProps(type, A, f, a);
    }

    function updateProps(type, A, f, a) {
        switch (type) {
            case 'sine': case 'cosine':
                propE.textContent    = '∞';
                propP.textContent    = (A * A / 2).toFixed(3);
                propType.textContent = 'Power Signal';
                propT.textContent    = (1 / f).toFixed(3) + ' s';
                propSym.textContent  = type === 'sine' ? 'Odd' : 'Even';
                propDC.textContent   = '0';
                break;
            case 'exp':
                propE.textContent    = (A * A / (2 * a)).toFixed(4);
                propP.textContent    = '0';
                propType.textContent = 'Energy Signal';
                propT.textContent    = 'Aperiodic';
                propSym.textContent  = 'Neither';
                propDC.textContent   = '0';
                break;
            case 'step':
                propE.textContent    = '∞';
                propP.textContent    = (A * A / 2).toFixed(3);
                propType.textContent = 'Power Signal';
                propT.textContent    = 'Aperiodic';
                propSym.textContent  = 'Neither';
                propDC.textContent   = (A / 2).toFixed(2);
                break;
            case 'rect': case 'tri':
                propE.textContent    = (A * A / f).toFixed(4);
                propP.textContent    = '0';
                propType.textContent = 'Energy Signal';
                propT.textContent    = 'Aperiodic (single)';
                propSym.textContent  = 'Even';
                propDC.textContent   = '0';
                break;
            case 'sum':
                propE.textContent    = '∞';
                propP.textContent    = '0.562';
                propType.textContent = 'Power Signal';
                propT.textContent    = '1.000 s';
                propSym.textContent  = 'Odd';
                propDC.textContent   = '0';
                break;
        }
    }

    function drawSignal() {
        updateLabels();

        const W   = canvas.width;
        const H   = canvas.height;
        const A   = parseFloat(ampSlider.value);
        const f   = parseFloat(freqSlider.value);
        const phi = parseFloat(phaseSlider.value);
        const a   = parseFloat(decaySlider.value);
        const type= sigType.value;

        ctx.clearRect(0, 0, W, H);

        // Grid
        ctx.strokeStyle = '#1a2535';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 50) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // Axes
        const cy = H / 2;
        ctx.strokeStyle = '#2d4060';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(40, H); ctx.stroke();

        ctx.fillStyle = '#4a6080';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText('t', W - 15, cy - 5);
        ctx.fillText('x(t)', 42, 15);

        const tMin = -1, tMax = 9;
        const tRange = tMax - tMin;
        const px2t  = t => tMin + (t / W) * tRange;
        const amp2py= v => cy - (v / 3.5) * (H / 2 - 20);

        function signalVal(t) {
            switch (type) {
                case 'sine':    return A * Math.sin(2 * Math.PI * f * t + phi);
                case 'cosine':  return A * Math.cos(2 * Math.PI * f * t + phi);
                case 'rect': {
                    const T = 1 / f;
                    return (Math.abs(t) <= T / 2) ? A : 0;
                }
                case 'exp':     return t >= 0 ? A * Math.exp(-a * t) : 0;
                case 'tri': {
                    const T = 1 / f;
                    return Math.abs(t) <= T ? A * (1 - Math.abs(t) / T) : 0;
                }
                case 'step':    return t >= 0 ? A : 0;
                case 'sum':
                    return Math.sin(2 * Math.PI * t) +
                           0.5 * Math.sin(2 * Math.PI * 3 * t) +
                           (1/3) * Math.sin(2 * Math.PI * 5 * t);
                default: return 0;
            }
        }

        // Gradient stroke
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, '#7c3aed');
        grad.addColorStop(0.5, '#00d4ff');
        grad.addColorStop(1, '#10b981');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        let started = false;
        for (let px = 0; px < W; px++) {
            const t  = px2t(px);
            const v  = signalVal(t);
            const py = amp2py(v);
            if (!started) { ctx.moveTo(px, py); started = true; }
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Glow effect
        ctx.strokeStyle = 'rgba(0,212,255,0.15)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        started = false;
        for (let px = 0; px < W; px++) {
            const t  = px2t(px);
            const v  = signalVal(t);
            const py = amp2py(v);
            if (!started) { ctx.moveTo(px, py); started = true; }
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // T-axis ticks
        ctx.fillStyle = '#3a5070';
        ctx.font = '10px JetBrains Mono, monospace';
        for (let t = Math.ceil(tMin); t <= tMax; t++) {
            const px = ((t - tMin) / tRange) * W;
            ctx.beginPath();
            ctx.strokeStyle = '#3a5070';
            ctx.lineWidth = 1;
            ctx.moveTo(px, cy - 4); ctx.lineTo(px, cy + 4); ctx.stroke();
            if (t !== 0) ctx.fillText(t, px - 4, cy + 16);
        }
        ctx.fillText('0', ((0 - tMin) / tRange) * W - 3, cy + 16);
    }

    [sigType, ampSlider, freqSlider, phaseSlider, decaySlider].forEach(el => {
        el.addEventListener('input', drawSignal);
    });

    window.addEventListener('resize', () => {
        canvas.width = canvas.parentElement.clientWidth || 900;
        drawSignal();
    });

    drawSignal();


    // ═══════════════════════════════════════════
    // AI CHAT (Anthropic API)
    // ═══════════════════════════════════════════
    const chatBox   = document.getElementById('chatBox');
    const chatInput = document.getElementById('chatInput');
    const sendBtn   = document.getElementById('sendBtn');
    const sendTxt   = document.getElementById('sendTxt');
    const sendLoad  = document.getElementById('sendLoad');
    const quickBtns = document.querySelectorAll('.quick-btn');

    const SYSTEM_PROMPT = `You are an expert tutor for EC321M "Signals and Systems" course. 
You help students understand:
- Signal types: energy/power, even/odd, periodic/aperiodic, CT/DT
- Signal operations: time scaling, shifting, reflection, amplitude operations
- System properties: linearity, time invariance, causality, stability, memory
- Fourier Series and Fourier Transform (properties and pairs)
- Laplace Transform (bilateral/unilateral, ROC, partial fractions)
- Convolution: CT and DT, step-by-step method
- LTI systems and impulse response

You can respond in Arabic OR English depending on what language the student uses.
When explaining math, use clear notation. When possible, give step-by-step worked examples.
Use emojis sparingly for clarity (like 📌 for key points, ✅ for correct steps).
Keep explanations clear, concise, and exam-focused.`;

    let chatHistory = [];

    function addMsg(role, text) {
        const div = document.createElement('div');
        div.className = `msg ${role}`;
        const avatar = role === 'user' ? '👤' : '🤖';
        const name   = role === 'user' ? 'You' : 'AI Tutor';
        div.innerHTML = `
            <div class="msg-avatar">${avatar}</div>
            <div class="msg-content">
                <strong>${name}</strong>
                <p>${escapeHtml(text)}</p>
            </div>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        return div;
    }

    function addTyping() {
        const div = document.createElement('div');
        div.className = 'msg assistant';
        div.id = 'typingIndicator';
        div.innerHTML = `
            <div class="msg-avatar">🤖</div>
            <div class="msg-content">
                <strong>AI Tutor</strong>
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        return div;
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    }

    async function sendMessage(userMsg) {
        if (!userMsg.trim()) return;
        chatInput.value = '';
        sendBtn.disabled = true;
        sendTxt.style.display = 'none';
        sendLoad.style.display = 'inline';

        addMsg('user', userMsg);
        chatHistory.push({ role: 'user', content: userMsg });

        const typingDiv = addTyping();

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    system: SYSTEM_PROMPT,
                    messages: chatHistory
                })
            });

            const data = await response.json();
            typingDiv.remove();

            if (data.content && data.content[0]) {
                const reply = data.content[0].text;
                chatHistory.push({ role: 'assistant', content: reply });
                addMsg('assistant', reply);
            } else {
                addMsg('assistant', 'Sorry, I encountered an error. Please try again.');
            }
        } catch (err) {
            typingDiv.remove();
            addMsg('assistant', 'Connection error. Make sure you have internet access and try again.');
        }

        sendBtn.disabled = false;
        sendTxt.style.display = 'inline';
        sendLoad.style.display = 'none';
    }

    sendBtn.addEventListener('click', () => sendMessage(chatInput.value));

    chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(chatInput.value);
        }
    });

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('[data-section="ai"]')?.click();
            sendMessage(btn.dataset.q);
        });
    });

});

// ═══════════════════════════════════════════
// PRACTICE PROBLEMS — SOLUTION TOGGLE
// ═══════════════════════════════════════════
function toggleSolution(btn) {
    const solution = btn.nextElementSibling;
    const isHidden = solution.classList.contains('hidden');

    if (isHidden) {
        solution.classList.remove('hidden');
        btn.classList.add('open');
        btn.querySelector('.toggle-icon').textContent = '▼';
        btn.innerHTML = btn.innerHTML.replace('Show Solution', 'Hide Solution');
    } else {
        solution.classList.add('hidden');
        btn.classList.remove('open');
        btn.querySelector('.toggle-icon').textContent = '▶';
        btn.innerHTML = btn.innerHTML.replace('Hide Solution', 'Show Solution');
    }
}
