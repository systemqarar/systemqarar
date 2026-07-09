import db from '../../../../config/db';
import { AdminPosition } from './executive-board.types';

export class ExecutiveBoardModel {
  
  // 1. جلب أعضاء الهيكل الإداري الحاليين
  static async getCurrentBoard() {
    const query = `
      SELECT 
        u.id as user_id,
        p.volunteer_number,
        u.role,
        p.full_name,
        p.phone,
        p.whatsapp,
        p.photo_url,
        ap.position_key as admin_position
      FROM users u
      JOIN volunteer_profiles p ON u.id = p.user_id
      INNER JOIN admin_positions ap ON p.admin_position_id = ap.id;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // 2. جلب المتطوعين العاديين المتاحين للتعيين (الذين ليس لديهم منصب حالي)
  static async getAvailableVolunteers() {
    const query = `
      SELECT 
        u.id as user_id,
        p.volunteer_number,
        p.full_name,
        p.phone
      FROM users u
      JOIN volunteer_profiles p ON u.id = p.user_id
      WHERE p.admin_position_id IS NULL
      AND u.role IN ('volunteer', 'volunteer_trainer')
      ORDER BY p.full_name ASC;
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // 3. التعيين الذكي والمحمي (Transaction) - الوصول للـ pool من داخل الـ db
  static async assignPosition(volunteerNumber: string, position: AdminPosition) {
    // الحل الجذري: استدعاء الـ connect من الـ pool المعرّف داخل كائن الـ db الخاص بك
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // أولاً: جلب الـ UUID الخاص بالمنصب من جدول المناصب الجديد
      const positionQuery = `SELECT id FROM admin_positions WHERE position_key = $1;`;
      const positionRes = await client.query(positionQuery, [position]);

      if (positionRes.rows.length === 0) {
        throw new Error('المنصب الإداري المطلوب غير مدرج في النظام الحالي');
      }

      const positionUuid = positionRes.rows[0].id;

      // ---- [خطوة الأمان الإداري]: إخلاء المنصب من الشاغل الحالي إن وُجد ----
      const demoteCurrentOccupantUser = `
        UPDATE users 
        SET role = 'volunteer' 
        WHERE id = (
          SELECT user_id FROM volunteer_profiles WHERE admin_position_id = $1 LIMIT 1
        );
      `;
      await client.query(demoteCurrentOccupantUser, [positionUuid]);

      const demoteCurrentOccupantProfile = `
        UPDATE volunteer_profiles 
        SET admin_position_id = NULL 
        WHERE admin_position_id = $1;
      `;
      await client.query(demoteCurrentOccupantProfile, [positionUuid]);
      // -----------------------------------------------------------------

      // ---- [خطوة التعيين الجديد]: تسليم الكرسي للمتطوع الجديد ----
      const updateUserQuery = `
        UPDATE users 
        SET role = $1 
        WHERE volunteer_number = $2 
        RETURNING id;
      `;
      const userResult = await client.query(updateUserQuery, [position, volunteerNumber]);

      if (userResult.rowCount === 0) {
        throw new Error('المتطوع غير موجود في نظام الحسابات الرئيسي');
      }

      const updateProfileQuery = `
        UPDATE volunteer_profiles 
        SET admin_position_id = $1 
        WHERE volunteer_number = $2;
      `;
      await client.query(updateProfileQuery, [positionUuid, volunteerNumber]);
      // -----------------------------------------------------------------

      await client.query('COMMIT');
      return { success: true, message: 'تم التعيين وتحديث الصلاحيات بنجاح وإخلاء المنصب السابق تلقائياً' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release(); // إغلاق الاتصال بأمان وإرجاعه للـ Pool
    }
  }

  // 4. الإعفاء النظيف من المنصب وإرجاع العضو لمرتبة متطوع عادي
  static async exemptPosition(volunteerNumber: string) {
    // الحل الجذري: استدعاء الـ connect من الـ pool المعرّف داخل كائن الـ db الخاص بك
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const updateUserQuery = `
        UPDATE users 
        SET role = 'volunteer' 
        WHERE volunteer_number = $1 
        RETURNING id;
      `;
      const userResult = await client.query(updateUserQuery, [volunteerNumber]);

      if (userResult.rowCount === 0) {
        throw new Error('العضو غير موجود في النظام');
      }

      const updateProfileQuery = `
        UPDATE volunteer_profiles 
        SET admin_position_id = NULL 
        WHERE volunteer_number = $1;
      `;
      await client.query(updateProfileQuery, [volunteerNumber]);

      await client.query('COMMIT');
      return { success: true, message: 'تم إعفاء العضو بنجاح وإعادته لرتبة متطوع' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release(); // إغلاق الاتصال بأمان وإرجاعه للـ Pool
    }
  }
}
