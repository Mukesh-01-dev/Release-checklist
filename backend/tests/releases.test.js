
import test from "node:test";
import assert from "node:assert/strict";

const API_URL = "http://localhost:4000/graphql";


async function graphql(query, expectErrors = false) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  assert.equal(response.status, 200);

  const body = await response.json();

  if (expectErrors) {
    assert.ok(body.errors?.length, "Expected a GraphQL error");
    return body.errors;
  }

  assert.equal(body.errors, undefined, JSON.stringify(body.errors));
  return body.data;
}


test("GraphQL health query works", async () => {
  const data = await graphql(`{ health }`);

  assert.equal(data.health, "Release Checklist API is running");
});

test("release CRUD and checklist behavior work", async () => {
  const name = `Automated Test ${Date.now()}`;
  let releaseId;

  try {
    // Create a release and its ten checklist steps.
    const created = await graphql(`
      mutation {
        createRelease(input: {
          name: "${name}"
          dueDate: "2026-11-01T12:00:00Z"
          additionalInfo: "Created by automated test"
        }) {
          id
          name
          status
          completedSteps
          totalSteps
          steps { stepId completed }
        }
      }
    `);

    const release = created.createRelease;
    releaseId = release.id;

    assert.equal(release.name, name);
    assert.equal(release.status, "planned");
    assert.equal(release.completedSteps, 0);
    assert.equal(release.totalSteps, 10);
    assert.equal(release.steps.length, 10);

    // Complete one step.
    const toggled = await graphql(`
      mutation {
        toggleStep(releaseId: "${releaseId}", stepId: 1) {
          status
          completedSteps
          steps { stepId completed }
        }
      }
    `);

    assert.equal(toggled.toggleStep.status, "ongoing");
    assert.equal(toggled.toggleStep.completedSteps, 1);
    assert.equal(toggled.toggleStep.steps[0].completed, true);

    // Update the release.
    const updated = await graphql(`
      mutation {
        updateRelease(
          id: "${releaseId}"
          input: { name: "${name} Updated" }
        ) {
          name
          status
        }
      }
    `);

    assert.equal(updated.updateRelease.name, `${name} Updated`);
    assert.equal(updated.updateRelease.status, "ongoing");

    // Confirm the update persists when queried.
    const fetched = await graphql(`
      query {
        release(id: "${releaseId}") {
          name
          completedSteps
        }
      }
    `);

    assert.equal(fetched.release.name, `${name} Updated`);
    assert.equal(fetched.release.completedSteps, 1);

    // Delete the release.
    const deleted = await graphql(`
      mutation {
        deleteRelease(id: "${releaseId}")
      }
    `);

    assert.equal(deleted.deleteRelease, true);
    releaseId = undefined;

    // Confirm the release no longer exists.
    const afterDelete = await graphql(`
      query {
        release(id: "${created.createRelease.id}") {
          id
        }
      }
    `);

    assert.equal(afterDelete.release, null);
  } finally {
    // Clean up if an earlier assertion fails.
    if (releaseId) {
      await graphql(`
        mutation {
          deleteRelease(id: "${releaseId}")
        }
      `);
    }
  }
});


test("rejects a blank release name", async () => {
  const errors = await graphql(`
    mutation {
      createRelease(input: {
        name: "   "
        dueDate: "2026-11-01T12:00:00Z"
      }) {
        id
      }
    }
  `, true);

  assert.match(errors[0].message, /Release name is required/);
});

test("rejects an invalid due date", async () => {
  const errors = await graphql(`
    mutation {
      createRelease(input: {
        name: "Invalid Date Test"
        dueDate: "not-a-date"
      }) {
        id
      }
    }
  `, true);

  assert.match(errors[0].message, /valid due date is required/i);
});

test("rejects a step ID outside 1–10", async () => {
  const errors = await graphql(`
    mutation {
      toggleStep(
        releaseId: "00000000-0000-0000-0000-000000000000"
        stepId: 11
      ) {
        id
      }
    }
  `, true);

  assert.match(errors[0].message, /Step ID must be between 1 and 10/);
});
