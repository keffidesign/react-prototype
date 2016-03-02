const capitalize = (s) => (s.charAt(0).toUpperCase() + s.slice(1));

export function prepareJsx({type, props, children}) {

    if ('each' in props) {

        const [scopeId, op, dataId] = props.each.split(' ');

        const data = this::resolveProp(dataId);

        if (!data) return null;

        const newProps = Object.keys(props).filter(key=>(key !== 'each')).reduce((r, p) => ((r[p] = props[p]), r), {});

        return data.map(d => {

            this[scopeId] = d;

            return this::prepareJsx({type, props: newProps, children});

        });
    }

    props = Object.keys(props).reduce((r, k) => {

        const key = (k === 'class') ? 'className' : k;

        r[key] = this::resolveProp(props[k]);

        return r;

    }, {});

    if ('if' in props) {

        if (typeof props.if === 'function') props.if = this::props.if();

        if (!props.if) {

            const elseStatment = children && children.filter(({type}) => type === 'else').pop();

            return elseStatment ? this::prepareJsx(elseStatment) : null;

        }

        children = children && children.filter(({type}) => type !== 'else');

    }

    return React.createElement(type, props, this::resolveChildren(children));

}

function resolveChildren(children) {

    if (children) return children.map(c => (typeof c === 'string') ? this::resolveProp(c) : this::prepareJsx(c));
}

function resolveProp(p) {

    if (!p || p[0] !== ':') return p;

    p = p.slice(1);

    const fnKey = `get${capitalize(p)}`;

    const factory = this.get(fnKey) || this[fnKey];

    let value = factory || this.get(p) || this[p];

    if (typeof value === 'function') {

        const cacheKey = `__${p}`;

        value = this[cacheKey] || (this[cacheKey] = value.bind(this));

        if (factory) {
            value = value();
        }
    }

    return value;
}