import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { convertEarthDateToMarsSol } from '@/lib/utils';
import { type MarsRoverPhotosCameraNamesAbv, MappingRoverNamesAndCameras, type RoverManifest, MarsRoverManifest } from '@/types/rover';
import { Spinner } from '@radix-ui/themes';
import { useForm } from '@tanstack/react-form';
import { useState, type JSX } from 'react';

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

const rovers = ['Perseverance', 'Curiosity', 'Opportunity', 'Spirit'];

export function MarsParameters({ setParameters, isLoading }: ParametersProps): JSX.Element {
  const [cameras, setCameras] = useState<MarsRoverPhotosCameraNamesAbv[]>([]);
  const [roverManifest, setRoverManifest] = useState<undefined | Omit<RoverManifest, 'cameras'>>(undefined);

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

  const handleRoverChange = (): void => {
    const roverValue = form.getFieldValue('rover').toLowerCase();
    if (!roverValue) setCameras([]);

    setCameras(MappingRoverNamesAndCameras[roverValue as keyof typeof MappingRoverNamesAndCameras]);
    setRoverManifest(MarsRoverManifest[roverValue]);
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
                    {rovers.map(rover => (
                      <SelectItem key={rover} value={rover} className="hover:cursor-pointer">
                        {rover}
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
                disabled={cameras.length <= 0}
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
                  field.handleChange(convertEarthDateToMarsSol(form.getFieldValue('rover'), e).toString());
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
                  field.handleChange(convertEarthDateToMarsSol(form.getFieldValue('rover'), e).toString());
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
