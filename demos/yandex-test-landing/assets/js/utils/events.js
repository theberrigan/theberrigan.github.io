export const addDelegatedListener = (rootEl, eventName, selectors, fn, options) => {
    return rootEl.addEventListener(eventName, (e) => {
        let currentEl = e.target;

        while (currentEl) {
            if (currentEl === rootEl) {
                return;
            }

            if (currentEl.matches(selectors)) {
                break;
            }

            currentEl = currentEl.parentElement;
        }

        if (currentEl) {
            Object.defineProperty(e, 'target', {
                value: currentEl,
                configurable: true
            });

            return fn(e);
        }
    }, options);
};

export const throttle = (fn, timeLimit) => {
    let lastTime = null;
    let timeout  = null;

    return (...args) => {
        if (timeout === null) {
            fn(...args);
            lastTime = Date.now();
        } else {
            const delay = Math.max(timeLimit - (Date.now() - lastTime), 0);

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                if ((Date.now() - lastTime) >= timeLimit) {
                    fn(...args);
                    lastTime = Date.now();
                }
            }, delay);
        }
    };
};
