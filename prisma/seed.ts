import { PrismaClient, NoteTemplateType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' });
const prisma = new PrismaClient({ adapter });

const LANGUAGES = [
    { id: 'en', name: 'English', nativeName: 'English', flagEmoji: '🇬🇧' },
    { id: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flagEmoji: '🇻🇳' },
    { id: 'ja', name: 'Japanese', nativeName: '日本語', flagEmoji: '🇯🇵' },
    { id: 'ko', name: 'Korean', nativeName: '한국어', flagEmoji: '🇰🇷' },
    { id: 'zh', name: 'Chinese', nativeName: '中文', flagEmoji: '🇨🇳' },
    { id: 'fr', name: 'French', nativeName: 'Français', flagEmoji: '🇫🇷' },
    { id: 'de', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
    { id: 'es', name: 'Spanish', nativeName: 'Español', flagEmoji: '🇪🇸' },
    { id: 'it', name: 'Italian', nativeName: 'Italiano', flagEmoji: '🇮🇹' },
    { id: 'pt', name: 'Portuguese', nativeName: 'Português', flagEmoji: '🇵🇹' },
    { id: 'ru', name: 'Russian', nativeName: 'Русский', flagEmoji: '🇷🇺' },
    { id: 'ar', name: 'Arabic', nativeName: 'العربية', flagEmoji: '🇸🇦' },
    { id: 'th', name: 'Thai', nativeName: 'ภาษาไทย', flagEmoji: '🇹🇭' },
    { id: 'nl', name: 'Dutch', nativeName: 'Nederlands', flagEmoji: '🇳🇱' },
    { id: 'pl', name: 'Polish', nativeName: 'Polski', flagEmoji: '🇵🇱' },
    { id: 'tr', name: 'Turkish', nativeName: 'Türkçe', flagEmoji: '🇹🇷' },
];

const TEMPLATES = [
    {
        name: 'Basic',
        type: NoteTemplateType.BASIC,
        fieldNames: ['Front', 'Back'],
        cardTemplates: [
            {
                name: 'Card 1',
                frontHtml: '{{Front}}',
                backHtml: '{{Front}}<hr id="answer">{{Back}}',
                css: '.card { font-family: Arial; font-size: 20px; text-align: center; color: #333; }',
            },
        ],
    },
    {
        name: 'Basic (and reversed card)',
        type: NoteTemplateType.BASIC_REVERSED,
        fieldNames: ['Front', 'Back'],
        cardTemplates: [
            {
                name: 'Card 1',
                frontHtml: '{{Front}}',
                backHtml: '{{Front}}<hr id="answer">{{Back}}',
                css: '',
            },
            {
                name: 'Card 2',
                frontHtml: '{{Back}}',
                backHtml: '{{Back}}<hr id="answer">{{Front}}',
                css: '',
            },
        ],
    },
    {
        name: 'Vocabulary',
        type: NoteTemplateType.BASIC,
        fieldNames: ['Word', 'Meaning', 'IPA', 'PartOfSpeech', 'Example', 'Image', 'Audio'],
        cardTemplates: [
            {
                name: 'Vocabulary Card',
                frontHtml: '<div class="word">{{Word}}</div><div class="pos">{{PartOfSpeech}}</div><div class="media">{{Image}}</div>',
                backHtml: '<div class="word">{{Word}}</div><div class="ipa">{{IPA}}</div><div class="media">{{Image}}</div><hr id="answer"><div class="meaning">{{Meaning}}</div><div class="example">{{Example}}</div><div class="media">{{Audio}}</div>',
                css: '.card { font-family: Arial; font-size: 20px; color: #333; }.word { font-size: 28px; font-weight: bold; }.ipa { font-style: italic; color: #888; }.meaning { font-size: 18px; }.example { font-size: 16px; font-style: italic; color: #555; }.pos { font-size: 12px; color: #aaa; }',
            },
        ],
    },
    {
        name: 'Vocabulary (reversed)',
        type: NoteTemplateType.BASIC_REVERSED,
        fieldNames: ['Word', 'Meaning', 'Image', 'Audio'],
        cardTemplates: [
            {
                name: 'Meaning → Word',
                frontHtml: '<div class="meaning">{{Meaning}}</div><div class="media">{{Image}}</div>',
                backHtml: '<div class="meaning">{{Meaning}}</div><div class="media">{{Image}}</div><hr id="answer"><div class="word">{{Word}}</div><div class="media">{{Audio}}</div>',
                css: '.card { font-family: Arial; font-size: 20px; text-align: center; }.word { font-size: 24px; font-weight: bold; }.meaning { font-size: 18px; color: #555; }',
            },
            {
                name: 'Word → Meaning',
                frontHtml: '<div class="word">{{Word}}</div><div class="media">{{Image}}</div>',
                backHtml: '<div class="word">{{Word}}</div><div class="media">{{Image}}</div><hr id="answer"><div class="meaning">{{Meaning}}</div><div class="media">{{Audio}}</div>',
                css: '',
            },
        ],
    },
    {
        name: 'Cloze',
        type: NoteTemplateType.CLOZE,
        fieldNames: ['Text', 'Extra'],
        cardTemplates: [
            {
                name: 'Cloze Card',
                frontHtml: '{{cloze:Text}}',
                backHtml: '{{cloze:Text}}<hr id="answer">{{Extra}}',
                css: '.cloze { font-weight: bold; color: blue; }.card { font-family: Arial; font-size: 20px; }',
            },
        ],
    },
    {
        name: 'Image Occlusion',
        type: NoteTemplateType.IMAGE_OCCLUSION,
        fieldNames: ['Image', 'Label'],
        cardTemplates: [
            {
                name: 'Image Card',
                frontHtml: '<div class="image">{{Image}}</div>',
                backHtml: '<div class="image">{{Image}}</div><hr id="answer"><div class="label">{{Label}}</div>',
                css: '.card { text-align: center; }.image img { max-width: 100%; border-radius: 8px; }.label { font-size: 18px; margin-top: 12px; }',
            },
        ],
    },
    {
        name: 'Type Answer',
        type: NoteTemplateType.BASIC,
        fieldNames: ['Front', 'Back'],
        cardTemplates: [
            {
                name: 'Typing Card',
                frontHtml: '{{Front}}<br><br>{{type:Back}}',
                backHtml: '{{Front}}<hr id="answer">{{Back}}',
                css: '.card { font-family: Arial; font-size: 20px; text-align: center; } input[type=text] { font-size: 18px; padding: 4px 8px; }',
            },
        ],
    },
    {
        name: 'Basic (Audio Front)',
        type: NoteTemplateType.BASIC_AUDIO,
        fieldNames: ['Word', 'Meaning', 'IPA', 'PartOfSpeech', 'Example', 'Image', 'Audio'],
        cardTemplates: [
            {
                name: 'Card 1',
                frontHtml: '<div class="word">{{Word}}</div><div class="media">{{Audio}}</div>',
                backHtml: '<div class="word">{{Word}}</div><div class="ipa">{{IPA}}</div><div class="pos">{{PartOfSpeech}}</div><div class="media">{{Image}}</div><hr id="answer"><div class="meaning">{{Meaning}}</div><div class="example">{{Example}}</div><div class="media">{{Audio}}</div>',
                css: '.card { font-family: Arial; font-size: 20px; color: #333; text-align: center; }.word { font-size: 28px; font-weight: bold; }.ipa { font-style: italic; color: #888; }.meaning { font-size: 18px; }.example { font-size: 16px; font-style: italic; color: #555; margin-top: 8px; }.pos { font-size: 12px; color: #aaa; }.media { margin: 8px 0; }',
            },
        ],
    },
];

const ACHIEVEMENTS = [
    // Streak achievements
    {
        key: 'STREAK_3',
        name: '3 Ngày liên tiếp',
        description: 'Học liên tiếp 3 ngày',
        iconUrl: null,
        xpReward: 20,
        condition: { type: 'streak', value: 3 },
    },
    {
        key: 'STREAK_7',
        name: '7 Ngày liên tiếp',
        description: 'Học liên tiếp 7 ngày',
        iconUrl: null,
        xpReward: 50,
        condition: { type: 'streak', value: 7 },
    },
    {
        key: 'STREAK_14',
        name: '2 Tuần liên tiếp',
        description: 'Học liên tiếp 14 ngày',
        iconUrl: null,
        xpReward: 100,
        condition: { type: 'streak', value: 14 },
    },
    {
        key: 'STREAK_30',
        name: '1 Tháng liên tiếp',
        description: 'Học liên tiếp 30 ngày',
        iconUrl: null,
        xpReward: 250,
        condition: { type: 'streak', value: 30 },
    },
    {
        key: 'STREAK_60',
        name: '2 Tháng liên tiếp',
        description: 'Học liên tiếp 60 ngày',
        iconUrl: null,
        xpReward: 500,
        condition: { type: 'streak', value: 60 },
    },
    {
        key: 'STREAK_100',
        name: '100 Ngày liên tiếp',
        description: 'Học liên tiếp 100 ngày - Huyền thoại!',
        iconUrl: null,
        xpReward: 1000,
        condition: { type: 'streak', value: 100 },
    },

    // Reviews achievements
    {
        key: 'REVIEWS_10',
        name: 'Người mới bắt đầu',
        description: 'Hoàn thành 10 lượt ôn tập',
        iconUrl: null,
        xpReward: 10,
        condition: { type: 'reviews', value: 10 },
    },
    {
        key: 'REVIEWS_50',
        name: 'Người chăm chỉ',
        description: 'Hoàn thành 50 lượt ôn tập',
        iconUrl: null,
        xpReward: 30,
        condition: { type: 'reviews', value: 50 },
    },
    {
        key: 'REVIEWS_100',
        name: 'Người siêng năng',
        description: 'Hoàn thành 100 lượt ôn tập',
        iconUrl: null,
        xpReward: 50,
        condition: { type: 'reviews', value: 100 },
    },
    {
        key: 'REVIEWS_500',
        name: 'Bậc thầy ôn tập',
        description: 'Hoàn thành 500 lượt ôn tập',
        iconUrl: null,
        xpReward: 200,
        condition: { type: 'reviews', value: 500 },
    },
    {
        key: 'REVIEWS_1000',
        name: 'Người ôn tập kiên trì',
        description: 'Hoàn thành 1.000 lượt ôn tập',
        iconUrl: null,
        xpReward: 500,
        condition: { type: 'reviews', value: 1000 },
    },
    {
        key: 'REVIEWS_5000',
        name: 'Máy ôn tập',
        description: 'Hoàn thành 5.000 lượt ôn tập',
        iconUrl: null,
        xpReward: 1000,
        condition: { type: 'reviews', value: 5000 },
    },
    {
        key: 'REVIEWS_10000',
        name: 'Thần ôn tập',
        description: 'Hoàn thành 10.000 lượt ôn tập',
        iconUrl: null,
        xpReward: 2000,
        condition: { type: 'reviews', value: 10000 },
    },

    // Cards achievements
    {
        key: 'CARDS_10',
        name: 'Tạo thẻ đầu tiên',
        description: 'Tạo 10 thẻ học tập',
        iconUrl: null,
        xpReward: 15,
        condition: { type: 'cards', value: 10 },
    },
    {
        key: 'CARDS_50',
        name: 'Người sưu tầm',
        description: 'Tạo 50 thẻ học tập',
        iconUrl: null,
        xpReward: 40,
        condition: { type: 'cards', value: 50 },
    },
    {
        key: 'CARDS_100',
        name: 'Người tích lũy',
        description: 'Tạo 100 thẻ học tập',
        iconUrl: null,
        xpReward: 80,
        condition: { type: 'cards', value: 100 },
    },
    {
        key: 'CARDS_500',
        name: 'Thư viện nhỏ',
        description: 'Tạo 500 thẻ học tập',
        iconUrl: null,
        xpReward: 200,
        condition: { type: 'cards', value: 500 },
    },
    {
        key: 'CARDS_1000',
        name: 'Thư viện lớn',
        description: 'Tạo 1.000 thẻ học tập',
        iconUrl: null,
        xpReward: 500,
        condition: { type: 'cards', value: 1000 },
    },

    // XP achievements
    {
        key: 'XP_100',
        name: '100 XP',
        description: 'Tích lũy 100 XP',
        iconUrl: null,
        xpReward: 0,
        condition: { type: 'xp', value: 100 },
    },
    {
        key: 'XP_500',
        name: '500 XP',
        description: 'Tích lũy 500 XP',
        iconUrl: null,
        xpReward: 0,
        condition: { type: 'xp', value: 500 },
    },
    {
        key: 'XP_1000',
        name: '1.000 XP',
        description: 'Tích lũy 1.000 XP',
        iconUrl: null,
        xpReward: 0,
        condition: { type: 'xp', value: 1000 },
    },
    {
        key: 'XP_5000',
        name: '5.000 XP',
        description: 'Tích lũy 5.000 XP',
        iconUrl: null,
        xpReward: 0,
        condition: { type: 'xp', value: 5000 },
    },
    {
        key: 'XP_10000',
        name: '10.000 XP',
        description: 'Tích lũy 10.000 XP',
        iconUrl: null,
        xpReward: 0,
        condition: { type: 'xp', value: 10000 },
    },

    // Special achievements
    {
        key: 'FIRST_REVIEW',
        name: 'Lượt ôn tập đầu tiên',
        description: 'Hoàn thành lượt ôn tập đầu tiên',
        iconUrl: null,
        xpReward: 5,
        condition: { type: 'reviews', value: 1 },
    },
    {
        key: 'FIRST_DECK',
        name: 'Deck đầu tiên',
        description: 'Tạo deck đầu tiên',
        iconUrl: null,
        xpReward: 10,
        condition: { type: 'cards', value: 1 },
    },
    {
        key: 'WEEK_WARRIOR',
        name: 'Chiến binh tuần lễ',
        description: 'Học ít nhất 1 lần trong 7 ngày liên tiếp',
        iconUrl: null,
        xpReward: 30,
        condition: { type: 'streak', value: 7 },
    },
];

async function main() {
    console.log('Seeding languages...');

    for (const lang of LANGUAGES) {
        const exists = await prisma.language.findUnique({ where: { id: lang.id } });
        if (exists) {
            await prisma.language.update({
                where: { id: lang.id },
                data: { isSupported: true },
            });
            console.log(`  Updated "${lang.name}" — isSupported = true`);
            continue;
        }

        await prisma.language.create({
            data: { ...lang, isSupported: true },
        });

        console.log(`  Created "${lang.name}"`);
    }

    console.log('Seeding note templates...');

    for (const template of TEMPLATES) {
        const exists = await prisma.noteTemplate.findFirst({
            where: { name: template.name },
        });

        if (exists) {
            console.log(`  Skipping "${template.name}" — already exists`);
            continue;
        }

        await prisma.noteTemplate.create({
            data: {
                name: template.name,
                type: template.type,
                fieldNames: template.fieldNames,
                cardTemplates: {
                    create: template.cardTemplates.map((ct) => ({
                        name: ct.name,
                        frontHtml: ct.frontHtml,
                        backHtml: ct.backHtml,
                        css: ct.css,
                    })),
                },
            },
        });

        console.log(`  Created "${template.name}"`);
    }

    console.log('Seeding achievements...');

    for (const ach of ACHIEVEMENTS) {
        const exists = await prisma.achievement.findUnique({ where: { key: ach.key } });
        if (exists) {
            console.log(`  Skipping "${ach.name}" — already exists`);
            continue;
        }
        await prisma.achievement.create({ data: ach });
        console.log(`  Created "${ach.name}"`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
