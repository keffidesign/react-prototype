import {createElement, render} from './ReactRenderUtils.es6';
import {Component} from 'react';

export default {

    internalConstructor(props, context) {

        this::Component(props, context);

        this.state = {...props};

        this.__render = this.render;

        this.render = render;

    },

    createElement,

    update(state) {

        this.setState(state);

    },

    componentWillUnmount() {

        this.done();

    },

    componentWillMount() {

        this.init();

    }

}