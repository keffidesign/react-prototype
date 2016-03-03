// "abc" => "Abc"
const capitalize = (s) => (s.charAt(0).toUpperCase() + s.slice(1));
// "a-bc-de" => "aBcDe"
const properify = (s) => (s.split('-').map((c,i)=>(i?capitalize(c):c)).join(''));

const propsNames = {
    'class': 'className',
    'click': 'onClick',
    'scroll': 'onScroll'
};

const ADAPTERS = {

    style(v){
        return (typeof v ==='string')?v.split(';').reduce((p, q, i, arr, kv = q.split(':'))=>(p[properify(kv[0])] = kv[1], p), {}):v;
    }
};

let COUNTER = 0;

export function prepareJsx([type, props, ...children]) {

    if (props) {

        if ('each' in props) {

            const [scopeId, op, dataId] = props.each.split(' ');

            const data = this::resolveProp(dataId);

            if (!data) return null;

            const newProps = Object.keys(props).filter(key=>(key !== 'each')).reduce((r, p) => ((r[p] = props[p]), r), {});

            return data.map(d => {

                this.$[scopeId] = d;

                const key = d.key || d.id || (++COUNTER);

                return this::prepareJsx([type, {...newProps, key}, ...children]);

            });
        }

        if ('if' in props) {

            let val = this::resolveProp(props.if);

            if (props.ifMatch!==undefined) {
                val = val == this::resolveProp(props.ifMatch)
            }

            if (!val) {

                const elze = children.filter(([type]) => type === 'else').pop();

                //console.log('else',type, props, children);

                return elze ? this::prepareJsx(elze) : null;
            }

            children = children.filter(([type]) => type !== 'else');
        }

        props = Object.keys(props).reduce((r, k) => {

            let value = this::resolveProp(props[k]);

            let adapter = ADAPTERS[k];

            r[propsNames[k] || k] = adapter ? adapter(value) : value;

            return r;

        }, {});
    }

    children = children.map(c => (typeof c === 'string') ? this::resolveProp(c.trim()) : this::prepareJsx(c));

    return type === 'for' || type === 'else' || type === 'block' ? children : React.createElement(type, props, children);
}

function resolveProp(_p) {

    if (!_p || _p[0] !== ':') return _p;

    let [p, ...pipes] = _p.slice(1).split('|');

    let value;

    if (p[0] === '(' && p.endsWith(')')) {

        value = p.slice(1, p.length-1).replace(/\((\:\w+(\.\w+)*)\)/g,(s,s1)=>this::resolveProp(s1));

    } else {

        const fnKey = `get${capitalize(p)}`;

        const factory = this.get(fnKey) || this[fnKey];

        value = factory || this.get(p) || this[p];

        if (typeof value === 'function') {

            const cacheKey = `__${p}`;

            value = this.$[cacheKey] || (this.$[cacheKey] = value.bind(this));

            if (factory) {
                value = value();
            }
        }
    }




    return pipes.length ? this::resolvePipes(value, pipes) : value;
}

function resolvePipes(v, pipes) {
    for (let p of pipes) {
        v = this.pipes[p](v);
    }
    return v;
}