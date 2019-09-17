import { aiWithAsyncInit, aiInit, aiMethod } from '.'


const pause = (timeout = 200) => new Promise(resolve => setTimeout(resolve, timeout))

const getClass = (results: string[]) => {

    @aiWithAsyncInit
    class Test {

        @aiInit
        init() {
            return new Promise(resolve => setTimeout(resolve, 100)).then(() => results.push('init'))            
        }

        @aiInit
        init2() {
            results.push('init2')
        }

        @aiMethod
        method1() {
            results.push('method1')
        }

        @aiMethod
        method2() {
            results.push('method2')
        }

        @aiInit
        static init() {
            return new Promise(resolve => setTimeout(resolve, 100)).then(() => results.push('init'))            
        }

        @aiInit
        static init2() {
            results.push('init2')
        }

        @aiMethod
        static method1() {
            results.push('method1')
        }

        @aiMethod
        static method2() {
            results.push('method2')
        }

    }
    return Test
}



test('ordinary usage', async () => {

    const results: string[] = []
    const Class = getClass(results)
    const t = new Class()

    await t.init()
    expect(results).toEqual(['init'])
    await t.method1()
    expect(results).toEqual(['init', 'method1'])
    await t.method2()
    expect(results).toEqual(['init', 'method1', 'method2'])
})

test('ordinary usage [static]', async () => {

    const results: string[] = []
    const Class = getClass(results)

    await Class.init()
    expect(results).toEqual(['init'])
    await Class.method1()
    expect(results).toEqual(['init', 'method1'])
    await Class.method2()
    expect(results).toEqual(['init', 'method1', 'method2'])
})

test('method won\'t be invoked without initialization', async () => {

    const results: string[] = []
    const Class = getClass(results)
    const t = new Class()

    t.method1()
    await pause()
    expect(results).toEqual([])
})

test('method won\'t be invoked without initialization [static]', async () => {

    const results: string[] = []
    const Class = getClass(results)

    Class.method1()
    await pause()
    expect(results).toEqual([])
})

test('method wait for initialization', async () => {

    const results: string[] = []
    const Class = getClass(results)
    const t = new Class()

    t.method1()
    await pause()
    expect(results).toEqual([])
    await t.init()
    expect(results).toEqual(['init'])
    await pause()
    expect(results).toEqual(['init', 'method1'])
})

test('method wait for initialization [static]', async () => {

    const results: string[] = []
    const Class = getClass(results)

    Class.method1()
    await pause()
    expect(results).toEqual([])
    await Class.init()
    expect(results).toEqual(['init'])
    await pause()
    expect(results).toEqual(['init', 'method1'])
})

test('right method order after initialization', async () => {

    const results: string[] = []
    const Class = getClass(results)
    const t = new Class()

    t.method1()
    t.method2()
    await pause()
    expect(results).toEqual([])
    await t.init()
    expect(results).toEqual(['init'])
    await pause()
    expect(results).toEqual(['init', 'method1', 'method2'])
})

test('right method order after initialization [static]', async () => {

    const results: string[] = []
    const Class = getClass(results)

    Class.method1()
    Class.method2()
    await pause()
    expect(results).toEqual([])
    await Class.init()
    expect(results).toEqual(['init'])
    await pause()
    expect(results).toEqual(['init', 'method1', 'method2'])
})

test('no re-initialization, init can be done once', async () => {

    const results: string[] = []
    const Class = getClass(results)
    const t = new Class()

    t.method1()
    t.method2()
    await pause()
    expect(results).toEqual([])
    await t.init()
    expect(results).toEqual(['init'])
    await pause()
    expect(results).toEqual(['init', 'method1', 'method2'])

    // call init again without waiting
    t.init()
    // method1 doesn't wait for init call
    await t.method1()
    expect(results).toEqual(['init', 'method1', 'method2', 'method1'])

})

test('no re-initialization, init can be done once [static]', async () => {

    const results: string[] = []
    const Class = getClass(results)

    Class.method1()
    Class.method2()
    await pause()
    expect(results).toEqual([])
    await Class.init()
    expect(results).toEqual(['init'])
    await pause()
    expect(results).toEqual(['init', 'method1', 'method2'])

    // call init again without waiting
    Class.init()
    // method1 doesn't wait for init call
    await Class.method1()
    expect(results).toEqual(['init', 'method1', 'method2', 'method1'])

})

test('other init2 method', async () => {

    const results: string[] = []
    const Class = getClass(results)
    const t = new Class()

    t.method1()
    t.method2()
    await pause()
    expect(results).toEqual([])
    await t.init2()
    expect(results).toEqual(['init2'])
    await pause()
    expect(results).toEqual(['init2', 'method1', 'method2'])

    // call init again without waiting
    t.init()
    // method1 doesn't wait for init call
    await t.method1()
    expect(results).toEqual(['init2', 'method1', 'method2', 'method1'])

})

test('other init2 method [static]', async () => {

    const results: string[] = []
    const Class = getClass(results)

    Class.method1()
    Class.method2()
    await pause()
    expect(results).toEqual([])
    await Class.init2()
    expect(results).toEqual(['init2'])
    await pause()
    expect(results).toEqual(['init2', 'method1', 'method2'])

    // call init again without waiting
    Class.init()
    // method1 doesn't wait for init call
    await Class.method1()
    expect(results).toEqual(['init2', 'method1', 'method2', 'method1'])

})