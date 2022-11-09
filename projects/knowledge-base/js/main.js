const db = [
    {
        title: 'Дисциплины',
        type: 'article',
        items: [
            {
                title: 'Математика',
                id: 'math'
            },
            {
                title: 'WebGL',
                id: 'webgl'
            },
            {
                title: 'OpenGL',
                id: 'opengl'
            },
            {
                title: 'Vulkan',
                id: 'vulkan'
            },
            {
                title: 'Разработка игр',
                id: 'gamedev'
            },
            {
                title: 'Актёрство, голос, пение',
                id: 'acting'
            },
            {
                title: 'Комедия',
                id: 'comedy'
            },
            {
                title: 'Английский язык',
                id: 'english'
            },
            {
                title: 'Электроника',
                id: 'electronics'
            },
            {
                title: 'C++',
                id: 'cpp'
            },
            {
                title: 'Javascript',
                id: 'js'
            },
            {
                title: 'Rust',
                id: 'rust'
            },
            {
                title: 'Архитектура',
                id: 'arch'
            },
            {
                title: 'Ассемблер',
                id: 'asm'
            },
            {
                title: 'Реверс инжиниринг',
                id: 're'
            },
            {
                title: 'Криптография',
                id: 'crypto'
            },
            {
                title: 'Хакинг',
                id: 'hacking'
            },
            {
                title: 'Дискретная математика',
                id: 'discrete-math'
            },
            {
                title: 'Физика',
                id: 'physics'
            },
            {
                title: 'Информатика',
                id: 'computer-science'
            },
            {
                title: 'Алгоритмы',
                id: 'algorithms'
            },
            {
                title: 'Шаблоны проектирования',
                id: 'patterns'
            },
            {
                title: 'Машинное обучение',
                id: 'machine-learning'
            },
            {
                title: 'Цифровые сигналы',
                id: 'signals'
            },
            {
                title: 'Git',
                id: 'git'
            },
            {
                title: 'Музыка',
                id: 'music'
            },
            {
                title: 'Сценарии, драматургия, юмор',
                id: 'drama'
            },
            {
                title: 'Психология',
                id: 'psychology'
            },
            {
                title: 'Рисование',
                id: 'art'
            },
            {
                title: 'Системное мышление',
                id: 'system-thinking'
            },
        ]
    },
    {
        title: 'Списки на изучение',
        type: 'list',
        items: [
            {
                title: 'Разработка игр',
                id: 'gamedev'
            },
            {
                title: 'Английский язык',
                id: 'english'
            },
            {
                title: 'Информатика и математика',
                id: 'computer-science'
            },
            {
                title: 'Дизайн и рисование',
                id: 'design'
            },
        ]
    },
    {
        title: 'Содержание книг',
        type: 'book',
        items: [
            {
                title: 'Думай, как математик',
                id: 'dumai-kak-matematik'
            },
            {
                title: 'Помнить всё. Практическое руководство по развитию памяти',
                id: 'pomni-vsyo'
            },
            {
                title: 'Харизма. Как влиять, вдохновлять и убеждать',
                id: 'harizma'
            },
        ]
    }
];

const navMap = {};
let articlesEl = null;
let loadingArticle = null;

const showArticle = (() => {
    let currentArticle = null;

    const switchArticle = article => {
        // on page init
        if (currentArticle) {
            currentArticle.el.classList.remove('article_current');
            currentArticle.anchorEl.classList.remove('nav__link_current');            
        }

        article.el.classList.add('article_current');
        article.anchorEl.classList.add('nav__link_current');

        currentArticle = article;

        // $('html, body').scrollTop(0);
    };

    return articleId => {
        if (
            !(articleId in navMap) || 
            currentArticle && currentArticle.id === articleId || 
            loadingArticle && loadingArticle.id === articleId
        ) {
            return;
        }

        const article = loadingArticle = navMap[articleId];

        if (article.el) {
            switchArticle(article);
            return;
        }

        $.get(article.url)
            .done(articleHTML => {
                const articleEl = document.createElement('article');
                articleEl.className = 'article';
                articleEl.id = articleId;
                articleEl.innerHTML = articleHTML;

                if (window.MathJax) {
                    setTimeout(() => {
                        /*MathJax.Config({
                            CommonHTML: {
                                scale: 160
                            }
                        });*/
                        MathJax.startup.output.options.scale = 1.1;        
                        MathJax.typeset();
                    }, 1000);
                }

                highlightListings(articleEl, () => {
                    articlesEl.appendChild(articleEl);

                    article.el = articleEl;

                    if (loadingArticle === article) {
                        switchArticle(article);
                        history.replaceState(null, article.title, '#' + articleId);

                        loadingArticle = null;
                    }                    
                }); 
            })
            .fail(error => console.warn('Can`t load article:', error));
    };
})(); 

