import queue, { OnRejection } from '.'

const pause = (timeout = 100) => new Promise(resolve => setTimeout(resolve, timeout))
const resolve = (value: number) => () => value
const reject = (value: number) => () => { throw `Error: ${value}` }
const getUniqueID = () => `${Date.now()}-${Math.random()}`



test('the last function call actually waits for all previous function calls', async () => {
  const results: number[] = []
  const id = getUniqueID()
  const testQueue = queue(id)

  const queuedFunc1 = testQueue(resolve(1), 'F_1')
  const queuedFunc2 = testQueue(resolve(2), 'F_2')
  const queuedFunc3 = testQueue(resolve(3), 'F_3')

  //@ts-ignore
  queuedFunc1().then(x => results.push(x))
  //@ts-ignore
  queuedFunc2().then(x => results.push(x))
  //@ts-ignore
  results.push(await queuedFunc3())

  expect(results).toEqual([1, 2, 3]);
});

test('wrapped function can be called several times obviously', async () => {
  const results: number[] = []
  const id = getUniqueID()
  const testQueue = queue(id)

  const queuedFunc1 = testQueue(resolve(1), 'F_1')
  const queuedFunc2 = testQueue(resolve(2), 'F_2')

  //@ts-ignore
  queuedFunc1().then(x => results.push(x))
  //@ts-ignore
  queuedFunc2().then(x => results.push(x))
  //@ts-ignore
  results.push(await queuedFunc1())

  expect(results).toEqual([1, 2, 1]);
});

test('onIsQueueProcessing handler', async () => {
  const results: (number | boolean)[] = []
  const id = getUniqueID()
  const testQueue = queue(id, {
    onIsQueueProcessing: (isProcessing: boolean) => results.push(isProcessing)
  })
  
  const queuedFunc1 = testQueue(resolve(1), 'F_1')
  const queuedFunc2 = testQueue(resolve(2), 'F_2')
  const queuedFunc3 = testQueue(resolve(3), 'F_3')

  //@ts-ignore
  queuedFunc1().then(x => results.push(x))
  //@ts-ignore
  queuedFunc2().then(x => results.push(x))
  //@ts-ignore
  results.push(await queuedFunc3())

  expect(results).toEqual([true, 1, 2, false, 3]);
});


test('Rejection strategy - none', async () => {
  const results: (number | boolean)[] = []
  const id = getUniqueID()
  const testQueue = queue(id, {
    onIsQueueProcessing: (isProcessing: boolean) => results.push(isProcessing),
    onRejection: OnRejection.None
  })
  
  const queuedFunc1 = testQueue(resolve(1), 'F_1')
  const queuedFunc2 = testQueue(reject(2), 'F_2')
  const queuedFunc3 = testQueue(resolve(3), 'F_3')

  //@ts-ignore
  queuedFunc1().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc2().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  await queuedFunc3().then(x => results.push(x)).catch(e => results.push(e))

  expect(results).toEqual([true, 1, 'Error: 2', false, 3]);
});



test('Rejection strategy - RejectAlways', async () => {
  const results: (number | boolean)[] = []
  const id = getUniqueID()
  const testQueue = queue(id, {
    onRejection: OnRejection.RejectAlways
  })
  
  const queuedFunc1 = testQueue(resolve(1), 'F_1')
  const queuedFunc2 = testQueue(reject(2), 'F_2')
  const queuedFunc3 = testQueue(resolve(3), 'F_3')
  const queuedFunc4 = testQueue(reject(4), 'F_4')
  const queuedFunc5 = testQueue(resolve(5), 'F_5')

  //@ts-ignore
  queuedFunc1().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc2().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc3().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc4().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  await queuedFunc5().then(x => results.push(x)).catch(e => results.push(e))

  expect(results).toEqual([ 
    1,
    'Error: 2',
    `One of previous task in queue "${id}" was rejected`,
    `One of previous task in queue "${id}" was rejected`,
    `One of previous task in queue "${id}" was rejected`,
  ]);
});



test('Rejection strategy - RejectAlways, using after rejection', async () => {
  const results: (number | boolean)[] = []
  const id = getUniqueID()
  const testQueue = queue(id, {
    onRejection: OnRejection.RejectAlways
  })
  
  const queuedFunc1 = testQueue(resolve(1), 'F_1')
  const queuedFunc2 = testQueue(reject(2), 'F_2')
  const queuedFunc3 = testQueue(resolve(3), 'F_3')
  const queuedFunc4 = testQueue(reject(4), 'F_4')
  const queuedFunc5 = testQueue(resolve(5), 'F_5')

  //@ts-ignore
  queuedFunc1().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc2().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc3().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc4().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  await queuedFunc5().then(x => results.push(x)).catch(e => results.push(e))

  await pause()

  //@ts-ignore
  queuedFunc1().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  await queuedFunc2().then(x => results.push(x)).catch(e => results.push(e))

  expect(results).toEqual([ 
    1,
    'Error: 2',
    `One of previous task in queue "${id}" was rejected`,
    `One of previous task in queue "${id}" was rejected`,
    `One of previous task in queue "${id}" was rejected`,
    `One of previous task in queue "${id}" was rejected`,
    `One of previous task in queue "${id}" was rejected` 
  ]);
});



test('Rejection strategy - RejectAllInQueue', async () => {
  const results: (number | boolean)[] = []
  const id = getUniqueID()
  const testQueue = queue(id, {
    onRejection: OnRejection.RejectAllInQueue
  })
  
  const queuedFunc1 = testQueue(resolve(1), 'F_1')
  const queuedFunc2 = testQueue(reject(2), 'F_2')
  const queuedFunc3 = testQueue(resolve(3), 'F_3')
  const queuedFunc4 = testQueue(reject(4), 'F_4')
  const queuedFunc5 = testQueue(resolve(5), 'F_5')

  //@ts-ignore
  queuedFunc1().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc2().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc3().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc4().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  await queuedFunc5().then(x => results.push(x)).catch(e => results.push(e))

  expect(results).toEqual([ 
    1,
    'Error: 2',
    `One of previous task in queue "${id}" was rejected`,
    `One of previous task in queue "${id}" was rejected`,
    `One of previous task in queue "${id}" was rejected`
  ]);
});


test('Rejection strategy - RejectAllInQueue, using after rejection', async () => {
  const results: (number | boolean)[] = []
  const id = getUniqueID()
  const testQueue = queue(id, {
    onRejection: OnRejection.RejectAllInQueue
  })

  const queuedFunc1 = testQueue(resolve(1), 'F_1')
  const queuedFunc2 = testQueue(reject(2), 'F_2')
  const queuedFunc3 = testQueue(resolve(3), 'F_3')
  const queuedFunc4 = testQueue(reject(4), 'F_4')
  const queuedFunc5 = testQueue(resolve(5), 'F_5')

  //@ts-ignore
  queuedFunc1().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc2().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc3().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  queuedFunc4().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  await queuedFunc5().then(x => results.push(x)).catch(e => results.push(e))

  await pause()

  //@ts-ignore
  queuedFunc2().then(x => results.push(x)).catch(e => results.push(e))
  //@ts-ignore
  await queuedFunc1().then(x => results.push(x)).catch(e => results.push(e))

  expect(results).toEqual([ 
    1,
    'Error: 2',
    `One of previous task in queue "${id}" was rejected`,
    `One of previous task in queue "${id}" was rejected`,
    `One of previous task in queue "${id}" was rejected`,
    'Error: 2',
    1
  ]);
});
