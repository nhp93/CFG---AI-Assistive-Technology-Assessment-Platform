export function getStaffNotesData(staff) {
  try {
    return staff?.notes ? JSON.parse(staff.notes) : {}
  } catch {
    return {}
  }
}
