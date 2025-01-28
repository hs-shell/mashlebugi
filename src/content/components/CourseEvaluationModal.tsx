import ReactDOM from 'react-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchCourseEvaluationData } from '@/hooks/fetchAPI';
import { CourseEvaluation, Description } from '@/types/types';
import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { ShadowRootContext } from '@/lib/ShadowRootContext';

interface ModalProp {
  code: string;
  onClose: () => void;
}

export function CourseEvaluationModal({ code, onClose }: ModalProp) {
  const [courseEvaluation, setCourseEvaluation] = useState<CourseEvaluation | null>(null);
  const shadowRoot = useContext(ShadowRootContext);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (code) {
      fetchCourseEvaluationData({ code, setCourseEvaluation });
    }

    setIsVisible(true);

    return () => {
      setIsVisible(false);
    };
  }, [code]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 left-44 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div className="bg-white rounded-lg shadow-lg w-3/4 max-w-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <Button onClick={onClose} className="absolute top-2 right-2" variant="ghost">
          ×
        </Button>
        {courseEvaluation ? (
          <div>
            <h2 className="text-xl font-bold mb-4">과목해설</h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-100 hover:bg-zinc-100">
                  <TableHead className="w-[15%]">교과코드</TableHead>
                  <TableHead className="w-[25%]">과목명</TableHead>
                  <TableHead className="w-[15%]">교수</TableHead>
                  <TableHead className="w-[15%]">학년도</TableHead>
                  <TableHead className="w-[15%]">학기</TableHead>
                  <TableHead className="w-[15%]">점수</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-white hover:bg-white">
                  <TableCell>{courseEvaluation.courseCode}</TableCell>
                  <TableCell>{courseEvaluation.courseName}</TableCell>
                  <TableCell>{courseEvaluation.professor}</TableCell>
                  <TableCell>{courseEvaluation.academicYear}</TableCell>
                  <TableCell>{courseEvaluation.semester}</TableCell>
                  <TableCell>{courseEvaluation.score}</TableCell>
                </TableRow>
                <TableRow className="bg-zinc-100 hover:bg-zinc-100">
                  <TableHead colSpan={6}>도움말</TableHead>
                </TableRow>
                <TableRow className="bg-white hover:bg-white">
                  <TableCell colSpan={6} className="text-left">
                    <ul className="list-disc pl-5">
                      <li>해당 교과에 대한 교강사의 최근 2학기 강의평가 점수 조회 화면입니다.</li>
                      <li>수강 신청 2주 전부터 정정일까지 확인 가능합니다.</li>
                    </ul>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center">로딩 중...</div>
        )}
      </div>
    </div>
  );

  const modalRoot = shadowRoot?.querySelector('#shadow-modal-root');
  if (!modalRoot) {
    console.error('shadow-modal-root element not found in the Shadow DOM.');
    return null;
  }

  return ReactDOM.createPortal(modalContent, modalRoot);
}

export default CourseEvaluationModal;
