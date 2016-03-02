export {Table, List, Button, Input, Dropdown, Checkbox, NavBar, Article, Footer, Form} from 'reangulact';

import {BaseComponent as _BaseComponent} from 'reangulact';
import ReactPrototype from './src/ReactPrototype';
import {jsx as _jsx} from './src/ReactRenderUtils.es6';
import {Component} from 'react';

Object.assign(_BaseComponent.prototype, Component.prototype, ReactPrototype);


export const jsx = _jsx ;

export const BaseComponent = _BaseComponent ;