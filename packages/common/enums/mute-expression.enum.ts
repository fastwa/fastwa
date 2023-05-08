export enum MuteExpression {
  UNMUTE = null,
  ALWAYS = -1,
  FOR_1_WEEK = new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
  FOR_8_HOURS = new Date().getTime() + 8 * 60 * 60 * 1000
}
