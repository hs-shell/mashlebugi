import xml2js from 'xml2js';
import {
  Item,
  ParsedXML,
  Department,
  SemesterItem,
  Semester,
  ParsedSemesterXML,
  Subject,
  Description,
  CourseEvaluation,
} from '@/types/types';
import { extractCollegeName, extractDepartmentName, extractFacultyName } from '@/lib/utils';

export const fetchSemesterData = ({
  setSemestersData,
  setLoading,
}: {
  setSemestersData: (groupedSemesters: { [year: string]: Semester[] }) => void;
  setLoading: (bool: boolean) => void;
}) => {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://info.hansung.ac.kr/jsp_21/student/kyomu/siganpyo_aui_data.jsp?gubun=yearhakgilist', true);
  xhr.withCredentials = true;
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  xhr.setRequestHeader('Accept', 'application/xml, text/xml, */*; q=0.01');

  xhr.onload = async function () {
    if (xhr.status === 200) {
      const xml = xhr.responseText;
      const parser = new xml2js.Parser();
      const resultSem: ParsedXML = await parser.parseStringPromise(xml);

      const semesters: SemesterItem[] = resultSem.root.items[0].item;
      const groupedSemesters: { [year: string]: Semester[] } = {};

      semesters.forEach((item) => {
        const tcd = item.tcd[0].trim(); // 예: 20251
        const tnm = item.tnm[0].trim(); // 예: 2025년 1학기

        if (tcd.length !== 5) {
          console.warn(`잘못된 tcd 코드: ${tcd}`);
          return;
        }

        const year = tcd.slice(0, 4); // 년도 추출
        const semesterCode = tcd.slice(4); // 학기 코드 추출

        let semesterName = '';
        switch (semesterCode) {
          case '1':
            semesterName = '1학기';
            break;
          case '2':
            semesterName = '2학기';
            break;
          case '3':
            semesterName = '여름학기';
            break;
          case '4':
            semesterName = '겨울학기';
            break;
          case '5':
            semesterName = '추가학기'; // 예: 20251
            break;
          default:
            semesterName = '알 수 없음';
        }

        if (!groupedSemesters[year]) {
          groupedSemesters[year] = [];
        }
        groupedSemesters[year].push({
          tcd: tcd,
          tnm: semesterName,
        });
      });

      setSemestersData(groupedSemesters);
      setLoading(false);
    } else {
      console.error('Request failed with status:', xhr.status); // 실패한 응답
    }
  };

  xhr.onerror = function () {
    console.error('Request failed');
  };

  xhr.send();
};

export const fetchDepartmentData = ({
  semester,
  setGroupedData,
  setLoading,
}: {
  semester: string;
  setGroupedData: (grouped: {
    [college: string]: {
      [faculty: string]: Department[];
    };
  }) => void;
  setLoading: (bool: boolean) => void;
}) => {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://info.hansung.ac.kr/jsp_21/student/kyomu/siganpyo_aui_data.jsp?gubun=jungonglist', true);
  xhr.withCredentials = true;
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  xhr.setRequestHeader('Accept', 'application/xml, text/xml, */*; q=0.01');

  var body = `syearhakgi=${semester}`;

  xhr.onload = async function () {
    if (xhr.status === 200) {
      const xml = xhr.responseText;
      const parser = new xml2js.Parser();
      const result: ParsedXML = await parser.parseStringPromise(xml);

      const items: Item[] = result.root.items[0].item;
      const grouped: { [college: string]: { [faculty: string]: Department[] } } = {};

      items.forEach((item) => {
        const tcd = item.tcd[0].trim(); // 예: V021
        const tnm = item.tnm[0].trim(); // 예: [V021] 모바일소프트웨어트랙

        if (tcd.length < 3) {
          console.warn(`잘못된 tcd 코드: ${tcd}`);
          return;
        }

        // 코드 분해
        const collegeName = extractCollegeName(tcd); // 단과대 이름 추출
        const facultyName = extractFacultyName(tcd); // 학부 이름 추출
        const departmentName = extractDepartmentName(tnm); // 학과 이름 추출

        // 그룹화 로직
        if (!grouped[collegeName]) {
          grouped[collegeName] = {};
        }
        if (!grouped[collegeName][facultyName]) {
          grouped[collegeName][facultyName] = [];
        }
        grouped[collegeName][facultyName].push({
          tcd: tcd,
          tnm: departmentName,
        });
      });

      setGroupedData(grouped);
      setLoading(false);
    } else {
      console.error('Request failed with status:', xhr.status); // 실패한 응답
    }
  };

  xhr.onerror = function () {
    console.error('Request failed');
  };

  xhr.send(body);
};

