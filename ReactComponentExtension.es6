//import {Component as ReactComponent} from 'react';
import {createElement} from './ReactUtils.es6';

export default {

    constructor: React.Component,

    internalConstructor(props, context) {

        this::React.Component(props, context);

        this.state = this.getDefaults(props);

        const jsx = this.render();

        this.render = () => createElement.apply(this, jsx);
    },

    setState(newState, cb) {

        React.Component.prototype.setState.call(this, newState, cb);
    },

    componentWillReceiveProps(newProps) {

        if (!newProps.children){
            this.update(newProps);
        }

    },

    componentDidMount() {

        this.init();
    },

    componentWillUnmount() {

        this.done();
    }
}