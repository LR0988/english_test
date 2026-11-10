export type WordTier = 'core' | 'recognition' | 'phonics';

export interface VocabItem {
  key: string;
  en: string;
  spellTarget: string; // clean word for spelling practice (without article or number annotation)
  zh: string;
  emoji: string;
  tier: WordTier; // core = 黑色應用字彙, recognition = 藍色認識字彙, phonics = 綠色自然發音字彙
  moe1200?: boolean; // 教育部基本 1,200 字詞 (*)
  category?: string;
  page?: string;
}

export interface SentenceItem {
  key: string;
  en: string;
  zh: string;
  tag: '核心句型' | '日常用語' | '故事口語' | '品格延伸' | '課室指令';
  replyEn?: string;
  replyZh?: string;
}

export interface PhonicsGroup {
  pattern: string;
  label: string;
  words: { en: string; zh: string; emoji: string }[];
}

export interface UnitData {
  id: string;
  section: 'starter' | 'core' | 'culture';
  badge: string;
  titleEn: string;
  titleZh: string;
  pages: string;
  themeColor: string;
  heroEmoji: string;
  summary: string;
  vocab: VocabItem[];
  sentences: SentenceItem[];
  phonicsGroups?: PhonicsGroup[];
  chant?: {
    title: string;
    lines: { en: string; zh: string }[];
    extraNote?: string;
  };
  bokaTip?: {
    title: string;
    page: string;
    description: string;
    type: 'weather_y' | 'teen_ty' | 'my_your' | 'syllables';
  };
  checklistItems?: { key: string; labelEn: string; labelZh: string }[];
}

export const CHARACTERS_DATA = [
  {
    id: 'boka',
    name: 'Boka',
    emoji: '🤖',
    color: 'from-amber-400 to-orange-500',
    cluesEn: ["He's two.", 'He can sing.', "Who's he?"],
    cluesZh: '他兩歲。他會唱歌。他是誰？',
    answerEn: "He's Boka!",
  },
  {
    id: 'amy',
    name: 'Amy',
    emoji: '👧🏻',
    color: 'from-pink-400 to-rose-500',
    cluesEn: ["She's a girl.", "She's nine years old.", 'She can fly a kite.', "Who's she?"],
    cluesZh: '她是個女孩。她九歲。她會放風箏。她是誰？',
    answerEn: "She's Amy!",
  },
  {
    id: 'kevin',
    name: 'Kevin',
    emoji: '👦🏻',
    color: 'from-sky-400 to-blue-500',
    cluesEn: ["He's a boy.", "He's ten.", "He's a student.", "Who's he?"],
    cluesZh: '他是個男孩。他十歲。他是學生。他是誰？',
    answerEn: "He's Kevin!",
  },
  {
    id: 'jello',
    name: 'Jello',
    emoji: '🐣',
    color: 'from-emerald-400 to-teal-500',
    cluesEn: ["She's two years old.", "She can't fly.", "Who's she?"],
    cluesZh: '她兩歲。她不會飛。她是誰？',
    answerEn: "She's Jello!",
  },
];

