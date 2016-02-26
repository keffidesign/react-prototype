import {Component as ReactComponent} from 'react';
export {Table, List, Button, Input, Dropdown, Checkbox, NavBar, Article, Footer, Form} from 'reangulact';

import {BaseComponent as _BaseComponent} from 'reangulact';
import ReactPrototype from './src/ReactPrototype';

Object.assign(_BaseComponent.prototype, ReactComponent.prototype, ReactPrototype, {constructor: ReactComponent});

export const BaseComponent = _BaseComponent;