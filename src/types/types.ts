export interface Item {
  tcd: string[];
  tnm: string[];
}

export interface ParsedXML {
  root: {
    items: {
      item: Item[];
    }[];
  };
}

export interface Department {
  tcd: string;
  tnm: string;
}

export interface Faculty {
  name: string;
  departments: Department[];
}

export interface College {
  name: string;
  faculties: Faculty[];
}

export interface GroupedOutput {
  root: {
    colleges: {
      college: College[];
    };
  };
}

export interface SemesterItem {
  tcd: string[];
  tnm: string[];
}

export interface ParsedSemesterXML {
  root: {
    items: {
      item: SemesterItem[];
    }[];
  };
}

export interface Semester {
  tcd: string;
  tnm: string;
}

export interface ParsedXML {
  rows: {
    row: Item[];
  };
}

export interface Subject {
  kwamokcode: string;
  kwamokname: string;
  isugubun: string;
  hakjum: string;
  haknean: string;
  classroom: string;
  plan: string;
  gwamokgun: string;
  kwamokgubun: string;
  juya: string;
  bunban: string;
  prof: string;
  suup_pyunga: string;
  cross_juya: string;
  haknean_limit: string;
  c12: string;
  c13: string;
  bigo: string;
  kcomment: string;
  ekname: string;
}

export interface GroupedSubject {
  kwamokcode: string;
  master: Subject;
  details: Subject[];
}

export type SortDirection = 'asc' | 'desc';

export interface MasterColumn {
  id: keyof Subject;
  label: string;
  width: number;
  sortable: boolean;
  filterable: boolean;
}

export interface DetailColumn {
  id: keyof Subject;
  label: string;
  width: number;
}

export interface Description {
  code: string;
  code_value: string;
  comment: string;
  ecomment: string;
}

export interface CourseEvaluation {
  courseCode: string;
  courseName: string;
  professor: string;
  academicYear: string;
  semester: string;
  score: string;
}
