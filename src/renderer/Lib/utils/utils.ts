//Libs
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

//Main
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
