import { useStore } from "react-redux";
import { Action, Dispatch } from "redux";
import Observable from "zen-observable";

export const useObservableStore = <a, b extends Action<any> = Action<any>>(): [
  () => a,
  Dispatch<b>,
  Observable<a>
] => {
  const store = useStore<a, b>();
  const observable = new Observable<a>(observer =>
    store.subscribe(() => observer.next(store.getState()))
  );

  return [store.getState, store.dispatch, observable];
};
