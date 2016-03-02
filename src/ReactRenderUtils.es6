const capitalize = (s) => (s.charAt(0).toUpperCase() + s.slice(1));

const propsNames = {
    'class':'className',
    'click':'onClick'
};

let COUNTER = 0;

export function prepareJsx([type, props, ...children]) {

    if ('each' in props) {

        const [scopeId, op, dataId] = props.each.split(' ');

        const data = this::resolveProp(dataId);

        if (!data) return null;

        const newProps = Object.keys(props).filter(key=>(key !== 'each')).reduce((r, p) => ((r[p] = props[p]), r), {});

        return data.map(d => {

            this.$[scopeId] = d;

            newProps.key = d.key || d.id || (++COUNTER);

            return this::prepareJsx([type, newProps, ...children]);

        });
    }

    if ('if' in props) {

        if (!this::resolveProp(props.if)) {

            const elze = children && children.filter(({type}) => type === 'else').pop();

            return elze ? this::prepareJsx(elze) : null;
        }

        children = children && children.filter(({type}) => type !== 'else');

    }

    props = Object.keys(props).reduce((r, k) => {

        r[propsNames[k]||k] = this::resolveProp(props[k]);

        return r;

    }, {});

    children = children && children.map(c => (typeof c === 'string') ? this::resolveProp(c.trim()) : this::prepareJsx(c));

    return React.createElement(type, props, children);
}

function resolveProp(_p) {

    if (!_p || _p[0] !== ':') return _p;

    const [p, ...pipes] = _p.slice(1).split('|');

    const fnKey = `get${capitalize(p)}`;

    const factory = this.get(fnKey) || this[fnKey];

    let value = factory || this.get(p) || this[p];

    if (typeof value === 'function') {

        const cacheKey = `__${p}`;

        value = this.$[cacheKey] || (this.$[cacheKey] = value.bind(this));

        if (factory) {
            value = value();
        }
    }

    return pipes.length ? this::resolvePipes(value, pipes) : value;
}

function resolvePipes(v, pipes) {
    for (let p of pipes){
        v = this.pipes[p](v);
    }
    return v;
}