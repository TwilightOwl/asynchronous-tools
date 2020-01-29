import getQueue from "../queue";
interface ProduceParams {
    id?: string | number,
    type?: string
}

// interface ProduceResult {
//     init: Function,
//     action: Function,
//     finalize: Function
// }

enum State {
    NotInitialized,
    Initialized,
    Finalized
}

interface Closure {
    state: State,
    queueIsProcessing: boolean,
    resolve?: Function,
    actionOrFinalizeAreCalled: boolean,
    enabled: boolean
}

export const produce = (params: ProduceParams = {}) => {
    const { id = undefined, type = undefined } = params;
    // по id возвращать те же самые функции не лучший вариант, плюс что можно из разных мест получить те же функцтт по id, но минус что в одном и том же месте кода придется генерить уникальный id когда нужн действительно новые обертки
    const closure: Closure = {
        state: State.NotInitialized,
        queueIsProcessing: false,
        actionOrFinalizeAreCalled: false,
        enabled: false
    };
    const queue = getQueue(`${Date.now()}-${Math.random()}`, {
        onIsQueueProcessing: (isProcessing: boolean) => closure.queueIsProcessing = isProcessing
    });
    const launchInitPromise = queue(() => new Promise(resolve => {
        closure.resolve = () => {
            closure.enabled = true;
            resolve();
            // workaround for right behavior: when init is not promise subsequent action or finalize shouldn't be promise (if original function is not promise too)
            if (!closure.actionOrFinalizeAreCalled) {
                closure.queueIsProcessing = false;
            }
        }
    }));
    launchInitPromise();
    const init = <A extends unknown[], S, P, R extends S | Promise<P>>(original: (...args: A) => R): (...args: A) => R => {
        return (...args: A) => {
            //TODO: think about different strategies
            if (!closure.resolve) throw 'TODO: Redundant call init function!'; // maybe it's waste case because of closure.enabled state more usefull
            if (closure.enabled) {
                throw 'TODO: Cannot call init on already enabled state'
            }
            const result = original(...args);
            return result instanceof Promise 
                ? result.then(data => (closure.resolve!(), data)) as R
                : (closure.resolve!(), result)
            // closure.resolve();
            // return result;
        }
    };
    //TODO: make it configurable - action can be waiting for previous action or it can be run concurrently
    //const action = <A extends unknown[], S, P>(original: (...args: A) => S | Promise<P>): (...args: A) => (S | Promise<P>) => {
    const action = <A extends unknown[], R>(original: (...args: A) => R): ((...args: A) => R extends Promise<any> ? R : R | Promise<R>) => {
        return (...args: A) => {
            const func = (...args: A) => {
                if (closure.enabled) {
                    return original(...args)
                } else {
                    console.log('Disabled!')
                    throw 'TODO: Disabled!'
                }
            }
            closure.actionOrFinalizeAreCalled = true;
            //TODO: Don't use queue! Actions have to wait for init promise (or not promise) and don't have to wait for each other (concurrent)
            //  Any queueing among action (any complex queueing logic) can be done outside this tool!
            
            return (closure.queueIsProcessing ? queue(func)(...args) : func(...args)) as R extends Promise<any> ? R : R | Promise<R>            
        }
    };
    //TODO: make configurable - can actions called after finalization be waiting fo other initialization or they should be rejected
    //const finalize = <A extends unknown[], R>(original: (...args: A) => R): (...args: A) => (R | Promise<R>) => {
    const finalize = <A extends unknown[], R>(original: (...args: A) => R): ((...args: A) => R extends Promise<any> ? R : R | Promise<R>) => {
        return (...args: A) => {
            // if (!closure.enabled) {
            //     throw 'TODO: Cannot call finalize on disabled state'
            // }
            // closure.enabled = false;
            closure.actionOrFinalizeAreCalled = true;

            const func = (...args: A) => {
                if (closure.enabled) {
                    closure.enabled = false;
                    return original(...args)
                } else {
                    console.log('Cannot call finalize on disabled state!')
                    throw 'TODO: Cannot call finalize on disabled state!'
                }
            }

            return (closure.queueIsProcessing ? queue(func)(...args) : func(...args)) as R extends Promise<any> ? R : R | Promise<R>
        }
    };
    return { init, action, finalize }
}

const show = (maybePromise: Promise<string> | string) => maybePromise instanceof Promise 
    ? maybePromise.then(console.log).catch(console.error) 
    : console.log(maybePromise, ' - pure');
const { init, action, finalize } = produce();

const i = init((x: number, y: string) => `${x} ${y}`);
const a = action((x: number, y: string) => `${x}-${y}`);
const a2 = action((x: number, y: string) => `${x}+${y}`);
const f = finalize((x: number, y: string) => `${x} final ${y}`);

show(i(1,'1'));
(new Promise(resolve => setTimeout(resolve, 0))).then(() => console.log('pause'))
show(a(2,'2'));

// show(a(3,'3'))
// show(a2(4,'4'))
// show(a(5,'5'))
// setTimeout(() => {
//     show(a2(7,'7'))
//     show(f(10, '10'))
//     show(a2(6,'6'))
// }, 1000)

// const pause = (timeout = 100) => new Promise(resolve => setTimeout(resolve, timeout))
// const I = init(async (x: number, y: string) => console.log(`${x} ${y}`));
// const A = action(async (x: number, y: string) => console.log(`${x}-${y}`));
// const A2 = action(async (x: number, y: string) => console.log(`${x}+${y}`));

// //@ts-ignore
// I(1,'1').then(async x => (await pause(1000), console.log('after init')));
// //@ts-ignore
// A(2,'2').then(x => console.log('after A'));
// //@ts-ignore
// A2(3,'3').then(x => console.log('after A2'));