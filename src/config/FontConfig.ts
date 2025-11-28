/**
 * 字体配置
 * 统一管理游戏中使用的字体
 */

/**
 * 字体配置接口
 */
export interface FontConfig {
  // 标题字体（粗体，用于大标题）
  title: string;
  // 正文字体（常规，用于正文内容）
  body: string;
  // 数字字体（等宽，用于显示数字）
  number: string;
}

/**
 * 默认字体配置（使用系统字体）
 */
export const DEFAULT_FONTS: FontConfig = {
  title: 'Arial Black, Microsoft YaHei, "Microsoft YaHei UI", sans-serif',
  body: 'Microsoft YaHei, "Microsoft YaHei UI", Arial, sans-serif',
  number: 'Arial, "Courier New", monospace'
};

/**
 * Google Fonts 字体配置（需要加载字体文件）
 * 推荐使用思源黑体（Noto Sans SC）或站酷字体
 */
export const GOOGLE_FONTS: FontConfig = {
  title: '"Noto Sans SC", "Microsoft YaHei", Arial, sans-serif',
  body: '"Noto Sans SC", "Microsoft YaHei", Arial, sans-serif',
  number: '"Noto Sans SC", Arial, monospace'
};

/**
 * 站酷字体配置（需要加载字体文件）
 */
export const ZCOOL_FONTS: FontConfig = {
  title: '"ZCOOL KuaiLe", "Microsoft YaHei", Arial, sans-serif',
  body: '"ZCOOL KuaiLe", "Microsoft YaHei", Arial, sans-serif',
  number: '"ZCOOL KuaiLe", Arial, monospace'
};

/**
 * 阿里巴巴普惠体配置（使用本地字体文件）
 */
export const ALIBABA_FONTS: FontConfig = {
  title: '"AlibabaPuHuiTi", "Microsoft YaHei", Arial, sans-serif',
  body: '"AlibabaPuHuiTi", "Microsoft YaHei", Arial, sans-serif',
  number: '"AlibabaPuHuiTi", Arial, monospace'
};

/**
 * 当前使用的字体配置
 * 可以在这里切换不同的字体方案
 */
export const CURRENT_FONTS: FontConfig = ALIBABA_FONTS;

/**
 * 获取标题字体
 */
export function getTitleFont(): string {
  return CURRENT_FONTS.title;
}

/**
 * 获取正文字体
 */
export function getBodyFont(): string {
  return CURRENT_FONTS.body;
}

/**
 * 获取数字字体
 */
export function getNumberFont(): string {
  return CURRENT_FONTS.number;
}

