import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchCourseDescriptionData } from '@/hooks/fetchAPI';
import { Description } from '@/types/types';
import { useEffect, useState } from 'react';

interface CourseDescriptionModalProps {
  code: string;
  isModalOpen: boolean;
  setIsModalOpen: (bool: boolean) => void;
}

export function CourseDescriptionModal({ code, isModalOpen, setIsModalOpen }: CourseDescriptionModalProps) {
  const [description, setDescription] = useState<Description | null>(null);
  useEffect(() => {
    fetchCourseDescriptionData({ code, setDescription });
  }, []);

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>과목해설</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Table>
            <TableBody>
              <TableRow className="bg-zinc-100">
                <TableCell>교과코드</TableCell>
                <TableCell>교과목명</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{description?.code}</TableCell>
                <TableCell>{description?.code_values}</TableCell>
              </TableRow>
              <TableRow className="bg-zinc-100">
                <TableCell colSpan={2}>교과목해설</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} className="text-left">
                  {description?.comment}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} className="text-left">
                  {description?.ecomment}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsModalOpen(false);
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
