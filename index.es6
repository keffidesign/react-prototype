import {Component} from 'reangulact';
import {Component as ReactComponent} from 'react';
import Ext from './ReactComponentExtension.es6';

/**
 * Make Reangulact Component being based on React.
 */
export function initialize() {

    Object.assign(Component.prototype, ReactComponent.prototype, Ext);
}