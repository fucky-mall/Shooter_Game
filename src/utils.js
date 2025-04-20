export const keys = {};
export let mouse = { x: 0, y: 0, left: false, right: false };

export function initInput(canvas) {
  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup',   e => keys[e.code] = false);
  
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mousedown', e => {
    if (e.button === 0) mouse.left = true;
    if (e.button === 2) mouse.right = true;
  });

  canvas.addEventListener('mouseup', e => {
    if (e.button === 0) mouse.left = false;
    if (e.button === 2) mouse.right = false;
  });
}

export function rectsCollide(a, b) {
  return a.x < b.x + b.width && 
         a.x + a.width > b.x && 
         a.y < b.y + b.height && 
         a.y + a.height > b.y;
}