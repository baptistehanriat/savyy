import { LabelsTable } from "~/components/labels/labels-table"

export function meta() {
  return [{ title: "Labels" }]
}

export default function LabelsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <LabelsTable />
    </div>
  )
}
