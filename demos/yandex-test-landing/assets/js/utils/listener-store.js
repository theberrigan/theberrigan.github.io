export class ListenerStore {
    #store = [];

    add = (el, eventName, eventFn, options) => {
        if (el) {
            el.addEventListener(eventName, eventFn, options);

            this.#store.push([ el, eventName, eventFn, options ]);
        }
    }

    destroy = () => {
        this.#store.forEach(([ el, eventName, eventFn, options ]) => {
            el.removeEventListener(eventName, eventFn, options);
        });

        this.#store = [];
    };
}