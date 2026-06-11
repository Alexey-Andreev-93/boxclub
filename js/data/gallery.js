import gallery1 from '../../images/gallery/gallery-1.jpg';
import gallery2 from '../../images/gallery/gallery-2.jpg';
import competition1 from '../../images/gallery/competition-1.jpg';
import team1 from '../../images/gallery/team-1.jpg';
import training1 from '../../images/gallery/training-1.jpg';
import trainer1 from '../../images/trainer/trainer-1.jpg';
import achievement from '../../images/hero/achievement.jpg';

export const GALLERY_ITEMS = [
  {
    id: 1,
    image: gallery1,
    title: "Профессиональная тренировка",
    description: "Индивидуальная работа с тренером над техникой ударов",
    type: "training",
    badge: "Тренировка",
    date: "15.01.2024",
    category: "Тренировочный процесс",
    featured: true,
  },
  {
    id: 2,
    image: gallery2,
    title: "Золото регионального чемпионата",
    description:
      "Наш спортсмен завоевал первое место в весовой категории до 75кг",
    type: "competitions",
    badge: "Победа",
    date: "10.12.2023",
    category: "Соревнования",
  },
  {
    id: 3,
    image: gallery2,
    title: "Командные сборы",
    description: "Зимние тренировочные сборы в спортивном лагере",
    type: "team",
    badge: "Команда",
    date: "05.11.2023",
    category: "Командные мероприятия",
  },
  {
    id: 4,
    image: trainer1,
    title: "Работа в парах",
    description: "Отработка защитных техник и контратак в спаррингах",
    type: "training",
    badge: "Спарринг",
    date: "20.01.2024",
    category: "Тренировочный процесс",
  },
  {
    id: 5,
    image: competition1,
    title: "Кубок победителей",
    description: "Завоевание главного трофея зимнего сезона",
    type: "competitions",
    badge: "Кубок",
    date: "12.12.2023",
    category: "Соревнования",
  },
  {
    id: 6,
    image: team1,
    title: "Силовая подготовка",
    description: "Развитие физической мощи для мощных нокаутирующих ударов",
    type: "training",
    badge: "ОФП",
    date: "25.01.2024",
    category: "Тренировочный процесс",
  },
  {
    id: 7,
    image: training1,
    title: "Товарищеская встреча",
    description: "Встреча с боксерами из соседнего клуба",
    type: "team",
    badge: "Встреча",
    date: "18.11.2023",
    category: "Командные мероприятия",
  },
  {
    id: 8,
    image: achievement,
    title: "Техника работы ног",
    description: "Освоение правильной стойки и перемещений по рингу",
    type: "training",
    badge: "Техника",
    date: "30.01.2024",
    category: "Тренировочный процесс",
  },
];