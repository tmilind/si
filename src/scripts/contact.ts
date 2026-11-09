const form = document.querySelector<HTMLFormElement>('form.contact-form');

function failure(f: HTMLFormElement) {
  f.querySelector('[role="alert"]')?.remove();
  const p = document.createElement('p');
  p.setAttribute('role', 'alert');
  p.append("Couldn't send. Email ");
  const a = document.createElement('a');
  a.href = 'mailto:hello@sourceintellect.com';
  a.textContent = 'hello@sourceintellect.com';
  p.append(a, ' instead.');
  f.append(p);
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const f = event.currentTarget as HTMLFormElement;
  const data = new FormData(f);
  const button = f.querySelector<HTMLButtonElement>('button[type="submit"], button:not([type])');
  const label = button?.textContent ?? '';
  if (button) { button.disabled = true; button.textContent = 'Sending…'; }
  try {
    const response = await fetch(f.action, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });
    const json = await response.json();
    if (response.ok && json.success) {
      const p = document.createElement('p');
      p.setAttribute('role', 'status');
      p.tabIndex = -1;
      p.textContent = `Sent. We'll reply to ${data.get('email')}.`;
      f.replaceWith(p);
      p.focus();
      return;
    }
  } catch {
    // fall through to the failure message
  }
  if (button) { button.disabled = false; button.textContent = label; }
  failure(f);
});
