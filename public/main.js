document.getElementById('userForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, phone, email })
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById('responseMessage').innerHTML = `<p style="color: green;">${result.message}</p>`;
    } else {
      document.getElementById('responseMessage').innerHTML = `<p style="color: red;">${result.errors.map(err => err.msg).join(', ')}</p>`;
    }
  } catch (error) {
    document.getElementById('responseMessage').innerHTML = `<p style="color: red;">Error submitting form: ${error.message}</p>`;
  }
});
