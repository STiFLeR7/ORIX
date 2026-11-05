// Render the approved V4 aperture; a small colored dot retains status information.
const orixMarks = new Map();
window.__orixMark = (ctx, x, y, size, accent = '#00c48a') => {
  const highContrast = document.documentElement.dataset.highContrast === 'true';
  const color = highContrast ? 'CanvasText' : document.documentElement.dataset.theme === 'light' ? '#111318' : '#F4F5F7';
  if (!orixMarks.has(color)) {
    const image = document.createElement('canvas'); image.width = image.height = 128;
    const mark = image.getContext('2d');
    mark.fillStyle = color;
    mark.beginPath(); mark.roundRect(4, 4, 120, 120, 30); mark.fill();
    mark.globalCompositeOperation = 'destination-out';
    mark.strokeStyle = '#000'; mark.lineCap = 'round'; mark.lineJoin = 'round';
    mark.lineWidth = 20; mark.beginPath(); mark.moveTo(4, 25);
    mark.bezierCurveTo(20, 18, 39, 40, 56, 54); mark.bezierCurveTo(65, 61, 78, 70, 103, 88); mark.stroke();
    mark.lineWidth = 21; mark.beginPath(); mark.moveTo(4, 122); mark.lineTo(52, 75);
    mark.bezierCurveTo(61, 66, 67, 62, 75, 54); mark.lineTo(124, 9); mark.stroke();
    orixMarks.set(color, image);
  }
  ctx.save();
  ctx.drawImage(orixMarks.get(color), x - size / 2, y - size / 2, size, size);
  ctx.beginPath(); ctx.arc(x + size * .36, y + size * .36, size * .09, 0, Math.PI * 2);
  ctx.fillStyle = accent; ctx.fill();
  ctx.restore();
};