export const UNITS_DATA: UnitData[] = [
  // ======================== 一、課前複習與準備 ========================
  {
    id: 'starter-vocab',
    section: 'starter',
    badge: 'Starter 1',
    titleEn: 'Vocabulary & Sentence Review',
    titleZh: '單字句型複習（動物・能力・家庭・職業）',
    pages: '第 4–5 頁',
    themeColor: 'from-emerald-500 to-teal-600',
    heroEmoji: '🐾',
    summary: '複習動物、動作能力、家庭成員與職業四大主題單字與基礎問答句型！',
    vocab: [
      // Animals
      { key: 'st_bird', en: 'a bird', spellTarget: 'bird', zh: '一隻鳥', emoji: '🐦', tier: 'core', moe1200: true, category: 'Animals 動物', page: 'p.4' },
      { key: 'st_cat', en: 'a cat', spellTarget: 'cat', zh: '一隻貓', emoji: '🐱', tier: 'core', moe1200: true, category: 'Animals 動物', page: 'p.4' },
      { key: 'st_dog', en: 'a dog', spellTarget: 'dog', zh: '一隻狗', emoji: '🐶', tier: 'core', moe1200: true, category: 'Animals 動物', page: 'p.4' },
      { key: 'st_frog', en: 'a frog', spellTarget: 'frog', zh: '一隻青蛙', emoji: '🐸', tier: 'core', moe1200: true, category: 'Animals 動物', page: 'p.4' },
      { key: 'st_rabbit', en: 'a rabbit', spellTarget: 'rabbit', zh: '一隻兔子', emoji: '🐰', tier: 'core', moe1200: true, category: 'Animals 動物', page: 'p.4' },
      { key: 'st_ox', en: 'an ox', spellTarget: 'ox', zh: '一頭公牛', emoji: '🐂', tier: 'core', moe1200: true, category: 'Animals 動物', page: 'p.4' },
      // Abilities
      { key: 'st_dance', en: 'dance', spellTarget: 'dance', zh: '跳舞', emoji: '💃', tier: 'core', moe1200: true, category: 'Abilities 能力', page: 'p.4' },
      { key: 'st_draw', en: 'draw', spellTarget: 'draw', zh: '畫畫', emoji: '🎨', tier: 'core', moe1200: true, category: 'Abilities 能力', page: 'p.4' },
      { key: 'st_sing', en: 'sing', spellTarget: 'sing', zh: '唱歌', emoji: '🎤', tier: 'core', moe1200: true, category: 'Abilities 能力', page: 'p.4' },
      { key: 'st_swim', en: 'swim', spellTarget: 'swim', zh: '游泳', emoji: '🏊', tier: 'core', moe1200: true, category: 'Abilities 能力', page: 'p.4' },
      { key: 'st_fly_kite', en: 'fly a kite', spellTarget: 'fly a kite', zh: '放風箏', emoji: '🪁', tier: 'core', moe1200: true, category: 'Abilities 能力', page: 'p.4' },
      { key: 'st_ride_bike', en: 'ride a bike', spellTarget: 'ride a bike', zh: '騎腳踏車', emoji: '🚲', tier: 'core', moe1200: true, category: 'Abilities 能力', page: 'p.4' },
      // Family
      { key: 'st_grandfather', en: 'grandfather', spellTarget: 'grandfather', zh: '爺爺；外公', emoji: '👴🏻', tier: 'core', moe1200: true, category: 'Family 家庭成員', page: 'p.5' },
      { key: 'st_grandmother', en: 'grandmother', spellTarget: 'grandmother', zh: '奶奶；外婆', emoji: '👵🏻', tier: 'core', moe1200: true, category: 'Family 家庭成員', page: 'p.5' },
      { key: 'st_father', en: 'father', spellTarget: 'father', zh: '爸爸', emoji: '👨🏻', tier: 'core', moe1200: true, category: 'Family 家庭成員', page: 'p.5' },
      { key: 'st_mother', en: 'mother', spellTarget: 'mother', zh: '媽媽', emoji: '👩🏻', tier: 'core', moe1200: true, category: 'Family 家庭成員', page: 'p.5' },
      { key: 'st_brother', en: 'brother', spellTarget: 'brother', zh: '哥哥；弟弟', emoji: '👦🏻', tier: 'core', moe1200: true, category: 'Family 家庭成員', page: 'p.5' },
      { key: 'st_sister', en: 'sister', spellTarget: 'sister', zh: '姊姊；妹妹', emoji: '👧🏻', tier: 'core', moe1200: true, category: 'Family 家庭成員', page: 'p.5' },
      { key: 'st_me', en: 'me', spellTarget: 'me', zh: '我', emoji: '🙋🏻‍♂️', tier: 'core', moe1200: true, category: 'Family 家庭成員', page: 'p.5' },
      // Jobs
      { key: 'st_cook', en: 'a cook', spellTarget: 'cook', zh: '廚師', emoji: '🧑🏻‍🍳', tier: 'core', moe1200: true, category: 'Jobs 職業', page: 'p.5' },
      { key: 'st_doctor', en: 'a doctor', spellTarget: 'doctor', zh: '醫生', emoji: '🧑🏻‍⚕️', tier: 'core', moe1200: true, category: 'Jobs 職業', page: 'p.5' },
      { key: 'st_nurse', en: 'a nurse', spellTarget: 'nurse', zh: '護理師', emoji: '🩺', tier: 'core', moe1200: true, category: 'Jobs 職業', page: 'p.5' },
      { key: 'st_student', en: 'a student', spellTarget: 'student', zh: '學生', emoji: '🎒', tier: 'core', moe1200: true, category: 'Jobs 職業', page: 'p.5' },
      { key: 'st_teacher', en: 'a teacher', spellTarget: 'teacher', zh: '老師', emoji: '🧑🏻‍🏫', tier: 'core', moe1200: true, category: 'Jobs 職業', page: 'p.5' },
    ],
    sentences: [
      { key: 'st_s1', en: 'Is it a cat?', zh: '它是一隻貓嗎？', replyEn: "No, it's not. It's a dog.", replyZh: '不，它不是。它是一隻狗。', tag: '核心句型' },
      { key: 'st_s2', en: 'Can you dance?', zh: '你會跳舞嗎？', replyEn: 'Yes, I can.', replyZh: '是的，我會。', tag: '核心句型' },
      { key: 'st_s3', en: "Who's she?", zh: '她是誰？', replyEn: "She's my mother.", replyZh: '她是我的媽媽。', tag: '核心句型' },
      { key: 'st_s4', en: 'Is she a doctor?', zh: '她是醫生嗎？', replyEn: 'Yes, she is.', replyZh: '是的，她是。', tag: '核心句型' },
    ],
  },

  {
    id: 'starter-phonics-classroom',
    section: 'starter',
    badge: 'Starter 2–4',
    titleEn: 'Phonics, Classroom & Characters',
    titleZh: '短母音拼讀・課室用語・人物介紹',
    pages: '第 6–11 頁（中譯 p.92）',
    themeColor: 'from-indigo-500 to-purple-600',
    heroEmoji: '🏫',
    summary: '熟練 10 組短母音字群拼讀、8 句必學上課指令，以及認識 Boka、Amy、Kevin 與 Jello！',
    vocab: [
      { key: 'ph_dad', en: 'dad', spellTarget: 'dad', zh: '爸爸 (-ad)', emoji: '👨🏻', tier: 'phonics', moe1200: true, category: '短母音 a (-ad/-at)', page: 'p.6' },
      { key: 'ph_mad', en: 'mad', spellTarget: 'mad', zh: '生氣的 (-ad)', emoji: '😠', tier: 'phonics', moe1200: true, category: '短母音 a (-ad/-at)', page: 'p.6' },
      { key: 'ph_bat', en: 'bat', spellTarget: 'bat', zh: '蝙蝠；球棒 (-at)', emoji: '🦇', tier: 'phonics', moe1200: true, category: '短母音 a (-ad/-at)', page: 'p.6' },
      { key: 'ph_cat', en: 'cat', spellTarget: 'cat', zh: '貓 (-at)', emoji: '🐱', tier: 'phonics', moe1200: true, category: '短母音 a (-ad/-at)', page: 'p.6' },
      { key: 'ph_hen', en: 'hen', spellTarget: 'hen', zh: '母雞 (-en)', emoji: '🐔', tier: 'phonics', moe1200: true, category: '短母音 e (-en/-et)', page: 'p.6' },
      { key: 'ph_pen', en: 'pen', spellTarget: 'pen', zh: '原子筆 (-en)', emoji: '🖊️', tier: 'phonics', moe1200: true, category: '短母音 e (-en/-et)', page: 'p.6' },
      { key: 'ph_net', en: 'net', spellTarget: 'net', zh: '網子 (-et)', emoji: '🥅', tier: 'phonics', moe1200: true, category: '短母音 e (-en/-et)', page: 'p.6' },
      { key: 'ph_vet', en: 'vet', spellTarget: 'vet', zh: '獸醫 (-et)', emoji: '🩺', tier: 'phonics', category: '短母音 e (-en/-et)', page: 'p.6' },
      { key: 'ph_pig', en: 'pig', spellTarget: 'pig', zh: '豬 (-ig)', emoji: '🐷', tier: 'phonics', moe1200: true, category: '短母音 i (-ig/-it)', page: 'p.6' },
      { key: 'ph_wig', en: 'wig', spellTarget: 'wig', zh: '假髮 (-ig)', emoji: '🦱', tier: 'phonics', category: '短母音 i (-ig/-it)', page: 'p.6' },
      { key: 'ph_sit', en: 'sit', spellTarget: 'sit', zh: '坐 (-it)', emoji: '🪑', tier: 'phonics', moe1200: true, category: '短母音 i (-ig/-it)', page: 'p.6' },
      { key: 'ph_kit', en: 'kit', spellTarget: 'kit', zh: '工具箱 (-it)', emoji: '🧰', tier: 'phonics', category: '短母音 i (-ig/-it)', page: 'p.6' },
      { key: 'ph_hot', en: 'hot', spellTarget: 'hot', zh: '熱的 (-ot)', emoji: '🥵', tier: 'phonics', moe1200: true, category: '短母音 o (-ot/-ox)', page: 'p.7' },
      { key: 'ph_pot', en: 'pot', spellTarget: 'pot', zh: '鍋子 (-ot)', emoji: '🍲', tier: 'phonics', moe1200: true, category: '短母音 o (-ot/-ox)', page: 'p.7' },
      { key: 'ph_box', en: 'box', spellTarget: 'box', zh: '盒子 (-ox)', emoji: '📦', tier: 'phonics', moe1200: true, category: '短母音 o (-ot/-ox)', page: 'p.7' },
      { key: 'ph_fox', en: 'fox', spellTarget: 'fox', zh: '狐狸 (-ox)', emoji: '🦊', tier: 'phonics', moe1200: true, category: '短母音 o (-ot/-ox)', page: 'p.7' },
      { key: 'ph_mug', en: 'mug', spellTarget: 'mug', zh: '馬克杯 (-ug)', emoji: '☕', tier: 'phonics', category: '短母音 u (-ug/-un)', page: 'p.7' },
      { key: 'ph_bug', en: 'bug', spellTarget: 'bug', zh: '蟲子 (-ug)', emoji: '🐞', tier: 'phonics', moe1200: true, category: '短母音 u (-ug/-un)', page: 'p.7' },
      { key: 'ph_bun', en: 'bun', spellTarget: 'bun', zh: '小圓麵包 (-un)', emoji: '🍔', tier: 'phonics', moe1200: true, category: '短母音 u (-ug/-un)', page: 'p.7' },
      { key: 'ph_run', en: 'run', spellTarget: 'run', zh: '跑 (-un)', emoji: '🏃🏻‍♂️', tier: 'phonics', moe1200: true, category: '短母音 u (-ug/-un)', page: 'p.7' },
    ],
    sentences: [
      { key: 'cls_1', en: 'Be quiet.', zh: '安靜。', tag: '課室指令' },
      { key: 'cls_2', en: 'Please turn to page 12.', zh: '請翻到第 12 頁。', tag: '課室指令' },
      { key: 'cls_3', en: 'Repeat after me.', zh: '跟著我重複一遍。', tag: '課室指令' },
      { key: 'cls_4', en: 'Louder, please.', zh: '請大聲一點。', tag: '課室指令' },
      { key: 'cls_5', en: 'Raise your hand.', zh: '舉起你的手。', tag: '課室指令' },
      { key: 'cls_6', en: 'Put down your hand.', zh: '放下你的手。', tag: '課室指令' },
      { key: 'cls_7', en: 'Show me your homework.', zh: '給我看看你的作業。', tag: '課室指令' },
      { key: 'cls_8', en: 'Go back to your seat.', zh: '回到你的座位。', tag: '課室指令' },
    ],
    phonicsGroups: [
      { pattern: '-ad / -at', label: '短母音 a', words: [{ en: 'dad', zh: '爸爸', emoji: '👨🏻' }, { en: 'mad', zh: '生氣的', emoji: '😠' }, { en: 'bat', zh: '蝙蝠', emoji: '🦇' }, { en: 'cat', zh: '貓', emoji: '🐱' }] },
      { pattern: '-en / -et', label: '短母音 e', words: [{ en: 'hen', zh: '母雞', emoji: '🐔' }, { en: 'pen', zh: '筆', emoji: '🖊️' }, { en: 'net', zh: '網子', emoji: '🥅' }, { en: 'vet', zh: '獸醫', emoji: '🩺' }] },
      { pattern: '-ig / -it', label: '短母音 i', words: [{ en: 'pig', zh: '豬', emoji: '🐷' }, { en: 'wig', zh: '假髮', emoji: '🦱' }, { en: 'sit', zh: '坐', emoji: '🪑' }, { en: 'kit', zh: '工具箱', emoji: '🧰' }] },
      { pattern: '-ot / -ox', label: '短母音 o', words: [{ en: 'hot', zh: '熱的', emoji: '🥵' }, { en: 'pot', zh: '鍋子', emoji: '🍲' }, { en: 'box', zh: '盒子', emoji: '📦' }, { en: 'fox', zh: '狐狸', emoji: '🦊' }] },
      { pattern: '-ug / -un', label: '短母音 u', words: [{ en: 'mug', zh: '馬克杯', emoji: '☕' }, { en: 'bug', zh: '蟲子', emoji: '🐞' }, { en: 'bun', zh: '小圓麵包', emoji: '🍔' }, { en: 'run', zh: '跑', emoji: '🏃🏻‍♂️' }] },
    ],
  },

  {
    id: 'get-ready',
    section: 'starter',
    badge: 'Get Ready',
    titleEn: 'Phonics (a / a_e) & Numbers 11–20',
    titleZh: '預備單元：自然發音 a / a_e 與數字 11–20',
    pages: '第 12–14 頁（中譯 p.93／檢核 p.103）',
    themeColor: 'from-amber-500 to-orange-500',
    heroEmoji: '🔢',
    summary: '學習短母音 a 與長母音 a_e（Magic e）的發音變化，並熟記英文數字 11 到 20！',
    vocab: [
      { key: 'gr_11', en: 'eleven (11)', spellTarget: 'eleven', zh: '十一 (11)', emoji: '1️⃣1️⃣', tier: 'core', moe1200: true, category: 'Numbers 11–20', page: 'p.14' },
      { key: 'gr_12', en: 'twelve (12)', spellTarget: 'twelve', zh: '十二 (12)', emoji: '1️⃣2️⃣', tier: 'core', moe1200: true, category: 'Numbers 11–20', page: 'p.14' },
      { key: 'gr_13', en: 'thirteen (13)', spellTarget: 'thirteen', zh: '十三 (13)', emoji: '1️⃣3️⃣', tier: 'core', moe1200: true, category: 'Numbers 11–20', page: 'p.14' },
      { key: 'gr_14', en: 'fourteen (14)', spellTarget: 'fourteen', zh: '十四 (14)', emoji: '1️⃣4️⃣', tier: 'core', moe1200: true, category: 'Numbers 11–20', page: 'p.14' },
      { key: 'gr_15', en: 'fifteen (15)', spellTarget: 'fifteen', zh: '十五 (15)', emoji: '1️⃣5️⃣', tier: 'core', moe1200: true, category: 'Numbers 11–20', page: 'p.14' },
      { key: 'gr_16', en: 'sixteen (16)', spellTarget: 'sixteen', zh: '十六 (16)', emoji: '1️⃣6️⃣', tier: 'core', moe1200: true, category: 'Numbers 11–20', page: 'p.14' },
      { key: 'gr_17', en: 'seventeen (17)', spellTarget: 'seventeen', zh: '十七 (17)', emoji: '1️⃣7️⃣', tier: 'core', moe1200: true, category: 'Numbers 11–20', page: 'p.14' },
      { key: 'gr_18', en: 'eighteen (18)', spellTarget: 'eighteen', zh: '十八 (18)', emoji: '1️⃣8️⃣', tier: 'core', moe1200: true, category: 'Numbers 11–20', page: 'p.14' },
      { key: 'gr_19', en: 'nineteen (19)', spellTarget: 'nineteen', zh: '十九 (19)', emoji: '1️⃣9️⃣', tier: 'core', moe1200: true, category: 'Numbers 11–20', page: 'p.14' },
      { key: 'gr_20', en: 'twenty (20)', spellTarget: 'twenty', zh: '二十 (20)', emoji: '2️⃣0️⃣', tier: 'core', moe1200: true, category: 'Numbers 11–20', page: 'p.14' },
      // Phonics words
      { key: 'gr_cap', en: 'cap', spellTarget: 'cap', zh: '棒球帽', emoji: '🧢', tier: 'phonics', moe1200: true, category: 'Phonics a / a_e', page: 'p.12' },
      { key: 'gr_mat', en: 'mat', spellTarget: 'mat', zh: '墊子；腳踏墊', emoji: '🧶', tier: 'phonics', moe1200: true, category: 'Phonics a / a_e', page: 'p.12' },
      { key: 'gr_tap', en: 'tap', spellTarget: 'tap', zh: '水龍頭', emoji: '🚰', tier: 'phonics', moe1200: true, category: 'Phonics a / a_e', page: 'p.12' },
      { key: 'gr_cape', en: 'cape', spellTarget: 'cape', zh: '披風', emoji: '🦸🏻', tier: 'phonics', category: 'Phonics a / a_e', page: 'p.12' },
      { key: 'gr_mate', en: 'mate', spellTarget: 'mate', zh: '夥伴', emoji: '🤝', tier: 'phonics', category: 'Phonics a / a_e', page: 'p.12' },
      { key: 'gr_tape', en: 'tape', spellTarget: 'tape', zh: '膠帶', emoji: '🩹', tier: 'phonics', moe1200: true, category: 'Phonics a / a_e', page: 'p.12' },
      { key: 'gr_cake', en: 'cake', spellTarget: 'cake', zh: '蛋糕（補充字）', emoji: '🎂', tier: 'recognition', moe1200: true, category: 'Chant 補充', page: 'p.13' },
    ],
    sentences: [
      { key: 'gr_c1', en: 'I take a cap.', zh: '我拿了一頂棒球帽。', tag: '核心句型' },
      { key: 'gr_c2', en: 'I take a cap and a cake.', zh: '我拿了一頂棒球帽和一個蛋糕。', tag: '核心句型' },
      { key: 'gr_c3', en: 'I take a cap and a cake for Dave.', zh: '我幫 Dave 拿了一頂棒球帽和一個蛋糕。', tag: '核心句型' },
    ],
    phonicsGroups: [
      { pattern: 'a (短母音 /æ/)', label: 'Short a', words: [{ en: 'cap', zh: '棒球帽', emoji: '🧢' }, { en: 'mat', zh: '墊子', emoji: '🧶' }, { en: 'tap', zh: '水龍頭', emoji: '🚰' }] },
      { pattern: 'a_e (長母音 /eɪ/)', label: 'Magic a_e', words: [{ en: 'cape', zh: '披風', emoji: '🦸🏻' }, { en: 'mate', zh: '夥伴', emoji: '🤝' }, { en: 'tape', zh: '膠帶', emoji: '🩹' }] },
    ],
    chant: {
      title: "Let's Chant! (a & a_e)",
      lines: [
        { en: 'I take a cap.', zh: '我拿了一頂棒球帽。' },
        { en: 'I take a cap and a cake.', zh: '我拿了一頂棒球帽和一個蛋糕。' },
        { en: 'I take a cap and a cake for Dave.', zh: '我幫 Dave 拿了一頂棒球帽和一個蛋糕。' },
      ],
      extraNote: '補充單字：cake（蛋糕）',
    },
    checklistItems: [
      { key: 'chk_gr_phonics', labelEn: 'Read cap/cape, mat/mate, tap/tape', labelZh: '能聽辨並唸出 a 與 a_e 發音字組' },
      { key: 'chk_gr_11_15', labelEn: 'Say numbers eleven to fifteen (11–15)', labelZh: '能聽懂並說出數字 11–15' },
      { key: 'chk_gr_16_20', labelEn: 'Say numbers sixteen to twenty (16–20)', labelZh: '能聽懂並說出數字 16–20' },
    ],
  },

  // ======================== 二、核心單元與複習 ========================
  {
    id: 'unit-1',
    section: 'core',
    badge: 'Unit 1',
    titleEn: 'The Big Wind',
    titleZh: '大風吹（天氣變化與城市預報）',
    pages: '第 15–28 頁（中譯 p.94–95／檢核 p.104）',
    themeColor: 'from-sky-500 to-cyan-600',
    heroEmoji: '🌬️',
    summary: '起床觀察天氣變化、認識臺灣各城市天氣預報，並發現名詞加 -y 變天氣形容詞的祕密！',
    vocab: [
      // 應用字彙 (黑色字)
      { key: 'u1_cloudy', en: 'cloudy', spellTarget: 'cloudy', zh: '陰天的', emoji: '☁️', tier: 'core', moe1200: true, category: '天氣應用字彙', page: 'p.20' },
      { key: 'u1_rainy', en: 'rainy', spellTarget: 'rainy', zh: '下雨的', emoji: '🌧️', tier: 'core', moe1200: true, category: '天氣應用字彙', page: 'p.20' },
      { key: 'u1_sunny', en: 'sunny', spellTarget: 'sunny', zh: '晴朗的', emoji: '☀️', tier: 'core', moe1200: true, category: '天氣應用字彙', page: 'p.20' },
      { key: 'u1_windy', en: 'windy', spellTarget: 'windy', zh: '颳風的', emoji: '💨', tier: 'core', moe1200: true, category: '天氣應用字彙', page: 'p.21' },
      { key: 'u1_cold', en: 'cold', spellTarget: 'cold', zh: '冷的', emoji: '🥶', tier: 'core', moe1200: true, category: '天氣應用字彙', page: 'p.21' },
      { key: 'u1_hot', en: 'hot', spellTarget: 'hot', zh: '熱的', emoji: '🥵', tier: 'core', moe1200: true, category: '天氣應用字彙', page: 'p.21' },
      // 認識字彙 (藍色字)
      { key: 'u1_how', en: 'how', spellTarget: 'how', zh: '如何', emoji: '❓', tier: 'recognition', moe1200: true, category: '認識字彙', page: 'p.20' },
      { key: 'u1_weather', en: 'weather', spellTarget: 'weather', zh: '天氣', emoji: '🌤️', tier: 'recognition', moe1200: true, category: '認識字彙', page: 'p.20' },
      { key: 'u1_forecast', en: 'weather forecast', spellTarget: 'weather forecast', zh: '天氣預報', emoji: '📺', tier: 'recognition', category: '認識字彙', page: 'p.21' },
      { key: 'u1_taipei', en: 'Taipei', spellTarget: 'Taipei', zh: '臺北', emoji: '🏙️', tier: 'recognition', category: '臺灣城市', page: 'p.21' },
      { key: 'u1_yilan', en: 'Yilan', spellTarget: 'Yilan', zh: '宜蘭', emoji: '🌾', tier: 'recognition', category: '臺灣城市', page: 'p.21' },
      { key: 'u1_taichung', en: 'Taichung', spellTarget: 'Taichung', zh: '臺中', emoji: '🎭', tier: 'recognition', category: '臺灣城市', page: 'p.21' },
      { key: 'u1_tainan', en: 'Tainan', spellTarget: 'Tainan', zh: '臺南', emoji: '🏯', tier: 'recognition', category: '臺灣城市', page: 'p.21' },
      // 自然發音 (綠色字)
      { key: 'u1_pet', en: 'pet', spellTarget: 'pet', zh: '寵物', emoji: '🐶', tier: 'phonics', moe1200: true, category: 'Phonics e / e_e', page: 'p.26' },
      { key: 'u1_jet', en: 'jet', spellTarget: 'jet', zh: '噴射機', emoji: '✈️', tier: 'phonics', category: 'Phonics e / e_e', page: 'p.26' },
      { key: 'u1_ted', en: 'Ted', spellTarget: 'Ted', zh: '泰德（人名）', emoji: '👦🏼', tier: 'phonics', category: 'Phonics e / e_e', page: 'p.26' },
      { key: 'u1_pete', en: 'Pete', spellTarget: 'Pete', zh: '彼得（人名）', emoji: '🧑🏻', tier: 'phonics', category: 'Phonics e / e_e', page: 'p.26' },
      { key: 'u1_theme_park', en: 'theme park', spellTarget: 'theme park', zh: '主題樂園', emoji: '🎢', tier: 'phonics', category: 'Phonics e / e_e', page: 'p.26' },
      { key: 'u1_chinese', en: 'Chinese', spellTarget: 'Chinese', zh: '中文；國語', emoji: '📖', tier: 'phonics', moe1200: true, category: 'Phonics e / e_e', page: 'p.26' },
    ],
    sentences: [
      { key: 'u1_s1', en: "How's the weather?", zh: '天氣如何？', replyEn: "It's sunny.", replyZh: '天氣晴朗。', tag: '核心句型' },
      { key: 'u1_s2', en: "It's cloudy in Taichung.", zh: '臺中是陰天。', tag: '核心句型' },
      { key: 'u1_d1', en: 'Line up, please.', zh: '請排隊。', tag: '日常用語' },
      { key: 'u1_d2', en: "Let's go.", zh: '我們走吧。', tag: '日常用語' },
      { key: 'u1_st1', en: 'Wake up!', zh: '起床！', tag: '故事口語' },
      { key: 'u1_st2', en: 'How come?', zh: '怎麼會這樣？', tag: '故事口語' },
      { key: 'u1_st3', en: "What's going on?", zh: '發生什麼事？', tag: '故事口語' },
    ],
    phonicsGroups: [
      { pattern: 'e (短母音 /ɛ/)', label: 'Short e', words: [{ en: 'pet', zh: '寵物', emoji: '🐶' }, { en: 'jet', zh: '噴射機', emoji: '✈️' }, { en: 'Ted', zh: '泰德', emoji: '👦🏼' }] },
      { pattern: 'e_e (長母音 /iː/)', label: 'Magic e_e', words: [{ en: 'Pete', zh: '彼得', emoji: '🧑🏻' }, { en: 'theme park', zh: '主題樂園', emoji: '🎢' }, { en: 'Chinese', zh: '中文', emoji: '📖' }] },
    ],
    chant: {
      title: "Let's Chant! (e & e_e)",
      lines: [
        { en: 'I see Ted.', zh: '我看見 Ted。' },
        { en: 'I see Ted and Eve.', zh: '我看見 Ted 和 Eve。' },
        { en: 'I see Ted and Eve at the sea.', zh: '我在海邊看見 Ted 和 Eve。' },
      ],
      extraNote: '補充片語：at the sea（在海邊）',
    },
    bokaTip: {
      title: 'Learn with Boka：天氣字尾 -y 魔法！',
      page: '第 28 頁',
      description: '把大自然的名詞加上字尾 -y，就會變成描述天氣的形容詞喔！（注意 sun 要重複 n 再加 y 變成 sunny！）',
      type: 'weather_y',
    },
    checklistItems: [
      { key: 'chk_u1_vocab', labelEn: 'Spell cloudy, rainy, sunny, windy, cold, hot', labelZh: '能聽說讀寫 6 個天氣應用單字' },
      { key: 'chk_u1_sent', labelEn: "Ask & answer: How's the weather? / It's sunny.", labelZh: '能用英文詢問並回答天氣狀況' },
      { key: 'chk_u1_daily', labelEn: "Say: Line up, please. / Let's go.", labelZh: '能使用排隊出遊日常用語' },
      { key: 'chk_u1_phonics', labelEn: 'Distinguish short e and long e_e sounds', labelZh: '能分辨 e 與 e_e 自然發音字組' },
    ],
  },

  {
    id: 'unit-2',
    section: 'core',
    badge: 'Unit 2',
    titleEn: 'Going Back Home',
    titleZh: '回家（時間詢問與整十數字）',
    pages: '第 29–42 頁（中譯 p.96–97／檢核 p.105）',
    themeColor: 'from-violet-500 to-fuchsia-600',
    heroEmoji: '⏰',
    summary: '放學鐘聲響起！學會詢問現在幾點鐘、熟記 15～50 時間數字，並比較 -teen 與 -ty 的字尾規律！',
    vocab: [
      // 應用字彙
      { key: 'u2_15', en: 'fifteen (15)', spellTarget: 'fifteen', zh: '十五 (15)', emoji: '🕒', tier: 'core', moe1200: true, category: '時間數字應用字彙', page: 'p.34' },
      { key: 'u2_20', en: 'twenty (20)', spellTarget: 'twenty', zh: '二十 (20)', emoji: '🕓', tier: 'core', moe1200: true, category: '時間數字應用字彙', page: 'p.34' },
      { key: 'u2_30', en: 'thirty (30)', spellTarget: 'thirty', zh: '三十 (30)', emoji: '🕧', tier: 'core', moe1200: true, category: '時間數字應用字彙', page: 'p.34' },
      { key: 'u2_40', en: 'forty (40)', spellTarget: 'forty', zh: '四十 (40)', emoji: '🕗', tier: 'core', moe1200: true, category: '時間數字應用字彙', page: 'p.35' },
      { key: 'u2_50', en: 'fifty (50)', spellTarget: 'fifty', zh: '五十 (50)', emoji: '🕙', tier: 'core', moe1200: true, category: '時間數字應用字彙', page: 'p.35' },
      { key: 'u2_25', en: 'twenty-five (25)', spellTarget: 'twenty-five', zh: '二十五 (25)', emoji: '⏱️', tier: 'core', moe1200: true, category: '時間數字應用字彙', page: 'p.35' },
      // 認識字彙
      { key: 'u2_time', en: 'time', spellTarget: 'time', zh: '時間', emoji: '⌚', tier: 'recognition', moe1200: true, category: '認識字彙', page: 'p.34' },
      { key: 'u2_oclock', en: "o'clock", spellTarget: "o'clock", zh: '……點鐘', emoji: '🕰️', tier: 'recognition', moe1200: true, category: '認識字彙', page: 'p.34' },
      { key: 'u2_am', en: 'AM', spellTarget: 'AM', zh: '上午', emoji: '🌅', tier: 'recognition', category: '認識字彙', page: 'p.35' },
      { key: 'u2_pm', en: 'PM', spellTarget: 'PM', zh: '下午', emoji: '🌇', tier: 'recognition', category: '認識字彙', page: 'p.35' },
      { key: 'u2_routine', en: 'routine', spellTarget: 'routine', zh: '作息', emoji: '📅', tier: 'recognition', category: '認識字彙', page: 'p.35' },
      // Phonics
      { key: 'u2_kit', en: 'kit', spellTarget: 'kit', zh: '工具箱', emoji: '🧰', tier: 'phonics', category: 'Phonics i / i_e', page: 'p.40' },
      { key: 'u2_pin', en: 'pin', spellTarget: 'pin', zh: '別針', emoji: '🧷', tier: 'phonics', moe1200: true, category: 'Phonics i / i_e', page: 'p.40' },
      { key: 'u2_win', en: 'win', spellTarget: 'win', zh: '贏', emoji: '🏆', tier: 'phonics', moe1200: true, category: 'Phonics i / i_e', page: 'p.40' },
      { key: 'u2_kite', en: 'kite', spellTarget: 'kite', zh: '風箏', emoji: '🪁', tier: 'phonics', moe1200: true, category: 'Phonics i / i_e', page: 'p.40' },
      { key: 'u2_pine', en: 'pine', spellTarget: 'pine', zh: '松樹', emoji: '🌲', tier: 'phonics', category: 'Phonics i / i_e', page: 'p.40' },
      { key: 'u2_wine', en: 'wine', spellTarget: 'wine', zh: '葡萄酒', emoji: '🍷', tier: 'phonics', category: 'Phonics i / i_e', page: 'p.40' },
    ],
    sentences: [
      { key: 'u2_s1', en: 'What time is it?', zh: '現在幾點？', replyEn: "It's twelve o'clock.", replyZh: '十二點鐘。', tag: '核心句型' },
      { key: 'u2_s2', en: "It's twelve thirty.", zh: '十二點三十分。', tag: '核心句型' },
      { key: 'u2_d1', en: 'Listen!', zh: '聽！', tag: '日常用語' },
      { key: 'u2_d2', en: 'Great!', zh: '太棒了！', tag: '日常用語' },
      { key: 'u2_st1', en: "We're back.", zh: '我們回來了。', tag: '故事口語' },
      { key: 'u2_st2', en: 'Time to go home.', zh: '該回家了。', tag: '故事口語' },
      { key: 'u2_st3', en: 'We must go home.', zh: '我們必須回家了。', tag: '故事口語' },
      { key: 'u2_st4', en: "Sorry, I'm late, Mom.", zh: '媽媽，對不起，我回來晚了。', tag: '故事口語' },
    ],
    phonicsGroups: [
      { pattern: 'i (短母音 /ɪ/)', label: 'Short i', words: [{ en: 'kit', zh: '工具箱', emoji: '🧰' }, { en: 'pin', zh: '別針', emoji: '🧷' }, { en: 'win', zh: '贏', emoji: '🏆' }] },
      { pattern: 'i_e (長母音 /aɪ/)', label: 'Magic i_e', words: [{ en: 'kite', zh: '風箏', emoji: '🪁' }, { en: 'pine', zh: '松樹', emoji: '🌲' }, { en: 'wine', zh: '葡萄酒', emoji: '🍷' }] },
    ],
    chant: {
      title: "Let's Chant! (i & i_e)",
      lines: [
        { en: 'Tim can ride.', zh: 'Tim 會騎車。' },
        { en: 'Tim can ride a bike.', zh: 'Tim 會騎腳踏車。' },
        { en: 'Tim can ride a bike to the pine.', zh: 'Tim 會騎腳踏車到松樹那裡。' },
      ],
    },
    bokaTip: {
      title: 'Learn with Boka：-teen 與 -ty 數字字尾規律！',
      page: '第 42 頁',
      description: '13–19 的數字都是 -teen 結尾（如 thirteen, fifteen）；20, 30...90 的整十數字都是 -ty 結尾（注意 forty 沒有 u 喔！）。',
      type: 'teen_ty',
    },
    checklistItems: [
      { key: 'chk_u2_vocab', labelEn: 'Spell fifteen, twenty, thirty, forty, fifty, twenty-five', labelZh: '能聽說讀寫時間數字應用單字（注意 forty 拼法）' },
      { key: 'chk_u2_sent', labelEn: "Ask & answer: What time is it? / It's twelve thirty.", labelZh: '能用英文詢問並回答幾點幾分' },
      { key: 'chk_u2_daily', labelEn: 'Say: Listen! / Great!', labelZh: '能使用日常感嘆與提醒用語' },
      { key: 'chk_u2_phonics', labelEn: 'Read kit/kite, pin/pine, win/wine', labelZh: '能分辨 i 與 i_e 自然發音字組' },
    ],
  },

  {
    id: 'review-1',
    section: 'core',
    badge: 'Review 1',
    titleEn: 'Review 1 (Units 1 & 2)',
    titleZh: '複習一：天氣表達 × 時間數字總驗收',
    pages: '第 43–46 頁',
    themeColor: 'from-cyan-600 to-indigo-600',
    heroEmoji: '🏅',
    summary: '綜合聽力與閱讀大挑戰！把 Unit 1 的天氣預報和 Unit 2 的時鐘報時合體闖關！',
    vocab: [
      { key: 'r1_sunny', en: 'sunny', spellTarget: 'sunny', zh: '晴朗的', emoji: '☀️', tier: 'core', moe1200: true, category: 'Unit 1 精選', page: 'p.43' },
      { key: 'r1_rainy', en: 'rainy', spellTarget: 'rainy', zh: '下雨的', emoji: '🌧️', tier: 'core', moe1200: true, category: 'Unit 1 精選', page: 'p.43' },
      { key: 'r1_windy', en: 'windy', spellTarget: 'windy', zh: '颳風的', emoji: '💨', tier: 'core', moe1200: true, category: 'Unit 1 精選', page: 'p.43' },
      { key: 'r1_cloudy', en: 'cloudy', spellTarget: 'cloudy', zh: '陰天的', emoji: '☁️', tier: 'core', moe1200: true, category: 'Unit 1 精選', page: 'p.43' },
      { key: 'r1_thirty', en: 'thirty (30)', spellTarget: 'thirty', zh: '三十 (30)', emoji: '🕧', tier: 'core', moe1200: true, category: 'Unit 2 精選', page: 'p.44' },
      { key: 'r1_forty', en: 'forty (40)', spellTarget: 'forty', zh: '四十 (40)', emoji: '🕗', tier: 'core', moe1200: true, category: 'Unit 2 精選', page: 'p.44' },
      { key: 'r1_fifty', en: 'fifty (50)', spellTarget: 'fifty', zh: '五十 (50)', emoji: '🕙', tier: 'core', moe1200: true, category: 'Unit 2 精選', page: 'p.44' },
      { key: 'r1_twenty_five', en: 'twenty-five (25)', spellTarget: 'twenty-five', zh: '二十五 (25)', emoji: '⏱️', tier: 'core', moe1200: true, category: 'Unit 2 精選', page: 'p.44' },
    ],
    sentences: [
      { key: 'r1_s1', en: "How's the weather in Taipei?", zh: '臺北天氣如何？', replyEn: "It's rainy and cold.", replyZh: '既下雨又寒冷。', tag: '核心句型' },
      { key: 'r1_s2', en: 'What time is it?', zh: '現在幾點？', replyEn: "It's four forty.", replyZh: '現在四點四十分。', tag: '核心句型' },
      { key: 'r1_s3', en: 'Line up, please.', zh: '請排隊。', replyEn: "Great! Let's go.", replyZh: '太棒了！我們走吧。', tag: '日常用語' },
    ],
  },

  {
    id: 'unit-3',
    section: 'core',
    badge: 'Unit 3',
    titleEn: 'Be Honest',
    titleZh: '誠實（文具單字與失物招領）',
    pages: '第 47–60 頁（中譯 p.98–99／檢核 p.106）',
    themeColor: 'from-rose-500 to-orange-500',
    heroEmoji: '✏️',
    summary: '撿到酷炫的恐龍鉛筆該怎麼辦？學會 6 種文具單字、詢問物品主人，以及誠實送到失物招領處！',
    vocab: [
      // 應用字彙
      { key: 'u3_book', en: 'book', spellTarget: 'book', zh: '書', emoji: '📕', tier: 'core', moe1200: true, category: '文具應用字彙', page: 'p.52' },
      { key: 'u3_eraser', en: 'eraser', spellTarget: 'eraser', zh: '橡皮擦', emoji: '🧼', tier: 'core', moe1200: true, category: '文具應用字彙', page: 'p.52' },
      { key: 'u3_marker', en: 'marker', spellTarget: 'marker', zh: '簽字筆；彩色筆', emoji: '🖍️', tier: 'core', moe1200: true, category: '文具應用字彙', page: 'p.52' },
      { key: 'u3_pen', en: 'pen', spellTarget: 'pen', zh: '原子筆', emoji: '🖊️', tier: 'core', moe1200: true, category: '文具應用字彙', page: 'p.53' },
      { key: 'u3_pencil', en: 'pencil', spellTarget: 'pencil', zh: '鉛筆', emoji: '✏️', tier: 'core', moe1200: true, category: '文具應用字彙', page: 'p.53' },
      { key: 'u3_ruler', en: 'ruler', spellTarget: 'ruler', zh: '尺', emoji: '📏', tier: 'core', moe1200: true, category: '文具應用字彙', page: 'p.53' },
      // 認識字彙
      { key: 'u3_storybook', en: 'storybook', spellTarget: 'storybook', zh: '故事書', emoji: '📚', tier: 'recognition', category: '品格延伸字彙', page: 'p.53' },
      { key: 'u3_lost_found', en: 'Lost and Found', spellTarget: 'Lost and Found', zh: '失物招領處', emoji: '📥', tier: 'recognition', category: '品格延伸字彙', page: 'p.50' },
      // Phonics
      { key: 'u3_cod', en: 'cod', spellTarget: 'cod', zh: '鱈魚', emoji: '🐟', tier: 'phonics', category: 'Phonics o / o_e', page: 'p.58' },
      { key: 'u3_hop', en: 'hop', spellTarget: 'hop', zh: '單腳跳', emoji: '🦘', tier: 'phonics', moe1200: true, category: 'Phonics o / o_e', page: 'p.58' },
      { key: 'u3_rob', en: 'rob', spellTarget: 'rob', zh: '搶劫', emoji: '🦹', tier: 'phonics', category: 'Phonics o / o_e', page: 'p.58' },
      { key: 'u3_code', en: 'code', spellTarget: 'code', zh: '代碼', emoji: '💻', tier: 'phonics', category: 'Phonics o / o_e', page: 'p.58' },
      { key: 'u3_hope', en: 'hope', spellTarget: 'hope', zh: '希望', emoji: '🌟', tier: 'phonics', moe1200: true, category: 'Phonics o / o_e', page: 'p.58' },
      { key: 'u3_robe', en: 'robe', spellTarget: 'robe', zh: '長袍', emoji: '👘', tier: 'phonics', category: 'Phonics o / o_e', page: 'p.58' },
      { key: 'u3_cone', en: 'cone', spellTarget: 'cone', zh: '圓錐體；甜筒', emoji: '🍦', tier: 'recognition', category: 'Chant 補充', page: 'p.59' },
      { key: 'u3_hole', en: 'hole', spellTarget: 'hole', zh: '洞', emoji: '🕳️', tier: 'recognition', category: 'Chant 補充', page: 'p.59' },
      { key: 'u3_bone', en: 'bone', spellTarget: 'bone', zh: '骨頭', emoji: '🦴', tier: 'recognition', moe1200: true, category: 'Chant 補充', page: 'p.59' },
    ],
    sentences: [
      { key: 'u3_s1', en: 'Is this your pencil?', zh: '這是你的鉛筆嗎？', replyEn: 'Yes, it is.', replyZh: '是的，它是。', tag: '核心句型' },
      { key: 'u3_s2', en: 'Is this your ruler?', zh: '這是你的尺嗎？', replyEn: "No, it's not. It's my ruler.", replyZh: '不，它不是。它是我的尺。', tag: '核心句型' },
      { key: 'u3_s3', en: "It's not my pencil.", zh: '它不是我的鉛筆。', tag: '核心句型' },
      { key: 'u3_d1', en: 'What happened?', zh: '發生什麼事？', tag: '日常用語' },
      { key: 'u3_d2', en: 'Nice!', zh: '太好了！', tag: '日常用語' },
      { key: 'u3_p1', en: 'Wow! A storybook. Take it to the Lost and Found.', zh: '哇！一本故事書。把它拿到失物招領處吧。（誠實好行為！）', tag: '品格延伸' },
      { key: 'u3_st1', en: "Let's take them to the Lost and Found.", zh: '我們把它們拿到失物招領箱吧。', tag: '故事口語' },
      { key: 'u3_st2', en: "Phew! It's just a dream.", zh: '呼！這只是一場夢。', tag: '故事口語' },
    ],
    phonicsGroups: [
      { pattern: 'o (短母音 /ɑ/)', label: 'Short o', words: [{ en: 'cod', zh: '鱈魚', emoji: '🐟' }, { en: 'hop', zh: '單腳跳', emoji: '🦘' }, { en: 'rob', zh: '搶劫', emoji: '🦹' }] },
      { pattern: 'o_e (長母音 /oʊ/)', label: 'Magic o_e', words: [{ en: 'code', zh: '代碼', emoji: '💻' }, { en: 'hope', zh: '希望', emoji: '🌟' }, { en: 'robe', zh: '長袍', emoji: '👘' }] },
    ],
    chant: {
      title: "Let's Chant! (o & o_e)",
      lines: [
        { en: 'Hop over the cone.', zh: '單腳跳過圓錐體。' },
        { en: 'Hop over the cone and the hole.', zh: '單腳跳過圓錐體和洞。' },
        { en: 'Hop over the cone and the hole with a bone.', zh: '拿著骨頭單腳跳過圓錐體和洞。' },
      ],
      extraNote: '補充單字：over（越過）、cone（圓錐體）、hole（洞）、with（有；帶著）、bone（骨頭）',
    },
    bokaTip: {
      title: 'Learn with Boka：my 與 your 所有格辨析！',
      page: '第 60 頁',
      description: 'my pen 指的是「我的筆」（指向自己 🙋🏻‍♂️）；your pen 指的是「你的筆」（指向對方 👉🏻）。例如：This is my dog. / This is your dog.',
      type: 'my_your',
    },
    checklistItems: [
      { key: 'chk_u3_vocab', labelEn: 'Spell book, eraser, marker, pen, pencil, ruler', labelZh: '能聽說讀寫 6 個文具應用單字' },
      { key: 'chk_u3_sent', labelEn: "Ask & answer: Is this your pencil? / Yes, it is. / No, it's not.", labelZh: '能詢問並回答物品是否屬於某人' },
      { key: 'chk_u3_honest', labelEn: 'Do the Right Thing: Take it to the Lost and Found.', labelZh: '懂得拾金不昧並說出送到失物招領處' },
      { key: 'chk_u3_phonics', labelEn: 'Read cod/code, hop/hope, rob/robe', labelZh: '能分辨 o 與 o_e 自然發音字組' },
    ],
  },

  {
    id: 'unit-4',
    section: 'core',
    badge: 'Unit 4',
    titleEn: 'Earthquake Drill',
    titleZh: '地震演習（位置介系詞・家具・防災保命）',
    pages: '第 61–74 頁（中譯 p.100–101／檢核 p.107）',
    themeColor: 'from-emerald-600 to-lime-600',
    heroEmoji: '🪖',
    summary: '學習 in / on / under 描述物品位置、認識緊急避難包（Go Bag）與抗震三步驟，還能拍手數單字音節！',
    vocab: [
      // 應用字彙
      { key: 'u4_in', en: 'in', spellTarget: 'in', zh: '在……裡面', emoji: '📥', tier: 'core', moe1200: true, category: '位置與家具應用字彙', page: 'p.66' },
      { key: 'u4_on', en: 'on', spellTarget: 'on', zh: '在……上面', emoji: '⬆️', tier: 'core', moe1200: true, category: '位置與家具應用字彙', page: 'p.66' },
      { key: 'u4_under', en: 'under', spellTarget: 'under', zh: '在……底下', emoji: '⬇️', tier: 'core', moe1200: true, category: '位置與家具應用字彙', page: 'p.66' },
      { key: 'u4_box', en: 'box', spellTarget: 'box', zh: '盒子', emoji: '📦', tier: 'core', moe1200: true, category: '位置與家具應用字彙', page: 'p.67' },
      { key: 'u4_chair', en: 'chair', spellTarget: 'chair', zh: '椅子', emoji: '🪑', tier: 'core', moe1200: true, category: '位置與家具應用字彙', page: 'p.67' },
      { key: 'u4_desk', en: 'desk', spellTarget: 'desk', zh: '書桌', emoji: '🗄️', tier: 'core', moe1200: true, category: '位置與家具應用字彙', page: 'p.67' },
      // 認識字彙 & 防災延伸
      { key: 'u4_where', en: 'where', spellTarget: 'where', zh: '哪裡', emoji: '🔍', tier: 'recognition', moe1200: true, category: '認識字彙', page: 'p.66' },
      { key: 'u4_drop', en: 'Drop!', spellTarget: 'drop', zh: '1. 趴下！（抗震步驟一）', emoji: '🧎🏻', tier: 'recognition', category: '抗震保命三步驟', page: 'p.67' },
      { key: 'u4_cover', en: 'Cover!', spellTarget: 'cover', zh: '2. 掩護！（抗震步驟二）', emoji: '🛡️', tier: 'recognition', moe1200: true, category: '抗震保命三步驟', page: 'p.67' },
      { key: 'u4_hold_on', en: 'Hold on!', spellTarget: 'hold on', zh: '3. 穩住！（抗震步驟三）', emoji: '✊', tier: 'recognition', category: '抗震保命三步驟', page: 'p.67' },
      // Go Bag
      { key: 'u4_first_aid', en: 'first aid kit', spellTarget: 'first aid kit', zh: '急救包', emoji: '🩹', tier: 'recognition', category: 'Go Bag 緊急避難包', page: 'p.69' },
      { key: 'u4_flashlight', en: 'flashlight', spellTarget: 'flashlight', zh: '手電筒', emoji: '🔦', tier: 'recognition', category: 'Go Bag 緊急避難包', page: 'p.69' },
      { key: 'u4_food', en: 'food', spellTarget: 'food', zh: '食物', emoji: '🥫', tier: 'recognition', moe1200: true, category: 'Go Bag 緊急避難包', page: 'p.69' },
      { key: 'u4_radio', en: 'radio', spellTarget: 'radio', zh: '收音機', emoji: '📻', tier: 'recognition', moe1200: true, category: 'Go Bag 緊急避難包', page: 'p.69' },
      { key: 'u4_water', en: 'water', spellTarget: 'water', zh: '水', emoji: '💧', tier: 'recognition', moe1200: true, category: 'Go Bag 緊急避難包', page: 'p.69' },
      // Phonics
      { key: 'u4_cub', en: 'cub', spellTarget: 'cub', zh: '幼獸', emoji: '🐻', tier: 'phonics', category: 'Phonics u / u_e', page: 'p.72' },
      { key: 'u4_cut', en: 'cut', spellTarget: 'cut', zh: '剪；切', emoji: '✂️', tier: 'phonics', moe1200: true, category: 'Phonics u / u_e', page: 'p.72' },
      { key: 'u4_duck', en: 'duck', spellTarget: 'duck', zh: '鴨子', emoji: '🦆', tier: 'phonics', moe1200: true, category: 'Phonics u / u_e', page: 'p.72' },
      { key: 'u4_cube', en: 'cube', spellTarget: 'cube', zh: '立方體', emoji: '🧊', tier: 'phonics', category: 'Phonics u / u_e', page: 'p.72' },
      { key: 'u4_cute', en: 'cute', spellTarget: 'cute', zh: '可愛的', emoji: '🥰', tier: 'phonics', moe1200: true, category: 'Phonics u / u_e', page: 'p.72' },
      { key: 'u4_duke', en: 'duke', spellTarget: 'duke', zh: '公爵', emoji: '🤴🏻', tier: 'phonics', category: 'Phonics u / u_e', page: 'p.72' },
    ],
    sentences: [
      { key: 'u4_s1', en: "Where's the eraser?", zh: '橡皮擦在哪裡？（Where\'s = Where is）', replyEn: "It's under the chair.", replyZh: '它在椅子底下。', tag: '核心句型' },
      { key: 'u4_s2', en: "What's in the go bag?", zh: '緊急避難包裡有什麼？', replyEn: 'Water, food, a flashlight, a radio, and a first aid kit.', replyZh: '水、食物、手電筒、收音機和急救包。', tag: '核心句型' },
      { key: 'u4_d1', en: 'Watch out!', zh: '小心！', tag: '日常用語' },
      { key: 'u4_d2', en: 'Give me a hand, please.', zh: '請幫我。', tag: '日常用語' },
      { key: 'u4_st1', en: 'Earthquake! Please take cover.', zh: '地震！請找掩護。', tag: '故事口語' },
      { key: 'u4_st2', en: 'Time to get out.', zh: '該離開教室了。', tag: '故事口語' },
      { key: 'u4_st3', en: "Where's my schoolbag?", zh: '我的書包呢？', tag: '故事口語' },
    ],
    phonicsGroups: [
      { pattern: 'u (短母音 /ʌ/)', label: 'Short u', words: [{ en: 'cub', zh: '幼獸', emoji: '🐻' }, { en: 'cut', zh: '剪；切', emoji: '✂️' }, { en: 'duck', zh: '鴨子', emoji: '🦆' }] },
      { pattern: 'u_e (長母音 /juː/)', label: 'Magic u_e', words: [{ en: 'cube', zh: '立方體', emoji: '🧊' }, { en: 'cute', zh: '可愛的', emoji: '🥰' }, { en: 'duke', zh: '公爵', emoji: '🤴🏻' }] },
    ],
    bokaTip: {
      title: 'Learn with Boka：拍拍手數音節 Syllable Sort！',
      page: '第 74 頁',
      description: '英文單字的音節由「母音發音」組成，一個母音發音代表一個音節！一起來拍手分分類：單音節 (1)、雙音節 (2)、三音節 (3)！',
      type: 'syllables',
    },
    checklistItems: [
      { key: 'chk_u4_vocab', labelEn: 'Spell in, on, under, box, chair, desk', labelZh: '能聽說讀寫位置介系詞與家具單字' },
      { key: 'chk_u4_sent', labelEn: "Ask & answer: Where's the eraser? / It's under the chair.", labelZh: '能詢問並描述物品所在位置' },
      { key: 'chk_u4_safety', labelEn: 'Remember Earthquake Safety: Drop! Cover! Hold on!', labelZh: '熟記抗震保命三步驟與緊急避難包物品' },
      { key: 'chk_u4_phonics', labelEn: 'Read cub/cube, cut/cute, duck/duke & count syllables', labelZh: '能分辨 u 與 u_e 並數出單字音節數' },
    ],
  },

  {
    id: 'review-2',
    section: 'core',
    badge: 'Review 2',
    titleEn: 'Review 2 (Units 3 & 4)',
    titleZh: '複習二：房間物品位置偵探 × Play & Say 發音連線',
    pages: '第 75–78 頁',
    themeColor: 'from-teal-600 to-emerald-600',
    heroEmoji: '🕵🏻‍♂️',
    summary: '結合顏色、物品與 in/on/under 找出正確房間，並挑戰第 78 頁 25 個長短母音單字大連線！',
    vocab: [
      { key: 'r2_room', en: 'room', spellTarget: 'room', zh: '房間（補充字）', emoji: '🚪', tier: 'recognition', moe1200: true, category: '房間偵探補充', page: 'p.75' },
      { key: 'r2_floor', en: 'floor', spellTarget: 'floor', zh: '地板（補充字）', emoji: '🪵', tier: 'recognition', moe1200: true, category: '房間偵探補充', page: 'p.75' },
      { key: 'r2_eraser', en: 'eraser', spellTarget: 'eraser', zh: '橡皮擦', emoji: '🧼', tier: 'core', moe1200: true, category: 'Unit 3 精選', page: 'p.76' },
      { key: 'r2_marker', en: 'marker', spellTarget: 'marker', zh: '彩色筆', emoji: '🖍️', tier: 'core', moe1200: true, category: 'Unit 3 精選', page: 'p.76' },
      { key: 'r2_under', en: 'under', spellTarget: 'under', zh: '在……底下', emoji: '⬇️', tier: 'core', moe1200: true, category: 'Unit 4 精選', page: 'p.77' },
      { key: 'r2_desk', en: 'desk', spellTarget: 'desk', zh: '書桌', emoji: '🪑', tier: 'core', moe1200: true, category: 'Unit 4 精選', page: 'p.77' },
    ],
    sentences: [
      { key: 'r2_s1', en: 'The red toy car is under the desk.', zh: '紅色玩具車在書桌底下。', tag: '核心句型' },
      { key: 'r2_s2', en: 'The blue box is on the desk.', zh: '藍色盒子在書桌上面。', tag: '核心句型' },
      { key: 'r2_s3', en: 'Where am I?', zh: '我在哪裡？', replyEn: "You're in Room A.", replyZh: '你在 A 房間裡。', tag: '核心句型' },
    ],
  },

  // ======================== 三、文化節慶與跨域延伸 ========================
  {
    id: 'halloween',
    section: 'culture',
    badge: 'Culture',
    titleEn: 'Festivals: Halloween',
    titleZh: '文化節慶：萬聖節不給糖就搗蛋！',
    pages: '第 79–83 頁（中譯 p.102／檢核 p.108）',
    themeColor: 'from-orange-500 to-purple-700',
    heroEmoji: '🎃',
    summary: '認識萬聖節五大經典角色與南瓜燈，跟著大家一起喊 Trick or treat! Happy Halloween!',
    vocab: [
      { key: 'hw_ghost', en: 'a ghost', spellTarget: 'ghost', zh: '鬼魂', emoji: '👻', tier: 'core', moe1200: true, category: '萬聖節字彙', page: 'p.80' },
      { key: 'hw_jack', en: "a jack-o'-lantern", spellTarget: "jack-o'-lantern", zh: '南瓜燈', emoji: '🎃', tier: 'recognition', category: '萬聖節字彙', page: 'p.80' },
      { key: 'hw_mummy', en: 'a mummy', spellTarget: 'mummy', zh: '木乃伊', emoji: '🤕', tier: 'recognition', category: '萬聖節字彙', page: 'p.80' },
      { key: 'hw_vampire', en: 'a vampire', spellTarget: 'vampire', zh: '吸血鬼', emoji: '🧛🏻', tier: 'recognition', category: '萬聖節字彙', page: 'p.80' },
      { key: 'hw_witch', en: 'a witch', spellTarget: 'witch', zh: '女巫', emoji: '🧙🏻‍♀️', tier: 'core', category: '萬聖節字彙', page: 'p.80' },
    ],
    sentences: [
      { key: 'hw_s1', en: "Let's go trick-or-treating!", zh: '我們一起去「不給糖就搗蛋」！', replyEn: 'Hooray!', replyZh: '萬歲！', tag: '日常用語' },
      { key: 'hw_s2', en: 'Red light! Stop!', zh: '紅燈！停！（交通安全）', tag: '故事口語' },
      { key: 'hw_s3', en: "Is that your grandpa's house?", zh: '那是你爺爺的房子嗎？', tag: '故事口語' },
      { key: 'hw_s4', en: 'Trick or treat!', zh: '不給糖就搗蛋！', replyEn: 'Happy Halloween!', replyZh: '萬聖節快樂！', tag: '核心句型' },
    ],
    checklistItems: [
      { key: 'chk_hw_vocab', labelEn: "Identify ghost, jack-o'-lantern, mummy, vampire, witch", labelZh: '能聽懂並說出 5 個萬聖節角色與物品' },
      { key: 'chk_hw_chant', labelEn: 'Say: Trick or treat! / Happy Halloween!', labelZh: '能開心地說出萬聖節祝福與討糖用語' },
    ],
  },
];

