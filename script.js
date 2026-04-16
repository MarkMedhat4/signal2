document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Interactive Sine Wave Logic
    const canvas = document.getElementById('sineCanvas');
    const ctx = canvas.getContext('2d');
    const ampSlider = document.getElementById('amp');
    const freqSlider = document.getElementById('freq');
    const phaseSlider = document.getElementById('phase');
    
    const eqA = document.getElementById('eqA');
    const eqF = document.getElementById('eqF');
    const eqP = document.getElementById('eqP');

    function drawSineWave() {
        const A = parseFloat(ampSlider.value);
        const f0 = parseFloat(freqSlider.value);
        const phi = parseFloat(phaseSlider.value);

        // Update formula text
        eqA.textContent = A.toFixed(1);
        eqF.textContent = f0.toFixed(1);
        eqP.textContent = phi.toFixed(2);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        for(let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for(let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Draw zero line
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Draw sine wave
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const scale = 40; // pixels per unit
        const centerY = canvas.height / 2;

        for (let px = 0; px < canvas.width; px++) {
            const t = px / scale;
            const y = A * Math.sin(2 * Math.PI * f0 * t + phi);
            const canvasY = centerY - (y * scale);
            if (px === 0) ctx.moveTo(px, canvasY);
            else ctx.lineTo(px, canvasY);
        }
        ctx.stroke();
    }

    // Event listeners for sliders
    [ampSlider, freqSlider, phaseSlider].forEach(slider => {
        slider.addEventListener('input', drawSineWave);
    });

    // Initial draw
    drawSineWave();
});