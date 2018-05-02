(() => {
    class Browser {
        get config () {
            return {
                domain: 'mathprofi.net',
                protocol: 'https'
            };
        }

        constructor () {
            this.navNode = document.body.querySelector('nav');

            this.unitInfoNode = document.body.querySelector('#unit-info');
            this.unitNumberNode = this.unitInfoNode.querySelector(':scope > #unit-number');
            this.unitNameNode = this.unitInfoNode.querySelector(':scope > #unit-name');

            this.unitPrevNode = document.body.querySelector('#prev-unit');
            this.unitNextNode = document.body.querySelector('#next-unit');
            this.continueNode = document.body.querySelector('#continue');

            this.browserNode = document.body.querySelector('#browser');

            this.unitLinks = {};
            this.currentLinkNode = null;
            this.lastUnitNode = null;
            this.expectedUrl = null;
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

                    aNode.href = this.fillUrl(unit.url);

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

                        unitName == unitNameToRestore && (this.lastUnitNode = aNode);
                        unitName == unitNameToLoad && (unitToLoad = aNode);

                        aNode.innerHTML = `<strong>${ this.zeroPad(++this.unitsCount) }</strong>. ${ unit.title.trim() }`;
                        aNode.linkData.unitNumber = this.unitsCount;

                        this.unitLinks[ unitName ] = aNode.linkData;

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

            this.unitInfoNode.querySelector(':scope > #unit-count').innerText = String(this.unitsCount);

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

            this.continueNode.addEventListener('click', () => this.lastUnitNode && this.browse(this.lastUnitNode));

            this.unitPrevNode.addEventListener('click', () => {
                const nodeNumber = this.getPrevUnitNumber();
                nodeNumber !== null && this.browse(unitNodes[ nodeNumber ]);
            });

            this.unitNextNode.addEventListener('click', () => {
                const nodeNumber = this.getNextUnitNumber();
                nodeNumber !== null && this.browse(unitNodes[ nodeNumber ]);
            });

            return unitToLoad || defaultUnit;
        }

        zeroPad (num) {
            return `00${ num }`.slice(-3);
        }

        fillUrl (url) {
            return (
                url
                    .replace(/\{\s*protocol\s*\}/ig, this.config.protocol)
                    .replace(/\{\s*domain\s*\}/ig, this.config.domain)
            );
        }

        extractUnit (url) {
            return ((new URL(url).pathname.split('/').pop() || '').match(/(.*)\.html$/i) || [ null, null ])[1];
        }

        toggleNav (activate) {
            document.body.classList[ activate ? 'add' : 'remove' ]('nav-active');
            this.isNavActive = activate;
        }

        initBrowser (unitToLoad) {
            this.browserNode.addEventListener('load', () => {
                console.log('Navigated to:', this.browserNode.src, this.expectedUrl);
            });

            this.browse(unitToLoad);
        }

        browse (aNode) {
            this.browserNode.src = this.expectedUrl = aNode.href;
            document.title = aNode.linkData.title;
            this.currentLinkNode && this.currentLinkNode.classList.remove('active');
            (this.currentLinkNode = aNode).classList.add('active');
            this.setCurrentUnit(aNode);
        }

        setCurrentUnit (aNode) {
            const url = new URL(window.location.href);

            const { title, unitNumber, unitName } = (aNode.linkData || {});

            if (unitName) {
                this.continueNode.setAttribute('hidden', 'hidden');

                this.lastUnitNode = aNode;
                window.localStorage.setItem('lastUnit', unitName);

                url.searchParams.set('unit', unitName);

                this.unitNameNode.innerText = title;
                this.unitNumberNode.innerText = String(unitNumber);

                this.unitPrevNode.classList[ this.getPrevUnitNumber() == null ? 'add' : 'remove' ]('button-disabled');
                this.unitNextNode.classList[ this.getNextUnitNumber() == null ? 'add' : 'remove' ]('button-disabled');

                this.unitInfoNode.removeAttribute('hidden');
                this.unitPrevNode.removeAttribute('hidden');
                this.unitNextNode.removeAttribute('hidden');
            } else {
                this.unitInfoNode.setAttribute('hidden', 'hidden');
                this.unitPrevNode.setAttribute('hidden', 'hidden');
                this.unitNextNode.setAttribute('hidden', 'hidden');

                url.searchParams.delete('unit');

                this.unitNameNode.innerText = '';
                this.unitNumberNode.innerText = '';

                this.lastUnitNode ? this.continueNode.removeAttribute('hidden') : this.continueNode.setAttribute('hidden', 'hidden');
            }

            window.history.pushState(null, null, url.href);  // + localStorage
        }

        getPrevUnitNumber () {
            const nodeNumber = this.lastUnitNode && this.lastUnitNode.linkData.unitNumber || 0;
            return nodeNumber && nodeNumber > 1 ? (nodeNumber - 2) : null;
        }

        getNextUnitNumber () {
            const nodeNumber = this.lastUnitNode && this.lastUnitNode.linkData.unitNumber || 0;
            return nodeNumber && nodeNumber < this.unitsCount ? nodeNumber : null;  
            
        }
    }

    const init = () => window.browser = new Browser();

    document.readyState == 'complete' ? init() : window.addEventListener('load', () => init());
})();