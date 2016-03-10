import {Component} from 'reangulact';
import {Component as ReactComponent} from 'react';
import {createElement} from './Utils.es6';

/**
 * Make Reangulact Component being based on React.
 */
export function initialize() {

    Object.assign(Component.prototype, ReactComponent.prototype, {

        internalConstructor(props, context) {

            this::ReactComponent(props, context);

            this.state = { ...this.getDefaults(), ...props};

            const jsx = this.render();

            this.render = () => createElement.apply(this, jsx);
        },

        componentDidMount() {

            this.init();
        },

        componentWillUnmount() {

            this.done();
        }
    });
}