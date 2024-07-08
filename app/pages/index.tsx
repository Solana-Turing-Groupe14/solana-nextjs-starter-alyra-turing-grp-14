import { Typography } from "@ui/typography"

export default function HomePage() {

  return (
    <div className="mx-auto my-20 flex w-full max-w-md flex-col gap-6 rounded-2xl p-6">
      <Typography as="h2" level="h6" className="font-bold">
        Home
      </Typography>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Typography level="body4" color="secondary">
            Todo
          </Typography>
          </div>
      </div>
    </div>
  )

}
