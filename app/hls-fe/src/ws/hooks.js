import { useEffect } from 'react';
import ws from './index';
import { useMountedState } from '../util/hooks';


function useWsCleanup() {
  useEffect(() => () => ws.close(), []);
}

/**
 *
 * @param {string} actionName
 * @param {function(payload: Object, status: number)} handler
 * @param {*[]} deps
 */
function useWsAction(actionName, handler, deps = []) {
  useEffect(() => {
    const unsubscribe = ws.subscribe(actionName, handler);

    return () => unsubscribe();
  }, deps)
}

/**
 *
 * @template T
 * @param {string} action
 * @param {function=} getPayload
 * @param {T} initialData
 * @param {Array<any>} [deps = []]
 * @param {boolean} [condition = true]
 * @param {(function(payload: any): T)=} transformer
 * @return {{ isFetching: boolean, err: { payload: any, status: number }, data: T, setData: function }}
 */
function useWsRequest(
  action, {
    getPayload = () => undefined,
    initialData = [],
    deps = [],
    condition = true,
    transformer = v => v
  } = {}
) {
  const [isFetching, setIsFetching] = useMountedState(condition);
  const [err, setErr] = useMountedState(null);
  const [data, setData] = useMountedState(initialData);

  useEffect(() => {
    const fetchData = async () => {
      setErr(null);
      setIsFetching(true);
      try {
        const response = await ws.request(action, getPayload(...deps));
        setData(transformer(response.payload));
      } catch (e) {
        setErr(e);
      } finally {
        setIsFetching(false);
      }
    };

    if (condition) {
      fetchData();
    }
  }, deps);

  return { isFetching, err, data, setData };
}

export { useWsCleanup, useWsAction, useWsRequest };