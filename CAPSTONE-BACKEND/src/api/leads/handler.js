const pool = require('../../db');
const { exec } = require('child_process');  

/**
 * GET /api/leads
 * Ambil semua leads + skor ML terbaru
 */
const getLeadsHandler = async (request, h) => {
  try {
    const { userId, role } = request.query;

    let query;
    let params = [];

    if (role === 'admin') {
      query = `
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
        ORDER BY hp.predicted_score DESC NULLS LAST;
      `;
    } else {
      query = `
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
          n.contacted_at AS "contactedAt",
          n.notes,
          n.user_id AS "userId",
          u.name AS "contactedByName",
          COALESCE(hp.predicted_score, 0) AS "predictedScore"
        FROM nasabah n
        LEFT JOIN users u ON u.user_id = n.user_id   -- <-- ini tadinya masih pakai u.id
        LEFT JOIN LATERAL (
          SELECT predicted_score
          FROM hasil_perhitungan_probabilitas
          WHERE nasabah_id = n.nasabah_id
          ORDER BY calculation_date DESC
          LIMIT 1
        ) hp ON TRUE
        WHERE
          (n.status = 'pending' AND n.user_id IS NULL)
          OR n.user_id = $1
        ORDER BY hp.predicted_score DESC NULLS LAST;
      `;
      params = [userId];
    }

   
    const { rows } = await pool.query(query, params);
    return h.response(rows).code(200);
  } catch (error) {
    console.error('Error getLeadsHandler:', error);
    return h
      .response({ message: 'Gagal mengambil data leads dari database' })
      .code(500);
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
    n.name,
    n.email,
    n.phone,
    n.age,
    n.job,
    n.marital,
    n.education,
    n.housing,
    n.loan,
    n.contact,
    n.campaign,
    n.poutcome AS "previousOutcome",
    n.balance,
    n.status,
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
  WHERE n.nasabah_id = $1;
`;

    const { rows } = await pool.query(query, [id]);
console.log('DETAIL DARI DB:', rows[0]);   
    if (rows.length === 0) {
      return h.response({ message: 'Lead not found' }).code(404);
    }

    return h.response(rows[0]).code(200);
  } catch (error) {
    console.error('Error getLeadByIdHandler:', error);
    return h.response({ message: 'Gagal mengambil detail lead' }).code(500);
  }
};


/**
 * PUT /api/leads/{id}/status
 */
const updateLeadStatusHandler = async (request, h) => {
  const { id } = request.params;
  const { status, userId } = request.payload;

  try {
    const query = `
      UPDATE nasabah
      SET 
        status = $1::text,
        contacted_at = CASE
          WHEN $1::text = 'pending' THEN contacted_at
          ELSE NOW()
        END,
        user_id = CASE
          WHEN $1::text <> 'pending' AND user_id IS NULL THEN $2
          ELSE user_id
        END
      WHERE nasabah_id = $3
      RETURNING
        nasabah_id AS "id",
        status,
        contacted_at AS "contactedAt",
        user_id;
    `;

    const { rows } = await pool.query(query, [status, userId, id]);

    return h.response(rows[0]).code(200);

  } catch (error) {
    console.error('ERROR UPDATE:', error.message);
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
    const query = `
      UPDATE nasabah
      SET notes = $1
      WHERE nasabah_id = $2
      RETURNING
        nasabah_id AS "id",
        notes;
    `;

    const { rows } = await pool.query(query, [notes, id]);

    if (rows.length === 0) {
      return h.response({ message: 'Lead not found' }).code(404);
    }

    return h.response(rows[0]).code(200);

  } catch (error) {
    console.error('Error updateLeadNotesHandler:', error);
    return h.response({ message: 'Gagal update notes' }).code(500);
  }
};

// POST /api/leads/refresh-ml
const refreshLeadsWithMLHandler = async (request, h) => {
  try {
    const pythonCommand = 'python';
    const scriptPath = '../ML/hitung_skor_nasabah.py';

    const runPython = () =>
      new Promise((resolve, reject) => {
        exec(`${pythonCommand} ${scriptPath}`, (error, stdout, stderr) => {
          if (error) {
            console.error('Error saat menjalankan Python:', error);
            console.error('stderr:', stderr);
            return reject(error);
          }
          console.log('Python stdout:', stdout);
          resolve(null);
        });
      });

    await runPython();

    
    return h.response({ message: 'Skor ML berhasil di-refresh' }).code(200);

  } catch (error) {
    console.error('Error refreshLeadsWithMLHandler:', error);
    return h.response({ message: 'Gagal refresh skor ML' }).code(500);
  }
};


module.exports = {
  getLeadsHandler,
  getLeadByIdHandler,
  updateLeadStatusHandler,
  updateLeadNotesHandler,
  refreshLeadsWithMLHandler,
};
