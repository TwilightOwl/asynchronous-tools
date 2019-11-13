import { produce } from '.'

const pause = (timeout = 100) => new Promise(resolve => setTimeout(resolve, timeout))

test('ordinary usage', async () => {

    const { init, action, finalize } = produce()

    const results: string[] = []

    const i = init(async () => (await pause(100), results.push('i')))
    const a1 = action(async () => (await pause(100), results.push('a1')))
    const a2 = action(async () => (await pause(1000), results.push('a2')))
    const a3 = action(async () => (await pause(100), results.push('a3')))
    const f = finalize(async () => (await pause(100), results.push('f')))

    a1(); 
    i(); 
    a2(); 
    a3(); 
    await f();

    expect(results).toEqual(['i', 'a1', 'a2', 'a3', 'f'])
})

test('call action after finalize', async () => {

    const { init, action, finalize } = produce()

    const results: string[] = []

    const i = init(async () => (await pause(100), results.push('i')))
    const a1 = action(async () => (await pause(100), results.push('a1')))
    const a2 = action(async () => (await pause(1000), results.push('a2')))
    const a3 = action(async () => (await pause(100), results.push('a3')))
    const f = finalize(async () => (await pause(100), results.push('f')))

    


    i(); 
    a1(); 
    a2(); 
    const fP = f();
    const a3P = a3(); 
    await Promise.all([fP, a3P])
    // await pause(3000)
    expect(results).toEqual(['i', 'a1', 'a2', 'f'])
})