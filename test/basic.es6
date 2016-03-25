import React from 'react';
import {Component} from 'reangulact';

import {initialize} from '../index.es6';

import {createElement} from '../ReactUtils.es6';
import chai from 'chai';

var expect = chai.expect;

initialize();

class UiButton extends Component {

    static DEFAULTS = {mode: 'primary', disabled:false};

    static TEMPLATE = (
        <button
            class=':(btn btn-(:mode))'
            disabled=':disabled'
            click=':click'
        >
            <i if=':icon' class=':(fa fa-(:icon))'></i>
            <block if=':caption'>:caption</block>
            <children/>
        </button>
    );

    click() {
        this.log('click')
    }
}

function stringifyComponentChildren(children) {
    if (!children || !children.length) return '';

    return children.filter(c=>c).map(c=>stringifyComponent(c)).join('');
}

function stringifyComponent(el) {
    let props =  el.props;

    if (typeof el.type ==='function') {

        const inst = new el.type(props,{});
        console.log(inst, inst.render);

        return stringifyComponent(inst.render());

    } else {

        const type =  el.type;

        const prefix = `${type} ${Object.keys(props).filter(k=>k!='children').map(k=>`${k}="${props[k]}"`).join(' ')}`;

        const str = (type !== 'input' && type !== 'img') ? `<${prefix}>${stringifyComponentChildren(props.children)}</${type}>` : `<${prefix}/>`;

        return str;
    }


}

const el = React.createElement(UiButton,{key:'11'});

const str = stringifyComponent(el);

console.log(str);

expect(el).be.an('object');
//
//describe('Instantiate', function () {
//
//    before(function(){
//
//    });
//
//    it('Serialize', function () {
//
//
//    });
//
//    it('Parse', function () {
//
//
//    });
//
//
//
//
//    after(function(){
//    });
//
//});