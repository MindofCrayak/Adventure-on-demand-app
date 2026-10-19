import { TokenStyling } from '../types/ttrpg';

export function renderTokenToCanvas(
  canvas: HTMLCanvasElement,
  imageSource: string | HTMLImageElement,
  styling: TokenStyling = {
    borderColor: '#eab308',
    borderStyle: 'ornate',
    badgeText: '',
    ringColor: '#9333ea',
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    ringThickness: 16,
  },
  size: number = 512
): Promise<string> {
  return new Promise((resolve) => {
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    ctx.clearRect(0, 0, size, size);

    const radius = size / 2;
    const ringWidth = styling.ringThickness || 18;
    const innerRadius = radius - ringWidth;

    const drawContent = (img: CanvasImageSource) => {
      // 1. Clip circular avatar viewport
      ctx.save();
      ctx.beginPath();
      ctx.arc(radius, radius, innerRadius + 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Background filler
      ctx.fillStyle = styling.ringColor || '#18181b';
      ctx.fillRect(0, 0, size, size);

      // Draw avatar image with pan & zoom
      const zoom = styling.zoom || 1;
      const offX = styling.offsetX || 0;
      const offY = styling.offsetY || 0;

      const imgWidth = size * zoom;
      const imgHeight = size * zoom;
      const x = (size - imgWidth) / 2 + offX;
      const y = (size - imgHeight) / 2 + offY;

      ctx.drawImage(img, x, y, imgWidth, imgHeight);

      // Optional vignette/tint
      if (styling.tint) {
        ctx.fillStyle = styling.tint;
        ctx.fillRect(0, 0, size, size);
      }

      ctx.restore();

      // 2. Draw Token Border Ring
      ctx.save();

      // Outer Ring Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      // Ring Stroke
      ctx.beginPath();
      ctx.arc(radius, radius, radius - ringWidth / 2, 0, Math.PI * 2);
      ctx.lineWidth = ringWidth;

      // Gradient for metallic look
      const grad = ctx.createLinearGradient(0, 0, size, size);
      const bColor = styling.borderColor || '#eab308';
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, bColor);
      grad.addColorStop(0.5, '#78350f');
      grad.addColorStop(0.8, bColor);
      grad.addColorStop(1, '#fef08a');
      ctx.strokeStyle = grad;
      ctx.stroke();

      ctx.restore();

      // 3. Inner border bevel line
      ctx.save();
      ctx.beginPath();
      ctx.arc(radius, radius, innerRadius, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
      ctx.restore();

      // 4. Border style accents (runic / ornate / spikes)
      if (styling.borderStyle === 'runic' || styling.borderStyle === 'ornate') {
        ctx.save();
        ctx.translate(radius, radius);
        const notches = styling.borderStyle === 'runic' ? 12 : 8;
        for (let i = 0; i < notches; i++) {
          ctx.rotate((Math.PI * 2) / notches);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(radius - ringWidth / 2, 0, ringWidth * 0.18, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.restore();
      } else if (styling.borderStyle === 'spikes') {
        ctx.save();
        ctx.translate(radius, radius);
        const spikes = 8;
        for (let i = 0; i < spikes; i++) {
          ctx.rotate((Math.PI * 2) / spikes);
          ctx.fillStyle = bColor;
          ctx.beginPath();
          ctx.moveTo(radius - ringWidth, -6);
          ctx.lineTo(radius + 4, 0);
          ctx.lineTo(radius - ringWidth, 6);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. Nameplate / Badge Banner at bottom
      if (styling.badgeText) {
        ctx.save();
        const bannerH = size * 0.12;
        const bannerW = size * 0.72;
        const bannerY = size - bannerH - (size * 0.04);
        const bannerX = (size - bannerW) / 2;

        // Banner shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;

        // Banner background
        ctx.fillStyle = '#18181b';
        ctx.strokeStyle = bColor;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 8);
        ctx.fill();
        ctx.stroke();

        // Banner Text
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${Math.floor(size * 0.048)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(styling.badgeText.toUpperCase(), radius, bannerY + bannerH / 2);

        ctx.restore();
      }

      resolve(canvas.toDataURL('image/png'));
    };

    if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => drawContent(img);
      img.onerror = () => {
        // Draw fallback styled silhouette
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = size;
        fallbackCanvas.height = size;
        const fctx = fallbackCanvas.getContext('2d')!;
        fctx.fillStyle = '#3f3f46';
        fctx.fillRect(0, 0, size, size);
        fctx.fillStyle = '#e4e4e7';
        fctx.beginPath();
        fctx.arc(size / 2, size * 0.38, size * 0.18, 0, Math.PI * 2);
        fctx.fill();
        fctx.beginPath();
        fctx.arc(size / 2, size * 0.85, size * 0.32, 0, Math.PI * 2);
        fctx.fill();
        drawContent(fallbackCanvas);
      };
      img.src = imageSource;
    } else {
      drawContent(imageSource);
    }
  });
}
