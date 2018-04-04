const child = require('./index.js');

const handleResult = (mode, data) => {
    if (mode === 'async') {
        console.log(mode, data.length);
    } else {
        console.log(mode, data);
    }
}
const longArr = new Array(999999).fill(null).map((v, index) => index);

new child()
    .pass({
        longArr
    })
    .node(() => {
        setTimeout(() => {
            resolve(longArr);
        }, 1000);

        setTimeout(() => {
            resolve(new Array(99999).fill(null).map((v, index) => index));
        }, 5000);

        return 'ok'
    })
    .back(handleResult)
    .close(() => {
        console.log('close');
    })
    .stderr((err) => {
        console.log(err.toString());
    });

