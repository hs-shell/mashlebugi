import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractCollegeName = (tcd: string): string => {
  const firstChar = tcd.charAt(0);
  switch (firstChar) {
    case 'P':
      return '크리에이티브인문예술대학';
    case 'R':
      return '미래융합사회과학대학';
    case 'T':
      return '디자인대학';
    case 'V':
      return 'IT공과대학';
    case 'Y':
      return '창의융합대학';
    case 'L':
    case 'M':
    case 'U':
      return '교양 및 기타';
    case 'W':
      return '미래플러스대학';
    case 'A':
    case 'D':
    case 'G':
    case 'K':
      return '구(과)';
    default:
      return '기타';
  }
};

// 학부 이름 추출 함수 (예: P012 -> '크리에이티브 인문학부')
export const extractFacultyName = (tcd: string): string => {
  if (tcd.length >= 3) {
    const facultyCode = tcd.slice(0, 3); // 첫 세 문자
    switch (facultyCode) {
      case 'P01':
        return '크리에이티브 인문학부';
      case 'P02':
        return '예술학부';
      case 'R01':
        return '사회과학부';
      case 'T01':
        return '글로벌패션산업학부';
      case 'T02':
      case 'T05':
      case 'T06':
        return 'ICT디자인학부';
      case 'T03':
      case 'T04':
        return '뷰티디자인매니지먼트학과';
      case 'V02':
        return '컴퓨터공학부';
      case 'V03':
        return '기계전자공학부';
      case 'V04':
        return 'IT융합공학부';
      case 'V07':
        return '산업시스템공학부';
      case 'V08':
        return '스마트제조혁신컨설팅학과';
      case 'Y02':
        return '문학문화콘텐츠학과';
      case 'Y03':
        return 'AI응용학과';
      case 'Y04':
        return '융합보안학과';
      case 'Y05':
        return '미래모빌리티학과';
      case 'Y06':
        return 'SW연계전공';
      case 'L11':
        return '교양';
      case 'U12':
        return '사이버 강의';
      case 'M02':
      case 'M03':
      case 'M11':
        return '전문과정';
      case 'A04':
      case 'A05':
      case 'A07':
        return '인문학';
      case 'D04':
      case 'D12':
      case 'D13':
      case 'D14':
      case 'D17':
      case 'D20':
      case 'D30':
        return '사회학';
      case 'G03':
      case 'G04':
      case 'G05':
      case 'G06':
      case 'G11':
      case 'G16':
        return '예체능';
      case 'K15':
      case 'K16':
      case 'K17':
      case 'K18':
      case 'K19':
      case 'K51':
        return '공학';
      case 'W02':
      case 'W03':
      case 'W04':
      case 'W05':
      case 'W06':
      case 'W07':
        return '미래플러스학과';
      default:
        return '기타';
    }
  }
  return '기타';
};

// 학과 이름 추출 함수
export const extractDepartmentName = (tnm: string): string => {
  const match = tnm.match(/\[(.*?)\]\s*(.*)/);
  return match ? match[2] : '알 수 없음';
};
