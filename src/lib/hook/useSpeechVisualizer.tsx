import { useRef } from "react";

const useSpeechVisualizer = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const startVisualizer = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
                if (!canvasRef.current) return;
                const WIDTH = canvas.width;
                const HEIGHT = canvas.height;
                const centerY = HEIGHT / 2;

                requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, WIDTH, HEIGHT);
                ctx.fillStyle = "rgb(0,0,0)";
                ctx.fillRect(0, 0, WIDTH, HEIGHT);

                const barWidth = (WIDTH / bufferLength) * 0.8;
                let barHeight;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i];

                    const maxBarHeight = HEIGHT * 0.5;
                    barHeight = Math.min(barHeight, maxBarHeight);

                    const gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2);
                    gradient.addColorStop(0, `hsl(${(i / bufferLength) * 360}, 100%, 50%)`);
                    gradient.addColorStop(1, `hsl(${(i / bufferLength) * 360}, 100%, 30%)`);

                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);

                    x += barWidth + 1;
                }
            };

            draw();
        });
    };

    const stopVisualizer = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas when stopping
    };

    return {
        startVisualizer,
        stopVisualizer,
        canvasRef,
    };
};

export default useSpeechVisualizer;
