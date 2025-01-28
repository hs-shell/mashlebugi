import ReactDOM from 'react-dom';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { fetchCourseDescriptionData } from '@/hooks/fetchAPI';
import { Description } from '@/types/types';
import { useEffect, useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { ShadowRootContext } from '@/lib/ShadowRootContext';

interface ModalProps {
  code: string;
  onClose: () => void;
}

const CourseDetailModal: React.FC<ModalProps> = ({ code, onClose }: ModalProps) => {
  const [description, setDescription] = useState<Description | null>(null);
  const shadowRoot = useContext(ShadowRootContext); // ShadowRootContext 사용

  useEffect(() => {
    console.log('Fetching description for code:', code);
    if (code) {
      fetchCourseDescriptionData({ code, setDescription });
    }
  }, [code]);

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-lg w-3/4 max-w-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
        {/* 닫기 버튼 */}
        <Button onClick={onClose} className="absolute top-2 right-2" variant="ghost">
          ×
        </Button>
        {description ? (
          <div>
            <h2 className="text-xl font-bold mb-4">과목해설</h2>
            <Table>
              <TableBody>
                <TableRow className="bg-zinc-100 hover:bg-zinc-100">
                  <TableCell>교과코드</TableCell>
                  <TableCell>교과목명</TableCell>
                </TableRow>
                <TableRow className="bg-white hover:bg-white">
                  <TableCell>{description.code}</TableCell>
                  <TableCell>{description.code_value}</TableCell>
                </TableRow>
                <TableRow className="bg-zinc-100 hover:bg-zinc-100">
                  <TableCell colSpan={2}>교과목해설</TableCell>
                </TableRow>
                <TableRow className="bg-white hover:bg-white">
                  <TableCell colSpan={2} className="text-left">
                    {description.comment}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-white hover:bg-white">
                  <TableCell colSpan={2} className="text-left">
                    {description.ecomment}
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
};

export default CourseDetailModal;
