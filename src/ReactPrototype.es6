import {createElement} from './ReactRenderUtils.es6';
import {Component} from 'react';

export default {

    internalConstructor(props, context) {

        this::Component(props, context);

        this.state = { ...this.initialState(), ...props};

        const jsx = this.render();

        this.render = () => createElement.apply(this, jsx);
    },

    setState(newState, cb) {

        Component.prototype.setState.call(this, newState, cb);
    },
    componentWillUnmount() {

        this.done();
    },

    componentWillMount() {

        this.init();
    }
};