// Review 2 Page 78 Play & Say 25 Phonics Words
export const PLAY_AND_SAY_WORDS: { en: string; zh: string; pattern: 'short_o' | 'long_oe' | 'short_u' | 'long_ue' }[] = [
  { en: 'hop', zh: '單腳跳', pattern: 'short_o' },
  { en: 'tube', zh: '管子', pattern: 'long_ue' },
  { en: 'hug', zh: '擁抱', pattern: 'short_u' },
  { en: 'mute', zh: '靜音的', pattern: 'long_ue' },
  { en: 'cute', zh: '可愛的', pattern: 'long_ue' },
  { en: 'puke', zh: '嘔吐', pattern: 'long_ue' },
  { en: 'rob', zh: '搶劫', pattern: 'short_o' },
  { en: 'duck', zh: '鴨子', pattern: 'short_u' },
  { en: 'cod', zh: '鱈魚', pattern: 'short_o' },
  { en: 'bone', zh: '骨頭', pattern: 'long_oe' },
  { en: 'cone', zh: '圓錐體', pattern: 'long_oe' },
  { en: 'tub', zh: '浴缸', pattern: 'short_u' },
  { en: 'robe', zh: '長袍', pattern: 'long_oe' },
  { en: 'mule', zh: '騾子', pattern: 'long_ue' },
  { en: 'pop', zh: '砰；汽水', pattern: 'short_o' },
  { en: 'tune', zh: '曲調', pattern: 'long_ue' },
  { en: 'code', zh: '代碼', pattern: 'long_oe' },
  { en: 'gum', zh: '口香糖', pattern: 'short_u' },
  { en: 'joke', zh: '笑話', pattern: 'long_oe' },
  { en: 'cub', zh: '幼獸', pattern: 'short_u' },
  { en: 'not', zh: '不是', pattern: 'short_o' },
  { en: 'cut', zh: '剪；切', pattern: 'short_u' },
  { en: 'cube', zh: '立方體', pattern: 'long_ue' },
  { en: 'mom', zh: '媽媽', pattern: 'short_o' },
  { en: 'hope', zh: '希望', pattern: 'long_oe' },
];

