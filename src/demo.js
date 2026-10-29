/* ВРЕМЕННЫЕ ДЕМО-ДАННЫЕ для разделов, у которых пока нет таблиц в Supabase
   (кибероны, КИБЕРшоп, новости, оплата, место обучения, тьютор группы, контакты).
   Когда появятся таблицы — заменить на запросы к базе. */

export const DEMO_BALANCE = {
  amount: 5120,
  history: [
    { id: 1, date: '2026-10-25', title: 'Задание «Скрипты на Lua» принято', amount: 150 },
    { id: 2, date: '2026-10-18', title: 'Посещение занятия', amount: 100 },
    { id: 3, date: '2026-10-12', title: 'Покупка в КИБЕРшопе: стикерпак', amount: -300 },
    { id: 4, date: '2026-10-11', title: 'Активность на уроке', amount: 50 },
    { id: 5, date: '2026-10-04', title: 'Приглашение друга', amount: 500 },
  ],
  howToEarn: [
    { title: 'Посещай занятия', amount: 100 },
    { title: 'Сдавай домашние задания', amount: 150 },
    { title: 'Будь активным на уроке', amount: 50 },
    { title: 'Пригласи друга в KIBERone', amount: 500 },
  ],
}

export const DEMO_PAYMENT = {
  status: 'overdue', // 'paid' | 'soon' | 'overdue'
  date: '2026-11-01',
  amount: 6500,
  history: [
    { id: 1, date: '2026-10-01', title: 'Абонемент, октябрь', amount: 6500 },
    { id: 2, date: '2026-09-01', title: 'Абонемент, сентябрь', amount: 6500 },
  ],
}

export const DEMO_BANNERS = [
  { id: 1, title: 'Цифровые технологии', sub: 'для детей от 6 до 14 лет', tone: 'yellow' },
  { id: 2, title: 'КИБЕРканикулы', sub: 'пятидневный IT-интенсив', tone: 'teal' },
  { id: 3, title: 'Приведи друга', sub: 'и получи 500 киберонов', tone: 'dark' },
]

export const DEMO_NEWS = [
  { id: 1, date: '2026-10-28', title: 'Скидка на абонемент 10%', text: 'При оплате абонемента за 3 месяца — скидка 10%. Подробности у администратора твоей локации.', tone: 'yellow' },
  { id: 2, date: '2026-10-20', title: 'Осенние КИБЕРканикулы', text: 'Пятидневный IT-интенсив для детей 8–14 лет: создаём игру, мультфильм и собственного чат-бота.', tone: 'teal' },
  { id: 3, date: '2026-10-10', title: 'Новинки в КИБЕРшопе', text: 'В магазин приехали рюкзаки, худи и стикерпаки KIBERone. Обменивай кибероны на мерч!', tone: 'dark' },
]

export const DEMO_SHOP = [
  { id: 1, title: 'Рюкзак айтишника', price: 4500, tags: ['new', 'sale'], tone: 'teal' },
  { id: 2, title: 'Худи KIBERone', price: 6000, tags: ['new'], tone: 'yellow' },
  { id: 3, title: 'Бутылка для воды', price: 1500, tags: ['sale'], tone: 'dark' },
  { id: 4, title: 'Стикерпак', price: 300, tags: [], tone: 'yellow' },
  { id: 5, title: 'Блокнот программиста', price: 900, tags: [], tone: 'teal' },
  { id: 6, title: 'Кепка KIBERone', price: 2500, tags: ['new'], tone: 'dark' },
]

export const DEMO_GROUP_INFO = {
  location: 'Локация 2, ауд. 02',
  tutor: 'Твой тьютор',
}

export const CONTACTS = [
  { icon: 'phone', label: 'Позвонить', href: 'tel:+70000000000' },
  { icon: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/70000000000' },
  { icon: 'mail', label: 'Почта', href: 'mailto:info@kiber-one.com' },
  { icon: 'telegram', label: 'Telegram', href: 'https://t.me/' },
  { icon: 'globe', label: 'Сайт', href: 'https://kiber-one.com' },
]
