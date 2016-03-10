import React from 'react';
import {capitalize,properify, EMPTY_STR} from 'reangulact/utils.es6';

const propsNames = {
    'class': 'className',
    'click': 'onClick',
    'change': 'onChange',
    'scroll': 'onScroll'
};

const ADAPTERS = {

    style(v, r){
        r.style =  (typeof v ==='string')?v.split(';').reduce((p, q, i, arr, kv = q.split(':'))=>(p[properify(kv[0])] = kv[1], p), {}):v;
    }
    ,
    ['class'](v, r){

        r['className'] = (typeof v ==='string')?v: Object.keys(v).reduce((p, key)=>{
                if (v[key] && !(v[key] in EMPTY_STR)){
                    p.push(key);
                }
                return p
        }, []).join(' ');
    }
};

let COUNTER = 0;

export function createElement(type, props, ...children) {
    if (type === 'children'){

        return this.props.children;
    }

    if (props) {

        if ('each' in props) {

            const [scopeId, op, dataId] = props.each.split(' ');

            const data = this::resolveProp(dataId);

            if (!data) return null;

            const newProps = Object.keys(props).filter(key=>(key !== 'each')).reduce((r, p) => ((r[p] = props[p]), r), {});

            return data.map(d => {

                this.$[scopeId] = d;

                const key = d.key || d.id || (++COUNTER);

                return createElement.call(this, type, {...newProps, key}, ...children);

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

                return elze ? createElement.apply(this, elze) : null;
            }

            children = children.filter(([type]) => type !== 'else');
        }

        const isComponent  = (typeof type !== 'string');

        props = Object.keys(props).reduce((r, k) => {

            let value = this::resolveProp(props[k]);

            let adapter = ADAPTERS[k];

            const key = !isComponent && propsNames[k] || k;

            if (adapter) {
                adapter(value, r);
            } else {
                r[key] =  value;
            }

            return r;

        }, {});
    }

    children = children.map(c => (typeof c === 'string') ? this::resolveProp(c.trim()) : createElement.apply(this, c));

    console.log('createElement',type, props, children);

    return type === 'for' || type === 'else' || type === 'block'
        ?
        children
        :
        React.createElement(type, props, children.length?children:null);
}

function resolveProp(_p) {

    if (!_p || _p[0] !== ':') return _p;

    let [p, ...pipes] = _p.slice(1).split('|');

    let value;

    if (p.match(/^\w+(\.\w+)*$/)) {

        value = this.get(p);

    } else if (p[0] === '{' && p.endsWith('}')) {

        value = p.slice(1, p.length-1).replace(/\(?(\:\w+(\.\w+)*)\)?/g,(s,s1)=>this::resolveProp(s1));

        value = value.split(',').reduce((p, q)=> {
            const kv = q.split(':');
            p[kv[0].trim()] = kv[1].trim();
            return p;
        }, {})

    } else {

        value = ((p[0] === '(' && p.endsWith(')')) ? p.slice(1, p.length-1) : p).replace(/\(?(\:\w+(\.\w+)*)\)?/g,(s,s1)=>this::resolveProp(s1));
    }

    return pipes.length ? this::resolvePipes(value, pipes) : value;
}

function resolvePipes(v, pipes) {
    for (let p of pipes) {
        v = this.pipes[p](v);
    }
    return v;
}