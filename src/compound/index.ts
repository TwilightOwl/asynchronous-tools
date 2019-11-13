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
    resolve?: Function
}

export const produce = (params: ProduceParams = {}) => {
    const { id = undefined, type = undefined } = params;
    // по id возвращать те же самые функции не лучший вариант, плюс что можно из разных мест получить те же функцтт по id, но минус что в одном и том же месте кода придется генерить уникальный id когда нужн действительно новые обертки
    const closure: Closure = {
        state: State.NotInitialized,
        queueIsProcessing: false
    };
    const queue = getQueue(`${Date.now()}-${Math.random()}`, {
        onIsQueueProcessing: (isProcessing: boolean) => closure.queueIsProcessing = isProcessing
    });
    const launchInitPromise = queue(() => new Promise(resolve => {
        closure.resolve = resolve
    }));
    launchInitPromise();
    const init = <A extends unknown[], R>(original: (...args: A) => R): (...args: A) => Promise<R> => {
        return async (...args: A) => {
            //TODO: think about different strategies
            if (!closure.resolve) throw 'TODO: Redundant call init function!';
            const result = await original(...args);
            closure.resolve();
            return result;
        }
    };
    const action = <A extends unknown[], R>(original: (...args: A) => R): (...args: A) => (R | Promise<R>) => {
        return (...args: A) => {
            return closure.queueIsProcessing ? queue(original)(...args) as Promise<R> : original(...args)
        }
    };
    //TODO:
    const finalize = action;
    return { init, action, finalize }
}


const { init, action, finalize } = produce();

const i = init((x: number, y: string) => `${x}-${y}`);
const a = action((x: number, y: string) => `${x}-${y}`);
const a2 = action(() => ``);

const s = i(4,4);
a(3,3)