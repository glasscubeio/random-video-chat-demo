export type Lang = "ko" | "en" | "ru" | "uz";

export const LANG_CODES: Record<Lang, string> = {
  ko: "KO",
  en: "EN",
  ru: "RU",
  uz: "UZ",
};

export interface Strings {
  // landing
  title: string;
  subtitleLine1: string;
  subtitleLine2: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  startBtn: string;
  cameraNote: string;
  howItWorksNav: string;
  shareNav: string;
  copied: string;
  errorEmpty: string;
  errorShort: string;
  errorLong: string;
  errorChars: string;
  errorNickTaken: string;
  // chat
  chatBrand: string;
  leaveBtn: string;
  findSomeoneBtn: string;
  cancelBtn: string;
  nextBtn: string;
  readyTitle: string;
  readySubtitle: string;
  searchingTitle: string;
  searchingSubtitle: string;
  connectingText: string;
  cameraDeniedTitle: string;
  // modal
  modalTitle: string;
  modalSubtitle: string;
  modalFooter: string;
  p0title: string; p0detail: string;
  p1title: string; p1detail: string;
  p2title: string; p2detail: string;
  p3title: string; p3detail: string;
  p4title: string; p4detail: string;
}

const T: Record<Lang, Strings> = {
  ko: {
    title: "안녕하세요, 낯선 분.",
    subtitleLine1: "무작위 영상 채팅. 계정 불필요. 기록 없음.",
    subtitleLine2: "그냥 대화.",
    nicknameLabel: "닉네임",
    nicknamePlaceholder: "닉네임 입력...",
    startBtn: "채팅 시작 →",
    cameraNote: "연결 시 카메라 권한을 요청합니다.",
    howItWorksNav: "이용 방법",
    shareNav: "공유",
    copied: "링크 복사됨!",
    errorEmpty: "닉네임을 먼저 입력하세요.",
    errorShort: "최소 2자 이상이어야 합니다.",
    errorLong: "최대 20자까지 가능합니다.",
    errorChars: "영문, 숫자, _, - 만 사용 가능합니다.",
    errorNickTaken: "이미 사용 중인 닉네임입니다. 다른 이름을 선택하세요.",
    chatBrand: "안녕하세요, 낯선 분.",
    leaveBtn: "나가기",
    findSomeoneBtn: "상대방 찾기",
    cancelBtn: "취소",
    nextBtn: "다음",
    readyTitle: "누군가와 연결할 준비가 됐나요?",
    readySubtitle: "아래를 클릭해 무작위 상대를 찾으세요",
    searchingTitle: "상대방을 찾고 있습니다...",
    searchingSubtitle: "잠시만 기다려 주세요",
    connectingText: "연결 중...",
    cameraDeniedTitle: "카메라 접근이 거부됨",
    modalTitle: "이용 방법",
    modalSubtitle: "익명 · 비저장 · P2P",
    modalFooter: "WebSocket으로 시그널링 · 영상은 P2P 스트리밍",
    p0title: "서버에 연결",
    p0detail: "Socket.IO가 시그널링 서버에 WebSocket 연결을 엽니다",
    p1title: "대기열 대기 중",
    p1detail: "다른 사용자가 접속 — 서버가 두 명의 사용자를 매칭 대기 상태로 유지합니다",
    p2title: "매칭 완료!",
    p2detail: "서버가 익명으로 연결해 각자의 소켓 ID를 전달합니다",
    p3title: "WebRTC 핸드셰이크",
    p3detail: "SDP 오퍼/앤서 + ICE 후보를 서버를 통해 중계합니다",
    p4title: "P2P 영상 — 라이브",
    p4detail: "브라우저 간 직접 스트리밍. 서버는 더 이상 필요하지 않습니다.",
  },
  en: {
    title: "Hello, Stranger.",
    subtitleLine1: "Random video chat. No accounts. No history.",
    subtitleLine2: "Just a conversation.",
    nicknameLabel: "Nickname",
    nicknamePlaceholder: "Enter a nickname...",
    startBtn: "Start Chatting →",
    cameraNote: "Your camera will be requested once you connect.",
    howItWorksNav: "How it works",
    shareNav: "Share",
    copied: "Link copied!",
    errorEmpty: "Choose a nickname first.",
    errorShort: "At least 2 characters.",
    errorLong: "Max 20 characters.",
    errorChars: "Letters, numbers, _ and - only.",
    errorNickTaken: "That nickname is taken. Try another.",
    chatBrand: "Hello, Stranger.",
    leaveBtn: "Leave",
    findSomeoneBtn: "Find Someone",
    cancelBtn: "Cancel",
    nextBtn: "Next",
    readyTitle: "Ready to meet someone?",
    readySubtitle: "Click below to find a random stranger",
    searchingTitle: "Looking for someone...",
    searchingSubtitle: "This usually takes just a moment",
    connectingText: "Connecting...",
    cameraDeniedTitle: "Camera access denied",
    modalTitle: "How it works",
    modalSubtitle: "Anonymous · Ephemeral · Peer-to-peer",
    modalFooter: "Signaling over WebSocket · Video streams are peer-to-peer",
    p0title: "You connect",
    p0detail: "Socket.IO opens a WebSocket to the signaling server",
    p1title: "Both in queue",
    p1detail: "A stranger joins — server holds two users waiting for a match",
    p2title: "Match found!",
    p2detail: "Server pairs you anonymously — sends each other's connection ID",
    p3title: "WebRTC handshake",
    p3detail: "SDP offer / answer + ICE candidates relay through server",
    p4title: "P2P video — live",
    p4detail: "Browser-to-browser direct stream. Server steps aside.",
  },
  ru: {
    title: "Привет, незнакомец.",
    subtitleLine1: "Случайный видеочат. Без аккаунта. Без истории.",
    subtitleLine2: "Просто разговор.",
    nicknameLabel: "Псевдоним",
    nicknamePlaceholder: "Введите псевдоним...",
    startBtn: "Начать чат →",
    cameraNote: "При подключении будет запрошен доступ к камере.",
    howItWorksNav: "Как это работает",
    shareNav: "Поделиться",
    copied: "Ссылка скопирована!",
    errorEmpty: "Сначала выберите псевдоним.",
    errorShort: "Минимум 2 символа.",
    errorLong: "Максимум 20 символов.",
    errorChars: "Только буквы, цифры, _ и -.",
    errorNickTaken: "Псевдоним занят. Выберите другой.",
    chatBrand: "Привет, незнакомец.",
    leaveBtn: "Выйти",
    findSomeoneBtn: "Найти собеседника",
    cancelBtn: "Отмена",
    nextBtn: "Далее",
    readyTitle: "Готовы познакомиться?",
    readySubtitle: "Нажмите ниже, чтобы найти собеседника",
    searchingTitle: "Ищем собеседника...",
    searchingSubtitle: "Обычно это займёт секунду",
    connectingText: "Подключение...",
    cameraDeniedTitle: "Доступ к камере запрещён",
    modalTitle: "Как это работает",
    modalSubtitle: "Анонимно · Без хранения · P2P",
    modalFooter: "Сигнализация по WebSocket · Видео P2P стриминг",
    p0title: "Подключение",
    p0detail: "Socket.IO открывает WebSocket к сигнальному серверу",
    p1title: "Ожидание в очереди",
    p1detail: "Незнакомец подключается — сервер держит двух пользователей в ожидании",
    p2title: "Собеседник найден!",
    p2detail: "Сервер анонимно связывает вас и обменивается ID сокетов",
    p3title: "WebRTC-рукопожатие",
    p3detail: "SDP-предложение/ответ + ICE-кандидаты проксируются через сервер",
    p4title: "P2P видео — в эфире",
    p4detail: "Прямой стрим браузер–браузер. Сервер больше не нужен.",
  },
  uz: {
    title: "Salom, Begona.",
    subtitleLine1: "Tasodifiy video chat. Hisob kerak emas. Tarix yo'q.",
    subtitleLine2: "Faqat suhbat.",
    nicknameLabel: "Taxallus",
    nicknamePlaceholder: "Taxallus kiriting...",
    startBtn: "Chatni boshlash →",
    cameraNote: "Ulanganingizda kamera ruxsati so'raladi.",
    howItWorksNav: "Qanday ishlaydi",
    shareNav: "Ulashish",
    copied: "Havola nusxalandi!",
    errorEmpty: "Avval taxallus tanlang.",
    errorShort: "Kamida 2 ta belgi.",
    errorLong: "Maksimal 20 ta belgi.",
    errorChars: "Faqat harflar, raqamlar, _ va -.",
    errorNickTaken: "Bu taxallus band. Boshqasini tanlang.",
    chatBrand: "Salom, Begona.",
    leaveBtn: "Chiqish",
    findSomeoneBtn: "Kimnidir topish",
    cancelBtn: "Bekor qilish",
    nextBtn: "Keyingisi",
    readyTitle: "Kimdir bilan uchrashishga tayyormisiz?",
    readySubtitle: "Tasodifiy begona topish uchun pastga bosing",
    searchingTitle: "Kimnidir izlayapman...",
    searchingSubtitle: "Bu odatda bir zumda bo'ladi",
    connectingText: "Ulanmoqda...",
    cameraDeniedTitle: "Kamera ruxsati rad etildi",
    modalTitle: "Qanday ishlaydi",
    modalSubtitle: "Anonim · Saqlanmaydi · Peer-to-peer",
    modalFooter: "WebSocket orqali signal · Video P2P oqimi",
    p0title: "Ulanish",
    p0detail: "Socket.IO signalizatsiya serveriga WebSocket ochadi",
    p1title: "Navbatda kutish",
    p1detail: "Begona ulanadi — server ikkita foydalanuvchini juftlash kutmoqda",
    p2title: "Juft topildi!",
    p2detail: "Server sizni anonim tarzda juftlaydi va socket ID almashadi",
    p3title: "WebRTC qo'l siqish",
    p3detail: "SDP taklif/javob + ICE nomzodlar server orqali uzatiladi",
    p4title: "P2P video — jonli",
    p4detail: "Brauzerdan-brauzerga to'g'ridan-to'g'ri stream. Server chetga chiqadi.",
  },
};

export function t(lang: Lang, key: keyof Strings): string {
  return T[lang][key];
}
