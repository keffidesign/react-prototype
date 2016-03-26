//import React from 'react';
import {capitalize,properify, EMPTY_STR} from 'reangulact/utils.es6';

const OPS= {
    'is': (a,b)=> (a===b),
    'isnt': (a,b)=> (a!==b)
}

const ADAPTERS = {

    style(v, k, r){

        v = this::resolveProp(v);

        if (v === undefined ) return;

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
        v = this::resolveProp(v);

        if (v === undefined ) return;

        if (typeof v ==='object'){
            v = Object.keys(v).filter((key)=>(v[key] && !(v[key] in EMPTY_STR))).join(' ');
        }

        r['className'] = v;
    }
    ,
    click(v, k, r, isComponent){
        r[isComponent ? k :'onClick']= this.getClicker(v.slice(1));
    },
    change(v, k, r, isComponent){
        v = this::resolveProp(v);

        if (v === undefined ) return;

        r[isComponent ? k :'onChange']= v;
    },
    scroll(v, k, r, isComponent){
        v = this::resolveProp(v);

        if (v === undefined ) return;

        r[isComponent ? k :'onScroll']= v;
    }
    ,
    ["*"](v, k, r, isComponent){
        v = this::resolveProp(v);

        if (v === undefined ) return;

        r[k] = v;
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

                this.state[scopeId] = d;

                const key = d && (d.key || d.id) || (++COUNTER);

                return createElement.call(this, type, {...newProps, key}, ...children);

            });
        }

        if ('if' in props) {

            const [ifExpr, ifOp, ifMatch]= props.if.split(' ');

            let val = this::resolveProp(ifExpr);

            if (ifMatch!==undefined) {
                val = OPS[ifOp](val, this::resolveProp(ifMatch))
            }

            if (!val) {

                const elze = children.find(([type]) => type === 'else');

                if (!elze || elze.length<3) return null;

                const map = elze.slice(2).reduce((r,d) => {
                    const el = createElement.apply(this, d);
                    if (el){
                        r.push(el)
                    }
                    return r;
                }, []);

                console.log('else',elze, map);

                return map.length===1 ? map[0] : map;
            }

            children = children.filter(([type]) => type !== 'else');
        }

        const isComponent  = (typeof type !== 'string');

        props = Object.keys(props).reduce((r, k) => {

            if (k==='if' || k==='each') return r;

            const value = props[k];

            if (value === undefined ) return r;

            const adapter = ADAPTERS[k] || ADAPTERS['*'];

            adapter.call(this, value, k, r, isComponent);

            return r;

        }, {});
    }

    children = children.map(c => (typeof c === 'string') ? this::resolveProp(c.trim()) : createElement.apply(this, c));

    console.log('createElement',type, props, children);

    return type === 'for' || type === 'else' || type === 'block'
        ?
        (children.length===1?children[0]:children)
        :
        React.createElement(type, props, ...children);
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

        return Function('return '+p.replace(/\(:(\w+(\.\w+)*)\)/g,(s,s1)=>`this.get("${s1}")`)).call(this);
    }

    if (p[0] === '(' && p.endsWith(')')) {

        return p.slice(1, p.length-1).replace(/\(:(\w+(\.\w+)*)\)/g,(s,s1)=>this.get(s1));
    }

    return p;
}