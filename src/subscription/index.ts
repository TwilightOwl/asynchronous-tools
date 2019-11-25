const _handlers: { [k: string]: Function[] } = {};
type SubscribeEvent = string;

export const subscribe = (event: SubscribeEvent, handler: Function) => {
  const queue = _handlers[event] || (_handlers[event] = []);
  queue.push(handler);
  let isSubscribed = true;
  return () => {
    if (!isSubscribed) return;
    const index = queue.indexOf(handler);
    if (~index) queue.splice(index, 1);
    isSubscribed = false;
  }
}

export const invokeHandlers = (event: SubscribeEvent, ...args: any[]) => {
  // сделал здесь новый массив, т.к. при двух хэндлерах с одним ивентом, если первый отпишет себя то в _handlers[event] собъются индексы и второй хэндлер не вызовется
  const handlers = [...(_handlers[event] || [])];
  //TODO: make it configurable, wait for async result
  handlers.forEach(handler => handler(...args));
}