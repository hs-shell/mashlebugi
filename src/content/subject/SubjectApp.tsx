import { Card, CardContent, CardHeader } from '@/components/ui/card';
import DepartmentSelector from './DepartmentSelector';
import { motion } from 'framer-motion';

const fadeInVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export default function SubjectApp() {
  return (
    <div className="font-sans p-6 max-w-5xl mx-auto bg-white space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-2"
      >
        시간표 및 수업계획서조회
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInVariants}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DepartmentSelector />
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
              <li>수강신청기간 동안 교수명 클릭시, 강의평가 결과가 조회됩니다.</li>
              <li>과목코드 클릭시 과목 해설이 표시됩니다.</li>
              <li>주야 구분값이 '합'인 경우 주야 동시 수강신청이 가능한 과목입니다.</li>
              <li>교차불가 컬럼은 수강정정(교차수강기간)에도 교차수강이 불가능한 과목임을 표시합니다.</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
