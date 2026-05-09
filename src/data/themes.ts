export type ThemeToken = {
  label: string;
  value: string;
};

export type ToolItem = {
  icon: string;
  label: string;
};

export type ToolGroup = {
  title: string;
  icon: string;
  items?: ToolItem[];
  description?: string;
};

export type LauncherTheme = {
  id: string;
  name: string;
  label: string;
  description: string;
  modeTag: string;
  modeNote: string;
  cssVars: Record<string, string>;
  palette: ThemeToken[];
};

export const toolGroups: ToolGroup[] = [
  {
    title: '常用工具',
    icon: '⚙',
    items: [
      { icon: '☀', label: '天气' },
      { icon: '🎙', label: '录音机' },
      { icon: '≋', label: '系统录音' },
      { icon: '🛡', label: 'Authenticator' },
      { icon: '📷', label: '拍照' },
      { icon: '🎥', label: '录像' },
      { icon: '🖼', label: '选择图片' },
      { icon: '🎞', label: '选择视频' },
    ],
  },
  {
    title: '更多功能',
    icon: '▱',
    items: [
      { icon: '▰', label: '文件管理' },
      { icon: '▰', label: '选择文件' },
      { icon: '▰', label: '选择目录' },
      { icon: '◉', label: '打开 Chrome' },
      { icon: '🔗', label: 'URL 示例' },
      { icon: '🕶', label: 'Chrome 无痕' },
      { icon: '🗺', label: '高德地图' },
      { icon: '♟', label: '高德定位' },
      { icon: '⊙', label: '高德导航' },
      { icon: '⌕', label: '高德搜索' },
      { icon: 'K', label: 'Keep' },
      { icon: '♫', label: '音乐链接' },
    ],
  },
  {
    title: '最近操作',
    icon: '◷',
    description: '等待操作，请点击一个入口按钮。',
  },
];

export const themes: LauncherTheme[] = [
  {
    id: 'light',
    name: '浅色主题配色',
    label: '浅色',
    description: '明亮、温和、低负担，适合日间浏览和默认主题验收。',
    modeTag: '结构一致，体验一致',
    modeNote: '自由切换，昼夜皆宜',
    cssVars: {
      '--background': '#F2F0EB',
      '--card': '#F8F6F1',
      '--button': '#F3E1C7',
      '--accent': '#E89A3C',
      '--text': '#2B2A29',
      '--muted': '#8A867F',
      '--border': 'rgba(91, 62, 31, 0.34)',
      '--phone-shell': '#2B2A29',
      '--soft-shadow': 'rgba(43, 42, 41, 0.22)',
      '--button-shadow': 'rgba(232, 154, 60, 0.16)',
    },
    palette: [
      { label: 'Background', value: '#F2F0EB' },
      { label: 'Card', value: '#F8F6F1' },
      { label: 'Button', value: '#F3E1C7' },
      { label: 'Accent', value: '#E89A3C' },
      { label: 'Text', value: '#2B2A29' },
      { label: 'Muted', value: '#8A867F' },
    ],
  },
  {
    id: 'dark',
    name: '深色主题配色',
    label: '深色',
    description: '夜间模式，柔和舒适，降低眩光，保持按钮层级清晰。',
    modeTag: '夜间模式，柔和舒适',
    modeNote: '降低眩光，专注体验',
    cssVars: {
      '--background': '#1B1916',
      '--card': '#24211E',
      '--button': '#342A20',
      '--accent': '#E89A3C',
      '--text': '#F3EFF8',
      '--muted': '#A49E95',
      '--border': 'rgba(232, 154, 60, 0.54)',
      '--phone-shell': '#22201E',
      '--soft-shadow': 'rgba(0, 0, 0, 0.45)',
      '--button-shadow': 'rgba(232, 154, 60, 0.12)',
    },
    palette: [
      { label: 'Background', value: '#1B1916' },
      { label: 'Card', value: '#24211E' },
      { label: 'Button', value: '#342A20' },
      { label: 'Accent', value: '#E89A3C' },
      { label: 'Text', value: '#F3EFF8' },
      { label: 'Muted', value: '#A49E95' },
    ],
  },
];
