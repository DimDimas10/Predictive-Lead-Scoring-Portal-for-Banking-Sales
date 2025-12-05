// leadsHandlers.js
const pool = require('../../db');
const { exec } = require('child_process');
const path = require('path');

/**
 * GET /api/leads
 * Mengambil data dari tabel 'nasabah'
 */
const getLeadsHandler = async (request, h) => {
  try {
    const { userId, role } = request.query;
    let query;
    let params = [];

    // Reset nasabah yang sudah DITOLAK > 1 hari
    // - status: 'rejected'  -> 'pending'
    // - user_id: sales_id   -> NULL (kembali ke pool)
    await pool.query(`
      UPDATE nasabah
      SET 
        status = 'pending',
        user_id = NULL
      WHERE status = 'rejected'
        AND contacted_at IS NOT NULL
        AND contacted_at < NOW() - INTERVAL '1 day'
    `);

    // Query data untuk dikirim ke frontend
    const baseQuery = `
      SELECT
        n.nasabah_id AS "id",
        n.name,
        n.email,
        n.phone,
        n.age,
        n.job,
        n.marital,
        n.education,
        COALESCE(n.balance, 0) AS "balance",
        n.housing,
        n.loan,
        n.contact,
        n.campaign,
        n.poutcome AS "previousOutcome",

        -- status apa adanya dari DB
        COALESCE(n.status, 'pending') AS "status",

        n.contacted_at AS "lastContact",
        n.contacted_at AS "contactedAt",
        n.notes,
        n.user_id AS "userId",
        u.name AS "contactedByName",
        COALESCE(hp.predicted_score, 0) AS "predictedScore"
      FROM nasabah n
      LEFT JOIN users u ON u.user_id = n.user_id
      LEFT JOIN LATERAL (
        SELECT predicted_score
        FROM hasil_perhitungan_probabilitas
        WHERE nasabah_id = n.nasabah_id
        ORDER BY calculation_date DESC
        LIMIT 1
      ) hp ON TRUE
    `;

    if (role === 'admin') {
      // Admin: lihat semua nasabah apapun status-nya
      query = `
        ${baseQuery}
        ORDER BY hp.predicted_score DESC NULLS LAST
      `;
    } else {
      // Sales:
      // - Pool: semua yg status 'pending' dan belum punya owner (user_id IS NULL)
      // - Ditambah SEMUA yg user_id = sales tsb (milik dia),
      //   termasuk yg status-nya: pending/contacted/converted/rejected
      query = `
        ${baseQuery}
        WHERE 
          (
            (n.status = 'pending' AND n.user_id IS NULL) -- pool
            OR n.user_id = $1                             -- milik sales
          )
        ORDER BY hp.predicted_score DESC NULLS LAST
      `;
      params = [userId];
    }

    const { rows } = await pool.query(query, params);
    return h.response(rows).code(200);

  } catch (error) {
    console.error('Error getLeadsHandler:', error);
    return h.response({ message: 'Gagal mengambil data leads' }).code(500);
  }
};




/**
 * GET /api/leads/{id}
 */
