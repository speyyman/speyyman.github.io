/* ==========================================================================
   Portfolio — Contact form handler
   --------------------------------------------------------------------------
   • Client-side validation with accessible inline errors
     (aria-invalid + aria-describedby, errors announced on submit)
   • Live validation once a field has been touched
   • Character counter for the message
   • Honeypot spam trap
   • Sends to the endpoint in data-endpoint (e.g. Formspree, Getform, your
     own API). With no endpoint set it opens the visitor's email app with the
     message pre-filled, using data-fallback-email as the recipient.
   ========================================================================== */

(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    name: {
      label: 'Name',
      validate: function (value) {
        if (!value) return 'Please enter your name.';
        if (value.length < 2) return 'Your name should be at least 2 characters.';
        if (value.length > 80) return 'Please keep your name under 80 characters.';
        return '';
      }
    },
    email: {
      label: 'Email',
      validate: function (value) {
        if (!value) return 'Please enter your email address.';
        if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email, like name@example.com.';
        return '';
      }
    },
    subject: {
      label: 'Subject',
      validate: function (value) {
        if (!value) return 'Please add a subject.';
        if (value.length < 3) return 'The subject should be at least 3 characters.';
        if (value.length > 120) return 'Please keep the subject under 120 characters.';
        return '';
      }
    },
    message: {
      label: 'Message',
      validate: function (value) {
        if (!value) return 'Please write a message.';
        if (value.length < 20) return 'Tell me a bit more — at least 20 characters (' + value.length + '/20).';
        if (value.length > 2000) return 'Please keep your message under 2000 characters.';
        return '';
      }
    }
  };

  var submitButton = form.querySelector('[type="submit"]');
  var submitLabel = submitButton ? submitButton.innerHTML : '';
  var statusRegion = form.querySelector('.form-status');
  var messageField = form.elements.message;
  var counter = form.querySelector('.field__counter');
  var touched = {};

  var ICON_SUCCESS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m8 12.5 2.5 2.5L16 9.5"/></svg>';
  var ICON_ERROR =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16.5v.01"/></svg>';

  /* Field helpers
     ------------------------------------------------------------------------ */
  function getField(name) {
    return form.elements[name];
  }

  function getWrapper(input) {
    return input.closest('.field');
  }

  function setFieldState(input, message) {
    var wrapper = getWrapper(input);
    var errorEl = document.getElementById(input.id + '-error');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      wrapper.classList.add('has-error');
      wrapper.classList.remove('is-valid');
      if (errorEl) errorEl.textContent = message;
    } else {
      input.removeAttribute('aria-invalid');
      wrapper.classList.remove('has-error');
      wrapper.classList.toggle('is-valid', input.value.trim() !== '');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function validateField(name) {
    var input = getField(name);
    var message = rules[name].validate(input.value.trim());
    setFieldState(input, message);
    return message;
  }

  function validateAll() {
    var errors = [];
    Object.keys(rules).forEach(function (name) {
      touched[name] = true;
      var message = validateField(name);
      if (message) errors.push({ name: name, message: message });
    });
    return errors;
  }

  function updateCounter() {
    if (!counter || !messageField) return;
    var length = messageField.value.length;
    counter.textContent = length + ' / 2000';
  }

  /* Status messages
     ------------------------------------------------------------------------ */
  function showStatus(type, html) {
    if (!statusRegion) return;
    statusRegion.innerHTML =
      '<div class="form-status__msg form-status__msg--' + type + '">' +
      (type === 'success' ? ICON_SUCCESS : ICON_ERROR) +
      '<div>' + html + '</div></div>';
  }

  function clearStatus() {
    if (statusRegion) statusRegion.innerHTML = '';
  }

  function setLoading(isLoading) {
    if (!submitButton) return;
    submitButton.disabled = isLoading;
    submitButton.setAttribute('aria-busy', String(isLoading));
    submitButton.innerHTML = isLoading
      ? '<span class="spinner" aria-hidden="true"></span><span>Sending…</span>'
      : submitLabel;
  }

  /* Live validation
     ------------------------------------------------------------------------ */
  Object.keys(rules).forEach(function (name) {
    var input = getField(name);
    if (!input) return;

    input.addEventListener('blur', function () {
      // Don't nag about an untouched empty field when someone just tabs past.
      if (input.value.trim() === '' && !touched[name]) return;
      touched[name] = true;
      validateField(name);
    });

    input.addEventListener('input', function () {
      if (touched[name]) validateField(name);
      if (name === 'message') updateCounter();
    });
  });

  updateCounter();

  /* Submission
     ------------------------------------------------------------------------ */
  function sendForm(data) {
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();

    if (!endpoint) {
      // No form service configured: hand the message to the visitor's email app.
      var to = (form.getAttribute('data-fallback-email') || '').trim();
      var body = String(data.get('message') || '') + '\n\n— ' + String(data.get('name') || '') + ' (' + String(data.get('email') || '') + ')';
      window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(String(data.get('subject') || '')) + '&body=' + encodeURIComponent(body);
      return Promise.resolve({ mailto: true });
    }

    return fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    }).then(function (response) {
      if (!response.ok) throw new Error('Request failed with status ' + response.status);
      return { mailto: false };
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearStatus();

    var errors = validateAll();
    if (errors.length) {
      var count = errors.length;
      showStatus(
        'error',
        '<strong>Please fix ' + count + ' field' + (count === 1 ? '' : 's') + ' before sending.</strong> ' +
          errors.map(function (e) { return rules[e.name].label; }).join(', ') + '.'
      );
      getField(errors[0].name).focus();
      return;
    }

    // Honeypot filled in → almost certainly a bot. Pretend success.
    var honeypot = form.elements.website;
    if (honeypot && honeypot.value) {
      form.reset();
      showStatus('success', '<strong>Thanks!</strong> Your message has been sent.');
      return;
    }

    var data = new FormData(form);
    data.delete('website');
    setLoading(true);

    sendForm(data)
      .then(function (result) {
        var firstName = String(data.get('name') || '').trim().split(/\s+/)[0];
        form.reset();
        touched = {};
        Object.keys(rules).forEach(function (name) {
          var input = getField(name);
          input.removeAttribute('aria-invalid');
          getWrapper(input).classList.remove('has-error', 'is-valid');
        });
        updateCounter();
        showStatus(
          'success',
          '<strong>Thanks' + (firstName ? ', ' + escapeHtml(firstName) : '') + '!</strong> ' +
            (result.mailto
              ? 'Your email app should open with the message ready to send. If it doesn’t, write to me directly at <a href="mailto:' + escapeHtml(form.getAttribute('data-fallback-email') || '') + '">' + escapeHtml(form.getAttribute('data-fallback-email') || '') + '</a>.'
              : 'Your message is on its way. I usually reply within 1–2 business days.')
        );
      })
      .catch(function () {
        var email = form.getAttribute('data-fallback-email') || '';
        showStatus(
          'error',
          '<strong>Sorry, something went wrong.</strong> Please try again' +
            (email ? ', or email me directly at <a href="mailto:' + email + '">' + email + '</a>.' : '.')
        );
      })
      .then(function () {
        setLoading(false);
      });
  });

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
})();
