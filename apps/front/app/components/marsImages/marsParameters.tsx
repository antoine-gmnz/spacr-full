import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { convertEarthDateToMarsSol } from '@/lib/utils';
import { Spinner } from '@radix-ui/themes';
import { useForm } from '@tanstack/react-form';
import { useState, type JSX } from 'react';
import { useRovers } from '@/hooks/use-rover';
import type { CameraModel, RoverModel } from '@spacr/shared-types';

interface ParametersProps {
  isLoading?: boolean;
  setParameters: React.Dispatch<
    React.SetStateAction<{
      rover: number;
      camera: number;
      begin_sol: string;
      end_sol: string;
    }>
  >;
}

export function MarsParameters({ setParameters }: ParametersProps): JSX.Element {
  const [cameras, setCameras] = useState<CameraModel[]>([]);
  const [roverManifest, setRoverManifest] = useState<undefined | RoverModel>(undefined);

  const { data: rovers } = useRovers();

  const form = useForm({
    onSubmit: () => {
      setParameters({
        rover: form.getFieldValue('rover'),
        camera: form.getFieldValue('camera'),
        begin_sol: form.getFieldValue('begin_sol'),
        end_sol: form.getFieldValue('end_sol'),
      });
    },
    defaultValues: {
      rover: 0,
      camera: 0,
      begin_sol: '',
      end_sol: '',
    },
  });

  const getRoverName = (roverId: number): string => {
    const roverName = rovers?.find(rover => rover.id === Number(roverId))?.name;
    if (!roverName) return '';
    return roverName;
  };

  const handleRoverChange = (): void => {
    const selectedRoverId = form.getFieldValue('rover');
    if (!selectedRoverId) setCameras([]);

    const roverName = getRoverName(Number(selectedRoverId));
    const rover = rovers?.find(rover => rover.name === roverName);

    if (!rover) return;

    setCameras(rover.cameras || []);
    setRoverManifest(rover);
  };

  return (
    <>
      <form
        className="flex flex-row gap-10 w-full h-auto items-end"
        onChange={handleRoverChange}
        onSubmit={e => {
          e.preventDefault();
          e.stopPropagation();
          form
            .handleSubmit()
            .then(() => {
              console.log('submitted');
            })
            .catch(e => {
              console.error(e);
            });
        }}
      >
        <form.Field
          name="rover"
          listeners={{
            onChange: () => {
              form.setFieldValue('begin_sol', '');
              form.setFieldValue('end_sol', '');
              form.setFieldValue('camera', 0);
            },
          }}
          children={field => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="sol-to">Select rover :</Label>
              <Select
                value={field.state.value}
                onValueChange={e => {
                  field.handleChange(Number(e));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a rover" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Rovers</SelectLabel>
                    {rovers?.map(rover => (
                      <SelectItem key={rover.id} value={rover.id} className="hover:cursor-pointer">
                        {rover.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        />
        <form.Field
          name="camera"
          children={field => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="sol-to">Select camera :</Label>
              <Select
                value={field.state.value.toString()}
                disabled={cameras?.length <= 0}
                onValueChange={e => {
                  field.handleChange(Number(e));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Cameras :</SelectLabel>
                    {roverManifest?.cameras?.map((camera: CameraModel) => (
                      <SelectItem key={camera.id} value={camera.id.toString()} className="hover:cursor-pointer">
                        {camera.fullName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="begin_sol"
          children={field => (
            <div className="flex flex-col gap-2 z-30">
              <Label htmlFor="sol-to">From :</Label>
              <DatePicker
                disabled={form.getFieldValue('rover') === 0}
                placeholder="Pick a date"
                onValueChange={(e: Date) => {
                  field.handleChange(convertEarthDateToMarsSol(getRoverName(Number(form.getFieldValue('rover'))), e).toString());
                }}
              />
            </div>
          )}
        />
        <form.Field
          name="end_sol"
          children={field => (
            <div className="flex flex-col gap-2 z-30">
              <Label htmlFor="sol-to">To :</Label>
              <DatePicker
                disabled={form.getFieldValue('rover') === 0}
                placeholder="Pick a date"
                onValueChange={(e: Date) => {
                  field.handleChange(convertEarthDateToMarsSol(getRoverName(Number(form.getFieldValue('rover'))), e).toString());
                }}
              />
            </div>
          )}
        />
        <form.Subscribe selector={formState => [formState.canSubmit, formState.isSubmitting]}>
          {([canSubmit, isLoading]) => (
            <Button disabled={!canSubmit} type="submit">
              {isLoading ? <Spinner size="3" /> : 'Show images'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </>
  );
}
