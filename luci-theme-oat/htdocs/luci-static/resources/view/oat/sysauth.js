'use strict';
'require ui';
'require view';

return view.extend({
	render: function () {
		var form = document.querySelector('form'),
			btn = document.querySelector('button'),
			section = document.querySelector('section');

		if (!form || !section) {
			return E('div', {}, 'Login form not found');
		}

		var errorMsg = document.querySelector('.alert-message.error');
		var hasError = !!errorMsg;

		var overlay = document.getElementById('modal_overlay');
		if (overlay) overlay.style.display = 'none';
		document.body.classList.remove('modal-overlay-active');

		try {
			return this.buildLoginUI(form, section, hasError);
		} catch (e) {
			section.removeAttribute('hidden');
			section.style.display = '';
			if (btn) btn.style.display = '';
			return E('div', { 'class': 'fallback-login' });
		}
	},

	buildLoginUI: function(form, section, hasError) {
		var manual = localStorage.getItem('luci-theme-manual');
		var isDark = manual ? manual === 'true' : true;
		document.documentElement.setAttribute('data-darkmode', isDark ? 'true' : 'false');

		var origUser = document.getElementById('luci_username');
		var origPass = document.getElementById('luci_password');
		if (!origUser || !origPass) {
			section.removeAttribute('hidden');
			section.style.display = '';
			return E('div', { 'class': 'fallback-login' });
		}

		var savedUser = origUser.value;
		var savedAutoUser = origUser.autocomplete;

		var wrap = document.createElement('div');
		wrap.className = 'oat-login-wrap';

		/* Animated background */
		var bgCanvas = document.createElement('div');
		bgCanvas.className = 'oat-login-bg';
		for (var i = 0; i < 6; i++) {
			var orb = document.createElement('div');
			orb.className = 'oat-login-orb';
			orb.style.animationDelay = (i * 1.2) + 's';
			orb.style.left = (10 + Math.random() * 80) + '%';
			orb.style.top = (10 + Math.random() * 80) + '%';
			orb.style.width = (60 + Math.random() * 120) + 'px';
			orb.style.height = orb.style.width;
			bgCanvas.appendChild(orb);
		}
		wrap.appendChild(bgCanvas);

		/* Card */
		var card = document.createElement('div');
		card.className = 'oat-login-card';

		/* Logo + hostname */
		var hostname = '';
		var meta = document.querySelector('meta[name="oat-hostname"]');
		if (meta) hostname = meta.getAttribute('content') || '';
		if (!hostname) {
			var t = document.title || '';
			hostname = t.split(' - ')[0] || 'Router';
		}

		var logoWrap = document.createElement('div');
		logoWrap.className = 'oat-login-logo';
		logoWrap.innerHTML =
			'<svg viewBox="0 0 100 100" width="64" height="64" aria-hidden="true">' +
				'<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="6">' +
					'<path d="M22 38 a32 32 0 0 1 56 0" opacity="0.35"/>' +
					'<path d="M30 44 a22 22 0 0 1 40 0" opacity="0.65"/>' +
					'<path d="M38 50 a12 12 0 0 1 24 0" opacity="1"/>' +
				'</g>' +
				'<rect x="28" y="56" width="44" height="34" rx="6" ry="6" fill="currentColor"/>' +
				'<circle cx="50" cy="70" r="5" fill="var(--oat-bg, #fff)"/>' +
				'<path d="M47.5 70 h5 l1.5 12 h-8 z" fill="var(--oat-bg, #fff)"/>' +
			'</svg>';
		card.appendChild(logoWrap);

		/* Title */
		var title = document.createElement('h1');
		title.className = 'oat-login-title';
		title.textContent = hostname || 'Welcome Back';
		card.appendChild(title);

		var subtitle = document.createElement('p');
		subtitle.className = 'oat-login-subtitle';
		subtitle.textContent = 'Sign in to your router';
		card.appendChild(subtitle);

		/* Error message */
		if (hasError) {
			var errDiv = document.createElement('div');
			errDiv.className = 'oat-login-error';
			errDiv.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" style="fill:currentColor;flex-shrink:0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> Invalid username or password. Please try again.';
			card.appendChild(errDiv);
		}

		/* Rebuild the form with styled inputs inside it */
		var styledForm = document.createElement('form');
		styledForm.method = 'post';
		styledForm.className = 'oat-login-form';

		/* Copy hidden inputs from original form (CSRF token etc) */
		var hiddenInputs = form.querySelectorAll('input[type="hidden"]');
		for (var h = 0; h < hiddenInputs.length; h++) {
			styledForm.appendChild(hiddenInputs[h].cloneNode(true));
		}

		/* Username field */
		var userGroup = document.createElement('div');
		userGroup.className = 'oat-login-field';
		var userLabel = document.createElement('label');
		userLabel.textContent = 'Username';
		userLabel.htmlFor = 'oat_username';
		userGroup.appendChild(userLabel);
		var userInputWrap = document.createElement('div');
		userInputWrap.className = 'oat-login-input-wrap';
		userInputWrap.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" class="oat-login-input-icon"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
		var newUser = document.createElement('input');
		newUser.type = 'text';
		newUser.name = 'luci_username';
		newUser.id = 'oat_username';
		newUser.className = 'oat-login-input';
		newUser.placeholder = 'root';
		newUser.autocomplete = 'username';
		newUser.value = savedUser;
		userInputWrap.appendChild(newUser);
		userGroup.appendChild(userInputWrap);
		styledForm.appendChild(userGroup);

		/* Password field */
		var passGroup = document.createElement('div');
		passGroup.className = 'oat-login-field';
		var passLabel = document.createElement('label');
		passLabel.textContent = 'Password';
		passLabel.htmlFor = 'oat_password';
		passGroup.appendChild(passLabel);
		var passInputWrap = document.createElement('div');
		passInputWrap.className = 'oat-login-input-wrap';
		passInputWrap.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" class="oat-login-input-icon"><path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>';
		var newPass = document.createElement('input');
		newPass.type = 'password';
		newPass.name = 'luci_password';
		newPass.id = 'oat_password';
		newPass.className = 'oat-login-input';
		newPass.placeholder = 'Enter password';
		newPass.autocomplete = 'current-password';
		passInputWrap.appendChild(newPass);

		var eyeBtn = document.createElement('button');
		eyeBtn.type = 'button';
		eyeBtn.className = 'oat-login-eye';
		eyeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
		eyeBtn.addEventListener('click', function() {
			if (newPass.type === 'password') {
				newPass.type = 'text';
				this.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
			} else {
				newPass.type = 'password';
				this.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
			}
		});
		passInputWrap.appendChild(eyeBtn);
		passGroup.appendChild(passInputWrap);
		styledForm.appendChild(passGroup);

		/* Login button inside the form */
		var loginBtn = document.createElement('button');
		loginBtn.className = 'oat-login-btn';
		loginBtn.type = 'submit';
		loginBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" style="fill:currentColor"><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg> Log In';
		styledForm.appendChild(loginBtn);

		styledForm.addEventListener('submit', function() {
			loginBtn.disabled = true;
			loginBtn.innerHTML = '<span class="oat-login-spinner"></span> Signing in\u2026';
		});

		card.appendChild(styledForm);

		/* Footer */
		var footer = document.createElement('div');
		footer.className = 'oat-login-footer';
		footer.textContent = 'Powered by OpenWrt';
		card.appendChild(footer);

		wrap.appendChild(card);

		/* Inject styles */
		var style = document.createElement('style');
		style.textContent = this.getLoginCSS();
		wrap.appendChild(style);

		/* Now hide the original section and form */
		section.style.display = 'none';
		form.style.display = 'none';

		/* Focus after DOM is ready */
		setTimeout(function() {
			if (savedUser) newPass.focus();
			else newUser.focus();
		}, 100);

		return wrap;
	},

	getLoginCSS: function() {
		return '' +
		'.oat-login-wrap {' +
			'position: fixed; inset: 0;' +
			'display: flex; align-items: center; justify-content: center;' +
			'background: linear-gradient(135deg, #0f0c29 0%, #1a1a2e 40%, #16213e 100%);' +
			'overflow: hidden; z-index: 9999;' +
			'font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;' +
		'}' +
		'[data-darkmode="false"] .oat-login-wrap {' +
			'background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);' +
		'}' +

		/* Floating orbs */
		'.oat-login-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }' +
		'.oat-login-orb {' +
			'position: absolute; border-radius: 50%; opacity: 0.08;' +
			'background: radial-gradient(circle, #6366f1, #8b5cf6);' +
			'animation: oatOrb 12s ease-in-out infinite alternate;' +
			'filter: blur(40px);' +
		'}' +
		'[data-darkmode="false"] .oat-login-orb {' +
			'opacity: 0.15; background: radial-gradient(circle, #fff, #e0e7ff);' +
		'}' +
		'@keyframes oatOrb {' +
			'0% { transform: translate(0, 0) scale(1); }' +
			'33% { transform: translate(30px, -40px) scale(1.15); }' +
			'66% { transform: translate(-20px, 20px) scale(0.9); }' +
			'100% { transform: translate(10px, -10px) scale(1.05); }' +
		'}' +

		/* Card */
		'.oat-login-card {' +
			'position: relative; z-index: 1;' +
			'width: 100%; max-width: 400px; margin: 20px;' +
			'padding: 40px 36px 32px;' +
			'background: rgba(24, 24, 27, 0.85);' +
			'backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);' +
			'border-radius: 20px;' +
			'border: 1px solid rgba(255,255,255,0.08);' +
			'box-shadow: 0 25px 60px rgba(0,0,0,0.4), 0 0 80px rgba(99,102,241,0.1);' +
			'animation: oatCardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);' +
		'}' +
		'[data-darkmode="false"] .oat-login-card {' +
			'background: rgba(255,255,255,0.92);' +
			'border: 1px solid rgba(0,0,0,0.08);' +
			'box-shadow: 0 25px 60px rgba(0,0,0,0.15), 0 0 80px rgba(99,102,241,0.08);' +
		'}' +
		'@keyframes oatCardIn {' +
			'from { opacity: 0; transform: translateY(20px) scale(0.97); }' +
			'to { opacity: 1; transform: translateY(0) scale(1); }' +
		'}' +

		/* Logo */
		'.oat-login-logo {' +
			'text-align: center; margin-bottom: 24px;' +
		'}' +
		'.oat-login-logo img {' +
			'height: 44px; width: auto; object-fit: contain;' +
		'}' +
		'.oat-login-logo-fallback {' +
			'display: inline-flex; align-items: center; justify-content: center;' +
			'width: 64px; height: 64px; border-radius: 16px;' +
			'background: linear-gradient(135deg, #6366f1, #8b5cf6);' +
			'color: #fff;' +
		'}' +

		/* Title */
		'.oat-login-title {' +
			'text-align: center; font-size: 24px; font-weight: 700;' +
			'color: #fafafa; margin: 0 0 4px; letter-spacing: -0.02em;' +
		'}' +
		'[data-darkmode="false"] .oat-login-title { color: #09090b; }' +
		'.oat-login-subtitle {' +
			'text-align: center; font-size: 14px; color: #a1a1aa;' +
			'margin: 0 0 28px; font-weight: 400;' +
		'}' +
		'[data-darkmode="false"] .oat-login-subtitle { color: #71717a; }' +

		/* Error */
		'.oat-login-error {' +
			'display: flex; align-items: center; gap: 8px;' +
			'padding: 12px 16px; margin-bottom: 20px;' +
			'border-radius: 12px; font-size: 13px; font-weight: 500;' +
			'background: rgba(239,68,68,0.12); color: #f87171;' +
			'border: 1px solid rgba(239,68,68,0.2);' +
			'animation: oatShake 0.5s ease-in-out;' +
		'}' +
		'[data-darkmode="false"] .oat-login-error {' +
			'background: rgba(239,68,68,0.08); color: #dc2626;' +
			'border-color: rgba(239,68,68,0.15);' +
		'}' +
		'@keyframes oatShake {' +
			'0%,100% { transform: translateX(0); }' +
			'20% { transform: translateX(-6px); }' +
			'40% { transform: translateX(6px); }' +
			'60% { transform: translateX(-4px); }' +
			'80% { transform: translateX(4px); }' +
		'}' +

		/* Form */
		'.oat-login-form { margin-bottom: 24px; }' +
		'.oat-login-field { margin-bottom: 16px; }' +
		'.oat-login-field label {' +
			'display: block; font-size: 13px; font-weight: 600;' +
			'color: #d4d4d8; margin-bottom: 6px;' +
		'}' +
		'[data-darkmode="false"] .oat-login-field label { color: #3f3f46; }' +
		'.oat-login-input-wrap {' +
			'position: relative; display: flex; align-items: center;' +
		'}' +
		'.oat-login-input-icon {' +
			'position: absolute; left: 14px; color: #71717a; pointer-events: none;' +
		'}' +
		'.oat-login-input {' +
			'width: 100%; box-sizing: border-box;' +
			'padding: 12px 14px 12px 42px;' +
			'background: rgba(255,255,255,0.06);' +
			'border: 1px solid rgba(255,255,255,0.1);' +
			'border-radius: 12px; color: #fafafa;' +
			'font-size: 14px; outline: none;' +
			'transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;' +
		'}' +
		'[data-darkmode="false"] .oat-login-input {' +
			'background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.12);' +
			'color: #09090b;' +
		'}' +
		'.oat-login-input::placeholder { color: #52525b; }' +
		'[data-darkmode="false"] .oat-login-input::placeholder { color: #a1a1aa; }' +
		'.oat-login-input:focus {' +
			'border-color: #6366f1;' +
			'box-shadow: 0 0 0 3px rgba(99,102,241,0.2);' +
			'background: rgba(255,255,255,0.1);' +
		'}' +
		'[data-darkmode="false"] .oat-login-input:focus {' +
			'background: rgba(99,102,241,0.04);' +
		'}' +

		/* Eye button */
		'.oat-login-eye {' +
			'position: absolute; right: 10px;' +
			'background: none; border: none; color: #71717a;' +
			'cursor: pointer; padding: 4px; display: flex;' +
			'border-radius: 6px; transition: color 0.2s;' +
		'}' +
		'.oat-login-eye:hover { color: #a1a1aa; }' +
		'[data-darkmode="false"] .oat-login-eye:hover { color: #3f3f46; }' +

		/* Login button */
		'.oat-login-btn {' +
			'width: 100%; padding: 13px 24px;' +
			'background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);' +
			'color: #fff; border: none; border-radius: 12px;' +
			'font-size: 15px; font-weight: 600;' +
			'cursor: pointer; display: flex; align-items: center;' +
			'justify-content: center; gap: 8px;' +
			'transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;' +
			'box-shadow: 0 4px 14px rgba(99,102,241,0.35);' +
		'}' +
		'.oat-login-btn:hover {' +
			'transform: translateY(-1px);' +
			'box-shadow: 0 6px 20px rgba(99,102,241,0.45);' +
		'}' +
		'.oat-login-btn:active { transform: translateY(0); }' +
		'.oat-login-btn:disabled { opacity: 0.7; cursor: wait; }' +

		/* Spinner */
		'.oat-login-spinner {' +
			'display: inline-block; width: 18px; height: 18px;' +
			'border: 2px solid rgba(255,255,255,0.3);' +
			'border-top-color: #fff; border-radius: 50%;' +
			'animation: spin 0.8s linear infinite;' +
		'}' +

		/* Footer */
		'.oat-login-footer {' +
			'text-align: center; font-size: 12px; color: #52525b;' +
			'margin-top: 24px; padding-top: 16px;' +
			'border-top: 1px solid rgba(255,255,255,0.06);' +
		'}' +
		'[data-darkmode="false"] .oat-login-footer {' +
			'color: #a1a1aa; border-top-color: rgba(0,0,0,0.06);' +
		'}' +

		/* Hide default LuCI chrome on login */
		'body.modal-overlay-active { overflow: auto !important; }' +
		'#modal_overlay { display: none !important; }';
	},

	addFooter: function () { }
});
