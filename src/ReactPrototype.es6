import {prepareJsx} from './ReactRenderUtils.es6';
import {Component} from 'react';

export default {

    internalConstructor(props, context) {

        this::Component(props, context);

        this.state = this.initialState(props);

        const jsx = this.render();

        this.render = () => this::prepareJsx(jsx);
    },

    initialState(props){

        return {...props}
    },

    componentWillUnmount() {

        this.done();
    },

    componentWillMount() {

        this.init();
    }
};