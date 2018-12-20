(() => {
    class Browser {
        get domain () {
            return 'mathprofi.net';
        }

        get protocol () {
            return 'https';
        }

        constructor () {
            this.els = {
                unitInfo: document.body.querySelector('#panel > #unit-info'),
                unitNumber: document.body.querySelector('#panel > #unit-info > #unit-number'),
                unitName: document.body.querySelector('#panel > #unit-info > #unit-name'),
                continue: document.body.querySelector('#panel > #continue'),
                browser: document.body.querySelector('#browser'),
                curLink: null,
                lastUnit: null
            };

            this.isNavActive = false;
            this.unitsCount = 0;

            axios
                .get('data/book.json')
                .then((response) => {
                    this.initBrowser(this.initNav(response.data));
                })
                .catch((error) => {
                    console.warn(error);
                });
        }

        initNav (db) {
            const 
                unitNameToRestore = window.localStorage.getItem('lastUnit') || null,
                unitNameToLoad = new URL(window.location.href).searchParams.get('unit'),
                navListNode = document.body.querySelector('#nav-list'),
                navLinks = [],
                unitNodes = [];

            let defaultUnit = null,
                unitToLoad = null;

            db.forEach((section) => {
                const sectionNode = document.createElement('div');
                sectionNode.className = 'nav-section';

                if (section.title) {
                    const titleNode = document.createElement('h3');
                    titleNode.innerHTML = section.title;
                    sectionNode.appendChild(titleNode);
                }

                const ulNode = document.createElement('ul');

                section.units.forEach((unit) => {
                    const 
                        liNode = document.createElement('li'),
                        aNode = document.createElement('a');
                    
                    unit.isExternal && (aNode.target = '_blank');

                    aNode.rel = 'noopener noreferrer';

                    aNode.href = (
                        unit.url
                            .replace(/\{\s*protocol\s*\}/ig, this.protocol)
                            .replace(/\{\s*domain\s*\}/ig, this.domain)
                    );

                    aNode.linkData = {
                        title: unit.title,
                        isDefault: unit.isDefault,
                        node: aNode,
                        unitName: null,
                        unitNumber: null
                    };

                    unit.isDefault && (defaultUnit = aNode);

                    if (!unit.isExternal && unit.isUnit !== false) {
                        const unitName = aNode.linkData.unitName = this.extractUnit(aNode.href);

                        unitName == unitNameToRestore && (this.els.lastUnit = aNode);
                        unitName == unitNameToLoad && (unitToLoad = aNode);

                        aNode.innerHTML = `<strong>${ this.zeroPad(++this.unitsCount) }</strong>. ${ unit.title.trim() }`;
                        aNode.linkData.unitNumber = this.unitsCount;

                        unitNodes.push(aNode);
                    } else {
                        aNode.innerHTML = unit.title.trim();
                    }

                    navLinks.push(aNode);

                    liNode.appendChild(aNode);
                    ulNode.appendChild(liNode);
                }); 

                sectionNode.appendChild(ulNode);
                navListNode.appendChild(sectionNode);
            });

            const linksCount = navLinks.length;

            this.els.unitInfo.querySelector(':scope > #unit-count').innerText = String(this.unitsCount);

            document.querySelector('#panel > .button-nav').addEventListener('click', (e) => {
                e.deactivateNav = false;                
                this.toggleNav(!this.isNavActive);
            });

            document.body.addEventListener('click', (e) => e.deactivateNav !== false && this.isNavActive && this.toggleNav(false));

            navListNode.addEventListener('click', (e) => {
                e.deactivateNav = false;

                let targetNode = e.target;

                while (targetNode != navListNode) {
                    for (let i = linksCount; i--;) {
                        if (navLinks[i] == targetNode) {
                            if (targetNode.target && targetNode.target != '_self') {
                                this.toggleNav(false);
                                return;
                            }

                            e.preventDefault();

                            this.toggleNav(false);

                            setTimeout(() => this.browse(targetNode), 150);  // browse when nav has been hidden

                            return;
                        }
                    }

                    targetNode = targetNode.parentNode;
                }
            });

            this.els.continue.addEventListener('click', () => this.els.lastUnit && this.browse(this.els.lastUnit));

            document.querySelectorAll('#panel > .button-direction').forEach((el) => {
                const dir = el.dataset.dir;
                (this.els[ dir ] = el).addEventListener('click', () => this.browse(unitNodes[ this.getSiblingUnit(dir) ]));
            });

            return unitToLoad || defaultUnit;
        }

        zeroPad (num) {
            return `00${ num }`.slice(-3);
        }

        extractUnit (url) {
            return ((new URL(url).pathname.split('/').pop() || '').match(/(.*)\.html$/i) || [ null, null ])[1];
        }

        toggleNav (activate) {
            document.body.classList[ activate ? 'add' : 'remove' ]('nav-active');
            this.isNavActive = activate;
        }

        initBrowser (unitToLoad) {
            // this.els.browser.addEventListener('load', () => {
            //     console.log('Navigated to:', this.els.browser.src);
            // });

            this.browse(unitToLoad);
        }

        browse (el = null) {
            if (!el || !el.linkData) return;
            
            const 
                url = new URL(window.location.href),
                { title, unitNumber, unitName } = el.linkData;

            this.els.browser.src = el.href;
            document.title = title;

            this.els.curLink && this.els.curLink.classList.remove('active');
            (this.els.curLink = el).classList.add('active');

            if (unitName) {
                url.searchParams.set('unit', unitName);

                this.els.lastUnit = el;
                window.localStorage.setItem('lastUnit', unitName);

                this.els.unitName.innerText = title;
                this.els.unitNumber.innerText = String(unitNumber);
                this.els.unitName.href = el.href;

                this.els.prev.classList[ this.getSiblingUnit('prev') == null ? 'add' : 'remove' ]('button-disabled');
                this.els.next.classList[ this.getSiblingUnit('next') == null ? 'add' : 'remove' ]('button-disabled');

                this.els.continue.hidden = true;
                this.els.prev.hidden = this.els.next.hidden = this.els.unitInfo.hidden = false;
                
            } else {
                url.searchParams.delete('unit');

                this.els.prev.hidden = this.els.next.hidden = this.els.unitInfo.hidden = true;
                this.els.continue.hidden = !this.els.lastUnit;

                this.els.unitName.innerText = this.els.unitNumber.innerText = '';
                this.els.unitName.href = '#';
            }

            window.history.pushState(null, null, url.href);
        }

        getSiblingUnit (dir) {
            const n = this.els.lastUnit && this.els.lastUnit.linkData.unitNumber || null;
            return n ? (dir == 'prev' && n > 1) ? (n - 2) : (dir == 'next' && n < this.unitsCount ? n : null) : null;  
        }
    }

    const init = () => window.browser = new Browser();

    document.readyState == 'complete' ? init() : window.addEventListener('load', () => init());
})();