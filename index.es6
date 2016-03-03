
import {BaseComponent as _BaseComponent} from 'reangulact';
import ReactPrototype from './src/ReactPrototype';
import {Component} from 'react';

Object.assign(_BaseComponent.prototype, Component.prototype, ReactPrototype);

export const BaseComponent = _BaseComponent ;