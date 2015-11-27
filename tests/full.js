var test = require("tape");
import GyreJS from "../src/index";

function createSimpleGyreFactory() {
  return GyreJS.createGyreFactory();
}
function registerSimpleGyreFactory(gf) {
  GyreJS.registerGyreFactory("simple", gf);
  return GyreJS.createGyre("simple");
}

test("Full: Can create and register a gyre factory", function(t) {
  t.plan(2);
  const simpleGyreFactory = createSimpleGyreFactory();
  const simpleGyre = registerSimpleGyreFactory(simpleGyreFactory);

  t.equal(typeof simpleGyreFactory, "function", "Gyre factory should be of type function.");
  t.equal(typeof simpleGyre, "object", "Gyre instance should be of type object.");
});

test("Full: Can add and dispatch actions.", function(t) {
  t.plan(3);
  const simpleGyre = registerSimpleGyreFactory(createSimpleGyreFactory());

  // Set initial state
  simpleGyre.setState({
    counter: 0
  });

  // Create actions
  simpleGyre.addAction("increment", (state) =>
    state.set("counter", state.get("counter") + 1));

  simpleGyre.addAction("decrement", (state) =>
    state.set("counter", state.get("counter") - 1));

  // Initial state
  t.deepLooseEqual(simpleGyre.getState().toJSON(), {
    counter: 0
  }, "Initial state");

  // Single increment
  simpleGyre.dispatch("increment");

  t.deepLooseEqual(simpleGyre.getState().toJSON(), {
    counter: 1
  }, "State after single increment");

  // Double decrement
  simpleGyre.dispatch("decrement");
  simpleGyre.dispatch("decrement");

  t.deepLooseEqual(simpleGyre.getState().toJSON(), {
    counter: -1
  }, "State after double decrement");
});

test("Full: Can add and use selectors.", function(t) {
  t.plan(1);
  const simpleGyre = registerSimpleGyreFactory(createSimpleGyreFactory());

  // Set initial state
  simpleGyre.setState({
    counter: 0
  });

  // Create actions (chained)
  simpleGyre
    .addAction("increment", (state) =>
      state.set("counter", state.get("counter") + 1))
    .addAction("decrement", (state) =>
      state.set("counter", state.get("counter") - 1));

  // Create selector callback
  const selCountArray = [];
  const selectorCb = (count) => {
    selCountArray.push(count);
  };

  // Create selectors
  simpleGyre.createSelector((state, cb) => {
    cb(state.get("counter"));
  }, selectorCb);

  // Register selector and create it
  simpleGyre
    .addSelector("simple", () => (state, cb) => {
      cb(state.get("counter"));
    })
    .createSelector("simple", selectorCb);

  // Initial state
  // Single increment
  simpleGyre.dispatch("increment");
  simpleGyre.dispatch("decrement");
  simpleGyre.dispatch("decrement");

  // Test result
  t.deepLooseEqual(selCountArray, [0, 0, 1, 1, 0, 0, -1, -1], "Selector callback result compare.");
});
