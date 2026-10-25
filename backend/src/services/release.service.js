import { releaseRepository as repo } from "../repositories/release.repository.js";

const STEP_TITLES = [
  "Requirements finalized",
  "Design reviewed",
  "Development completed",
  "Code review completed",
  "Unit tests passed",
  "Integration tests passed",
  "Security review completed",
  "Staging deployment completed",
  "QA approval received",
  "Production deployment completed",
];

function validateDate(value) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    throw new Error("A valid due date is required");
  }

  return date;
}

function getStatus(completedSteps) {
  if (completedSteps === 0) return "planned";
  if (completedSteps === 10) return "done";
  return "ongoing";
}

async function formatRelease(row) {
  if (!row) return null;

  const stepRows = await repo.findSteps(row.id);
  const completedSteps = stepRows.filter((step) => step.completed).length;

  return {
    id: row.id,
    name: row.name,
    dueDate: new Date(row.due_date).toISOString(),
    additionalInfo: row.additional_info,
    status: getStatus(completedSteps),
    completedSteps,
    totalSteps: 10,
    steps: stepRows.map((step) => ({
      stepId: step.step_id,
      title: STEP_TITLES[step.step_id - 1],
      completed: step.completed,
    })),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export const releaseService = {
  async getAll() {
    const rows = await repo.findAll();
    return Promise.all(rows.map(formatRelease));
  },

  async getById(id) {
    return formatRelease(await repo.findById(id));
  },

  async create(input) {
    const name = input.name?.trim();

    if (!name) throw new Error("Release name is required");

    const row = await repo.create({
      name,
      dueDate: validateDate(input.dueDate),
      additionalInfo: input.additionalInfo ?? null,
    });

    return this.getById(row.id);
  },

  async update(id, input) {
    if (input.name !== undefined && !input.name.trim()) {
      throw new Error("Release name cannot be empty");
    }

    const existing = await repo.findById(id);
    if (!existing) throw new Error("Release not found");

    const updates = { ...input };

    if (updates.name !== undefined) {
      updates.name = updates.name.trim();
    }

    if (updates.dueDate !== undefined) {
      updates.dueDate = validateDate(updates.dueDate);
    }

    const row = await repo.update(id, updates);
    return formatRelease(row);
  },

  async toggleStep(releaseId, stepId) {
    if (!Number.isInteger(stepId) || stepId < 1 || stepId > 10) {
      throw new Error("Step ID must be between 1 and 10");
    }

    if (!(await repo.findById(releaseId))) {
      throw new Error("Release not found");
    }

    if (!(await repo.toggleStep(releaseId, stepId))) {
      throw new Error("Step not found");
    }

    return this.getById(releaseId);
  },

  async delete(id) {
    return repo.delete(id);
  },
};