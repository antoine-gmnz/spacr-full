import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { convertEarthDateToMarsSol } from '@/lib/utils';
import { type MarsRoverPhotosCameraNamesAbv, MappingRoverNamesAndCameras, type RoverManifest, MarsRoverManifest } from '@/types/rover';
import { Spinner } from '@radix-ui/themes';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { useState, type JSX } from 'react';
import type { GetRoversResponseDTO } from '@spacr/shared-types/dto';
import { data } from 'react-router';

interface ParametersProps {
  isLoading?: boolean;
  setParameters: React.Dispatch<
    React.SetStateAction<{
      rover: string;
      camera: string;
      begin_sol: string;
      end_sol: string;
    }>
  >;
}

export function MarsParameters({ setParameters, isLoading }: ParametersProps): JSX.Element {
  const [cameras, setCameras] = useState<MarsRoverPhotosCameraNamesAbv[]>([]);
  const [roverManifest, setRoverManifest] = useState<undefined | Omit<RoverManifest, 'cameras'>>(undefined);

  const { data: rovers } = useQuery<GetRoversResponseDTO[]>({
    queryKey: ['rovers'],
    queryFn: () => fetch(`${import.meta.env.VITE_API_URL}/rovers`).then(res => res.json()),
  });

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
      rover: '',
      camera: '',
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

    setCameras(MappingRoverNamesAndCameras[roverName.toLowerCase() as keyof typeof MappingRoverNamesAndCameras]);
    setRoverManifest(MarsRoverManifest[roverName]);
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
            onChange: ({ value }) => {
              console.log(`Country changed to: ${value}, resetting province`);
              form.setFieldValue('begin_sol', '');
              form.setFieldValue('end_sol', '');
              form.setFieldValue('camera', '');
            },
          }}
          children={field => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="sol-to">Select rover :</Label>
              <Select
                value={field.state.value}
                onValueChange={e => {
                  field.handleChange(e);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a rover" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Rovers</SelectLabel>
                    {rovers?.map(rover => (
                      <SelectItem key={rover.id} value={rover.id.toString()} className="hover:cursor-pointer">
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
                value={field.state.value}
                disabled={cameras?.length <= 0}
                onValueChange={e => {
                  field.handleChange(e);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Cameras :</SelectLabel>
                    {cameras.map(camera => (
                      <SelectItem key={camera} value={camera} className="hover:cursor-pointer">
                        {camera}
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
                disabled={form.getFieldValue('rover').length <= 0}
                placeholder="Pick a date"
                fromDate={roverManifest?.landing_date}
                toDate={roverManifest?.max_date}
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
                disabled={form.getFieldValue('rover').length <= 0}
                placeholder="Pick a date"
                fromDate={roverManifest?.landing_date}
                toDate={roverManifest?.max_date}
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
