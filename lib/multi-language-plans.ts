export type DayPlan = {
  id: number;
  title: string;
  goal: string;
  readingScript: string;
  tasks: string[];
};

export type LanguagePlan = {
  [key: string]: DayPlan[];
};

// English Learning Plan (Original)
const englishPlan: DayPlan[] = [
  {
    id: 1,
    title: 'Break the Fear',
    goal: 'Speak about yourself without worrying about mistakes.',
    readingScript: 'Hello. My name is __________. I am from Bangladesh. Bengali is my first language, and I am learning English to become more confident. I want to speak clearly at work and in daily life. I may make mistakes, but I will keep going.',
    tasks: ['Read the script aloud 3 times', 'Record a 1 to 2 minute introduction', 'Rate your confidence from 1 to 5', 'Mark the day complete']
  },
  {
    id: 2,
    title: 'Talk About Your Day',
    goal: 'Describe your daily routine in simple English.',
    readingScript: 'I usually wake up in the morning and start my day with simple tasks. After that, I get ready for work. During the day, I complete my tasks, talk to people, and try to stay focused. In the evening, I spend time with my family and take some rest.',
    tasks: ['Read the script aloud 3 times', 'Speak for 2 minutes about your routine', 'Upload or record audio', 'Write one sentence about what felt difficult']
  },
  // ... rest of English plan copied from original
];

// Spanish Learning Plan
const spanishPlan: DayPlan[] = [
  {
    id: 1,
    title: 'Rompe el Miedo',
    goal: 'Habla sobre ti sin preocuparte por los errores.',
    readingScript: 'Hola. Mi nombre es __________. Soy de Bangladesh. El bengalí es mi primer idioma, y estoy aprendiendo español para ser más seguro. Quiero hablar claramente en el trabajo y en la vida diaria. Puedo cometer errores, pero seguiré adelante.',
    tasks: ['Lee el guión en voz alta 3 veces', 'Graba una introducción de 1 a 2 minutos', 'Califica tu confianza del 1 al 5', 'Marca el día como completo']
  },
  {
    id: 2,
    title: 'Habla sobre tu Día',
    goal: 'Describe tu rutina diaria en español simple.',
    readingScript: 'Normalmente me despierto por la mañana y comienzo mi día con tareas simples. Después de eso, me preparo para el trabajo. Durante el día, completo mis tareas, hablo con la gente e intento mantenerme concentrado. Por la noche, paso tiempo con mi familia y descanso.',
    tasks: ['Lee el guión en voz alta 3 veces', 'Habla durante 2 minutos sobre tu rutina', 'Sube o graba audio', 'Escribe una oración sobre lo que fue difícil']
  },
  // Add more days...
];

// German Learning Plan
const germanPlan: DayPlan[] = [
  {
    id: 1,
    title: 'Überwinde die Angst',
    goal: 'Sprich über dich selbst, ohne dir Sorgen um Fehler zu machen.',
    readingScript: 'Hallo. Mein Name ist __________. Ich komme aus Bangladesch. Bengali ist meine Muttersprache und ich lerne Deutsch, um selbstbewusster zu werden. Ich möchte klar bei der Arbeit und im täglichen Leben sprechen. Ich kann Fehler machen, aber ich werde weitermachen.',
    tasks: ['Lies das Skript 3 Mal laut vor', 'Nimm eine 1- bis 2-minütige Vorstellung auf', 'Bewerte dein Selbstvertrauen von 1 bis 5', 'Markiere den Tag als abgeschlossen']
  },
  {
    id: 2,
    title: 'Sprich über deinen Tag',
    goal: 'Beschreibe deine tägliche Routine auf einfachem Deutsch.',
    readingScript: 'Ich wache normalerweise morgens auf und beginne meinen Tag mit einfachen Aufgaben. Danach mache ich mich für die Arbeit fertig. Während des Tages erledige ich meine Aufgaben, spreche mit Menschen und versuche konzentriert zu bleiben. Am Abend verbringe ich Zeit mit meiner Familie und ruhe mich aus.',
    tasks: ['Lies das Skript 3 Mal laut vor', 'Sprich 2 Minuten über deine Routine', 'Lade Audio hoch oder nimm auf', 'Schreibe einen Satz darüber, was schwierig war']
  },
  // Add more days...
];

