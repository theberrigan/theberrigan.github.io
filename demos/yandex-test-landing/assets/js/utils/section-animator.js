import { ListenerStore } from './listener-store.js';
import { throttle } from './events.js';



export class SectionAnimator {
    #elements = null;
    #listeners = new ListenerStore();
    #overlapPoints = null;

    static create (els) {
        return new SectionAnimator().#setup(els);
    }

    #destroy = () => {
        this.#listeners.destroy();

        this.#elements = null;
    };

    #setup = (els) => {
        this.#setupElements(els);
        this.#setupListeners();
        this.#checkVisibility(true);

        return this;
    };

    #setupElements = (els) => {
        this.#elements = els.filter(el => el).map((item) => {
            return {
                ...item,
                isDone: false,
            };
        });
    };

    #setupListeners = () => {
        this.#listeners.add(window, 'scroll', throttle(() => this.#checkVisibility(false), 250));
        this.#listeners.add(window, 'resize', throttle(() => this.#checkVisibility(true), 250));
    };

    #checkOverlap = (el) => {
        const points = this.#overlapPoints;
        const rect = el.getBoundingClientRect();

        return (
            rect.top >= points.top && rect.top <= points.bottom ||  // rect.top between points
            rect.bottom >= points.top && rect.bottom <= points.bottom ||  // rect.bottom between points
            rect.top <= points.top && rect.bottom >= points.bottom     // points are inside rect
        );
    };

    #updatePoints = () => {
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
        const heightFraction = 0.5;

        const top = (viewportHeight * (1 - heightFraction)) / 2;
        const bottom = viewportHeight - top;

        this.#overlapPoints = { top, bottom };
    }

    #checkVisibility = (updatePoints = false) => {
        if (updatePoints || !this.#overlapPoints) {
            this.#updatePoints();
        }

        let isComplete = true;

        for (let item of this.#elements) {
            if (!item.isDone && this.#checkOverlap(item.el)) {
                item.el.classList.add(item.animClass);

                item.isDone = true;
            }

            isComplete &&= item.isDone;
        }

        if (isComplete) {
            this.#destroy();
        }
    };
}