const highlightCode = (() => {
    const 
        h = Prism.highlight,
        l = Prism.languages;

    return (code, lang) => {
        return h(code, l[lang], lang);
    };
})();

const highlightListings = (() => {
    const commentRegexp = /^(<listing(?:\s+[\w\-]+="[^"]+")*>)([\s\S]*)<\/listing>$/i;
    const attrRegexp = /([\w\-]+)="([^"]+)"/ig;
    const indentRegexp = /^\s*/;

    const walker = (parentNode, comments = []) => {
        if (!(parentNode instanceof HTMLElement)) {
            return;
        }

        parentNode.childNodes.forEach(node => {
            if (node.nodeType !== 8) {  // not a comment node
                walker(node, comments);
                return;
            }

            const commentText = node.nodeValue || '';

            let matches = commentText.match(commentRegexp);

            if (matches) {
                const comment = { 
                    node
                };

                // ------

                let lines = matches[2].split('\n');

                const 
                    listingTag = matches[1],
                    attrs = {};

                while (matches = attrRegexp.exec(listingTag)) {
                    attrs[matches[1]] = matches[2];
                }


                if (!attrs.lang || !Prism.languages[attrs.lang]) {
                    console.warn('Incorrect listing \'lang\'-attribute:', node);
                    return;
                }

                // ------

                while (lines.length && !lines[0].trim()) {
                    lines.shift();
                }

                let len;

                while ((len = lines.length) && !lines[len - 1].trim()) {
                    lines.pop();
                }

                if (!lines.length) {
                    return;
                }

                let minIndent = null;

                lines = lines.map(line => {
                    if (!line.trim()) {
                        return '';
                    }

                    let spaces = 0,
                        tabs = 0;

                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];

                        if (char === ' ') {
                            spaces++
                        } else if (char === '\t') {
                            tabs++;
                        } else {
                            break;
                        }
                    }

                    spaces += tabs * 4;
                    (minIndent === null || minIndent > spaces) && (minIndent = spaces);

                    return tabs ? line.replace(indentRegexp, ' '.repeat(spaces)) : line;
                });

                minIndent && (lines = lines.map(line => line.slice(minIndent)));

                // --------------

                const preEl = document.createElement('pre');
                preEl.className = 'line-numbers';                

                const codeEl = document.createElement('code');
                codeEl.className = 'language-' + attrs.lang;

                codeEl.textContent = lines.join('\n');

                preEl.appendChild(codeEl);

                comment.pre = preEl;

                // ------

                comments.push(comment);
            }
        });

        return comments;
    };

    return (node, callback) => {
        const comments = walker(node);

        if (!comments.length) {
            return callback();
        }

        comments.forEach(comment => {
            comment.node.parentNode.insertBefore(comment.pre, comment.node);
            comment.node.remove();
        });

        Prism.highlightAllUnder(node, true, () => callback());
    };
})();

/*
Отдельные темы
- Строки
- Числа
- Дата и время
- Little endian big endian
- представление целых и дробных чисел в компе
*/

/*
<!--<listing lang="cpp|js|json|...">
    code...                        
</listing>-->
*/
const init = () => {
    articlesEl = document.body.querySelector('.articles');

    const navEl = document.body.querySelector('.nav__scroll');

    db.forEach(section => {
        const titleEl = document.createElement('div');
        titleEl.className = 'nav__title';
        titleEl.textContent = section.title;

        const listEl = document.createElement('ul');
        listEl.className = 'nav__list-toplevel';

        // ----

        section.items.forEach(item => {
            const itemId = section.type + '-' + item.id;

            const itemEl = document.createElement('li');

            const anchorEl = document.createElement('a');
            anchorEl.className = 'nav__link';
            anchorEl.textContent = item.title;
            anchorEl.href = '#' + itemId;

            itemEl.appendChild(anchorEl);
            listEl.appendChild(itemEl);

            navMap[itemId] = {
                id: itemId,
                url: `db/${ itemId }.html`,
                el: null,
                anchorEl,
                title: item.title
            };
        });

        // ----

        navEl.appendChild(titleEl);
        navEl.appendChild(listEl);
    });

    $(navEl).on('click', 'a', e => {
        e.preventDefault();
        e.stopPropagation();

        showArticle(e.currentTarget.href.split('#').pop());
    });

    $(document.body).on('click', 'article.article a', e => {
        const data = e.target.dataset;

        if (data.spoiler) {
            e.preventDefault();
            $(`.spoiler[data-spoiler='${ data.spoiler }']`).toggleClass('spoiler_opened');
        }
    });

    // --------

    showArticle(location.hash.slice(1));
};

/^interactive|complete$/.test(document.readyState) ? init() : window.addEventListener('load', init);

// https://docs.mathjax.org/en/latest/input/tex/differences.html
// http://docs.mathjax.org/en/latest/basic/mathematics.html#basic-mathematics
// https://docs.mathjax.org/en/latest/input/tex/eqnumbers.html
