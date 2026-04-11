export function formatElapsed(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function calcFee(startTime) {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  if (elapsed <= 0) return 0;
  const units = Math.ceil(elapsed / (30 * 60));
  return units * 15;
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function formatDuration(startTime, endTime) {
  const elapsed = Math.floor(((endTime || Date.now()) - startTime) / 1000);
  return formatElapsed(elapsed);
}
