import { pool } from "../config/db.js";

export const releaseRepository = {
  async findAll() {
    const result = await pool.query(
      "SELECT * FROM releases ORDER BY due_date ASC"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM releases WHERE id = $1",
      [id]
    );
    return result.rows[0] ?? null;
  },

  async findSteps(releaseId) {
    const result = await pool.query(
      `SELECT step_id, completed
       FROM release_steps
       WHERE release_id = $1
       ORDER BY step_id`,
      [releaseId]
    );
    return result.rows;
  },

  async create(input) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO releases (name, due_date, additional_info)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [input.name, input.dueDate, input.additionalInfo ?? null]
      );

      const release = result.rows[0];

      await client.query(
        `INSERT INTO release_steps (release_id, step_id)
         SELECT $1, generate_series(1, 10)`,
        [release.id]
      );

      await client.query("COMMIT");
      return release;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async update(id, input) {
    const result = await pool.query(
      `UPDATE releases SET
         name = COALESCE($2, name),
         due_date = COALESCE($3, due_date),
         additional_info = CASE
           WHEN $4 THEN $5
           ELSE additional_info
         END,
         updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        input.name === undefined ? null : input.name,
        input.dueDate === undefined ? null : input.dueDate,
        Object.hasOwn(input, "additionalInfo"),
        input.additionalInfo ?? null,
      ]
    );

    return result.rows[0] ?? null;
  },

  async toggleStep(releaseId, stepId) {
    const result = await pool.query(
      `UPDATE release_steps
       SET completed = NOT completed
       WHERE release_id = $1 AND step_id = $2
       RETURNING step_id`,
      [releaseId, stepId]
    );

    if (result.rowCount) {
      await pool.query(
        "UPDATE releases SET updated_at = NOW() WHERE id = $1",
        [releaseId]
      );
    }

    return result.rowCount > 0;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM releases WHERE id = $1",
      [id]
    );
    return result.rowCount > 0;
  },
};