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

    // PERBAIKAN: Mengganti n.last_contact menjadi n.contacted_at
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
      // Admin melihat semua data
      query = `${baseQuery} ORDER BY hp.predicted_score DESC NULLS LAST`;
    } else {
      // User melihat data pending atau miliknya sendiri
      query = `
        ${baseQuery} 
        WHERE (n.status = 'pending' AND n.user_id IS NULL) OR n.user_id = $1
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
    // PERBAIKAN: Mengganti n.last_contact menjadi n.contacted_at
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

    const id = Date.now().toString(); // ID Unik sederhana
    const status = 'pending';
    const contactedAt = new Date(); // Waktu saat ini

    // PERBAIKAN: Menggunakan contacted_at (sesuai SQL) bukan last_contact
    const query = `
      INSERT INTO nasabah (
        nasabah_id, name, email, phone, age, job, marital, education, 
        balance, housing, loan, status, campaign, 
        poutcome, contacted_at, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
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
 * PUT /api/leads/{id} (UPDATE FULL)
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

    if (rows.length === 0) return h.response({ message: 'Lead not found' }).code(404);

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

    if (rows.length === 0) return h.response({ message: 'Lead not found' }).code(404);

    return h.response({ message: 'Nasabah berhasil dihapus' }).code(200);
  } catch (error) {
    console.error('Error deleteLead:', error);
    return h.response({ message: 'Gagal menghapus data' }).code(500);
  }
};

/**
 * PUT /api/leads/{id}/status
 */
const updateLeadStatusHandler = async (request, h) => {
  const { id } = request.params;
  const { status, userId } = request.payload;

  try {
    // PERBAIKAN: Menggunakan contacted_at
    const query = `
      UPDATE nasabah
      SET 
        status = $1,
        contacted_at = CASE WHEN $1 = 'pending' THEN NULL ELSE NOW() END,
        user_id = CASE WHEN $1 <> 'pending' AND user_id IS NULL THEN $2 ELSE user_id END
      WHERE nasabah_id = $3
      RETURNING nasabah_id AS "id", status
    `;
    const { rows } = await pool.query(query, [status, userId, id]);
    return h.response(rows[0]).code(200);
  } catch (error) {
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
    if (rows.length === 0) return h.response({ message: 'Lead not found' }).code(404);
    return h.response(rows[0]).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
};

/**
 * POST /api/leads/refresh-ml
 */
const refreshLeadsWithMLHandler = async (request, h) => {
  try {
    // PERBAIKAN: Menggunakan path absolute agar aman dijalankan dari folder manapun
    const scriptPath = path.resolve(__dirname, '../../../../ML/hitung_skor_nasabah.py');
    const pythonCommand = 'python'; 

    console.log('Menjalankan script Python di:', scriptPath);

    const runPython = () =>
      new Promise((resolve, reject) => {
        exec(`${pythonCommand} "${scriptPath}"`, (error, stdout, stderr) => {
          if (error) {
            console.error('Python Error:', stderr);
            return reject(error);
          }
          console.log('Python Output:', stdout);
          resolve(null);
        });
      });

    await runPython();
    return h.response({ message: 'Skor ML berhasil di-refresh' }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ message: 'Gagal refresh skor ML' }).code(500);
  }
};

module.exports = {
  getLeadsHandler,
  getLeadByIdHandler,
  addLeadHandler,
  updateLeadInfoHandler,
  deleteLeadHandler,
  updateLeadStatusHandler,
  updateLeadNotesHandler,
  refreshLeadsWithMLHandler,
};