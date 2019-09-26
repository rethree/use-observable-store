import { mount, ReactWrapper } from "enzyme";
import React, { FunctionComponent, useEffect, useState } from "react";
import { act } from "react-dom/test-utils";
import { AnyAction, createStore } from "redux";
import Observable from "zen-observable";
import { useObservableStore } from "../lib/use-store";
import { WithStore } from "./utils";

const Basic: FunctionComponent<{ effects: any[] }> = ({ effects }) => {
  const [getState, dispatch, observable] = useObservableStore();

  effects.push(getState, dispatch, observable);

  return <p></p>;
};

const Subscriber: FunctionComponent<{ effects: any[] }> = ({ effects }) => {
  const [, , observable] = useObservableStore();
  const [state, setState] = useState();

  useEffect(() => {
    const sub = observable.subscribe(setState);
    effects.push(sub);
    return () => sub.unsubscribe();
  }, []);

  effects.push(observable);

  return <p>{state}</p>;
};

test("hook()[0] is equal to Store.getState", () => {
  const store = createStore(x => x);
  const effects: Function[] = [];

  act(() => {
    mount(WithStore(Basic, { store, effects }));
  });

  expect(effects[0]).toBe(store.getState);
});

test("hook()[1] is equal to Store.dispatch", () => {
  const store = createStore(x => x);
  const effects: Function[] = [];

  act(() => {
    mount(WithStore(Basic, { store, effects }));
  });

  expect(effects[1]).toBe(store.dispatch);
});

test("hook()[3] is an observable", () => {
  const store = createStore(x => x);
  const effects: Function[] = [];

  act(() => {
    mount(WithStore(Basic, { store, effects }));
  });

  expect(effects[2]).toBeInstanceOf(Observable);
});

test("observable listens to store changes", () => {
  const store = createStore((_, { payload }: AnyAction) => payload);
  const effects: any[] = [];
  let wrapper: ReactWrapper;

  act(() => {
    wrapper = mount(WithStore(Subscriber, { store, effects }));
  });

  act(() => {
    store.dispatch({ type: "", payload: 42 });
  });

  //@ts-ignore variable is used before being assigned
  const p = wrapper.find("p");

  expect(p.text()).toBe("42");
});

test("Observable unsubsribe is triggered when component is unmounted", () => {
  const store = createStore((_, { payload }: AnyAction) => payload);
  const effects: any[] = [];
  let wrapper: ReactWrapper;

  act(() => {
    wrapper = mount(WithStore(Subscriber, { store, effects }));
  });

  act(() => {
    store.dispatch({ type: "", payload: 42 });
  });

  //@ts-ignore variable is used before being assigned
  act(() => {
    wrapper.unmount();
  });

  const [, sub] = effects as [any, ZenObservable.Subscription];

  expect(sub.closed).toBe(true);
});

test("Store unsubsribe is triggered when component is unmounted", () => {
  const store = createStore((_, { payload }: AnyAction) => payload);
  const { subscribe } = store;
  const effects: any[] = [];
  let wrapper: ReactWrapper;
  let destroy: jest.Mock<void>;

  store.subscribe = (listener: () => void) => {
    const _destroy = subscribe(listener);
    destroy = jest.fn(_destroy);
    return destroy;
  };

  act(() => {
    wrapper = mount(WithStore(Subscriber, { store, effects }));
  });

  act(() => {
    store.dispatch({ type: "", payload: 42 });
  });

  //@ts-ignore variable is used before being assigned
  act(() => {
    wrapper.unmount();
  });

  //@ts-ignore variable is used before being assigned
  expect(destroy).toHaveBeenCalled();
});