// Russian Learning Plan
const russianPlan: DayPlan[] = [
  {
    id: 1,
    title: 'Преодолей страх',
    goal: 'Говори о себе, не беспокоясь об ошибках.',
    readingScript:'Здравствуйте. Меня зовут __________. Я из Бангладеш. Бенгальский - мой родной язык, и я изучаю русский, чтобы стать увереннее. Я хочу ясно говорить на работе и в повседневной жизни. Я могу делать ошибки, но я буду продолжать.',
    tasks: ['Прочитай сценарий вслух 3 раза', 'Запиши введение на 1-2 минуты', 'Оцени свою уверенность от 1 до 5', 'Отметь день как завершенный']
  },
  {
    id: 2,
    title: 'Расскажи о своем дне',
    goal: 'Опиши свой распорядок дня на простом русском.',
    readingScript: 'Обычно я просыпаюсь утром и начинаю день с простых задач. После этого я готовлюсь к работе. В течение дня я выполняю свои задачи, разговариваю с людьми и стараюсь оставаться сосредоточенным. Вечером я провожу время с семьей и отдыхаю.',
    tasks: ['Прочитай сценарий вслух 3 раза', 'Говори 2 минуты о своей рутине', 'Загрузи или запиши аудио', 'Напиши одно предложение о том, что было трудно']
  },
  // Add more days...
];

// Chinese Learning Plan
const chinesePlan: DayPlan[] = [
  {
    id: 1,
    title: '打破恐惧',
    goal: '不用担心错误，谈论你自己。',
    readingScript: '你好。我叫__________。我来自孟加拉国。孟加拉语是我的母语，我正在学习中文以变得更自信。我想在工作和日常生活中清楚地说话。我可能会犯错，但我会继续前进。',
    tasks: ['大声朗读剧本3次', '录制1到2分钟的自我介绍', '将你的信心从1到5评分', '标记这一天为完成']
  },
  {
    id: 2,
    title: '谈论你的一天',
    goal: '用简单的中文描述你的日常作息。',
    readingScript: '我通常早上醒来，开始做简单的任务。之后，我准备去工作。白天，我完成我的任务，与人交谈，并努力保持专注。晚上，我与家人共度时光并休息。',
    tasks: ['大声朗读剧本3次', '谈论你的日常作息2分钟', '上传或录制音频', '写一句关于什么感觉困难的话']
  },
  // Add more days...
];

// Japanese Learning Plan
const japanesePlan: DayPlan[] = [
  {
    id: 1,
    title: '恐れを打ち破る',
    goal: '間違いを心配せずに自分について話す。',
    readingScript: 'こんにちは。私の名前は__________です。私はバングラデシュ出身です。ベンガル語は私の母国語で、自信を持つために日本語を学んでいます。仕事や日常生活ではっきりと話したいです。間違えるかもしれませんが、続けていきます。',
    tasks: ['スクリプトを3回声に出して読む', '1〜2分の自己紹介を録音する', '自信を1から5で評価する', 'この日を完了としてマークする']
  },
  {
    id: 2,
    title: 'あなたの一日について話す',
    goal: '簡単な日本語で日常のルーティンを説明する。',
    readingScript: '私は通常朝起きて、簡単なタスクで一日を始めます。その後、仕事の準備をします。日中は、タスクを完了し、人々と話し、集中するようにしています。夕方は、家族と時間を過ごして休みます。',
    tasks: ['スクリプトを3回声に出して読む', 'ルーティンについて2分間話す', 'オーディオをアップロードまたは録音する', '何が難しかったかについて一文書く']
  },
  // Add more days...
];

// Export all plans
export const languagePlans: LanguagePlan = {
  en: englishPlan,
  es: spanishPlan,
  de: germanPlan,
  ru: russianPlan,
  zh: chinesePlan,
  ja: japanesePlan,
};

// Get plan for specific language
export function getPlanForLanguage(languageCode: string): DayPlan[] {
  return languagePlans[languageCode] || languagePlans.en;
}

// Legacy export for backward compatibility
export const plan = englishPlan;
