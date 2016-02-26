import {event} from 'applugins';

const EXCEPTIONAL_NOUNS = {
    data: 'datum',
    children: 'child'
};

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * The base for all components.
 */
export default {

    //constructor() {
    //
    //    const _renderInternal = this.render;
    //
    //    this.render = () => this.prepareJsx(_renderInternal.call(this), this.state);
    //
    //}

    internalConstructor: function() {

        this._renderInternal = this.render;

        this.render = this.newRender;

        this.state = this.state || {};

    },

    newRender: function() {

        //console.log('render', this);

        const p = this.props;
        const st = this.state;
        let data = st.data;

        this.state.props = p;

        if (st.dataLoading) {

            return this.renderDataLoading();

        }

        return this.prepareJsx(this._renderInternal.call(this), this.state);

    },

    createElement: function(type, props, ...children) {

        return {type, props: props || {}, children};

    },

    prepareJsx: function({type, props, children}, state) {

        if (props.each) {

            const [scopeId, dataId] = this.resolveEach(props.each);

            const data = this.resolveData(dataId);

            if (!data) return null;

            return data.map(d => {

                state[scopeId] = d;

                return this.cloneElement(type, props, children, state);

            });

        }

        props = Object.keys(props).reduce((r,k) => (r[k] = this.resolveProp(k, props[k], state), r), {});

        if (props.if != undefined && state) {

            if (!props.if) {

                const ElseStatment = children.filter(({type}) => type === 'else').pop();

                if (ElseStatment) return this.prepareJsx(ElseStatment, state);

                return null;

            }

            children = children.filter(({type}) => type !== 'else');

        }

        return React.createElement(type, props, this.resolveChildren(children, state));

    },

    cloneElement: function(type, props, children, state) {

        props = this.resolveProps(props);

        return this.prepareJsx({type, props: { ...props}, children}, state);

    }
    ,
    resolveProps: function(props) {

        return Object.keys(props).reduce((r, p) => p !== 'each' ? (r[p] = this.resolvePlaceholders(props[p]), r) : r, {});

    }
    ,
    resolveChildren: function(children, state) {

        if (!children) return null;

        return children.map(c => (typeof c === 'string') ? this.resolvePlaceholders(c) : this.prepareJsx(c, state));

    }
    ,
    resolveProp: function(key, value, scope) {

        if (typeof value !== 'string') return value;

        value = value.trim();

        if (/^on[A-Z]/.test(key)) {

            return this[value] ? (...args) => this[value](...args) : () => this.event(this.resolvePlaceholders(value)).emit();

        }

        const selector = /(\w|[\[\]\(\)\,\.])+/g;

        const calls = value.match(selector);

        if (calls && calls.length === 1 && calls[0].length === value.length) {

            const result = this.resolveData(value, scope);

            //console.log('RESULT', key, value, result);

            return result != undefined ? result : value;

        }

        return value;

    }
    ,
    resolvePlaceholders: function(str) {

        if (!str || typeof str !== 'string') return str;

        /**
         * Select with #[<...>] placeholder
         */
        const selector = /#\[(\w|[\[\]\(\)\,\s\.])+\]/g;

        return str
            .trim()
            .replace(selector, p => this.resolveData(p.substring(2, p.length - 1)));

    }
    ,
    resolveData: function(path, scope) {


        //console.log('resolveData', path, scope, this.state, this);

        return path
            .split('.')
            .reduce((s, p) => {

                const value = this[`get${capitalize(p)}`] || s[`get${capitalize(p)}`] || this[p] || s[p];

                //console.log('resolveData', p, value, Object.keys(this));

                return (typeof value === 'function') ? value.call(this) : value;

            }, scope || this.state);

    }
    ,
    resolveEach: function(value) {

        let [scopeId, operator, dataId = scopeId] = value.split(' ');

        if (scopeId === dataId) {

            scopeId = scopeId.split('.').pop();

            scopeId = EXCEPTIONAL_NOUNS[scopeId] || scopeId.slice(0, -1);

        }

        return [scopeId, dataId];

    }
    ,
    resolveIfDirective: function({props, children}) {

        if (!this.resolveData(props.if)) {

            const elseStatement = children.filter(({type}) => type === 'else').pop();

            return elseStatement ? this.prepareJsx(elseStatement, state) : null;

        }

        children = children.filter(({type}) => type !== 'else');

    }
    ,
    ////render() {
    ////
    ////    console.log('DataDrivenComponent', this);
    //
    ////const p = this.props;
    ////const st = this.state;
    ////let data = st.data;
    ////
    ////if (st.error) {
    ////
    ////    return this.renderError(st.error);
    ////
    ////} else if (st.dataLoading) {
    ////
    ////    return this.renderDataLoading();
    ////
    ////} else if (!data || data.length === 0) {
    ////
    ////    return this.renderEmptyData();
    ////
    ////} else {
    ////
    ////    if (p.filter) {
    ////        data = data.filter(p.filter);
    ////    }
    ////
    ////    if (p.sort) {
    ////        data = data.sort(p.sort);
    ////    }
    ////
    ////    return this.renderWithData(data);
    ////
    ////}
    //
    ////}
    ////
    ////renderWithData(data) {
    ////
    ////    return this.callPropsHook('template', data, this.state, this.props);
    ////}
    ////
    ////renderError(error) {
    ////
    ////    return <ErrorView error={error}/>;
    ////}
    ////
    renderDataLoading() {

        const loadingView = {type: 'span', props: {}, children: ['Loading...']};

        return this.prepareJsx(loadingView, this.state);

        //return this.props.loadingView || <LoadingIndicator type={this.props.loadingIndicatorType}/>;

    }
    ,
    ////
    ////renderEmptyData() {
    ////
    ////    return this.props.emptyView || <div>{this.props.emptyDataMessage || `No data`}</div>;
    ////}
    ////
    componentWillMount: function() {

        (this.props.dataDependsOn || '').split(';').map(e => e.trim()).filter(e => e).forEach(
            (key) => this.addEventListener(key, (params, cb) => {
                this.reloadData();
                cb();
            })
        );

        if (!this.props.dataPreventInitialLoad) {

            this.reloadData();

        }

        //super.componentWillMount();

    }
    ,
    setData(data, extraState) {

        //if (!this.done()) {

            this.setState({data, ...extraState, dataChanged: (this.state.dataChanged || 0) + 1});

            this.dataChanged(data);

        //}

    }
    ,
    dataChanged(data) {

        this.callPropsHook('onDataChanged', data);

    }
    ,
    reloadData(key = this.props.dataFrom, payload = this.props.dataFromPayload || {}) {

        if (key) {

            const dataLoading = this.uniqueKey();

            this.setState({data: null, error: null, dataLoading});

            this.event(key).withData(payload).action((error, data) => {

                //this.log('data loaded', error, data, dataLoading, this.state.dataLoading);

                // !!! only the last sent emit is able to be applied.
                //if (dataLoading===this.state.dataLoading) {
                //this.log('data loaded', error, data);

                this.setData(data, {error, dataLoading: false});
                //}

            });
        }
    }
    ,
    ////////////////////////
    //// Routines
    ///////////////////////

    callPropsHook(key, ...args) {

        const cb = this.props[key];

        return cb && cb.apply(this, args) || null;

    }

}