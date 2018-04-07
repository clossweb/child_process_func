const child = require('./index.js');

const longArr = new Array(999999).fill({i: -1}).map((v, index) => {
    v.i = index;
    return v;
});

const child_1 = () => new child()
    .pass({
        longArr
    })
    .node(() => {
        setTimeout(() => {
            resolve(longArr);
        }, 1000);

        setTimeout(() => {
            resolve(new Array(99999).fill({
                i: -1,
                test: {data: -1}
            }).map((v, index) => {
                v.i = index;
                v.test.data = index;
                return v;
            }));
        }, 5000);

        return 'child process - 1'
    })
    .back((status, data) => {
        if (status === 'async') {
            console.log(status, data.length);
        } else {
            console.log(status, data);
        }
    })
    .close(() => {
        console.log('child process - 1 done');
    })
    .stderr((err) => {
        console.log(err.toString());
    });

const child_2 = () => new child()
    .pass({
        longArr
    })
    .node(() => {
        setInterval(() => {
            resolve({
                dateVal: new Date().valueOf()
            });
        }, 1000);

        return 'child process - 2'
    })
    .back((status, data) => {
        if (status === 'async') {
            console.log(new Date(data.dateVal).toString());
            if (new Date(data.dateVal).getSeconds() === 30) {
                child_1();
            }
        } else {
            console.log(data);
        }
    })
    .close(() => {
        console.log('child process - 2 done');
    })
    .stderr((err) => {
        console.log(err.toString());
    });


child_1();
child_2();