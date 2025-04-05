import { IoIosSearch } from "react-icons/io";
import type { Dispatch, SetStateAction } from "react";
interface Prop {
    columnFilters: string,
    setColumnFilters: Dispatch<SetStateAction<string[]>>;
}
export default function FiltersBox({columnFilters, setColumnFilters}: Prop) {
    return (
        <div className="max-w-[12rem] relative my-2">
            <span className="absolute inset-y-0 left-2 flex items-center text-gray-400">
                <IoIosSearch />
            </span>
            <input
                type="text"
                placeholder="Search"
                className="w-full pl-8 pr-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}
