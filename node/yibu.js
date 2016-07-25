//  js 怎么能做到方法的注入？
//  就像java 使用代理来实现修改方法
//
//  解决什么时候回调完,

var _ = require('lodash');

const EventEmitter = require('events');

var default_options = {
    type: 'counting' // counting,event
};

function Waiter(name, options) {
    this.name = name;
    // 是否完成了的标志
    this.hasDone = false;
    this.options = _.assignIn(default_options || options);
}

/**
 * do 和 done 是一对方法
 * @return {[type]} [description]
 */
Waiter.prototype.do = function() {

};

Waiter.prototype.done = function() {
    this.do();
};

/**
 * 有时需要指明等待的数量,这个计算起来也是有些麻烦的
 * 还有一种情况是 持续的增加的,并不是一开始就会知道需要等待多少，
 * 这种情况怎么确定什么时候是没有了？
 *
 * 持续增加的 当已经知道了没有了之后，需要发送一个已经全部生产完毕的事件
 * 然后在此事件的监听中处理全部完成的回调
 *
 * 但如果就是使用事件的形式 那么这个跟自定义一个事件有什么区别,特点在哪里
 *
 * 不能使用 instanceof Number 来判断一个值是不是数字
 *
 * @param  {[type]}   options  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Waiter.prototype.waitingFor = function(options, callback) {
    this.waitingOptions = options;
    this.waitingCallback = callback;

    if (isNaN(options)) {
        // 非数字
        this.waitingType = 'Array';
    } else {
        // 是数字
        this.waitingType = 'Number';
        if( options === 0) {
            this.someDone();
        }
    }

    // if (options instanceof Array) {
    //     // 事件名数组
    //     this.waitingType = 'Array';
    // } else if (options instanceof Number) {
    //     // 处理次数
    //     this.waitingType = 'Number';
    // } else if (options === 0) {
    //     this.waitingType = 'Number';
    //     this.someDone();
    // }
};

var temp = 0;

/**
 * 参数可以传递名字，表示某事件处理完了，如果没有参数,表示完成了一次
 *
 * 要想等待方法能够被调用,次数需要被完全的消费掉,否则回调永远不会被调用了
 *
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
Waiter.prototype.someDone = function(name) {

    if (this.hasDone) {
        // 已经处理完的不在给予处理
        console.log('hasDone');
        return;
    }

    switch (this.waitingType) {
        case 'Array':
            let index = this.waitingOptions.indexOf(name);
            // 删除掉指定的元素
            this.waitingOptions.splice(index, 0);
            if (this.waitingOptions.length === 0) {
                this.hasDone = true;
                this.waitingCallback();
            }
            break;
        case 'Number':

            if (this.waitingOptions === 0) {
                this.hasDone = true;
                this.waitingCallback();
            } else {
                this.waitingOptions--;

                if (this.waitingOptions === 0) {
                    this.hasDone = true;
                    this.waitingCallback();
                }
            }

            break;
        default:
    }
};

exports.Waiter = Waiter;
