const TURNSTILE_SITE_KEY = '__TURNSTILE_SITE_KEY__';

const params = new URLSearchParams(window.location.search);
const redirectUrl = params.get('redirect_url');
const id = params.get('id');

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

async function onTurnstileSuccess(token) {
  const msg = document.getElementById('statusMsg');
  msg.className = 'status-message';
  msg.textContent = 'Verifying...';

  try {
    const response = await fetch('https://api.dohyeon5626.com/bot-check/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, turnstileToken: token }),
    });

    if (response.status === 409) {
      msg.className = 'status-message success';
      let seconds = 5;
      msg.textContent = `Already verified. Redirecting in ${seconds}s...`;
      const timer = setInterval(() => {
        seconds--;
        msg.textContent = `Already verified. Redirecting in ${seconds}s...`;
        if (seconds <= 0) {
          clearInterval(timer);
          if (redirectUrl) window.location.href = redirectUrl;
        }
      }, 1000);
      return;
    }

    if (response.status === 401) {
      msg.className = 'status-message error';
      msg.textContent = 'Verification failed. Please try again.';
      turnstile.reset('#turnstile-container');
      return;
    }

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    msg.className = 'status-message success';
    msg.textContent = 'Verification successful. Redirecting...';

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      msg.textContent = 'Verified. No redirect URL specified.';
    }
  } catch (err) {
    msg.className = 'status-message error';
    msg.textContent = 'Verification failed. Please try again.';
    turnstile.reset('#turnstile-container');
  }
}

function onTurnstileError() {
  document.getElementById('statusMsg').className = 'status-message error';
  document.getElementById('statusMsg').textContent = 'Verification failed. Please try again.';
}

function onTurnstileExpired() {
  document.getElementById('statusMsg').className = 'status-message';
  document.getElementById('statusMsg').textContent = 'Verification expired. Please complete the check again.';
}


window.addEventListener('load', () => {
  if (typeof turnstile !== 'undefined') {
    renderTurnstile();
  }
});
