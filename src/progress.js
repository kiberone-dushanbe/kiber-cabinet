/* Общая логика прогресса ученика: используется на главной и в боковом меню */

/** Текущий урок модуля: первый с несданным/непринятым заданием, иначе последний */
export function currentIndex(lessons, subs) {
  const i = lessons.findIndex((l) => l.task && subs[l.id]?.status !== 'accepted')
  return i === -1 ? lessons.length - 1 : i
}

/** Модуль по умолчанию — первый, где есть непринятые задания, иначе последний */
export function pickModule(modules, subs) {
  if (!modules?.length) return null
  return modules.find((m) => m.lessons.some((l) => l.task && subs[l.id]?.status !== 'accepted')) || modules[modules.length - 1]
}
