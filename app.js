const TURNSTILE_SITE_KEY = '__TURNSTILE_SITE_KEY__';

const params = new URLSearchParams(window.location.search);
const redirectUrl = params.get('redirect_url');

let turnstileToken = null;

function renderTurnstile() {
  turnstile.render('#turnstile-container', {
    sitekey: TURNSTILE_SITE_KEY,
    theme: 'dark',
    callback: onTurnstileSuccess,
    'error-callback': onTurnstileError,
    'expired-callback': onTurnstileExpired,
  });
}

function onTurnstileSuccess(token) {
  turnstileToken = token;

  const msg = document.getElementById('statusMsg');
  msg.className = 'status-message success';
  msg.textContent = 'Verification successful. Redirecting...';

  setTimeout(() => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      msg.textContent = 'Verified. No redirect URL specified.';
    }
  }, 800);
}

function onTurnstileError() {
  turnstileToken = null;
  document.getElementById('verifyBtn').classList.remove('visible');
  document.getElementById('statusMsg').className = 'status-message error';
  document.getElementById('statusMsg').textContent = 'Verification failed. Please try again.';
}

function onTurnstileExpired() {
  turnstileToken = null;
  document.getElementById('verifyBtn').classList.remove('visible');
  document.getElementById('statusMsg').className = 'status-message';
  document.getElementById('statusMsg').textContent = 'Verification expired. Please complete the check again.';
}


window.addEventListener('load', () => {
  if (typeof turnstile !== 'undefined') {
    renderTurnstile();
  }
});
