/* eslint-disable react/no-children-prop */

import React, { useState, type JSX } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";

import { useQuery } from "@tanstack/react-query";
import { DatePicker } from "@/components/ui/date-picker";
import { convertEarthDateToMarsSol } from "@/lib/utils";
import { Label } from "@/components/ui/label";

import { Spinner } from "@radix-ui/themes";
import { useRoverImageContext } from "@/context/roverImageContext";
import { 
  type MarsRoverPhotosCameraNamesAbv,
  MappingRoverNamesAndCameras,
  type RoverManifest,
  type MarsRoverResponse,
  MarsRoverManifest,
} from "@/types/rover";

const rovers = ["Curiosity", "Opportunity", "Spirit"];

export default function MarsImages(): JSX.Element {
  const { setImages } = useRoverImageContext();

  const [cameras, setCameras] = useState<MarsRoverPhotosCameraNamesAbv[]>([]);
  const [roverManifest, setRoverManifest] = useState<
    undefined | Omit<RoverManifest, "cameras">
  >(undefined);

  const form = useForm({
    onSubmit: async () => {
      // Do something with form data
      await refetch();
    },
    defaultValues: {
      rover: "",
      camera: "",
      begin_sol: "",
      end_sol: "",
    },
  });

  const { refetch } = useQuery({
    enabled: false,
    queryKey: ["fetchImages"],
    queryFn: async () => {
      const { rover, camera, begin_sol, end_sol } = form.state.values;
      try {
        const res = await fetch(
          `http://localhost:4200/rover?rover=${rover}&camera=${camera}&begin_sol=${begin_sol}&end_sol=${end_sol}`,
          {
            method: "GET",
          }
        );

        setImages((await res.json()) as MarsRoverResponse[]);
      } catch (e) {
        console.error(e);
      }
    },
  });

  const handleRoverChange = (): void => {
    const roverValue = form.getFieldValue("rover").toLowerCase();
    if (!roverValue) setCameras([]);

    setCameras(
      MappingRoverNamesAndCameras[
        roverValue as keyof typeof MappingRoverNamesAndCameras
      ]
    );
    setRoverManifest(MarsRoverManifest[roverValue]);
  };

  return (
    <div className="w-full h-auto">
      <form
        className="flex flex-row gap-10 w-full h-auto items-end"
        onChange={handleRoverChange}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form
            .handleSubmit()
            .then(() => {
              console.log("submitted");
            })
            .catch((e) => {
              console.error(e);
            });
        }}
      >
        <form.Field
          name="rover"
          children={(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="sol-to">Select rover :</Label>
              <Select
                value={field.state.value}
                onValueChange={(e) => {
                  field.handleChange(e);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a rover" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Rovers</SelectLabel>
                    {rovers.map((rover) => (
                      <SelectItem
                        key={rover}
                        value={rover}
                        className="hover:cursor-pointer"
                      >
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
          children={(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="sol-to">Select camera :</Label>
              <Select
                value={field.state.value}
                disabled={cameras.length <= 0}
                onValueChange={(e) => {
                  field.handleChange(e);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a camera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Cameras :</SelectLabel>
                    {cameras.map((camera) => (
                      <SelectItem
                        key={camera}
                        value={camera}
                        className="hover:cursor-pointer"
                      >
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
          children={(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="sol-to">From :</Label>
              <DatePicker
                disabled={form.getFieldValue("rover").length <= 0}
                placeholder="Pick a date"
                fromDate={roverManifest?.landing_date}
                toDate={roverManifest?.max_date}
                onValueChange={(e: Date) => {
                  field.handleChange(
                    convertEarthDateToMarsSol(
                      form.getFieldValue("rover"),
                      e
                    ).toString()
                  );
                }}
              />
            </div>
          )}
        />
        <form.Field
          name="end_sol"
          children={(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="sol-to">To :</Label>
              <DatePicker
                disabled={form.getFieldValue("rover").length <= 0}
                placeholder="Pick a date"
                fromDate={roverManifest?.landing_date}
                toDate={roverManifest?.max_date}
                onValueChange={(e: Date) => {
                  field.handleChange(
                    convertEarthDateToMarsSol(
                      form.getFieldValue("rover"),
                      e
                    ).toString()
                  );
                }}
              />
            </div>
          )}
        />
        <form.Subscribe
          selector={(formState) => [
            formState.canSubmit,
            formState.isSubmitting,
          ]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button disabled={!canSubmit} type="submit">
              {isSubmitting ? <Spinner size="3" /> : "Show images"}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
