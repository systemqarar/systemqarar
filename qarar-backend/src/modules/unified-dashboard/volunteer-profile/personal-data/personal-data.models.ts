import { Pool } from 'pg';
import { VolunteerProfileInput } from './personal-data.types';

// 🔌 الاتصال الآمن بالسيرفر
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/**
 * 📥 1. دالة حفظ وتحديث البيانات (UPSERT)
 */
export const saveOrUpdateProfileModel = async (data: VolunteerProfileInput) => {
  const queryText = `
    INSERT INTO volunteer_profiles (
      volunteer_id, full_name, national_id, gender, birth_date, 
      blood_type, marital_status, email, education, occupation, 
      address, preferred_office, is_niqabi, profile_image_url, updated_at
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
    ON CONFLICT (volunteer_id) 
    DO UPDATE SET
      gender = EXCLUDED.gender,
      birth_date = EXCLUDED.birth_date,
      blood_type = EXCLUDED.blood_type,
      marital_status = EXCLUDED.marital_status,
      email = EXCLUDED.email,
      education = EXCLUDED.education,
      occupation = EXCLUDED.occupation,
      address = EXCLUDED.address,
      preferred_office = EXCLUDED.preferred_office,
      is_niqabi = EXCLUDED.is_niqabi,
      profile_image_url = EXCLUDED.profile_image_url,
      updated_at = NOW()
    RETURNING *;
  `;

  const values = [
    data.volunteerId, data.fullName, data.nationalId, data.gender, data.birthDate, 
    data.bloodType, data.maritalStatus, data.email, data.education, data.occupation, 
    data.address, data.preferredOffice, data.isNiqabi, data.profileImageUrl
  ];

  const result = await pool.query(queryText, values);
  return result.rows[0];
};

/**
 * 📤 2. دالة جلب وقراءة البيانات الحقيقية من قاعدة بيانات Neon
 */
export const getProfileFromDBModel = async (volunteerId: string) => {
  const queryText = `
    SELECT 
      volunteer_id AS "volunteerId", 
      full_name AS "fullName", 
      national_id AS "nationalId", 
      gender, 
      birth_date AS "birthDate", 
      blood_type AS "bloodType", 
      marital_status AS "maritalStatus", 
      email, 
      education, 
      occupation, 
      address, 
      preferred_office AS "preferredOffice", 
      is_niqabi AS "isNiqabi", 
      profile_image_url AS "profileImageUrl"
    FROM volunteer_profiles 
    WHERE volunteer_id = $1;
  `;
  
  const result = await pool.query(queryText, [volunteerId]);
  return result.rows[0];
};