// Magic e Folding Cards (Book Pull-out Flap)
export const MAGIC_E_PAIRS = [
  { vowel: 'a → a_e', shortWord: 'cap', shortZh: '棒球帽', shortEmoji: '🧢', longWord: 'cape', longZh: '披風', longEmoji: '🦸🏻' },
  { vowel: 'a → a_e', shortWord: 'mat', shortZh: '墊子', shortEmoji: '🧶', longWord: 'mate', longZh: '夥伴', longEmoji: '🤝' },
  { vowel: 'a → a_e', shortWord: 'tap', shortZh: '水龍頭', shortEmoji: '🚰', longWord: 'tape', longZh: '膠帶', longEmoji: '🩹' },
  { vowel: 'e → e_e', shortWord: 'pet', shortZh: '寵物', shortEmoji: '🐶', longWord: 'Pete', longZh: '彼得', longEmoji: '🧑🏻' },
  { vowel: 'i → i_e', shortWord: 'kit', shortZh: '工具箱', shortEmoji: '🧰', longWord: 'kite', longZh: '風箏', longEmoji: '🪁' },
  { vowel: 'i → i_e', shortWord: 'pin', shortZh: '別針', shortEmoji: '🧷', longWord: 'pine', longZh: '松樹', longEmoji: '🌲' },
  { vowel: 'i → i_e', shortWord: 'win', shortZh: '贏', shortEmoji: '🏆', longWord: 'wine', longZh: '葡萄酒', longEmoji: '🍷' },
  { vowel: 'o → o_e', shortWord: 'cod', shortZh: '鱈魚', shortEmoji: '🐟', longWord: 'code', longZh: '代碼', longEmoji: '💻' },
  { vowel: 'o → o_e', shortWord: 'hop', shortZh: '單腳跳', shortEmoji: '🦘', longWord: 'hope', longZh: '希望', longEmoji: '🌟' },
  { vowel: 'o → o_e', shortWord: 'rob', shortZh: '搶劫', shortEmoji: '🦹', longWord: 'robe', longZh: '長袍', longEmoji: '👘' },
  { vowel: 'u → u_e', shortWord: 'cub', shortZh: '幼獸', shortEmoji: '🐻', longWord: 'cube', longZh: '立方體', longEmoji: '🧊' },
  { vowel: 'u → u_e', shortWord: 'cut', shortZh: '剪；切', shortEmoji: '✂️', longWord: 'cute', longZh: '可愛的', longEmoji: '🥰' },
];

