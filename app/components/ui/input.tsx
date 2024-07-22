import * as React from "react"
import { tv } from "tailwind-variants"
import { cn } from "@clement-utils/cn"
import { forwardRefWithAs } from "@clement-utils/render"

const styles = tv({
  slots: {
    input: [
      "flex rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-z1",
      "placeholder:text-gray-500",
      "hover:border-gray-900",
      "focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900",
      "disabled:cursor-not-allowed disabled:bg-gray-50",
    ],
    startDecorator: "pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-500",
    endDecorator: "pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500",
  },
  variants: {
    hasLeft: {
      true: {
        input: "pl-10",
      },
    },
    hasRight: {
      true: {
        input: "pr-10",
      },
    },
    fullWidth: {
      true: {
        input: "w-full",
      },
    },
    error: {
      true: {
        input: [
          "border-error-500",
          "hover:border-error-500",
          "focus:border-error-500 focus:ring-error-500",
          "placeholder:text-red-500",
        ],
        startDecorator: "text-error-300",
        endDecorator: "text-error-300",
      },
    },
    disabled: {
      true: {
        input: "hover:border-gray-300",
      },
    },
  },
  defaultVariants: {
    hasLeft: false,
    hasRight: false,
    fullWidth: true,
    disabled: false,
    isInput: true,
  },
})

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean
  error?: boolean
  wrapperClassName?: string
  startDecorator?: React.ReactNode
  startDecoratorClassName?: string
  endDecorator?: React.ReactNode
  endDecoratorClassName?: string
}

export const Input = forwardRefWithAs<"input", InputProps>((props, ref) => {
  const {
    wrapperClassName,
    startDecorator,
    startDecoratorClassName,
    endDecorator,
    endDecoratorClassName,
    fullWidth = true,
    error,
    disabled,
    className,
    as: Tag = "input",
    ...rest
  } = props

  const baseStyles = styles({
    hasLeft: !!startDecorator,
    hasRight: !!endDecorator,
    fullWidth,
    error,
    disabled,
  })

  const child = (
    <Tag
      className={cn(baseStyles.input(), { "h-11": Tag === "input" }, className)}
      ref={ref}
      disabled={disabled}
      {...rest}
    />
  )
  if (startDecorator || endDecorator) {
    return (
      <div className={cn("relative", wrapperClassName)}>
        <span className={cn(baseStyles.startDecorator(), startDecoratorClassName)}>{startDecorator}</span>
        {child}
        <span className={cn(baseStyles.endDecorator(), endDecoratorClassName)}>{endDecorator}</span>
      </div>
    )
  }

  return child
})
