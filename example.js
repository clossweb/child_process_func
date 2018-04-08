const child = require('./index.js');

const longArr = new Array(999999).fill({i: -1}).map((v, index) => {
    v.i = index;
    return v;
});


// console.log((()=>{
//     for (let i = 0; i < 9999999999; i++) {
//
//     }
//
//     return 'for loop 1 ok'
// })());
//
// console.log((()=>{
//     for (let i = 0; i < 9999999999; i++) {
//
//     }
//
//     return 'for loop 2 ok'
// })());

const child_1 = () => new child()
    .pass({
        longArr
    })
    .node(() => {

        setTimeout(()=>{
            resolve('async setTimeout 1 ok');
        }, 1000);

        for (let i = 0; i < 9999999999; i++) {

        }

        return 'for loop 1 ok'
    })
    .back((status, data) => {
        console.log(data);
    })
    .close(() => {
        console.log('child process - 1 done');
    })
    .stderr((err) => {
        console.log(err.toString());
    });


const child_2 = () => new child()
    .node(() => {
        for (let i = 0; i < 9999999999; i++) {

        }

        return 'for loop 2 ok'
    })
    .back((status, data) => {
        console.log(data);
    })
    .close(() => {
        console.log('child process - 2 done');
    })
    .stderr((err) => {
        console.log(err.toString());
    });


child_1();
child_2();