// Taiwan Cities & Temperatures (pp. 86–87 Picture Dictionary)
export const TAIWAN_CITIES_WEATHER = [
  {
    cityEn: 'Taipei',
    cityZh: '臺北',
    region: '北部',
    weatherEn: 'rainy',
    weatherZh: '下雨的',
    emoji: '🌧️',
    tempNum: 20,
    tempWords: 'twenty degrees Celsius',
    sentence: "It's rainy in Taipei. It's twenty degrees Celsius.",
  },
  {
    cityEn: 'Hsinchu',
    cityZh: '新竹',
    region: '北部（風城）',
    weatherEn: 'windy',
    weatherZh: '颳風的',
    emoji: '💨',
    tempNum: 25,
    tempWords: 'twenty-five degrees Celsius',
    sentence: "It's windy in Hsinchu. It's twenty-five degrees Celsius.",
  },
  {
    cityEn: 'Taichung',
    cityZh: '臺中',
    region: '中部',
    weatherEn: 'cloudy',
    weatherZh: '陰天的',
    emoji: '☁️',
    tempNum: 15,
    tempWords: 'fifteen degrees Celsius',
    sentence: "It's cloudy in Taichung. It's fifteen degrees Celsius.",
  },
  {
    cityEn: 'Kaohsiung',
    cityZh: '高雄',
    region: '南部',
    weatherEn: 'sunny',
    weatherZh: '晴朗的',
    emoji: '☀️',
    tempNum: 30,
    tempWords: 'thirty degrees Celsius',
    sentence: "It's sunny in Kaohsiung. It's thirty degrees Celsius.",
  },
];

