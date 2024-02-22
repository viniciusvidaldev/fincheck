import { CrossCircledIcon } from "@radix-ui/react-icons";
import { ComponentProps, forwardRef } from "react";
import { cn } from "../../app/utils/cn";

interface InputProps extends ComponentProps<'input'> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className, placeholder, name, id, error, ...props
}, ref) => {
  const inputId = id ?? name

  return (
    <div className="relative">
      <input
        {...props}
        ref={ref}
        name={name}
        id={inputId}
        className={cn(`bg-white w-full rounded-lg border border-gray-500 px-3 h-[52px] 
        text-gray-800 pt-4 placeholder-shown:pt-0 peer focus:border-gray-800 outline-none
          transition-all`,
          error && '!border-red-900',
          className
        )}
        placeholder=" "
      />

      <label
        htmlFor={inputId}
        className="absolute peer-placeholder-shown:text-base text-xs left-[13px] top-2 
        peer-placeholder-shown:top-3.5 pointer-events-none text-gray-700 transition-all"
      >
        {placeholder}
      </label>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-900 ">
          <CrossCircledIcon />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'