import { BadgeCheck, HeartHandshake, TrendingUp, HeartPulse } from 'lucide-react';

const benefits = [
  {
    icon: BadgeCheck,
    title: 'ЭКСПЕРТНЫЙ ПОДХОД',
    text: 'Индивидуальный подход тренера и его экспертиза — твой план, твоя техника, твой результат.'
  },
  {
    icon: HeartHandshake,
    title: 'ДОМАШНЯЯ АТМОСФЕРА',
    text: 'Уютная, поддерживающая атмосфера, без суеты, без лишних глаз. Здесь комфортно быть собой.'
  },
  {
    icon: TrendingUp,
    title: 'ПРОГРЕСС И РАЗВИТИЕ',
    text: 'Анализируем твой прогресс, подбираем нагрузку и корректируем план под твои цели.'
  },
  {
    icon: HeartPulse,
    title: 'ЗАБОТА О ТВОЕМ ЗДОРОВЬЕ',
    text: 'Сильное тело — это энергия, уверенность и качество жизни.'
  },
];

export function Benefits() {
  return (
    <section className="benefits" id="about">
      <div className="container benefits-grid">
        {benefits.map(({ icon: Icon, title, text }) => (
          <article className="benefit" key={title}>
            <div className="line-icon">
              <Icon size={23} strokeWidth={1.5} />
            </div>

            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}