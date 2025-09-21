import { Carousel } from './utils/carousel.js';
import { addDelegatedListener } from './utils/events.js';
import { SectionAnimator } from './utils/section-animator.js';


const createParticipantsCarousel = () => {
    Carousel.create({
        rootEl: document.body.querySelector('.participants__carousel'),
        controlsNestEl: document.body.querySelector('.participants__carousel-controls'),
        autoPlay: true,
        autoPlayDelay: 4000,
        loop: true,
        breakpoints: [
            {
                minWidth: 0,
                slidesPerPage: 1,
            },
            {
                minWidth: 480,
                slidesPerPage: 2,
            },
            {
                minWidth: 920,
                slidesPerPage: 3,
            },
        ]
    });
};

const createStagesCarousel = () => {
    const wrapperEl = document.body.querySelector('.stages__wrapper');
    const carouselEl = document.body.querySelector('.stages__carousel');
    const controlsNestEl = document.body.querySelector('.stages__carousel-controls');

    let carousel = null;

    const resizeObserver = new ResizeObserver((entries) => {
        const rootWidth = entries[0].borderBoxSize[0].inlineSize;

        if (rootWidth < 716) {
            wrapperEl.classList.remove('stages__wrapper_grid');

            carousel ||= Carousel.create({
                rootEl: carouselEl,
                controlsNestEl,
                dots: true,
            });
        } else {
            wrapperEl.classList.add('stages__wrapper_grid');

            carousel = carousel?.destroy();
        }
    });

    resizeObserver.observe(carouselEl);
};

const createAnchorsHandler = () => {
    addDelegatedListener(document.documentElement, 'click', `a[href^='#']`, (e) => {
        e.preventDefault();

        const hash = e.target.getAttribute('href');

        if (hash === '#') {
            return;
        }

        const el = document.body.querySelector(hash);

        if (el) {
            el.scrollIntoView({
                behavior: 'smooth',
                block: e.target.dataset.scrollAlignment ?? 'center'
            });
        }
    });
};

const createSectionAnimator = () => {
    SectionAnimator.create([
        {
            el: document.getElementById('intro'),
            animClass: 'intro_animated'
        },
        {
            el: document.getElementById('support'),
            animClass: 'support_animated'
        },
        {
            el: document.getElementById('details'),
            animClass: 'details_animated'
        },
        {
            el: document.getElementById('stages'),
            animClass: 'stages_animated'
        },
        {
            el: document.getElementById('participants'),
            animClass: 'participants_animated'
        },
    ]);
};

const main = () => {
    createAnchorsHandler();
    createSectionAnimator();
    createStagesCarousel();
    createParticipantsCarousel();
};

main();
