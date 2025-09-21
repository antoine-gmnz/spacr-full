import { TableSchedule } from '@/components/schedule/submodules/tableSchedule';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/loader';
import { useLaunches } from '@/hooks/use-launches';
import { useNavigate } from 'react-router';

export function Schedule() {
  const navigate = useNavigate();
  const { data, isPending } = useLaunches();

  return (
    <Card title="Launch Schedule" className="p-5">
      <CardTitle className="flex justify-between">
        <p>Launch schedule</p>
        <Button variant="outline" size="sm" className="font-normal text-sm hover:cursor-pointer" onClick={() => void navigate('/launch-schedule')}>
          View all
        </Button>
      </CardTitle>
      {isPending && (
        <div className="w-full flex items-center justify-center min-h-[350px]">
          <Loader />
        </div>
      )}
      {data && <TableSchedule data={data.results.slice(0, 7)} />}
    </Card>
  );
}
