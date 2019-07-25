import queue, { OnRejection } from '../queue';

// TODO: make function version without decorators
// TODO: make the queue when init decorator have been applied, 
//    if method is called without init decorator at all, throw "you should apply init"
//    if method is called just before decorated init function, throw "you should call initialize function before any @method functions"
// TODO: unit tests
// TODO: think about reinitialization, how should it work?

const generateQueue = (name: string) => queue(
  `${name}-${Date.now()}-${Math.random()}`, 
  { 
    onIsQueueProcessing: (isProcessing: boolean) => {},
    onRejection: OnRejection.RejectAlways
  }
)

const initialComplete = () => {
  throw 'Call complete before initialization'
}

const generateInitialPromise = (target: any) => target.__queue(
  () => new Promise((resolve, reject) => {
    target.__complete = (ok: boolean) => {
      target.__init = ok;
      (ok ? resolve : reject)();
    }
  })
)

export const aiWithAsyncInit = <T extends {new(...args:any[]):{}}>(constructor:T) => {
  
  class Wrapper extends constructor {

    /**
      We should use unique keys for static fields, like this:
      ```
        const _queue = Symbol('queue');

        class Wrapper extends constructor {
          static [_queue] = ...
        }
      ```
      But TS crashes, see https://github.com/microsoft/TypeScript/issues/23736
    */

    static __queue = generateQueue('QUEUE');
    
    static __complete: () => void = initialComplete;

    static __init = false;

    static __initPromise = generateInitialPromise(Wrapper);

    static _ = Wrapper.__initPromise().catch(() => {});

    
    __queue = generateQueue('QUEUE-INSTANCE');
      
    __complete: () => void = initialComplete;
      
    __init = false;

    __initPromise = generateInitialPromise(this);

    constructor(...args: any[]) {
      super(...args);
      this.__initPromise().catch(() => {});
    }

  }
    
  return Wrapper;
}

export const aiInit = (target: any, key: string, value: any) => ({
  //@ts-ignore
  value: async function(...args: any[]): any {
    const isStatic = !(this.constructor as any).__initPromise;
    const object = this; // isStatic ? this : this.constructor;
    try {
      const result = value.initializer
        ? await value.initializer.apply(this)(...args)
        : await value.value.apply(this, args);
      (object as any).__complete(true);
      return result;
    } catch(error) {
      (object as any).__complete(false);
      throw error;
    }             
  }
})

export const aiMethod = (target: any, key: string, value: any) => ({
  //@ts-ignore
  value: async function(...args: any[]): any {
    const func = () => value.initializer
        ? value.initializer.apply(this)(...args)
        : value.value.apply(this, args);
    // Wrap up func to prevent rejection into queue because rejection of any one method must not block next methods!
    // But initializer must block queue!
    const wrapped = () => Promise
      .resolve(func())
      .then(result => ({ ok: true, result }))
      .catch(result => ({ ok: false, result }));
    const unwrap = ({ ok = true, result = undefined }) => ok
      ? Promise.resolve(result)
      : Promise.reject(result);      
    const isStatic = !(this.constructor as any).__initPromise;
    const object = this; // isStatic ? this : this.constructor;
    return (object as any).__init 
      ? await func() 
      : unwrap(await (object as any).__queue(wrapped)());
  }
})