// Famous Clocks Around the World (pp. 90–91)
export const FAMOUS_CLOCKS = [
  {
    nameEn: 'Big Ben',
    nameZh: '英國大笨鐘',
    countryEn: 'the UK',
    countryZh: '英國 🇬🇧',
    emoji: '🕰️',
    timeDisplay: '11:26',
    questionEn: 'What time is it?',
    answerEn: "It's eleven twenty-six.",
    answerZh: '現在十一點二十六分。',
    fact: '位於倫敦西敏宮北端的大笨鐘，是世界最著名的哥德式鐘塔地標！',
  },
  {
    nameEn: 'cuckoo clock',
    nameZh: '德國咕咕鐘',
    countryEn: 'Germany',
    countryZh: '德國 🇩🇪',
    emoji: '🐦',
    timeDisplay: '03:00',
    questionEn: 'What time is it?',
    answerEn: "It's three o'clock.",
    answerZh: '現在三點整（布穀鳥會跳出來報時喔！）。',
    fact: '發源於德國黑森林地區，整點時可愛的木雕布穀鳥會推開小門「咕咕」報時！',
  },
  {
    nameEn: 'Grand Central Station Clock',
    nameZh: '美國中央車站時鐘',
    countryEn: 'the USA',
    countryZh: '美國 🇺🇸',
    emoji: '🚉',
    timeDisplay: '08:15',
    questionEn: 'What time is it?',
    answerEn: "It's eight fifteen.",
    answerZh: '現在八點十五分。',
    fact: '位於紐約中央車站詢問台上方，四面鐘盤皆由珍貴的蛋白石打造而成！',
  },
  {
    nameEn: 'Cosmo Clock 21',
    nameZh: '日本橫濱摩天輪時鐘',
    countryEn: 'Japan',
    countryZh: '日本 🇯🇵',
    emoji: '🎡',
    timeDisplay: '6:46',
    questionEn: 'What time is it?',
    answerEn: "It's six forty-six.",
    answerZh: '現在六點四十六分（課本實境顯示 6:46）。',
    fact: '位於日本橫濱港未來 21，是一座結合巨大數位電子時鐘的摩天輪地標！',
  },
];

