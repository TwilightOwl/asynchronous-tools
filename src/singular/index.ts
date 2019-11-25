/**
 * @overview utility to prevent several function calls at the same time
 * @author Denis Zhelnerovich
 * @version 1.0
 */

interface IStatusHandler {
  (status: boolean): void;
}
interface IFailureHandler {
  (): void;
}

export interface IResultFunction {
  (): any;
  release: () => void;
  function: Function;
  setOnStatusChanged: (handler: IStatusHandler) => void;
  setOnFailure: (handler: IFailureHandler) => void;
}

export interface IParams {
  onStatusChanged?: IStatusHandler;
  onFailure?: IFailureHandler;
  enabled?: boolean;
}

export interface ISingular {
  (func: Function, params?: IParams): IResultFunction;
}

const singular: ISingular = (func, params: IParams = {}) => {
  let {
    onStatusChanged = () => {},
    onFailure = () => {},
    enabled = true
  } = params;
  const setEnabled = (value: boolean) => {
    enabled = value;
    onStatusChanged(enabled);
    return false;
  };
  const release = () => setEnabled(true);
  const resultFunction = ((...args) =>
    enabled
      ? setEnabled(false) || func(release, ...args)
      : onFailure()) as IResultFunction;

  //I've added following properties just for future use cases
  resultFunction.release = release;
  resultFunction.function = func;
  resultFunction.setOnStatusChanged = handler => (onStatusChanged = handler);
  resultFunction.setOnFailure = handler => (onFailure = handler);

  return resultFunction;
};

export default singular;
