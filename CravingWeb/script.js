const showMessage = (elementId, message, type = 'success') => {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = `<div class="alert alert-${type === 'error' ? 'danger' : 'success'} p-2">${message}</div>`;
};

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || 'Server error');
  }
  return json;
};

const getValue = (id) => {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
};

const bindButton = (buttonId, callback) => {
  const button = document.getElementById(buttonId);
  if (!button) return;
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    await callback();
  });
};

const handleLogin = async () => {
  const payload = {
    email: getValue('loginEmail'),
    password: getValue('loginPassword')
  };
  try {
    const result = await postJson('/api/login', payload);
    showMessage('loginMessage', result.message, 'success');
  } catch (error) {
    showMessage('loginMessage', error.message, 'error');
  }
};

const handleRegister = async () => {
  const role = document.querySelector('input[name="role"]:checked')?.value || '';
  const payload = {
    name: getValue('registerName'),
    email: getValue('registerEmail'),
    phone: getValue('registerPhone'),
    role,
    password: getValue('registerPassword'),
    confirmPassword: getValue('registerPasswordConfirm')
  };
  try {
    const result = await postJson('/api/register', payload);
    showMessage('registerMessage', result.message, 'success');
  } catch (error) {
    showMessage('registerMessage', error.message, 'error');
  }
};

const handleContact = async () => {
  const payload = {
    name: getValue('contactName'),
    email: getValue('contactEmail'),
    phone: getValue('contactPhone'),
    subject: getValue('contactSubject'),
    message: getValue('contactBody')
  };
  try {
    const result = await postJson('/api/contact', payload);
    showMessage('contactMessage', result.message, 'success');
  } catch (error) {
    showMessage('contactMessage', error.message, 'error');
  }
};

const handleFeedback = async () => {
  const payload = {
    name: getValue('feedbackName'),
    email: getValue('feedbackEmail'),
    category: getValue('feedback-category'),
    rating: getValue('rating') || '0',
    message: getValue('feedbackBody')
  };
  try {
    const result = await postJson('/api/feedback', payload);
    showMessage('feedbackMessage', result.message, 'success');
  } catch (error) {
    showMessage('feedbackMessage', error.message, 'error');
  }
};

const handleSupport = async () => {
  const payload = {
    name: getValue('supportName'),
    email: getValue('supportEmail'),
    issueType: getValue('issue-type'),
    orderId: getValue('supportOrderId'),
    message: getValue('supportBody')
  };
  try {
    const result = await postJson('/api/support', payload);
    showMessage('supportMessage', result.message, 'success');
  } catch (error) {
    showMessage('supportMessage', error.message, 'error');
  }
};

const initRatingStars = () => {
  const stars = document.querySelectorAll('.stars span');
  const ratingInput = document.getElementById('rating');
  if (!stars.length || !ratingInput) return;
  stars.forEach((star, index) => {
    star.style.cursor = 'pointer';
    star.addEventListener('click', () => {
      stars.forEach((item, itemIndex) => {
        item.style.color = itemIndex <= index ? '#ffc107' : 'lightgrey';
      });
      ratingInput.value = String(index + 1);
    });
  });
};

window.addEventListener('DOMContentLoaded', () => {
  bindButton('loginSubmit', handleLogin);
  bindButton('registerSubmit', handleRegister);
  bindButton('contactSubmit', handleContact);
  bindButton('feedbackSubmit', handleFeedback);
  bindButton('supportSubmit', handleSupport);
  initRatingStars();
  // menu page bindings
  bindButton('addMenuSubmit', handleAddMenu);
  // load menu if container present
  if (document.getElementById('menuList')) {
    loadMenu();
  }
});

// Menu handling: add and load
const handleAddMenu = async () => {
  const payload = {
    name: getValue('menuName'),
    price: getValue('menuPrice'),
    image: getValue('menuImage')
  };
  try {
    const result = await postJson('/api/menu', payload);
    showMessage('menuMessage', result.message, 'success');
    // reload menu list
    loadMenu();
  } catch (err) {
    showMessage('menuMessage', err.message, 'error');
  }
};

const loadMenu = async () => {
  try {
    const res = await fetch('/api/menu');
    const json = await res.json();
    if (!json.success) throw new Error('Could not load menu');
    const list = json.items || [];
    const container = document.getElementById('menuList');
    if (!container) return;
    container.innerHTML = '';
    list.forEach(item => {
      const col = document.createElement('div');
      col.className = 'Card2 p-3 m-3 rounded-3';
      col.style.backgroundColor = '#fff8f1';
      col.innerHTML = `
        <div class="d-flex justify-content-between">
          <div class="d-flex">
            <img class="w-25 rounded-3" src="${item.image}" alt="" />
            <div class="p-3">
              <div>
                <h5><b>${item.name}</b></h5>
                <p>${item.description || ''}</p>
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center p-3">
            <div class="text-center">
              <h4><b class="text-danger">&#8377;${item.price}</b></h4>
              <button type="button" class="Additem btn btn-outline-secondary" data-name="${item.name}" data-price="${item.price}">+ Add</button>
            </div>
          </div>
        </div>`;
      container.appendChild(col);
    });
  } catch (err) {
    console.error('loadMenu error', err);
  }
};