// Task: Let's Write Emergency Scenarios (pp. 84–85)
export const EMERGENCY_SCENARIOS = [
  {
    id: 'fire',
    wordEn: 'fire',
    wordZh: '火災（火）',
    emoji: '🔥',
    conditionEn: 'hot and windy',
    conditionZh: '又熱風又大',
  },
  {
    id: 'blackout',
    wordEn: 'blackout',
    wordZh: '停電',
    emoji: '🕯️',
    conditionEn: 'dark',
    conditionZh: '一片漆黑',
  },
  {
    id: 'earthquake',
    wordEn: 'earthquake',
    wordZh: '地震',
    emoji: '🫨',
    conditionEn: 'cold and rainy',
    conditionZh: '又冷又下雨',
  },
  {
    id: 'flood',
    wordEn: 'flood',
    wordZh: '水災',
    emoji: '🌊',
    conditionEn: 'rainy and windy',
    conditionZh: '颳風又下雨',
  },
  {
    id: 'mudslide',
    wordEn: 'mudslide',
    wordZh: '土石流',
    emoji: '⛰️',
    conditionEn: 'rainy and dark',
    conditionZh: '下雨又昏暗',
  },
];

// Witch's Hat Word Hunt (p. 112 & pp. 103–108)
export const WORD_HUNT_TARGETS = [
  { key: 'wh_fifteen', word: 'fifteen', hintZh: '十五（Get Ready / Unit 2）', unit: 'Get Ready' },
  { key: 'wh_twenty', word: 'twenty', hintZh: '二十（Get Ready / Unit 2）', unit: 'Get Ready' },
  { key: 'wh_sunny', word: 'sunny', hintZh: '晴朗的（Unit 1）', unit: 'Unit 1' },
  { key: 'wh_cloudy', word: 'cloudy', hintZh: '陰天的（Unit 1）', unit: 'Unit 1' },
  { key: 'wh_windy', word: 'windy', hintZh: '颳風的（Unit 1）', unit: 'Unit 1' },
  { key: 'wh_thirty', word: 'thirty', hintZh: '三十（Unit 2）', unit: 'Unit 2' },
  { key: 'wh_forty', word: 'forty', hintZh: '四十（Unit 2）', unit: 'Unit 2' },
  { key: 'wh_eraser', word: 'eraser', hintZh: '橡皮擦（Unit 3）', unit: 'Unit 3' },
  { key: 'wh_pencil', word: 'pencil', hintZh: '鉛筆（Unit 3）', unit: 'Unit 3' },
  { key: 'wh_ruler', word: 'ruler', hintZh: '尺（Unit 3）', unit: 'Unit 3' },
  { key: 'wh_under', word: 'under', hintZh: '在……底下（Unit 4）', unit: 'Unit 4' },
  { key: 'wh_chair', word: 'chair', hintZh: '椅子（Unit 4）', unit: 'Unit 4' },
  { key: 'wh_witch', word: 'witch', hintZh: '女巫（Halloween）', unit: 'Halloween' },
  { key: 'wh_ghost', word: 'ghost', hintZh: '鬼魂（Halloween）', unit: 'Halloween' },
];

export function getAllVocabWithUnit(): (VocabItem & { unitId: string; unitBadge: string })[] {
  const list: (VocabItem & { unitId: string; unitBadge: string })[] = [];
  for (const u of UNITS_DATA) {
    for (const v of u.vocab) {
      list.push({ ...v, unitId: u.id, unitBadge: u.badge });
    }
  }
  return list;
}
