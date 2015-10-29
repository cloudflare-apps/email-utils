export function submit(options, email, callback) {
  if (options.destination == 'email' && options.email) {
    submitFormspree(email, callback);
  } else if (options.destination == 'service') {
    if (options.account.service == 'mailchimp') {
      submitMailchimp(email, callback);
    } else if (options.account.service == 'constant-contact') {
      submitConstantContact(email, callback);
    }
  }
}

export function submitFormspree(email, cb) {
  var url, xhr, params;

  url = '//formspree.io/' + options.email;
  xhr = new XMLHttpRequest();

  params = 'email=' + encodeURIComponent(email);

  xhr.open('POST', url);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = function() {
    var jsonResponse = {};
    if (xhr.status < 400) {
      try {
        jsonResponse = JSON.parse(xhr.response);
      } catch (err) {}

      if (jsonResponse && jsonResponse.success === 'confirmation email sent') {
        cb('Formspree has sent an email to ' + options.email + ' for verification.');
      } else {
        cb(true);
      }
    } else {
      cb(false);
    }
  }

  xhr.send(params);
};

export function submitMailchimp(email, cb) {
  var cbCode, url, script;

  cbCode = 'eagerFormCallback' + Math.floor(Math.random() * 100000000000000);

  window[cbCode] = function(resp) {
    cb(resp && resp.result === 'success');

    delete window[cbCode];
  }

  url = options.list;
  if (!url) {
    return cb(false);
  }

  url = url.replace('http', 'https');
  url = url.replace(/list-manage[0-9]+\.com/, 'list-manage.com');
  url = url.replace('?', '/post-json?');
  url = url + '&EMAIL=' + encodeURIComponent(email);
  url = url + '&c=' + cbCode;

  script = document.createElement('script');
  script.src = url;
  document.head.appendChild(script);
};

export function submitConstantContact(email, cb) {
  if (!options.form || !options.form.listId) {
    return cb(false);
  }

  var xhr, body;

  xhr = new XMLHttpRequest();

  body = {
    email: email,
    ca: options.form.campaignActivity,
    list: options.form.listId
  };

  xhr.open('POST', 'https://visitor2.constantcontact.com/api/signup');
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.onload = function() {
    cb(xhr && xhr.status < 400);
  };

  xhr.send(JSON.stringify(body));
};
