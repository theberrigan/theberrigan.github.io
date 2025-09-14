const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const PHONE_REGEXP = /^[+\-()\s\d]+$/;
const delegate = (el, eventName, descendantSelector, listener) => {
    if (typeof (el) === 'string') {
        el = document.querySelector(el);
    }
    if (!el) {
        return;
    }
    el.addEventListener('click', (e) => {
        const descendants = [...el.querySelectorAll(descendantSelector)];
        let target = e.target;
        while (target !== el) {
            if (descendants.includes(target)) {
                Object.defineProperty(e, 'target', { value: target, configurable: true });
                return listener(e);
            }
            target = target.parentNode;
        }
    });
};
const setScrollState = (state) => {
    if (state) {
        document.body.classList.remove('scroll_disabled');
    }
    else {
        document.body.classList.add('scroll_disabled');
    }
};
const markEvent = (e, propKey, propValue = true) => {
    Object.defineProperty(e, `__${propKey}`, { value: propValue, configurable: true });
    return e;
};
const hasEventMark = (e, propKey, propValue = true) => {
    return e[`__${propKey}`] === propValue;
};
const getEventMark = (e, propKey) => {
    return e[`__${propKey}`];
};
const injectFormSubmittedTag = async () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = '';
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
    });
};
class FAQ {
    constructor() {
        const itemMainEls = Array.from(document.body.querySelectorAll('.section-faq__item-main'));
        itemMainEls.forEach(el => el.addEventListener('click', () => {
            this.onItemMainClick(el.closest('.section-faq__item'));
        }));
    }
    onItemMainClick(itemEl) {
        if (this.activeItemEl) {
            this.activeItemEl.classList.remove('section-faq__item_active');
        }
        if (this.activeItemEl === itemEl) {
            this.activeItemEl = null;
        }
        else {
            itemEl.classList.add('section-faq__item_active');
            this.activeItemEl = itemEl;
        }
    }
}
class LanguageSwitcher {
    constructor() {
        this.isPopupVisible = false;
        this.hostEl = document.body.querySelector('.language-switcher');
        this.buttonEl = this.hostEl.querySelector('.language-switcher__button');
        this.curLangEl = this.hostEl.querySelector('.language-switcher__current_language');
        this.popupEl = this.hostEl.querySelector('.language-switcher__popup');
        this.itemEls = Array.from(this.popupEl.querySelectorAll('.language-switcher__item'));
        this.langs = this.itemEls.reduce((acc, el) => {
            const code = el.dataset.code.toLowerCase();
            acc[code] = el.dataset.shortName;
            return acc;
        }, {});
        this.buttonEl.addEventListener('click', (e) => this.onButtonClick(e));
        this.popupEl.addEventListener('click', (e) => this.onPopupClick(e));
        document.documentElement.addEventListener('click', (e) => this.onDocClick(e));
        delegate(this.popupEl, 'click', '.language-switcher__item', (e) => this.onItemClick(e));
        this.updateCurrentLangFromLocation();
    }
    onButtonClick(e) {
        markEvent(e, 'lsButtonClick');
        this.isPopupVisible = !this.isPopupVisible;
        if (this.isPopupVisible) {
            this.hostEl.classList.add('language-switcher_visible');
        }
        else {
            this.hostEl.classList.remove('language-switcher_visible');
        }
    }
    onPopupClick(e) {
        markEvent(e, 'lsPopupClick');
    }
    onItemClick(e) {
        markEvent(e, 'lsItemClick');
        this.isPopupVisible = false;
        this.hostEl.classList.remove('language-switcher_visible');
        this.setLanguage(e.target.dataset.code.toLowerCase());
    }
    onDocClick(e) {
        if (!hasEventMark(e, 'lsButtonClick') && !hasEventMark(e, 'lsItemClick') && !hasEventMark(e, 'lsPopupClick')) {
            this.isPopupVisible = false;
            this.hostEl.classList.remove('language-switcher_visible');
        }
    }
    updateCurrentLangFromLocation() {
        const currentLocation = new URL(window.location.href);
        this.currentLang = (currentLocation.pathname.replace(/^\/+/g, '').split('/')[0] || 'en').toLowerCase();
        if (!(this.currentLang in this.langs)) {
            this.currentLang = 'en';
        }
        this.setLanguageToUI(this.currentLang, this.langs[this.currentLang]);
    }
    setLanguage(code) {
        if (code === this.currentLang) {
            return;
        }
        this.currentLang = code;
        this.setLanguageToUI(this.currentLang, this.langs[this.currentLang]);
        const currentLocation = new URL(window.location.href);
        const pathParts = currentLocation.pathname.replace(/^\/+/g, '').split('/');
        const currentLangSlug = pathParts[0].toLowerCase();
        if (!(currentLangSlug in this.langs)) {
            pathParts.unshift('en');
        }
        pathParts[0] = code;
        currentLocation.pathname = pathParts.join('/');
        window.location.assign(currentLocation.toString());
    }
    setLanguageToUI(code, shortName) {
        this.curLangEl.textContent = shortName;
        this.itemEls.forEach(el => {
            if (el.dataset.code.toLowerCase() === code) {
                el.classList.add('language-switcher__item_current');
            }
            else {
                el.classList.remove('language-switcher__item_current');
            }
        });
    }
    getCurrentLang() {
        return this.currentLang;
    }
}
class PhoneForm {
    constructor(config, rootEl, langSwitcher) {
        this.config = config;
        this.rootEl = rootEl;
        this.langSwitcher = langSwitcher;
        this.isValid = false;
        this.isSubmitting = false;
        this.rootEl = rootEl;
        this.formEl = rootEl.querySelector('.phone-form__form');
        this.fieldsetEl = rootEl.querySelector('.phone-form__fieldset');
        this.inputEl = rootEl.querySelector('.phone-form__input');
        this.buttonEl = rootEl.querySelector('.phone-form__button');
        this.messageEl = rootEl.querySelector('.phone-form__message');
        this.formEl.addEventListener('submit', (e) => this.onFormSubmit(e));
        this.inputEl.addEventListener('input', () => this.validate());
        this.inputEl.addEventListener('change', () => this.validate());
        this.inputEl.addEventListener('focus', () => this.validate());
        this.inputEl.addEventListener('blur', () => this.validate());
        this.setValidState(false);
        this.setSubmitting(false);
        this.setMessage(null);
    }
    onFormSubmit(e) {
        e.preventDefault();
        if (this.isSubmitting) {
            return;
        }
        this.validate();
        if (!this.isValid) {
            return;
        }
        this.setSubmitting(true);
        this.setMessage(null);
        const phone = this.sanitizePhone(this.getPhone());
        fetch(this.config.phoneFormURL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone,
                language: 'en',
                brand: this.config.phoneFormBrand
            })
        }).then((response) => {
            return response.json();
        }).then((response) => {
            if (response === 'OK') {
                return true;
            }
            console.warn('Failed to send request:', response);
            return false;
        }).catch((e) => {
            console.warn('Failed to send request:', e);
            return false;
        }).then(async (isOk) => {
            if (isOk) {
                // window.location.assign('/thank-you-for-signing-up/');
                // await injectFormSubmittedTag();
                this.setSubmitting(false);
                this.resetForm();
                this.setMessage({
                    isError: false,
                    message: 'Thank you for getting started! You will receive a text message momentarily that will guide you through the registration process'
                });
            }
            else {
                this.setSubmitting(false);
                this.setMessage({
                    isError: true,
                    message: 'Unfortunately, something went wrong. Please try again later'
                });
            }
        });
    }
    resetForm() {
        this.inputEl.value = '';
        this.validate();
    }
    getPhone() {
        return (this.inputEl.value || '').trim();
    }
    sanitizePhone(phone) {
        return (phone || '').replace(/[^\d]+/g, '');
    }
    validate() {
        const phone = this.getPhone();
        const phoneDigits = this.sanitizePhone(phone);
        const isPhoneValid = /^[+\-()\s\d]+$/.test(phone) && phoneDigits.length >= 6;
        this.setValidState(isPhoneValid);
    }
    setValidState(isValid) {
        this.isValid = isValid;
        this.buttonEl.disabled = !this.isValid;
    }
    setSubmitting(isSubmitting) {
        this.isSubmitting = isSubmitting;
        this.fieldsetEl.disabled = this.isSubmitting;
        if (this.isSubmitting) {
            this.buttonEl.classList.add('phone-form__button_progress');
        }
        else {
            this.buttonEl.classList.remove('phone-form__button_progress');
        }
    }
    setMessage(data) {
        if (data) {
            this.messageEl.innerHTML = data.message;
            if (data.isError) {
                this.messageEl.classList.add('phone-form__message_error');
            }
            else {
                this.messageEl.classList.remove('phone-form__message_error');
            }
            this.messageEl.classList.add('phone-form__message_visible');
        }
        else {
            this.messageEl.classList.remove('phone-form__message_visible');
        }
    }
}
class Feedback {
    constructor(config) {
        this.config = config;
        this.isFormValid = false;
        this.isSubmitting = false;
        this.hostEl = document.body.querySelector('.section-feedback__content');
        this.messageEl = this.hostEl.querySelector('.section-feedback__message');
        this.fieldsetEl = this.hostEl.querySelector('.section-feedback__fieldset');
        this.formEl = this.fieldsetEl.querySelector('.section-feedback__form');
        this.fieldEls = Array.from(this.formEl.querySelectorAll('input[name], textarea[name]'));
        this.buttonEl = this.formEl.querySelector('.section-feedback__button');
        this.formEl.addEventListener('submit', (e) => this.onFormSubmit(e));
        this.formEl.addEventListener('reset', () => this.onFormReset());
        this.fieldEls.forEach(el => {
            el.dataset.isValid = 'false';
            el.addEventListener('input', (e) => this.validateForm(e, false));
            el.addEventListener('change', (e) => this.validateForm(e, true));
            el.addEventListener('focus', (e) => this.validateForm(e, true));
            el.addEventListener('blur', (e) => this.validateForm(e, true));
        });
        this.validateForm();
        this.setSubmitting(false);
        this.setMessage(null);
    }
    resetForm() {
        this.formEl.reset();
    }
    validateForm(e = null, showErrors = false) {
        const target = (e === null || e === void 0 ? void 0 : e.target);
        if (target) {
            this.validateField(target, showErrors);
        }
        else {
            this.fieldEls.forEach(el => this.validateField(el, showErrors));
        }
        const isFormValid = this.fieldEls.every(el => el.dataset.isValid === 'true');
        this.setValidState(isFormValid);
    }
    validateField(fieldEl, showErrors) {
        const value = fieldEl.value.trim();
        let isValid = !value && !fieldEl.required;
        if (fieldEl instanceof HTMLInputElement) {
            switch (fieldEl.type) {
                case 'email': {
                    isValid || (isValid = value && EMAIL_REGEXP.test(value));
                    break;
                }
                case 'tel': {
                    isValid || (isValid = value && PHONE_REGEXP.test(value) && this.sanitizePhone(value).length >= 6);
                    break;
                }
                default: {
                    isValid || (isValid = value.length > 0);
                    break;
                }
            }
        }
        else if (fieldEl instanceof HTMLTextAreaElement) {
            isValid || (isValid = value.length > 0);
        }
        if (!isValid && showErrors) {
            fieldEl.classList.add(fieldEl.dataset.errorClass);
        }
        else {
            fieldEl.classList.remove(fieldEl.dataset.errorClass);
        }
        fieldEl.dataset.isValid = String(!!(isValid));
    }
    setValidState(isValid) {
        this.isFormValid = isValid;
        this.buttonEl.disabled = !this.isFormValid;
    }
    setSubmitting(isSubmitting) {
        this.isSubmitting = isSubmitting;
        this.fieldsetEl.disabled = this.isSubmitting;
        if (this.isSubmitting) {
            this.buttonEl.classList.add('button_progress');
        }
        else {
            this.buttonEl.classList.remove('button_progress');
        }
    }
    sanitizePhone(phone) {
        return (phone || '').replace(/[^\d]+/g, '');
    }
    getFormData() {
        return this.fieldEls.reduce((acc, fieldEl) => {
            let value = fieldEl.value.trim();
            if (fieldEl.type === 'tel') {
                value = this.sanitizePhone(value);
            }
            acc[fieldEl.name] = value;
            return acc;
        }, {});
    }
    onFormSubmit(e) {
        e.preventDefault();
        if (this.isSubmitting) {
            return;
        }
        this.validateForm();
        if (!this.isFormValid) {
            return;
        }
        this.setSubmitting(true);
        this.setMessage(null);
        const formData = this.getFormData();
        fetch(this.config.feedbackFormURL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        }).then((response) => {
            return response.json();
        }).then((response) => {
            if (response === 'OK') {
                return true;
            }
            console.warn('Failed to send request:', response);
            return false;
        }).catch((e) => {
            console.warn('Failed to send request:', e);
            return false;
        }).then(async (isOk) => {
            if (isOk) {
                await injectFormSubmittedTag();
                this.setSubmitting(false);
                this.resetForm();
                this.setMessage({
                    isError: false,
                    message: 'Thank you! We will review your request and respond within 1 business day. Please go to our FAQ\'s to view helpful information'
                });
            }
            else {
                this.setSubmitting(false);
                this.setMessage({
                    isError: true,
                    message: 'Uh oh! We are having some technical difficulties and are working quickly to fix them. Please try again later'
                });
            }
        });
    }
    onFormReset() {
        requestAnimationFrame(() => this.validateForm());
    }
    setMessage(data) {
        if (data) {
            this.messageEl.innerHTML = data.message;
            if (data.isError) {
                this.messageEl.classList.add('section-feedback__message_error');
            }
            else {
                this.messageEl.classList.remove('section-feedback__message_error');
            }
            this.messageEl.classList.add('section-feedback__message_visible');
        }
        else {
            this.messageEl.classList.remove('section-feedback__message_visible');
        }
    }
}
class Application {
    constructor() {
        this.config = {
            isLoggedIn: false,
            phoneFormURL: './',
            phoneFormBrand: 'SUNPASS',
            feedbackFormURL: '#'
        };
        this.adminBarHeight = 0;
        this.isAdminBarFixed = true;
        this.isPanelInversed = false;
        this.isNavActive = false;
        this.panelBreakpoint = 50;
        this.faq = new FAQ();
        this.feedback = new Feedback(this.config);
        this.adminBarEl = document.body.querySelector(':scope > #wpadminbar');
        this.panelEl = document.body.querySelector(':scope > .panel');
        this.navEl = document.body.querySelector('.nav');
        this.phoneForms = Array.from(document.querySelectorAll('.phone-form')).map((el) => {
            return new PhoneForm(this.config, el, this.langSwitcher);
        });
        window.addEventListener('scroll', () => this.onScroll());
        window.addEventListener('resize', () => this.onResize());
        delegate(this.navEl, 'click', 'a, .nav__overlay, .nav__hide', () => this.toggleNav(false));
        document.body.querySelector('.nav-switcher').addEventListener('click', () => this.toggleNav());
        this.onResize();
    }
    onResize() {
        if (this.config.isLoggedIn && this.adminBarEl) {
            this.adminBarHeight = this.adminBarEl.getBoundingClientRect().height;
            this.isAdminBarFixed = window.getComputedStyle(this.adminBarEl).position === 'fixed';
        }
        else {
            this.adminBarHeight = 0;
            this.isAdminBarFixed = true;
        }
        this.redrawPanel();
    }
    onScroll() {
        this.redrawPanel();
    }
    redrawPanel() {
        requestAnimationFrame(() => {
            if (this.isAdminBarFixed) {
                this.panelEl.style.top = this.adminBarHeight + 'px';
            }
            else {
                this.panelEl.style.top = Math.max(0, this.adminBarHeight - window.scrollY) + 'px';
            }
            if (window.scrollY < this.panelBreakpoint) {
                if (this.isPanelInversed) {
                    this.panelEl.classList.remove('panel_inversed');
                    this.isPanelInversed = false;
                }
            }
            else {
                if (!this.isPanelInversed) {
                    this.panelEl.classList.add('panel_inversed');
                    this.isPanelInversed = true;
                }
            }
        });
    }
    toggleNav(state) {
        requestAnimationFrame(() => {
            this.isNavActive = typeof (state) === 'boolean' ? state : !this.isNavActive;
            setScrollState(!this.isNavActive);
            if (this.isNavActive) {
                this.navEl.classList.add('nav_active');
            }
            else {
                this.navEl.classList.remove('nav_active');
            }
        });
    }
    setupRecaptcha(siteKey) {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        document.head.appendChild(script);
    }
}
const init = () => {
    window.sunpass = new Application();
};
/^(interactive|complete)$/.test(document.readyState) ? init() : window.addEventListener('load', init);
