const child_process = require('child_process');

module.exports = function spawn (...options) {
    // if (typeof options[1] === 'object') {
    //     options[1] = {
    //         ...options[1],
    //         stdio: ['pipe', 'pipe']
    //     }
    // }

    this.child = child_process.spawn(process.execPath, ...options);
    this.spawn = child_process.spawn;

    this.pass = function (data) {

        for (let key in data) {
            // this.child.stdio[0].write(new Buffer(`const ${key} = ${JSON.stringify(variable[key])}`));
            this.child.stdin.write(`let ${key} = ${JSON.stringify(data[key])}`);
        }

        return this;
    }

    this.node = function (func) {
        const funcStr = func.toString();

        this.child.stdin.write(`
            process.stdout.write(JSON.stringify({
                status: 'sync', 
                result: (()=>{
                    const resolve = (asyncFunc) => 
                        {process.stdout.write(JSON.stringify({status: 'async', result: asyncFunc}));}
                    return (${funcStr})();
                })()
            }));
        `);
        this.child.stdin.end();

        return this;
    }

    this.back = function (callback) {
        const jsonStringBeforePattern = /\{/g;
        const jsonStringAfterPattern = /\}/g;
        let jsonStringBeforeCount = 0;
        let jsonStringAfterCount = 0;
        let dataStrRet = '';

        this.child.stdout.on('data', function (data) {
            const dataStr = data.toString()
            dataStrRet += dataStr;

            jsonStringBeforeCount += (dataStr.match(jsonStringBeforePattern) || []).length;
            jsonStringAfterCount += (dataStr.match(jsonStringAfterPattern) || []).length;

            // 組成階段當符合完整 Object 時傳回
            if (jsonStringBeforeCount && jsonStringAfterCount &&
                jsonStringBeforeCount === jsonStringAfterCount) {

                dataStrRet
                    .replace(/\}(?=\{)/g, '}&') // 不支援反找 .split(/(?<=\})(?=\{)/) 的替代做法
                    .split(/&/)
                    .map((curJsonDataStr) => {
                        if (curJsonDataStr) {
                            const JSONdata = JSON.parse(curJsonDataStr);
                            callback(JSONdata.status, JSONdata.result);
                        } else {
                            callback('error', curJsonDataStr);
                        }
                    });

                dataStrRet = '';
                jsonStringBeforeCount = 0;
                jsonStringAfterCount = 0;
            }
        });

        // this.child.stdout.on('close', function () {
        //     // console.log('close');
        //     // const JSONdata = JSON.parse(dataStrRet);
        //     // callback(JSONdata.status, JSONdata.result);
        // });

        return this;
    }

    this.stderr = function (callback) {
        this.child.stderr.on('data', callback);

        return this;
    }

    this.close = function (callback) {
        this.child.on('close', callback);

        return this;
    }
}