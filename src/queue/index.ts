type TQueueId = number | string;
interface ITask { process: Function, tag: string, resolve: Function, reject: Function };
interface IQueue {
  tasks: ITask[],
  meta: {
    isTaskRejected: boolean,
    isTaskRejectedInNotEmptyQueue: boolean
  }
}

const queues: { [k in TQueueId]: IQueue } = {};
const getQueue = (queueId: TQueueId) => queues[queueId] || (
  queues[queueId] = {
    tasks: [],
    meta: {
      isTaskRejected: false,
      isTaskRejectedInNotEmptyQueue: false
    }
  }
);

const showLog = false;
const log = (...args: any[]) => showLog && console.log(...args);

interface IQueueParams {
  onIsQueueProcessing?: (isProcessing: boolean) => any,
  onRejection?: OnRejection
}

export enum OnRejection {
  RejectAllInQueue = 'rejectAllInQueue',
  RejectAlways = 'rejectAlways',
  None = 'none'
}

export default
  (queueId: TQueueId, {
    onIsQueueProcessing = (isProcessing: boolean) => {},
    onRejection = OnRejection.None
  }: IQueueParams = {}) => 
    (process: Function, tag: string = '') => 
      (...args: any[]) => 
        new Promise((resolve, reject) => {
          const { tasks, meta }: IQueue = getQueue(queueId);
          const idle = !tasks.length;
          log(`\n:: ${queueId} :: CALL :: ${tag} :: Queue: ${tasks}`);
          tasks.push({ process: () => process(...args), tag, resolve, reject });
     
          const doNext = async () => {
            if (!tasks.length) return;
            const { process, tag, resolve, reject } = tasks[0];
            log(`:: ${queueId} :: BEGIN :: ${tag}`);
            
            if (
              onRejection === OnRejection.RejectAlways && meta.isTaskRejected ||
              onRejection === OnRejection.RejectAllInQueue && meta.isTaskRejectedInNotEmptyQueue
            ) {
              reject(`One of previous task in queue "${queueId}" was rejected`)
            } else {
              try {
                resolve(await process());
              } catch (error) {
                meta.isTaskRejected = true;
                meta.isTaskRejectedInNotEmptyQueue = true;
                reject(error);
              }
            }
            
            tasks.shift();
            log(`:: ${queueId} :: END :: ${tag}\n`);

            if (tasks.length) {
              setTimeout(doNext, 0);
            } else {
              meta.isTaskRejectedInNotEmptyQueue = false;
              onIsQueueProcessing(false);
            }
          }
          
          if (idle) {
            onIsQueueProcessing(true);
            doNext(); 
          } else {
            log(`:: ${queueId} :: Waiting... :: ${tag}`);
          }
        });