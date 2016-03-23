import React from 'react';
import {capitalize,properify, EMPTY_STR} from 'reangulact/utils.es6';

const ADAPTERS = {

    style(v, k, r){

        if (typeof v ==='string'){

            v = v.split(';').reduce((p, q, i, arr, kv = q.split(':'))=>(p[(kv[0])] = kv[1], p), {})
        }

        r.style = Object.keys(v).reduce((p, k)=> {
            p[properify(k)] = v[k];
            return p;
        }, {});
    }
    ,
    ['class'](v, k, r,  isComponent){
        if (typeof v !=='string'){
            v = Object.keys(v).filter((key)=>(v[key] && !(v[key] in EMPTY_STR))).join(' ');
        }
        r['className'] = v;
    }
    ,
    click(v, k, r, isComponent){ r[isComponent ? k :'onClick']= v;},
    change(v, k, r, isComponent){ r[isComponent ? k :'onChange']= v;},
    scroll(v, k, r, isComponent){ r[isComponent ? k :'onScroll']= v;}
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

                this.state[scopeId] = d;

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

            if (adapter) {

                adapter.call(this, value, k, r, isComponent);
            } else {

                r[k] = value;
            }

            return r;

        }, {});
    }

    children = children.map(c => (typeof c === 'string') ? this::resolveProp(c.trim()) : createElement.apply(this, c));

    //console.log('createElement',type, props, children);

    return type === 'for' || type === 'else' || type === 'block'
        ?
        children
        :
        React.createElement(type, props, children.length?children:null);
}

function resolveProp(_p) {

    if (!_p || _p[0] !== ':') return _p;

    let [p, ...pipes] = _p.slice(1).split('|');

    let value = parseBindingExpression.call(this, p);

    return pipes.length ? this::this.transform(value, pipes.map(p => p.trim())) : value;

}

function parseBindingExpression(p) {

    if (p.match(/^\w+(\.\w+)*$/)) {

        return this.get(p);
    }

    if (p[0] === '{' && p.endsWith('}')) {

        return Function('return '+p.replace(/\((\:\w+(\.\w+)*)\)/g,(s,s1)=>this::resolveProp(s1)))();

    }

    if (p[0] === '(' && p.endsWith(')')) {

        return p.slice(1, p.length-1).replace(/\((\:\w+(\.\w+)*)\)/g,(s,s1)=>this::resolveProp(s1));
    }

    return p;
}