const EXCEPTIONAL_NOUNS = {
    data: 'datum',
    children: 'child'
};

export function render() {

    return this::prepareJsx(this.__render(), this.state);

}

export function createElement(type, props, ...children) {

    return {type, props: props || {}, children};

}

function capitalize(string) {

    return string.charAt(0).toUpperCase() + string.slice(1);

}

function prepareJsx({type, props, children}, state) {

    if (props.each) {

        const [scopeId, dataId] = resolveEach(props.each);

        const data = this::resolveData(dataId);

        if (!data) return null;

        return data.map(d => {

            state[scopeId] = d;

            return this::cloneElement(type, props, children, state);

        });

    }

    props = Object.keys(props).reduce((r, k) => {

        let key = k;

        if (k === 'class') key = 'className';

        r[key] = this::resolveProp(props[k]);

        return r;

    }, {});


    if (props.if != undefined && state) {

        if (typeof props.if === 'function') props.if = this::props.if();

        if (!props.if) {

            const ElseStatment = children.filter(({type}) => type === 'else').pop();

            if (ElseStatment) return this::prepareJsx(ElseStatment, state);

            return null;

        }

        children = children.filter(({type}) => type !== 'else');

    }

    return React.createElement(type, props, this::resolveChildren(children, state));

}

function cloneElement(type, props, children, state) {

    props = this::resolveProps(props);

    return this::prepareJsx({type, props: { ...props}, children}, state);

}

function resolveChildren(children, state) {

    if (children) return children.map(c => (typeof c === 'string') ? this::resolveProp(c) : this::prepareJsx(c, state));

}

function resolveProps(props) {

    return Object.keys(props).filter(key=>(key!=='each')).reduce((r, p) => ((r[p] = props[p]), r), {});
}

function resolveProp(str) {

    if (!str || str[0] !== ':') return str;

    return this::resolveData(str.slice(1));
}

function resolveData(path) {

    return path
        .split('.')
        .reduce((s, p) => {

            const value = s[`get${capitalize(p)}`]  || s[p] || this[`get${capitalize(p)}`] || this[p];

            if (typeof value === 'function') return value.name.startsWith('get') ? value.call(this) : value.bind(this);

            return value;

        }, this.state);

}

function resolveEach(value) {

    let [scopeId, operator, dataId = scopeId] = value.split(' ');

    if (scopeId === dataId) {

        scopeId = scopeId.split('.').pop();

        scopeId = EXCEPTIONAL_NOUNS[scopeId] || scopeId.slice(0, -1);

    }

    return [scopeId, dataId];

}//166:3362