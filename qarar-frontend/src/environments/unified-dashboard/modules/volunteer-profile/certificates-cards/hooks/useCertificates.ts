setCertificatesData({
  volunteerId: d.volunteerId || d.volunteerNumber || volunteerId,
  fullName: d.fullName || 'متطوع غير مسمى',
  nationalId: d.nationalId,
  profileImageUrl: d.profileImageUrl,
  adminPosition: d.adminPosition,
  gender: d.gender,
  isNiqabi: d.isNiqabi,
  phone: d.phone || d.phoneNumber || 'غير مسجل', // 🎯 قراءة الهاتف
  unitName: d.unitName || 'مكتب الطوارئ المركزي', // 🎯 قراءة الوحدة الإدارية
  approvedAt: d.approvedAt || d.createdAt,
  isTotTrainer: d.isTotTrainer,
  totYear: d.totYear,
  totCertificateUrl: d.totCertificateUrl,
  otherCertificateUrl: d.otherCertificateUrl,
  lastFirstAidRefresher: d.lastFirstAidRefresher
});
