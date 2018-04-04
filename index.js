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
        const replaceFuncStr = funcStr.replace(/(?:resolve\((.+)\))/g,
            'process.stdout.write(JSON.stringify({mode: \'async\', result: $1}))');

        this.child.stdin.write(`
            process.stdout.write(JSON.stringify({
                mode: 'sync', 
                result: (${replaceFuncStr})()
            }));
        `);
        this.child.stdin.end();

        return this;
    }

    this.back = function (callback) {
        let isJsonStringBefore = false;
        let isJsonStringAfter = false;
        let dataStrRet = '';

        this.child.stdout.on('data', function (data) {
            const dataStr = data.toString()
            dataStrRet += dataStr;

            if (dataStr.includes('{')) {
                isJsonStringBefore = true;
            }
            if (dataStr.includes('}')) {
                isJsonStringAfter = true;
            }

            // 組成階段當符合完整 Object 時傳回
            if (isJsonStringBefore && isJsonStringAfter) {
                const pattern = /\{(?:\"\w+\"\:[^\{\}]+(\,|\B))+\}/g;

                dataStrRet
                    .match(pattern)
                    .map((curJsonDataStr) => {
                        if (curJsonDataStr) {
                            const JSONdata = JSON.parse(curJsonDataStr);
                            callback(JSONdata.mode, JSONdata.result);
                        }
                    });

                dataStrRet = dataStrRet.replace(pattern, '');

                isJsonStringBefore = dataStrRet.includes('{');
                isJsonStringAfter = dataStrRet.includes('}');
            }
        });

        // this.child.stdout.on('close', function () {
        //     // console.log('close');
        //     // const JSONdata = JSON.parse(dataStrRet);
        //     // callback(JSONdata.mode, JSONdata.result);
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