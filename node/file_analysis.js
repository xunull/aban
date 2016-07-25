var fs = require('fs');
var readline = require('readline');
var path = require('path');
var yaml = require('js-yaml');

const Waiter = require('./yibu').Waiter;

var _tree = new Map();
var extensionCnt = new Map();
var extensionLineCnt = new Map();

var config = yaml.safeLoad(fs.readFileSync('config.yaml'));

let waiter = new Waiter();

config.extensions.forEach(function(value) {
    extensionCnt.set(value, 0);
    extensionLineCnt.set(value, 0);

});

// console.log(config);

/**
 * 此方法是同步方法(不完全是异步方法),这个方法要是都是异步执行就不知道什么时候能执行完了
 * @param  {[type]}  _path [description]
 * @param  {[type]}  tree  =             _tree [description]
 * @return {Boolean}       [description]
 */
function analysisSync(_path, tree = _tree) {
    var files = fs.readdirSync(_path);
    for (var file of files) {
        var stats = fs.statSync(path.join(_path, file));
        if (stats.isFile()) {
            tree.set(file, null);
            analysis_extension(path.join(_path, file));
        } else if (stats.isDirectory()) {
            if (config.excludeDirs.includes(file)) {

            } else if (file.startsWith('.')) {
                // 属于排除的,不扫描的目录
            } else {
                tree.set(file, new Map());

                analysisSync(path.join(_path, file), tree.get(file));
            }
        }
    }

    if (tree == _tree) {
        console.log(extensionCnt);
    }

}

let fileSum = 0;
let dirSum = 0;

function countNumSync(_path,rank=0) {
    var files = fs.readdirSync(_path);
    for (var file of files) {
        var stats = fs.statSync(path.join(_path, file));
        if (stats.isFile()) {
            fileSum++;
        } else if (stats.isDirectory()) {
            if (config.excludeDirs.includes(file)) {
                // 属于排除的,不扫描的目录
            } else if (file.startsWith('.')) {
                // 属于排除的,不扫描的目录
            } else {
                dirSum++;
                countNumSync(path.join(_path, file),rank+1);
            }
        }
    }

    if (rank === 0) {
        console.log('文件的数量为 ',fileSum);
        console.log('文件夹的数量为 ',dirSum);
    }
}

// 统计文件夹,文件的数量
// 还是同样的问题,什么时候知道遍历完了 , 同步的方法会知道什么时候调用完了
function countNum() {
    fs.readdir(_path, function(err, files) {
        if (err) {
            console.log(err);
            console.log('读取文件夹 ', path, ' 出错');
        } else {
            for (var file of files) {
                fs.stat(path.join(_path, file), function(err, stats) {
                    if (stats.isFile()) {
                        fileSum++;
                    } else if (stats.isDirectory()) {
                        if (config.excludeDirs.includes(file)) {
                            // 属于排除的,不扫描的目录
                        } else if (file.startsWith('.')) {
                            // 属于排除的,不扫描的目录
                        } else {
                            dirSum++;
                            analysis(path.join(_path, file), tree.get(file));
                        }
                    }
                });
            }
            console.log(files);
        }
    });
}

/**
 * 此方法是异步方法
 *
 * 一个问题,遍历树形结构的时候,什么时候知道遍历完了
 *
 * @param  {[type]}  _path [description]
 * @param  {[type]}  tree  =             _tree [description]
 * @return {Boolean}       [description]
 */
function analysis(_path, tree = _tree) {

    fs.readdir(_path, function(err, files) {
        if (err) {
            console.log(err);
            console.log('读取文件夹 ', path, ' 出错');
        } else {
            for (var file of files) {
                fs.stat(path.join(_path, file), function(err, stats) {
                    if (stats.isFile()) {
                        tree.set(file, null);
                        analysis_extension(path.join(_path, file));
                    } else if (stats.isDirectory()) {
                        if (config.excludeDirs.includes(file)) {
                            // 属于排除的,不扫描的目录
                        } else if (file.startsWith('.')) {
                            // 属于排除的,不扫描的目录
                        } else {
                            tree.set(file, new Map());
                            // 递归调用
                            analysis(path.join(_path, file), tree.get(file));
                        }
                    }
                });
            }
            console.log(files);
        }
    });
    if (tree == _tree) {
        console.log(extensionCnt);
        //console.log(extensionLineCnt);

    }

}

/**
 * 方法中有异步部分
 * @param  {[type]}  filename [description]
 * @param  {[type]}  extname  [description]
 * @return {Boolean}          [description]
 */
function analysis_line(filename, extname) {
    var data = fs.readFileSync(filename);
    data = data.toString();

    var rl = readline.createInterface({
        input: fs.createReadStream(filename)
    });
    var count = 0;

    // 这个地方是异步的

    rl.on('line', (line) => {
        count++;
    });

    rl.on('close', function() {
        extensionLineCnt.set(extname, extensionLineCnt.get(extname) + count);
    });

}


function analysis_extension(filename) {
    var extname = path.extname(filename);
    if (extname !== '' && config.extensions.includes(extname)) {
        extensionCnt.set(extname, extensionCnt.get(extname) + 1);
        analysis_line(filename, extname);
    }
}

exports.analysis = analysis;
exports.analysisSync = analysisSync;
exports.countNumSync = countNumSync;
