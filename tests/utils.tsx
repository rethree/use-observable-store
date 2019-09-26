import React, { ComponentType } from "react";
import { Provider } from "react-redux";
import { Store } from "redux";

export const WithStore = <p extends object>(
  Component: ComponentType<typeof props>,
  { store, ...props }: p & { store: Store }
) => (
  <Provider store={store}>
    <Component {...props} />
  </Provider>
);
