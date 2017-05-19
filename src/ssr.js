import {
    isFn,
    extend,
    isStateless,
    getContext
} from './util'
import {
    rnumber,
    cssNumber
} from './style'
import {
    isEventName
} from './event'
var React = global.React

var Component = React.Component

function renderVNode(vnode, context) {
    var {type, props} = vnode

    switch (type) {
        case '#text':
            return encodeEntities(vnode.text)
        case '#comment':
            return '<!--' + vnode.text + '-->'
        default:
            if (typeof type === 'string') {
                var arr = [], html
                for (var i in props) {
                    for (var i in props) {

                        if (i === 'children' || i === 'ref' || i === 'key' || isEventName(i))
                            continue
                        var v = props[i]
                        if (name === 'dangerouslySetInnerHTML') {
                            html = v && v.__html;
                            continue
                        }
                        if (name === 'className') {
                            name = 'class';
                        }
                        if (name === 'class' && v && typeof v === 'object') {
                            v = hashToClassName(v);
                        } else if (name === 'style' && v && typeof v === 'object') {
                            v = styleObjToCss(v);
                        }
                        if (skipFalseAndFunction(val)) {
                            arr.push(i + '=' + encodeAttributes(v + ''))
                        }
                    }
                    arr = arr.length ? ' ' + arr.join(' ') : ''

                }
                var str = '<' + type + arr
                if (voidTags[type]) {
                    return str + '/>\n'
                }
                str += '>'
                if (html) {
                    str += html
                } else {
                    str +=  props.children.map(
                        el => (el ? renderVNode(el, context) : '')
                    ).join('')
                }
                return str + '</' + type + '>\n'

            } else if (typeof (type) === 'function') {
                vnode = toVnode(vnode, context)
                return renderVNode(vnode, vnode.context || context)
            } else {
                throw '数据不合法'
            }
    }
}

function hashToClassName() {
    var arr = []
    for (var i in obj) {
        if (obj[i]) {
            arr.push(i)
        }
    }
    return arr.join(' ')
}



const voidTags = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];

function skipFalseAndFunction(a) {
    return a !== false && (Object(a) !== a)
}

function styleObjToCss(obj) {
    var arr = []
    for (var i in obj) {
        var val = obj[i]
        if (obj != null) {
            var unit = ''
            if (rnumber.test(val) && !cssNumber[name]) {
                unit = 'px'
            }
            arr.push(i.toLowerCase() + ': ' + val + unit)
        }
    }
    return arr.join('; ')

}




//===============重新实现transaction＝＝＝＝＝＝＝＝＝＝＝
function setStateWarn() {}
var transaction = {
    renderWithoutSetState: function (instance, nextProps, context) {
        instance.setState = instance.forceUpdate = setStateWarn
        try {
            var vnode = instance.render(nextProps, context)
            if (vnode === null) {
                vnode = {
                    type: '#comment',
                    text: 'empty'
                };
            }
        } finally {
            delete instance.setState
            delete instance.forceUpdate

        }
        return vnode
    }
}


function toVnode(vnode, context, parentInstance) {

    var Type = vnode.type,
        instance, rendered

    if (typeof (Type) === 'function') {
        var props = vnode.props
        if (isStateless(Type)) {
            //处理无状态组件
            instance = new Component(null, context)
            instance.render = instance.statelessRender = Type
            rendered = transaction.renderWithoutSetState(instance, props, context)

        } else {

            //处理普通组件
            var defaultProps = Type.defaultProps || (instance && instance.getDefaultProps && instance.getDefaultProps())
            props = extend({}, props) //注意，上面传下来的props已经被冻结，无法修改，需要先复制一份
            for (var i in defaultProps) {
                if (props[i] === void 666) {
                    props[i] = defaultProps[i]
                }
            }
            instance = new Type(props, context)

            //必须在这里添加vnode，因为willComponent里可能进行setState操作
            Component.call(instance, props, context) //重点！！
            instance.componentWillMount && instance.componentWillMount()

            rendered = transaction.renderWithoutSetState(instance)

        }
        instance._rendered = rendered

        vnode._instance = instance

        if (parentInstance) {
            instance.parentInstance = parentInstance
        } else {
            instance.vnode = vnode
        }

        //<App />下面存在<A ref="a"/>那么AppInstance.refs.a = AInstance
        //  patchRef(vnode._owner, vnode.props.ref, instance)

        if (instance.getChildContext) {
            context = rendered.context = getContext(instance, context) //将context往下传
        }
        return toVnode(rendered, context, instance)
    } else {

        vnode.context = context
        return vnode
    }
}
//==================实现序列化文本节点与属性值的相关方法=============

var matchHtmlRegExp = /["'&<>]/;

function escapeHtml(string) {
    var str = '' + string;
    var match = matchHtmlRegExp.exec(str);

    if (!match) {
        return str;
    }

    var escape;
    var html = '';
    var index = 0;
    var lastIndex = 0;

    for (index = match.index; index < str.length; index++) {
        switch (str.charCodeAt(index)) {
            case 34:
                // "
                escape = '&quot;';
                break;
            case 38:
                // &
                escape = '&amp;';
                break;
            case 39:
                // '
                escape = '&#x27;'; // modified from escape-html; used to be '&#39'
                break;
            case 60:
                // <
                escape = '&lt;';
                break;
            case 62:
                // >
                escape = '&gt;';
                break;
            default:
                continue;
        }

        if (lastIndex !== index) {
            html += str.substring(lastIndex, index);
        }

        lastIndex = index + 1;
        html += escape;
    }

    return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
}

function encodeEntities(text) {
    if (typeof text === 'boolean' || typeof text === 'number') {
        return '' + text;
    }
    return escapeHtml(text);
}


function encodeAttributes(value) {
    return '"' + encodeEntities(value) + '"';
}


function renderToString(vnode, context) {

    return renderVNode(vnode, context || {})
}
export default {
    renderToString
}