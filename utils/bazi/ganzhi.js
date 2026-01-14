export const TIAN_GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
export const DI_ZHI  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

export function ganzhiFromIndex(index) {
  return TIAN_GAN[index % 10] + DI_ZHI[index % 12];
}

