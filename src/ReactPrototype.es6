import {prepareJsx} from './ReactRenderUtils.es6';
import {Component} from 'react';

export default {

    internalConstructor(props, context) {

        this::Component(props, context);

        this.state = {...props};

        const __render = this.render;

        this.render = () => this::prepareJsx(this::__render());
    },

    createElement(type, props, ...children){

        return {type, props: props || {}, children}
    },

    update(state) {

        this.setState(state);
    },

    componentWillUnmount() {

        this.done();
    },

    componentWillMount() {

        this.init();
    }
};