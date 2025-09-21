export class Timer {
    #delay = null;
    #fn    = null;

    #invokeTime = null;
    #remTime    = null;
    #timeout    = null;

    constructor (delay, fn) {
        this.#delay = delay;
        this.#fn    = fn;
    }

    #clear = () => {
        if (this.#timeout !== null) {
            clearTimeout(this.#timeout);
            this.#timeout = null;
        }
    };

    #reset = () => {
        this.#clear();
        this.#remTime    = null;
        this.#invokeTime = null;
    };

    #setTimeout = (delay) => {
        this.#remTime    = null;
        this.#invokeTime = performance.now() + delay;
        this.#timeout    = setTimeout(() => {
            this.#reset();
            this.#fn();
        }, delay);
    };

    start = () => {
        this.#reset();
        this.#setTimeout(this.#delay);

        return this;
    };

    // alias
    restart = this.start;

    // alias
    stop = this.#reset;

    pause = () => {
        if (this.#invokeTime !== null) {
            this.#clear();
            this.#remTime = Math.max(0, this.#invokeTime - performance.now());
        }

        return this;
    };

    continue = () => {
        if (this.#remTime === null) {
            this.start();
        } else {
            this.#setTimeout(this.#remTime);
        }

        return this;
    };
}