const getLeadByIdHandler = async (request, h) => {
  const { id } = request.params;
  try {
    const query = `
      SELECT
        n.nasabah_id AS "id",
        n.name, n.email, n.phone, n.age, n.job, n.marital, n.education,
        n.housing, n.loan, n.contact, n.campaign, n.poutcome AS "previousOutcome",
        n.balance, n.status,
        n.contacted_at AS "lastContact",
        n.contacted_at AS "contactedAt",
        n.notes,
        n.user_id AS "userId", u.name AS "contactedByName",
        COALESCE(hp.predicted_score, 0) AS "predictedScore"
      FROM nasabah n
      LEFT JOIN users u ON u.user_id = n.user_id
      LEFT JOIN LATERAL (
        SELECT predicted_score
        FROM hasil_perhitungan_probabilitas
        WHERE nasabah_id = n.nasabah_id
        ORDER BY calculation_date DESC
        LIMIT 1
      ) hp ON TRUE
      WHERE n.nasabah_id = $1
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) return h.response({ message: 'Lead not found' }).code(404);
    return h.response(rows[0]).code(200);

  } catch (error) {
    console.error('Error getLeadById:', error);
    return h.response({ message: 'Error database' }).code(500);
  }
};



/**
 * POST /api/leads (CREATE)
 */
const addLeadHandler = async (request, h) => {
  try {
    const {
      name, email, phone, age, job, marital, education, balance, housing, loan,
      campaign, poutcome, notes
    } = request.payload;

    const id = Date.now().toString();
    const status = 'pending';
    const contactedAt = new Date();

    const query = `
      INSERT INTO nasabah (
        nasabah_id, name, email, phone, age, job, marital, education,
        balance, housing, loan, status, campaign,
        poutcome, contacted_at, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, $16
      ) RETURNING nasabah_id AS "id"
    `;

    const values = [
      id, name, email, phone, age, job, marital, education,
      balance, housing, loan, status, campaign,
      poutcome || 'nonexistent', contactedAt, notes
    ];

    const { rows } = await pool.query(query, values);

    return h.response({
      message: 'Nasabah berhasil ditambahkan',
      leadId: rows[0].id
    }).code(201);

  } catch (error) {
    console.error('Error addLeadHandler:', error);
    return h.response({ message: error.message }).code(500);
  }
};



/**
 * PUT /api/leads/{id} (UPDATE INFO)
 */
const updateLeadInfoHandler = async (request, h) => {
  const { id } = request.params;
  const {
    name, email, phone, age, job, marital, education, balance, housing, loan,
    campaign, poutcome, notes
  } = request.payload;

  try {
    const query = `
      UPDATE nasabah
      SET
        name = $1, email = $2, phone = $3, age = $4, job = $5,
        marital = $6, education = $7, balance = $8, housing = $9, loan = $10,
        campaign = $11, poutcome = $12, notes = $13
      WHERE nasabah_id = $14
      RETURNING nasabah_id AS "id"
    `;

    const values = [
      name, email, phone, age, job, marital, education,
      balance, housing, loan,
      campaign, poutcome, notes,
      id
    ];

    const { rows } = await pool.query(query, values);

    if (rows.length === 0)
      return h.response({ message: 'Lead not found' }).code(404);

    return h.response({ message: 'Data nasabah berhasil diperbarui' }).code(200);

  } catch (error) {
    console.error('Error updateLeadInfo:', error);
    return h.response({ message: 'Gagal update data' }).code(500);
  }
};



/**
 * DELETE /api/leads/{id}
 */
const deleteLeadHandler = async (request, h) => {
  const { id } = request.params;
  try {
    const query = `DELETE FROM nasabah WHERE nasabah_id = $1 RETURNING nasabah_id`;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0)
      return h.response({ message: 'Lead not found' }).code(404);

    return h.response({ message: 'Nasabah berhasil dihapus' }).code(200);

  } catch (error) {
    console.error('Error deleteLead:', error);
    return h.response({ message: 'Gagal menghapus data' }).code(500);
  }
};



/**
 * PUT /api/leads/{id}/status
 * MENANGANI: contacted, converted, rejected, pending
 * Including:
 * - Reject → lepas owner
 * - Reject → masuk log KPI
 * - Semua status (kecuali pending) → masuk log KPI
 */
const updateLeadStatusHandler = async (request, h) => {
  const { id } = request.params;
  const { status, userId } = request.payload;

  try {
    const updateQuery = `
      UPDATE nasabah
      SET 
        status = $1::varchar,
        contacted_at = CASE 
          WHEN $1::varchar = 'pending' THEN NULL 
          ELSE NOW() 
        END,
        user_id = CASE 
          -- Kalau status jadi pending, lepaskan owner (kembali ke pool)
          WHEN $1::varchar = 'pending' THEN NULL
          -- Kalau status bukan pending, dan belum ada owner, isi dengan userId (sales)
          WHEN (user_id IS NULL OR user_id = '')
               AND $1::varchar <> 'pending'
            THEN $2::varchar
          -- Kalau sudah ada owner, biarkan
          ELSE user_id
        END
      WHERE nasabah_id = $3::varchar
      RETURNING nasabah_id AS "id", status, user_id
    `;

    const params = [status, userId, id];
    const { rows } = await pool.query(updateQuery, params);

    if (rows.length === 0)
      return h.response({ message: 'Lead not found' }).code(404);

    // MASUKKAN KE LOG KPI (kecuali pending)
    if (status !== 'pending') {
      await pool.query(
        `INSERT INTO nasabah_sales_log (nasabah_id, user_id, status)
         VALUES ($1, $2, $3)`,
        [id, userId, status]
      );
    }

    return h.response(rows[0]).code(200);

  } catch (error) {
    console.error("updateLeadStatusHandler Error:", error);
    return h.response({ message: error.message }).code(500);
  }
};



/**
 * PUT /api/leads/{id}/notes
 */
const updateLeadNotesHandler = async (request, h) => {
  const { id } = request.params;
  const { notes } = request.payload;

  try {
    const query = `UPDATE nasabah SET notes = $1 WHERE nasabah_id = $2 RETURNING nasabah_id`;
    const { rows } = await pool.query(query, [notes, id]);

    if (rows.length === 0)
      return h.response({ message: 'Lead not found' }).code(404);

    return h.response(rows[0]).code(200);

  } catch (error) {
    console.error('updateLeadNotesHandler Error:', error);
    return h.response({ message: error.message }).code(500);
  }
};



/**
 * POST /api/leads/refresh-ml
 */
const refreshLeadsWithMLHandler = async (request, h) => {
  try {
    const scriptPath = path.resolve(__dirname, '../../../../ML/hitung_skor_nasabah.py');
    const pythonCommand = 'python';

    const runPython = () =>
      new Promise((resolve, reject) => {
        exec(`${pythonCommand} "${scriptPath}"`, (error, stdout, stderr) => {
          if (error) {
            console.error('Python Error:', stderr || error.message);
            return reject(error);
          }
          console.log('Python Output:', stdout || '(no output)');
          resolve(null);
        });
      });

    await runPython();
    return h.response({ message: 'Skor ML berhasil di-refresh' }).code(200);

  } catch (error) {
    console.error('refreshLeadsWithMLHandler Error:', error);
    return h.response({ message: 'Gagal refresh skor ML' }).code(500);
  }
};



/**
 * GET /api/users/:id/leads
 */
const getLeadsByUserHandler = async (request, h) => {
  const { id } = request.params;
  try {
    const query = `
      SELECT
        n.nasabah_id AS id,
        n.name,
        n.email,
        n.phone,
        COALESCE(n.contacted_at, n.contacted_at) AS contactedAt,
        COALESCE(n.status, 'pending') AS status,
        n.campaign,
        n.notes
      FROM nasabah n
      WHERE n.user_id = $1
        AND n.status IN ('contacted', 'converted')
      ORDER BY n.contacted_at DESC NULLS LAST
    `;

    const { rows } = await pool.query(query, [id]);
    return h.response(rows).code(200);

  } catch (err) {
    console.error('getLeadsByUserHandler error:', err);
    return h.response({ message: 'Gagal mengambil daftar nasabah untuk user' }).code(500);
  }
};

/**
 * GET /api/users/:id/leads-history
 * Mengambil riwayat lead per-sales dari nasabah_sales_log
 */
const getSalesHistoryByUserHandler = async (request, h) => {
  const { id } = request.params; // user_id (sales)
  try {
    const query = `
      SELECT
        l.id AS log_id,
        n.nasabah_id AS id,
        n.name,
        n.email,
        n.phone,
        n.age,
        n.job,
        n.marital,
        n.education,
        n.campaign,
        n.notes,
        l.status,             
        l.changed_at AS "contactedAt"
      FROM nasabah_sales_log l
      JOIN nasabah n ON n.nasabah_id = l.nasabah_id
      WHERE l.user_id = $1
      ORDER BY l.changed_at ASC
    `;

    const { rows } = await pool.query(query, [id]);
    return h.response(rows).code(200);
  } catch (err) {
    console.error('getSalesHistoryByUserHandler error:', err);
    return h
      .response({ message: 'Gagal mengambil riwayat nasabah untuk user' })
      .code(500);
  }
};


module.exports = {
  getLeadsHandler,
  getLeadByIdHandler,
  getLeadsByUserHandler,
  getSalesHistoryByUserHandler,
  addLeadHandler,
  updateLeadInfoHandler,
  deleteLeadHandler,
  updateLeadStatusHandler,
  updateLeadNotesHandler,
  refreshLeadsWithMLHandler,
};
