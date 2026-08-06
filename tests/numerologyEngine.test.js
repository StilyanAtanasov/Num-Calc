const test = require("node:test");
const assert = require("node:assert/strict");
const {
  reduceNumber,
  createProfileFromParts,
  buildCompositeProfile,
} = require("../js/numerologyEngine");

test("reduceNumber subtracts 9 until the value is less than 10", () => {
  assert.equal(reduceNumber(18), 9);
  assert.equal(reduceNumber(27), 9);
  assert.equal(reduceNumber(10), 1);
});

test("createProfileFromParts returns the expected reduced values and digits", () => {
  const profile = createProfileFromParts(15, 7, 1990);

  assert.equal(profile.leadNumber, 5);
  assert.ok(profile.numbersPresent.includes(1));
  assert.ok(profile.numbersPresent.includes(5));
  assert.ok(profile.numbersPresent.includes(7));
  assert.ok(profile.numbersPresent.includes(9));
});

test("buildCompositeProfile merges the number sets for the final map", () => {
  const first = createProfileFromParts(1, 1, 2000);
  const second = createProfileFromParts(2, 2, 2000);
  const third = createProfileFromParts(3, 3, 2000);
  const fourth = createProfileFromParts(4, 4, 2000);

  const composite = buildCompositeProfile([first, second, third, fourth]);

  assert.equal(composite.leadNumber, 1);
  assert.ok(composite.numbersPresent.includes(1));
  assert.ok(composite.numbersPresent.includes(2));
  assert.ok(composite.numbersPresent.includes(3));
  assert.ok(composite.numbersPresent.includes(4));
});
