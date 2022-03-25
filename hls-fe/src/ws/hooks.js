import { useEffect } from 'react';
import ws from './index';
import { useMountedState } from '../util/hooks';


function useWsCleanup() {
  useEffect(() => () => ws.close(), []);
}

function useWsAction(actionName, handler, deps = []) {
  useEffect(() => {
    const unsubscribe = ws.subscribe(actionName, handler);

    return () => unsubscribe();
  }, deps)
}

/**
 * @typedef WsResponse
 * @type {Object}
 * @property {any} payload
 * @property {number} status
 */

/**
 *
 * @param {string} action
 * @param {any} payload
 * @param {boolean} [condition = true]
 * @param {Array<any>} [deps = []]
 * @param {(function(payload: any))=} onSuccess
 * @param {(function(e: WsResponse))=} onError
 * @param {(function())=} onAny
 * @return {{ isFetching: boolean, err: WsResponse, data: any }}
 */
function useWsRequest(
  action, payload,

  condition = true,
  deps = [],

  onSuccess = () => {},
  onError = errData => console.log(errData),
  onAny = () => {}
) {
  const [isFetching, setIsFetching] = useMountedState(condition);
  const [err, setErr] = useMountedState(null);
  const [data, setData] = useMountedState(null);

  useEffect(() => {
    const fetchData = async () => {
      setErr(null);
      setIsFetching(true);
      try {
        const response = await ws.request(action, payload);
        setData(response.payload);
        onSuccess(response.payload);
      } catch (e) {
        setErr(e);
        onError(e);
      } finally {
        setIsFetching(false);
        onAny();
      }
    };

    if (condition) {
      fetchData();
    }
  }, deps);

  return { isFetching, err, data };
}

export { useWsCleanup, useWsAction, useWsRequest };