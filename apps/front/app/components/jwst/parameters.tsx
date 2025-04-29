import { ResultsPerPage } from "@/components/resultsPerPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { PaginatedResponse } from "@/types/pagination";
import { type Dispatch, type SetStateAction, useState, useEffect } from "react";
import useDebounce from "@/hooks/useDebounce";

interface ParametersProps {
  data: PaginatedResponse<JWSTImages[]> | undefined;
  currentPage: number;
  setLimit: Dispatch<SetStateAction<number>>;
  limit: number;
  setSearch: Dispatch<SetStateAction<string>>;
}

export function Parameters({
  data,
  currentPage,
  setLimit,
  limit,
  setSearch,
}: ParametersProps): JSX.Element {
  const [search, setSearchInput] = useState<string>("");

  const debouncedSearch = useDebounce(search, 500);

  //   Update the search state with the debounced value
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const getCurrentShowing = () => {
    if (currentPage !== data?.totalPages) {
      return limit * currentPage;
    }
    return data?.totalCount;
  };

  return (
    <>
      <div className="flex justify-between items-end">
        <div className="flex flex-col justify-end">
          <div className="w-96">
            <Label htmlFor="search">Search by title</Label>
            <Input
              type="text"
              name="search"
              value={search}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Type something here"
            />
          </div>
        </div>
        <div>
          <ResultsPerPage
            handleChange={(e: string) => setLimit(Number.parseInt(e))}
            items={[
              { key: "20", value: "20" },
              { key: "40", value: "40" },
              { key: "60", value: "60" },
            ]}
            label="Results per page"
            placeholder={"Select"}
          />
        </div>
      </div>
      <Separator className="w-100 my-10" />
      <p className="text-slate-900 mb-5">
        Showing {getCurrentShowing()} of {data?.totalCount}
      </p>
    </>
  );
}