export const fetchSubjectsData = ({
  code,
  semester,
  setSubjectsData,
  setLoading,
}: {
  code: string;
  semester: string;
  setSubjectsData: (subjectsData: Subject[]) => void;
  setLoading: (bool: boolean) => void;
}) => {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://info.hansung.ac.kr/jsp_21/student/kyomu/siganpyo_aui_data.jsp', true);
  xhr.withCredentials = true;
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  xhr.setRequestHeader('Accept', 'application/xml, text/xml, */*; q=0.01');

  var body = `gubun=history&syearhakgi=${semester}&sjungong=${code}`;

  xhr.onload = async function () {
    if (xhr.status === 200) {
      try {
        const xml = xhr.responseText;
        const parser = new xml2js.Parser();
        const result: ParsedXML = await parser.parseStringPromise(xml);

        // XML 구조 확인
        if (!result.rows || !result.rows.row) {
          console.error('Unexpected XML structure:', result);
          setSubjectsData([]);
          setLoading(false);
          return;
        }

        const items: any[] = result.rows.row;
        const subjects: Subject[] = items.map((item: any) => ({
          kwamokcode: item.kwamokcode?.[0]?.trim() || '',
          kwamokname: item.kwamokname?.[0]?.trim() || '',
          isugubun: item.isugubun?.[0]?.trim() || '',
          hakjum: item.hakjum?.[0]?.trim() || '',
          juya: item.juya?.[0]?.trim() || '',
          bunban: item.bunban?.[0]?.trim() || '',
          haknean: item.haknean?.[0]?.trim() || '',
          haknean_limit: item.haknean_limit?.[0]?.trim() || '',
          prof: item.prof?.[0]?.trim() || '',
          classroom: item.classroom?.[0]?.trim() || '',
          plan: item.plan?.[0]?.trim() || '',
          c12: item.c12?.[0]?.trim() || '',
          c13: item.c13?.[0]?.trim() || '',
          suup_pyunga: item.suup_pyunga?.[0]?.trim() || '',
          bigo: item.bigo?.[0]?.trim() || '',
          kcomment: item.kcomment?.[0]?.trim() || '',
          ekname: item.ekname?.[0]?.trim() || '',
          gwamokgun: item.gwamokgun?.[0]?.trim() || '',
          kwamokgubun: item.kwamokgubun?.[0]?.trim() || '',
          cross_juya: item.cross_juya?.[0]?.trim() || '',
        }));

        setSubjectsData(subjects); // 상태 업데이트
        setLoading(false); // 로딩 상태 해제
      } catch (err) {
        console.error('XML parsing failed:', err);
        setSubjectsData([]); // 빈 데이터로 상태 초기화
        setLoading(false);
      }
    } else {
      console.error('Request failed with status:', xhr.status); // 실패한 응답
    }
  };

  xhr.onerror = function () {
    console.error('Request failed');
  };

  xhr.send(body);
};

export const fetchCourseDescriptionData = ({
  code,
  setDescription,
}: {
  code: string;
  setDescription: (description: Description) => void;
}) => {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://info.hansung.ac.kr/jsp_21/student/kyomu/siganpyo_aui_data.jsp', true);
  xhr.withCredentials = true;
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  xhr.setRequestHeader('Accept', 'application/xml, text/xml, */*; q=0.01');

  var body = `code=${code}&gubun=comment`;

  xhr.onload = async function () {
    if (xhr.status === 200) {
      try {
        const xml = xhr.responseText;
        const parser = new xml2js.Parser();
        const result: ParsedXML = await parser.parseStringPromise(xml);

        const item: any = result.root.items[0].item[0];
        const description: Description = {
          code: item?.code,
          code_value: item?.code_value,
          comment: item?.comment,
          ecomment: item?.ecomment,
        };
        setDescription(description);
      } catch (err) {
        console.error('XML parsing failed:', err);
      }
    } else {
      console.error('Request failed with status:', xhr.status); // 실패한 응답
    }
  };

  xhr.onerror = function () {
    console.error('Request failed');
  };

  xhr.send(body);
};

export const fetchCourseEvaluationData = ({
  code,
  setCourseEvaluation,
}: {
  code: string;
  setCourseEvaluation: (courseEvaluation: CourseEvaluation) => void;
}) => {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://info.hansung.ac.kr/jsp_21/student/kyomu/siganpyo_aui_data.jsp', true);
  xhr.withCredentials = true;
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  xhr.setRequestHeader('Accept', 'application/xml, text/xml, */*; q=0.01');

  var body = `code=${code}&gubun=pyunga`;

  xhr.onload = async function () {
    if (xhr.status === 200) {
      try {
        const xml = xhr.responseText;
        const parser = new xml2js.Parser();
        const result: ParsedXML = await parser.parseStringPromise(xml);

        // const item: any = result.root.items[0].item[0];
        const courseEvaluation: CourseEvaluation = {
          academicYear: '2001',
          courseCode: code,
          courseName: '크롬익스텐션',
          professor: '홍길동',
          score: '4.5',
          semester: '2학기',
        };
        setCourseEvaluation(courseEvaluation);
      } catch (err) {
        console.error('XML parsing failed:', err);
      }
    } else {
      console.error('Request failed with status:', xhr.status); // 실패한 응답
    }
  };

  xhr.onerror = function () {
    console.error('Request failed');
  };

  xhr.send(body);
};
