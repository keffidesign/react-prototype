import {Component as ReactComponent} from 'react';
import {createElement} from './ReactUtils.es6';

export default {

    constructor: ReactComponent,

    internalConstructor(props, context) {

        this::ReactComponent(props, context);

        this.state = this.getDefaults(props);

        const jsx = this.render();

        this.render = () => createElement.apply(this, jsx);
    },

    setState(newState, cb) {

        ReactComponent.prototype.setState.call(this, newState, cb);
    },

    componentWillReceiveProps(newProps) {

        this.update(newProps);
    },

    componentDidMount() {

        this.init();
    },

    componentWillUnmount() {

        this.done();
    }
}