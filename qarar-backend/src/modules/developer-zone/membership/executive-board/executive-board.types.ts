// 1. تعريف المناصب الـ 16 الرسمية المعتمدة في النظام (مفروزة إدارياً)
export type AdminPosition =
  // 👥 أولاً: المكاتب التنفيذية التابعة للوحدة (14 منصب)
  | 'unit_head'                         // رئيس الوحدة
  | 'deputy_unit_head'                  // نائب رئيس الوحدة
  | 'unit_secretary'                    // أمين أمانة التنسيق والمتابعة والسرية
  | 'deputy_unit_secretary'             // مساعد أمين أمانة التنسيق والمتابعة
  | 'financial_secretary'               // أمين الأمانة المالية
  | 'deputy_financial_secretary'        // مساعد أمين الأمانة المالية
  | 'media_secretary'                   // أمين أمانة الإعلام والتوثيق الإلكتروني
  | 'deputy_media_secretary'            // مساعد أمين أمانة الإعلام والتوثيق
  | 'social_secretary'                  // أمين أمانة البرامج والعمل الاجتماعي
  | 'deputy_social_secretary'           // مساعد أمين أمانة البرامج والعمل الاجتماعي
  | 'training_youth_secretary'          // أمين أمانة التدريب وتنمية القدرات الشبابية
  | 'deputy_training_youth_secretary'   // مساعد أمين أمانة التدريب وتنمية القدرات
  | 'women_secretary'                   // أمين أمانة شؤون المرأة المتطوعة
  | 'deputy_women_secretary'            // مساعد أمين أمانة شؤون المرأة المتطوعة
  
  // 🏛️ ثانياً: المكاتب الإشرافية والتدريبية التابعة للمحلية (منصبين)
  | 'locality_training_director'        // مدير مكتب تدريب الإسعافات الأولية بالمحلية
  | 'supervisory_office';               // المكتب الإشرافي للوحدة

// 2. واجهة البيانات (Payload) المطلوبة عند إرسال طلب تعيين منصب جديد لمتطوع
export interface AssignPositionPayload {
  volunteerNumber: string; // رقم المتطوع المستهدف (Volunteer Number)
  position: AdminPosition; // المنصب الإداري المراد تعيينه فيه
}

// 3. واجهة البيانات (Payload) المطلوبة عند إرسال طلب إعفاء عضو من منصبه
export interface ExemptPositionPayload {
  volunteerNumber: string; // رقم المتطوع المراد سحب المنصب منه وإعادته لرتبة متطوع
}
