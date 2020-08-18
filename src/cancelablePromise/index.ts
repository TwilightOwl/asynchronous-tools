const cancelKey = Symbol('canceled')

interface CanceledResult {
  [cancelKey]: true,
  canceled: true,
  data: unknown
}

interface CancelableResult<T> {
  promise: Promise<T | CanceledResult>,
  cancel: (data?: unknown) => void
}

const cancelable = <T>(originalPromise: Promise<T>): CancelableResult<T> => {
  let cancel!: (data?: unknown) => void
  const cancelPromise: Promise<CanceledResult> = new Promise(resolve => {
    cancel = data => resolve({ data, [cancelKey]: true, canceled: true })
  })

  const promise: Promise<T | CanceledResult> = new Promise(async (resolve, reject) => {
    try {
      const result = await Promise.race([originalPromise, cancelPromise])
      if (result && (result as any)[cancelKey]) {
        resolve(result as CanceledResult)
      } else {
        resolve(result as T)
        cancel('Stop cancelPromise')
      }
    } catch(e) {
      reject(e)
    }
  })
  return { cancel, promise }
}

export const isCanceled = <T>(result: T | CanceledResult): result is CanceledResult => {
  return (result as CanceledResult)[cancelKey]
}

export default cancelable
