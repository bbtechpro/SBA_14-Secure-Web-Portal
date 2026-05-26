const registerTab = document.getElementById('registerTab');
const loginTab = document.getElementById('loginTab');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const fetchProfileButton = document.getElementById('fetchProfile');
const logoutButton = document.getElementById('logoutButton');
const useJwtButton = document.getElementById('useJwtButton');
const githubRegisterButton = document.getElementById('githubRegister');
const useJwtRegisterButton = document.getElementById('useJwtRegister');
const statusText = document.getElementById('statusText');
const messageText = document.getElementById('messageText');
const responseOutput = document.getElementById('responseOutput');
const githubLoginButton = document.getElementById('githubLogin');

const registerUsernameInput = document.getElementById('registerUsername');
const registerEmailInput = document.getElementById('registerEmail');
const registerPasswordInput = document.getElementById('registerPassword');
const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');

let authToken = localStorage.getItem('authToken') || '';

function aggressiveFormClear() {
  [registerUsernameInput, registerEmailInput, registerPasswordInput, loginEmailInput, loginPasswordInput].forEach((input) => {
    input.value = '';
    input.setAttribute('value', '');
  });
  registerForm.reset();
  loginForm.reset();
}

window.addEventListener('DOMContentLoaded', () => {
  aggressiveFormClear();
  requestAnimationFrame(aggressiveFormClear);
  setTimeout(aggressiveFormClear, 10);
  setTimeout(aggressiveFormClear, 50);
  setTimeout(aggressiveFormClear, 150);
  handleRedirectToken();
  updateSessionStatus();
});

window.addEventListener('load', () => {
  aggressiveFormClear();
  requestAnimationFrame(aggressiveFormClear);
  setTimeout(aggressiveFormClear, 10);
  setTimeout(aggressiveFormClear, 50);
  setTimeout(aggressiveFormClear, 150);
});

window.addEventListener('pageshow', () => {
  aggressiveFormClear();
  requestAnimationFrame(aggressiveFormClear);
  setTimeout(aggressiveFormClear, 10);
  setTimeout(aggressiveFormClear, 50);
  setTimeout(aggressiveFormClear, 150);
});

registerTab.addEventListener('click', () => setActiveForm('register'));
loginTab.addEventListener('click', () => setActiveForm('login'));

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!username || !email || !password) {
    showResponse('Please complete all fields.', true);
    return;
  }

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      showResponse(data.message || JSON.stringify(data), true);
      return;
    }
    clearFormInputs();
    setActiveForm('login');
    showResponse(`Account created successfully. You can now login.\n\n${JSON.stringify(data.data, null, 2)}`);
  } catch (error) {
    showResponse(`Register request failed: ${error.message}`, true);
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showResponse('Please enter email and password.', true);
    return;
  }

  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      showResponse(data.message || JSON.stringify(data), true);
      return;
    }
    authToken = data.token;
    localStorage.setItem('authToken', authToken);
    updateSessionStatus();
    showResponse(`Login succeeded. Token saved.\n\n${JSON.stringify(data.user, null, 2)}`);
  } catch (error) {
    showResponse(`Login request failed: ${error.message}`, true);
  }
});

fetchProfileButton.addEventListener('click', async () => {
  if (!authToken) {
    showResponse('No token found. Please login first.', true);
    return;
  }

  try {
    const response = await fetch('/api/users/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      showResponse(data.message || JSON.stringify(data), true);
      return;
    }
    showResponse('Profile loaded successfully.', false, JSON.stringify(data.data, null, 2));
  } catch (error) {
    showResponse(`Profile request failed: ${error.message}`, true);
  }
});

logoutButton.addEventListener('click', () => {
  authToken = '';
  localStorage.removeItem('authToken');
  updateSessionStatus();
  clearFormInputs();
  showResponse('Logged out successfully.', false, '');
});

githubLoginButton.addEventListener('click', () => {
  window.location.href = '/api/users/auth/github';
});

githubRegisterButton.addEventListener('click', () => {
  window.location.href = '/api/users/auth/github';
});

useJwtButton.addEventListener('click', () => {
  const storedToken = localStorage.getItem('authToken');
  if (storedToken) {
    authToken = storedToken;
    updateSessionStatus();
    showResponse('Using existing JWT from localStorage.');
    return;
  }

  const token = window.prompt('Paste your JWT token here:');
  if (!token || !token.trim()) {
    alert('No token entered. Please try again.');
    showResponse('No token entered.', true);
    return;
  }

  authToken = token.trim();
  localStorage.setItem('authToken', authToken);
  updateSessionStatus();
  alert('JWT loaded successfully!');
  showResponse('JWT loaded from prompt and saved to localStorage.');
});

useJwtRegisterButton.addEventListener('click', () => {
  const storedToken = localStorage.getItem('authToken');
  if (storedToken) {
    authToken = storedToken;
    updateSessionStatus();
    showResponse('Using existing JWT from localStorage.');
    return;
  }

  const token = window.prompt('Paste your JWT token here:');
  if (!token || !token.trim()) {
    alert('No token entered. Please try again.');
    showResponse('No token entered.', true);
    return;
  }

  authToken = token.trim();
  localStorage.setItem('authToken', authToken);
  updateSessionStatus();
  alert('JWT loaded successfully!');
  showResponse('JWT loaded from prompt and saved to localStorage.');
});

function setActiveForm(type) {
  if (type === 'register') {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  } else {
    registerTab.classList.remove('active');
    loginTab.classList.add('active');
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
  }
}

function showResponse(message, isError = false, response = '') {
  messageText.textContent = message;
  messageText.className = isError ? 'message-text error' : 'message-text success';
  responseOutput.textContent = response || '';
}

function clearFormInputs() {
  registerUsernameInput.value = '';
  registerEmailInput.value = '';
  registerPasswordInput.value = '';
  loginEmailInput.value = '';
  loginPasswordInput.value = '';
}

function updateSessionStatus() {
  if (authToken) {
    statusText.textContent = 'Logged in with token saved.';
    logoutButton.classList.add('visible');
  } else {
    statusText.textContent = 'Not signed in';
    logoutButton.classList.remove('visible');
  }
}

function handleRedirectToken() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) {
    return;
  }

  authToken = token;
  localStorage.setItem('authToken', authToken);
  updateSessionStatus();
  showResponse('Logged in via GitHub. Token saved from redirect.');

  params.delete('token');
  const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState({}, document.title, cleanUrl);
}
