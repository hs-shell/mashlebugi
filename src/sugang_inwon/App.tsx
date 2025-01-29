import { Card, CardContent, CardHeader } from '@/components/ui/card';
import DepartmentSelector from './DepartmentSelector';
import { motion } from 'framer-motion';
import { extractCollegeName, extractDepartmentName, extractFacultyName } from '@/lib/utils';
import { Department } from '@/types/types';
import { useEffect, useState } from 'react';

const fadeInVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export default function App() {
  const [groupedData, setGroupedData] = useState<{ [college: string]: { [faculty: string]: Department[] } }>({});

  useEffect(() => {
    const extractDataFromDOM = () => {
      const selectElement = document.getElementById('junkong') as HTMLSelectElement;

      if (!selectElement) {
        console.warn('DOM 요소를 찾을 수 없습니다.');
        return;
      }

      const options = selectElement.querySelectorAll('option');

      const grouped: { [college: string]: { [faculty: string]: Department[] } } = {};

      options.forEach((option) => {
        const tcd = option.value.trim();
        const tnm = option.textContent?.trim() || '';

        if (!tcd || tcd.length < 3) {
          console.warn(`잘못된 tcd 코드: ${tcd}`);
          return;
        }

        const collegeName = extractCollegeName(tcd);
        const facultyName = extractFacultyName(tcd);
        const departmentName = extractDepartmentName(tnm);

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
    };
    extractDataFromDOM();
  }, []);

  return (
    <div className="font-sans p-6 max-w-7xl mx-auto bg-white space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-2"
      >
        수강잔여인원조회
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DepartmentSelector groupedData={groupedData} />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="shadow-none">
          <CardHeader className="text-xl font-semibold px-7 pt-4 pb-3">안내</CardHeader>
          <CardContent>
            <hr className="px-4 mb-3 mt-1 bg-zinc-600" />
            <ul className="list-disc pl-5 text-sm font-normal text-zinc-600">
              <li>본 화면은 학년별 수강잔여 인원입니다.</li>
              <li>수강신청기간 : 학년별 정원, 수강정정기간 : 총계 인원을 체크합니다.</li>
              <li>
                1학년/편입생 수강신청기간 보이는 자과 학년의 잔여인원은 정정기간에 타과/타학년의 수강신청 인원이
                빠져있습니다. 총잔여인원을 확인해주시기 바랍니다.
              </li>
              <li className="text-red-800 font-semibold">▶ 전공은 같으나, 학년이 다르면 타과입니다.</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
