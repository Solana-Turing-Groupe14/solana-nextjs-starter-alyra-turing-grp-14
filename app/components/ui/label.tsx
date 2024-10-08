import * as LabelPrimitive from "@radix-ui/react-label"
import * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"
import { cn } from "@clement-utils/cn"

// eslint-disable-next-line tailwindcss/no-custom-classname
const labelVariants = tv({
  base: '"text-sm peer-disabled:opacity-70" font-medium leading-none peer-disabled:cursor-not-allowed',
})

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
