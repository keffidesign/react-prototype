import {Component as ReactComponent} from 'react';
export {Table, List, Button, Input, Dropdown, Checkbox, NavBar, Article, Footer, Form} from 'reangulact';

import {BaseComponent as _BaseComponent} from 'reangulact';
import ReactPrototype from './src/ReactPrototype';


Object.assign(_BaseComponent.prototype, ReactComponent.prototype, ReactPrototype);

_BaseComponent.prototype.constructor = ReactComponent;

_BaseComponent.prototype.internalConstructor = function() {

    this._renderInternal = this.render;

    this.render = ReactPrototype.render;

    this.state = this.state || {};

};

export const BaseComponent = _BaseComponent;