import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useValue } from "@legendapp/state/react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Field, FieldLabel, FieldError, FieldGroup } from "~/components/ui/field"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "~/components/ui/combobox"
import { addTransaction } from "~/stores/transactions-store"
import { labels$ } from "~/stores/labels-store"

const transactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(value => !isNaN(parseFloat(value)), "Amount must be a valid number"),
  labelIds: z.array(z.string()).nullable(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

export function TransactionFormDialog() {
  const [open, setOpen] = useState(false)
  const labels = useValue(labels$)
  const anchor = useComboboxAnchor()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      labelIds: [],
    },
  })

  async function onSubmit(values: TransactionFormValues) {
    await addTransaction({
      date: values.date,
      description: values.description,
      amount: parseInt(values.amount) * 100,
      currency: "EUR",
      labelIds: values.labelIds ? values.labelIds : null,
    })
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <PlusIcon />
            New transaction
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.amount}>
              <FieldLabel>Amount</FieldLabel>
              <Input
                type="number"
                step="0.01"
                placeholder="−12.50 or 1200"
                aria-invalid={!!errors.amount}
                {...register("amount")}
              />
              <FieldError errors={[errors.amount]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel>Description</FieldLabel>
              <Input placeholder="Coffee, Salary..." aria-invalid={!!errors.description} {...register("description")} />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field data-invalid={!!errors.date}>
              <FieldLabel>Date</FieldLabel>
              <Input type="date" aria-invalid={!!errors.date} {...register("date")} />
              <FieldError errors={[errors.date]} />
            </Field>

            <Field>
              <FieldLabel>Labels</FieldLabel>
              <Controller
                control={control}
                name="labelIds"
                render={({ field }) => {
                  const labelNames = labels.map(label => label.name)
                  const selectedNames = field.value
                    ? field.value.map(id => labels.find(label => label.id === id)?.name ?? "").filter(Boolean)
                    : []

                  function handleValueChange(names: string[]) {
                    field.onChange(
                      names.map(name => labels.find(label => label.name === name)?.id ?? "").filter(Boolean)
                    )
                  }

                  return (
                    <Combobox
                      multiple
                      autoHighlight
                      items={labelNames}
                      value={selectedNames}
                      onValueChange={handleValueChange}
                    >
                      <ComboboxChips ref={anchor} className="w-full">
                        <ComboboxValue>
                          {(selectedValues: string[]) => (
                            <>
                              {selectedValues.map(name => {
                                const label = labels.find(l => l.name === name)
                                return (
                                  <ComboboxChip key={name}>
                                    {label && (
                                      <span
                                        className="size-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: label.color }}
                                      />
                                    )}
                                    {name}
                                  </ComboboxChip>
                                )
                              })}
                              <ComboboxChipsInput
                                placeholder={field.value && field.value.length > 0 ? "" : "Search labels..."}
                              />
                            </>
                          )}
                        </ComboboxValue>
                      </ComboboxChips>
                      <ComboboxContent anchor={anchor}>
                        <ComboboxEmpty>No labels found.</ComboboxEmpty>
                        <ComboboxList>
                          {(name: string) => {
                            const label = labels.find(l => l.name === name)
                            return (
                              <ComboboxItem key={name} value={name}>
                                {label && (
                                  <span
                                    className="size-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                  />
                                )}
                                {name}
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )
                }}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-4">
            <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
