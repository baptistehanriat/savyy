import { useState } from "react";
import { use$ } from "@legendapp/state/react";
import { PlusIcon } from "lucide-react";

import { labelsStore, addLabel } from "~/store/labels";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function meta() {
  return [{ title: "Labels" }];
}

function AddLabelDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addLabel({ name: name.trim(), color });
    setName("");
    setColor("#6366f1");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Add label
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New label</DialogTitle>
        </DialogHeader>
        <form id="add-label-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Label name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-input bg-transparent p-0.5"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#6366f1"
              className="font-mono"
            />
          </div>
        </form>
        <DialogFooter showCloseButton>
          <Button type="submit" form="add-label-form">
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function LabelsPage() {
  const labels = use$(labelsStore.items);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Labels</h1>
        <AddLabelDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Color</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labels.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No labels yet.
              </TableCell>
            </TableRow>
          ) : (
            labels.map((label) => (
              <TableRow key={label.id}>
                <TableCell>
                  <span
                    className="inline-block size-4 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                </TableCell>
                <TableCell>{label.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(label.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
